/**
 * 本地智能客服（OPTILAB Copilot）
 *
 * 不是真正的 LLM，而是基于意图分类 + 关键词索引 + 计算器调用的"工具调用"调度器。
 *
 * ====== 工具（Tools） =====
 *  - greeting    : 闲聊 / 自介绍
 *  - list        : 列出所有可用能力
 *  - knowledge   : 在 handbook 里查找词条并返回知识卡片
 *  - compute     : 解析自然语言里的数字 + 单位 → 调用 calculators.compute() 输出结果卡片
 *  - plan        : 根据光学场景（光镊 / 成像 / 全息 / 激光）给出多工具组合方案
 *
 * ====== 调用方式 =====
 *    const { text, cards, tool, slots } = runAssistant(query)
 *  cards 每条 { kind, id, title, lines, primary?, payload? }
 *  payload 是给计算器详页带的"上次结果"，让打开 calc 页时直接进入结果态。
 */

const { calculators, getCalc } = require('../data/calculators')
const { handbook, findEntry } = require('../data/handbook')
const { sigNum } = require('./util')

/* ---------- 1. 单位换算 ---------- */
const UNIT_NUM = {
  nm:  1e-9, nm_: 1e-9,
  μm:  1e-6, um: 1e-6, 'µm': 1e-6, micron: 1e-6,
  mm:  1e-3,  millimeter: 1e-3,
  cm:  1e-2,  m: 1,    meter: 1,
  Å: 1e-10,  angstrom: 1e-10,
  rad: 1, deg: Math.PI / 180, 度: Math.PI / 180, '°': Math.PI / 180
}

/* 单位换算：把 value 从 fromUnit 转到 toUnit 同量纲 */
function toUnit(value, fromUnit, toUnit) {
  if (!fromUnit || !toUnit) return value
  if (fromUnit === toUnit) return value
  const f = UNIT_NUM[(fromUnit || '').toLowerCase()]
  const t = UNIT_NUM[(toUnit || '').toLowerCase()]
  if (!f || !t) return value
  return value * (f / t)
}

/* ---------- 2. 计算器别名表（中文/英文关键词 → 计算器 id） ---------- */
const CALC_ALIAS = [
  // ==== 光场调控 ====
  { id: 'holo-nearfar',     kw: ['菲涅尔', 'fresnel', 'fraunhofer', '夫琅禾费', '近场', '远场', '判据', '临界距离', '波长', '孔径', '传播距离', 'n_f', 'nf数'] },
  { id: 'holo-fresnel-fft', kw: ['fresnel fft', '菲涅尔fft', '菲涅尔采样', '单步fresnel', '一步菲涅尔', '近场采样'] },
  { id: 'holo-slm-gamma',   kw: ['slm', 'gamma', '伽马', '灰度', '查找表', 'lut', '相位深度', '电压相位', '标定'] },
  { id: 'holo-gs',          kw: ['gs算法', 'gs迭代', 'gerchberg', '迭代全息', '迭代算法', '衍射效率', '迭代次数', 'nmse'] },
  { id: 'holo-wgs',         kw: ['wgs', '加权gs', '加权迭代', 'weighted gs', '均匀度优化', '权重反馈'] },
  { id: 'holo-3dgs',        kw: ['3dgs', '3d gs', '三维gs', '多平面', '多焦面', '3d全息', '体全息', '轴向分辨率'] },
  { id: 'holo-ga',          kw: ['ga算法', '遗传算法', 'genetic', '进化算法', '种群', '适应度'] },
  { id: 'holo-blazed',      kw: ['闪耀', '光栅', 'blazed', 'littrow', '一级衍射', '闪耀角', 'blaze'] },
  // ==== 几何光学 ====
  { id: 'geo-snell',        kw: ['snell', '斯涅尔', '折射', '折射率', '全反射', '临界角', 'n1', 'n2'] },
  { id: 'geo-lens',         kw: ['薄透镜', '成像公式', '透镜', '焦距', '4f系统', '放大率', '4f', 'f数'] },
  { id: 'geo-mirror',       kw: ['凹面镜', '凸面镜', '球面镜', '物距', '像距'] },
  { id: 'geo-focal',        kw: ['焦距', 'focal', '聚焦', '聚焦长度'] },
  // ==== 波动 ====
  { id: 'wave-diffraction', kw: ['衍射', '单缝', '孔径', 'airy', '艾里', '远场衍射'] },
  { id: 'wave-interference',kw: ['干涉', '双缝', '迈克耳孙', 'michelson', '杨氏'] },
  { id: 'wave-polarize',    kw: ['偏振', 'polarization', '布鲁斯特', 'brewster', '马吕斯', 'malus'] },
  // ==== 光子学 ====
  { id: 'phys-plank',       kw: ['普朗克', '黑体', '辐射', '玻尔兹曼', '维恩'] },
  { id: 'phys-laser',       kw: ['激光', '增益', '阈值', '速率方程', '谐振腔', '脉冲'] }
]

/* ---------- 3. 手册词条索引：title/tag/summary + blocks 全文 ---------- */

/** 把词条 blocks 里的可检索文本抽取出来（公式、小节、列表、表格；代码块只取语言名） */
function blockText(blocks) {
  let s = ''
  ;(blocks || []).forEach(b => {
    if (b.t === 'formula' || b.t === 'h3' || b.t === 'p' || b.t === 'note') s += ' ' + b.x
    else if (b.t === 'list') s += ' ' + (b.x || []).join(' ')
    else if (b.t === 'table') s += ' ' + (b.head || []).join(' ') + ' ' + (b.rows || []).map(r => r.join(' ')).join(' ')
    else if (b.t === 'code') s += ' ' + (b.lang || '')
  })
  return s
}

function buildEntryIndex() {
  const out = []
  handbook.forEach(cat => {
    cat.entries.forEach(en => {
      const text = `${en.title} ${en.tag || ''} ${en.summary || ''}`.toLowerCase()
      const full = (text + ' ' + cat.name + ' ' + blockText(en.blocks)).toLowerCase().slice(0, 3000)
      out.push({ key: en.key, catId: cat.id, catName: cat.name, catColor: cat.color, title: en.title, text, full })
    })
  })
  return out
}
const ENTRY_INDEX = buildEntryIndex()

/** 从词条 blocks 抽取亮点（公式 / 小节标题 / 提示），给对话卡片展示 */
function entryHighlights(entry, n = 3) {
  const out = []
  ;(entry.blocks || []).forEach(b => {
    if (out.length >= n) return
    if (b.t === 'formula') out.push('ƒ ' + b.x)
    else if (b.t === 'h3' && out.length === 0) out.push('§ ' + b.x)
  })
  if (!out.length) out.push(entry.summary || '')
  return out
}

/* ---------- 4. 关键词切分：兼容中英文 ---------- */
function normalize(s) {
  return String(s || '').toLowerCase().trim()
}

/* 从 query 中尽量提取所有 "数字 + 单位" 对，支持 Unicode 空白分隔 */
function extractNumbers(query) {
  const re = /(-?\d+(?:\.\d+)?(?:e[+-]?\d+)?)\s*(nm|μm|µm|um|micron|mm|cm|m|Å|angstrom|rad|deg|°|度|pi|π|倍|x|×)?/gi
  const out = []
  let m
  while ((m = re.exec(query)) !== null) {
    const raw = m[1]
    const u = m[2]
    let v = parseFloat(raw)
    if (!isFinite(v)) continue
    let unit = u ? u.toLowerCase() : null
    if (unit === 'π' || unit === 'pi') { v = Math.PI; unit = 'rad' }
    if (unit === '倍' || unit === 'x' || unit === '×') unit = null
    const factor = unit && UNIT_NUM[unit] ? UNIT_NUM[unit] : 1
    out.push({ raw: v, unit: unit || '', value: v * factor, index: m.index })
  }
  return out
}

/* 关键词命中工具：拆词 + 多段打分 */
function _scoreText(q, hay) {
  if (!hay) return 0
  let sc = 0
  const h = String(hay).toLowerCase()
  // 整串包含
  if (q.includes(h)) sc += 28
  if (h.includes(q) && q.length >= 2) sc += 8
  // 2-gram 命中（中文友好）
  if (h.length >= 2) {
    for (let i = 0; i < h.length - 1; i++) {
      const tk = h.slice(i, i + 2)
      if (tk.length === 2 && q.includes(tk)) sc += 1.4
    }
  }
  // 4-gram 命中（更精确）
  if (h.length >= 4) {
    for (let i = 0; i < h.length - 3; i++) {
      const tk = h.slice(i, i + 4)
      if (tk.length === 4 && q.includes(tk)) sc += 3.5
    }
  }
  return sc
}

function hitCalc(query) {
  const q = normalize(query)
  let best = null, bestScore = 0
  for (const c of calculators) {
    let sc = 0
    // 别名（最高权重）
    for (const r of CALC_ALIAS) {
      if (r.id === c.id) {
        for (const k of r.kw) {
          const kl = k.toLowerCase()
          if (q.includes(kl)) sc += 18 + kl.length
        }
      }
    }
    // name / sub / desc / symbol
    sc += _scoreText(q, c.name)
    sc += _scoreText(q, c.sub)
    sc += _scoreText(q, c.desc) * 0.6
    // formula 命中
    if (Array.isArray(c.formulas)) for (const f of c.formulas.slice(0, 4)) sc += _scoreText(q, f) * 0.4
    if (sc > bestScore) { bestScore = sc; best = c.id }
  }
  return bestScore >= 16 ? best : null
}

/** 返回多个候选（给 knowledge tool 使用） */
function hitCalcs(query, top = 3) {
  const q = normalize(query)
  const scs = calculators.map(c => {
    let sc = 0
    for (const r of CALC_ALIAS) {
      if (r.id === c.id) {
        for (const k of r.kw) {
          const kl = k.toLowerCase()
          if (q.includes(kl)) sc += 12 + kl.length
        }
      }
    }
    sc += _scoreText(q, c.name) * 1.1
    sc += _scoreText(q, c.sub)
    sc += _scoreText(q, c.desc) * 0.5
    return { c, sc }
  })
  return scs.filter(x => x.sc >= 12).sort((a, b) => b.sc - a.sc).slice(0, top).map(x => x.c)
}

/** 去掉问句尾巴（是什么/怎么选/？等），保留核心关键词 */
function stripQW(query) {
  let s = normalize(query).replace(/[?？。！!，,]/g, '')
  for (let i = 0; i < 3; i++) {
    const t = s.replace(/(是什么意思|是什么样的|是什么|怎么样|是什么的|怎么用|怎么选|怎么做|怎么算|怎么|为什么|如何|哪些|有什么用|有什么|是多少|多少|呢|吗|啊|用在哪|在哪)$/g, '')
    if (t === s || !t) break
    s = t
  }
  return s || normalize(query)
}

function hitEntries(query, top = 5) {
  const q = normalize(query)
  const qq = stripQW(query)
  const scores = ENTRY_INDEX.map(e => {
    let sc = 0
    sc += _scoreText(q, e.title) * 1.0
    sc += _scoreText(q, e.tag || '') * 1.2
    sc += _scoreText(q, e.summary || '') * 0.6
    sc += _scoreText(q, e.catName) * 0.4
    // blocks 全文检索：手册里有的内容都能查到
    if (q.length >= 3) sc += _scoreText(q, e.full) * 0.35
    if (qq.length >= 2 && qq !== q) {
      // 去掉疑问词后的核心词直接命中标题/正文
      if (e.title.toLowerCase().includes(qq)) sc += 10
      if (e.full.includes(qq)) sc += 6
    }
    if (sc < 6) sc = 0
    return { ...e, sc }
  })
  return scores.filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, top)
}

/** 类目命中：query 匹配到分类名 → 返回该分类（用于"浏览某分类下所有词条"） */
function hitCategory(query) {
  const q = normalize(query)
  let best = null, bestScore = 0
  handbook.forEach(cat => {
    const n = cat.name.toLowerCase()
    let sc = 0
    if (q.includes(n)) sc = 10 + n.length
    else sc += _scoreText(q, cat.name + ' ' + cat.desc) * 0.5
    if (sc > bestScore) { bestScore = sc; best = cat }
  })
  return bestScore >= 10 ? best : null
}

/* ---------- 5. 各 Tool 实现 ---------- */

/** Greeting：问候 / 自介绍 */
function toolGreeting(query) {
  const q = normalize(query)
  if (/你是什么|你是谁|自我介绍|你是哪个|名字/.test(q)) {
    return {
      text: '我是 OPTILAB 智能客服，一台本地离线运行的光学助理小机器人 🤖。我可以帮你：\n\n● **查找概念**：问"什么是菲涅尔数？""WGS 权重怎么选"——手册里的任何概念 / 公式 / 数据表都能问\n● **算公式**：说"波长 532 nm 孔径 5 mm 距离 200 mm，算近远场"\n● **算法库**：GS / WGS / 三维 GS / GA 遗传算法的参数与收敛估算\n● **设计方案**：说"光镊方案"或"全息图生成方案"\n● **自动总结**：输入"总结一下"或"盘点"，我会自动盘点系统全部能力。',
      cards: []
    }
  }
  return {
    text: '你好呀 👋 我是 OPTILAB 智能客服。试试问"菲涅尔判据"、"光镊方案"或"波长 532 nm 算近场"。',
    cards: []
  }
}

/** List / Digest：自动总结系统现有能力（数据驱动，加内容即自动长出来） */
function toolList() {
  const entryTotal = handbook.reduce((s, c) => s + c.entries.length, 0)
  const catLines = handbook.map(c => '● ' + c.name + '：' + c.entries.length + ' 篇 · ' + c.entries.map(e => e.title).slice(0, 4).join(' / ') + (c.entries.length > 4 ? ' …' : ''))
  const calcByCat = {}
  calculators.forEach(c => { (calcByCat[c.catName] = calcByCat[c.catName] || []).push(c.name) })
  const calcLines = Object.keys(calcByCat).map(k => '● ' + k + '：' + calcByCat[k].join(' · '))
  const hotEntries = []
  handbook.forEach(c => c.entries.forEach(en => { if (en.hot) hotEntries.push(en.title) }))
  return {
    text: '🧠 **系统自检总结**（自动盘点，内容新增后自动更新）：\n\n' +
      '共 **' + calculators.length + ' 个交互计算器** + **' + entryTotal + ' 篇手册词条**，覆盖 ' + handbook.length + ' 大分类。\n' +
      '手册里的所有概念 / 公式 / 数据表 / 代码都可以直接问我，例如「WGS 权重怎么选」「阿贝数怎么算」「BBO 晶体用在哪」。',
    cards: [
      { kind: 'sys', title: '📚 知识分类（' + entryTotal + ' 篇词条）', lines: catLines },
      { kind: 'sys', title: '🛠 交互计算器（' + calculators.length + ' 个）', lines: calcLines },
      { kind: 'sys', title: '🔥 热门词条', lines: hotEntries.map(t => '● ' + t).slice(0, 8) }
    ]
  }
}

/** Knowledge：找手册词条 + 计算器（统一搜索；支持按分类浏览） */
function toolKnowledge(query) {
  // 1) 分类浏览：问到某个分类名 → 列出该分类全部词条
  const cat = hitCategory(query)
  if (cat) {
    return {
      text: '📘 分类「**' + cat.name + '**」共 **' + cat.entries.length + ' 篇词条**：\n' + cat.desc + '\n\n点击卡片即可打开对应词条。',
      cards: cat.entries.map(en => ({
        kind: 'entry',
        id: en.key,
        title: (en.hot ? '🔥 ' : '') + en.title,
        sub: cat.name + ' · ' + (en.tag || ''),
        lines: [en.summary],
        catColor: cat.color
      }))
    }
  }
  // 2) 通用检索
  const hits = hitEntries(query, 4)
  const calcHits = hitCalcs(query, 4)
  if (!hits.length && !calcHits.length) {
    // 兜底：给最接近的分类，引导继续问
    return {
      text: '没在手册里查到与「' + query + '」直接匹配的内容。我可以回答手册里的任何概念 / 公式 / 数据表，试试：\n● 问概念：「什么是阿贝数」「WGS 是什么」\n● 问公式：「马吕斯定律」「布儒斯特角」\n● 报数字算：「波长 532 算近场」\n● 看分类：「' + handbook.map(c => c.name).join('」「') + '」',
      cards: []
    }
  }
  let primaryTitle = (hits[0] && hits[0].title) || (calcHits[0] && calcHits[0].name) || ''
  const cards = []
  hits.slice(0, 3).forEach((h, i) => {
    const en = findEntry(h.key)
    cards.push({
      kind: 'entry',
      id: h.key,
      title: (i === 0 && calcHits.length === 0 ? '⭐ ' : '') + h.title,
      sub: h.catName + ' · ' + (h.tag || ''),
      lines: en ? entryHighlights(en, 3) : [h.title.slice(0, 80)],
      primary: i === 0 && calcHits.length === 0,
      catColor: h.catColor
    })
  })
  calcHits.slice(0, 3).forEach((c, i) => {
    cards.push({
      kind: 'calc',
      id: c.id,
      title: (i === 0 && hits.length === 0 ? '⭐ ' : '🛠 ') + c.name,
      sub: c.catName + ' · ' + c.symbol + ' · ' + c.sub,
      lines: [c.desc.slice(0, 60)],
      primary: i === 0 && hits.length === 0,
      payload: null
    })
  })
  return {
    text: '知识库里有 ' + (hits.length + calcHits.length) + ' 条与「' + query + '」相关，最匹配的是《' + primaryTitle + '》。\n' +
      '点击卡片即可打开对应计算器 / 手册页。',
    cards
  }
}

/* 输入参数解析：把 query 中的数字按 alias → 单位换算 → def.unit */
function mapInputs(query, inputDefs) {
  const inputs = {}
  const ALIAS = {
    wl: ['波长', 'lambda', 'λ'],
    a:  ['孔径', '半径', 'aperture'],
    z:  ['距离', '传播', 'distance'],
    dx: ['像素', 'pixel', 'Δx', 'dx', '采样'],
    N:  ['点数', 'pixel数', '阵面', '大小', '尺寸'],
    iter: ['迭代', 'iteration', 'iter'],
    u: ['均匀度', 'uniformity'],
    beta: ['反馈', '权重系数', 'beta', 'β'],
    pop: ['种群', '个体', 'pop'],
    bits: ['位数', '量化', 'bits', 'bit'],
    P: ['平面数', '平面', 'planes', '层数'],
    dz: ['间距', '间隔', 'dz', '层间'],
    gamma: ['gamma', 'γ', '伽马'],
    depth: ['深度', 'phase max', 'φ_max'],
    levels: ['灰度级', 'levels'],
    lambda: ['波长', 'λ', 'lambda'],
    ab: ['闪耀角', 'alpha', 'blaze'],
    theta_i: ['入射', 'theta i', 'θ_i']
  }
  for (const def of inputDefs) {
    const aliases = ALIAS[def.key] || [def.key]
    let val = null
    for (const al of aliases) {
      // 匹配 "alias+数字+单位"，允许中文标点
      const re = new RegExp(al + '[^\\d-]*?(-?\\d+(?:\\.\\d+)?(?:e[+\\-]?\\d+)?)\\s*(nm|μm|µm|um|micron|mm|cm|m|Å|angstrom|rad|deg|°|度|pi|π|倍|x|×)?', 'i')
      const m = query.match(re)
      if (m) {
        let v = parseFloat(m[1])
        if (!isFinite(v)) continue
        const u = (m[2] || '').toLowerCase()
        if (u === 'π' || u === 'pi') v = Math.PI
        inputs[def.key] = toUnit(v, u, def.unit)
        val = inputs[def.key]
        break
      }
    }
    if (val === null && def.val !== undefined) inputs[def.key] = def.val
  }
  return inputs
}

/** Compute：调用 calculators.compute */
function toolCompute(query) {
  let id = hitCalc(query)
  if (!id) {
    // 没有计算器命中，但用户输入了数字 — 做一个数值快捷：返回 "请指明要计算什么"
    const nums = extractNumbers(query)
    if (nums.length) {
      return {
        text: '我读到 **' + nums.length + '** 个数字：' + nums.map(n => `${sigNum(n.value, 4)} (${n.unit || '—'})`).join('，') + '。但没识别出要算什么，试试 "菲涅尔判据"、"GS 算法"、"闪耀光栅" 等关键词。',
        cards: []
      }
    }
    return { text: '请告诉我计算目标，比如 "Fresnel 判据"、"SLM Gamma"、"GS 迭代"、"闪耀光栅"。', cards: [] }
  }
  const calc = getCalc(id)
  if (!calc) return { text: '工具未找到: ' + id, cards: [] }

  const inputs = mapInputs(query, calc.inputs)
  let result
  try { result = calc.compute(inputs) } catch (e) { return { text: '计算失败: ' + e.message, cards: [] } }

  const inLine = calc.inputs.map(d => `${d.label.replace(/[:：]$/, '')}=${sigNum(inputs[d.key], 4)}${d.unit ? ' ' + d.unit : ''}`).join('，')
  const items = (result.items || []).slice(0, 6)
  const lines = items.map(it => `${it.label}: ${it.val}${it.unit ? ' ' + it.unit : ''}${(it.primary ? '  ⭐' : '')}`)

  // 工具调用调试信息（可在卡片下方展示）
  const toolTrace =
    'Tool Call › ' + id + '\n' +
    calc.inputs.map(d => `  · ${d.key} = ${sigNum(inputs[d.key], 4)}${d.unit ? ' ' + d.unit : ''}`).join('\n') +
    '\n  → 返回 ' + items.length + ' 项结果'

  return {
    text: '调用 **[' + id + '] ' + calc.name + '** 计算：' + inLine + '\n\n' +
      items.map((it, i) => '● ' + lines[i]).join('\n') +
      (result.warning ? '\n\n⚠️ ' + result.warning : '') +
      (result.notes && result.notes.length ? '\n\n笔记：' + result.notes.slice(0, 3).map(x => '· ' + x).join('\n') : ''),
    cards: [
      {
        kind: 'calc',
        id,
        title: '📐 ' + calc.name,
        sub: calc.catName + ' · ' + calc.symbol + ' · ' + calc.sub,
        lines,
        primary: true,
        payload: { inputs, result }
      },
      {
        kind: 'sys',
        title: 'Tool Trace',
        lines: toolTrace.split('\n').slice(0, 8),
        muted: true
      }
    ]
  }
}

/** Plan：按光学场景给方案 */
function toolPlan(query) {
  const q = normalize(query)
  // 场景匹配
  const SCENES = [
    {
      kw: ['光镊', '光学陷阱', 'optical trap', '光陷阱'],
      title: '多焦点光学镊实现方案',
      steps: [
        '1. 激光源：高 NA 物镜焦点区域需要 >10 mW、波长 1064 nm 常用（生物兼容）',
        '2. 扩束：把激光束扩到与 SLM 孔径匹配（约 8–15 mm）',
        '3. SLM 加载相位全息：使用 Gerchberg-Saxton 生成多焦点相位图',
        '2π 相位深度 + 偏振片 + 4f 系统成像',
        '4. 转发：远心 4f 系统把 SLM 平面映射到物镜后瞳',
        '5. 末端：物镜 NA ≥ 1.0（例如 100×, NA 1.4 油浸）',
        '6. 监视：sCMOS / CCD 在样本面观察；实时更换 SLM 图样即可操控'
      ],
      calcIds: ['holo-gs', 'holo-slm-gamma', 'holo-nearfar'],
      entryKeys: ['h-holo', 'h-iter', 'h-slm']
    },
    {
      kw: ['全息图', 'hologram', '数字全息', '计算全息', 'gs全息', '光场调控', '多平面', '三维', '3d', 'wgs', '加权', '遗传算法'],
      title: '计算全息图生成方案',
      steps: [
        '1. 准备目标强度图（点阵 / 多焦点 / 任意 mask / 多层 3D）',
        '2. 选择迭代算法：GS / WGS 加权 / 三维多平面 GS / GA 遗传 / Wirtinger / MRAF',
        '3. 离散约束（二值 / 多级相位）→ GA 粗搜 + GS 精修混合策略',
        '4. 准备 SLM LUT：按当前波长标定 φ(g) 与 g_lut(φ_t)',
        '5. 加载复振幅全息图到 SLM，并加横向载频以分离共轭像',
        '6. 远场再现：把 SLM 平面经 4f 系统映射到傅里叶面',
        '7. 评估指标：衍射效率、误差 RMSE、均匀度 U'
      ],
      calcIds: ['holo-gs', 'holo-wgs', 'holo-3dgs', 'holo-ga', 'holo-slm-gamma', 'holo-blazed'],
      entryKeys: ['h-holo', 'h-iter', 'h-iter-adv', 'h-prop']
    },
    {
      kw: ['显微成像', '显微', '成像', '4f', '傅里叶'],
      title: '显微镜 4f 成像方案',
      steps: [
        '1. 物镜：放大率 M_obj，目标 NA / 视场',
        '2. 4f 系统：第一个透镜做傅里叶变换，可放入滤波 / SLM',
        '3. 第二个透镜做反变换重建像',
        '4. 管镜 + 相机：相机像素应匹配 M = (f_tube / f_obj)',
        '5. 校准：用 USAF 1951 分辨率板验证极限分辨率'
      ],
      calcIds: ['holo-nearfar', 'holo-fresnel-fft'],
      entryKeys: ['h-prop', 'h-holo']
    },
    {
      kw: ['光纤', '光纤通信', '单模光纤', '色散'],
      title: '单模光纤链路方案',
      steps: [
        '1. 选波长：1310 nm 零色散 / 1550 nm 最低损耗',
        '2. 计算 NA / 模式场直径：MFD ≈ 9.2 µm @1550 nm',
        '3. 估算色度色散：约 17 ps/(nm·km)，长距需补偿',
        '4. 端接：FC/APC 接头，端面 < 0.5° 倾角',
        '5. 监测：OTDR 测断点 / 光功率计测链路损耗'
      ],
      calcIds: [],
      entryKeys: []
    },
    {
      kw: ['激光', 'laser', '谐振腔', '增益'],
      title: '固体激光器方案',
      steps: [
        '1. 增益介质：Nd:YAG / Ti:Sapphire 等',
        '2. 谐振腔：平面-凹面稳定腔；凹面镜 R = 3–10 m',
        '3. 泵浦源：LD 泵浦，耦合光纤注入',
        '4. 调 Q / 锁模：电光或声光调制',
        '5. 评估：输出功率 / M² / 谱宽 / 脉宽'
      ],
      calcIds: [],
      entryKeys: []
    }
  ]

  let scene = null
  for (const s of SCENES) {
    if (s.kw.some(k => q.includes(k.toLowerCase()))) { scene = s; break }
  }
  if (!scene) return null   // 无匹配场景 → 交回 knowledge 检索

  // 关联卡片
  const cards = []
  scene.calcIds.forEach(cid => {
    const c = getCalc(cid)
    if (c) cards.push({ kind: 'calc', id: cid, title: '🛠 ' + c.name, sub: c.catName + ' · ' + c.symbol, lines: [c.desc.slice(0, 60)], primary: false })
  })
  scene.entryKeys.forEach(k => {
    const en = findEntry(k)
    if (en) cards.push({ kind: 'entry', id: k, title: '📖 ' + en.title, sub: en.catName + ' · ' + en.tag, lines: [en.summary], primary: false })
  })

  return {
    text: '下面是「**' + scene.title + '**」的推荐步骤：\n\n' + scene.steps.join('\n'),
    cards
  }
}

/* ---------- 6. 工具路由 ---------- */
const TOOLS = [
  { name: 'greeting', test: q => /^(你好|您好|hi|hello|嗨|hey|你是谁|你是什么|自我介绍|帮助|help)/i.test(normalize(q)), run: toolGreeting },
  { name: 'list',     test: q => /(能做什么|列一下|列表|列出|全部能力|有哪些工具|列出来|总结|总览|盘点|自检|知识库|手册目录|都有什么|有什么内容)/.test(q), run: toolList },
  { name: 'plan',     test: q => /(方案|设计|实现|怎么做|如何实现|搭建|搭建一个|怎么配|配置|步骤|流程)/.test(normalize(q)), run: toolPlan },
  { name: 'compute',  test: q => /(\d|算一下|计算|求|估算|多少|多大|多少倍)/.test(q), run: toolCompute },
  { name: 'knowledge',test: () => true, run: toolKnowledge } /* 默认 */
]

function runAssistant(query) {
  const text = String(query || '').trim()
  if (!text) return { tool: 'greeting', text: '我在线，请问我吧。', cards: [] }
  // 优先级：greeting → list → plan → compute → knowledge
  for (const t of TOOLS) {
    if (t.test(text)) {
      try {
        const out = t.run(text)
        if (!out) continue   // 工具主动放行（如 plan 无匹配场景）→ 落到下一个工具
        return { tool: t.name, text: out.text || '', cards: out.cards || [] }
      } catch (e) {
        return { tool: t.name, text: '⚠️ 调用工具 [' + t.name + '] 出错：' + e.message, cards: [] }
      }
    }
  }
  return { tool: 'fallback', text: '我不太确定你想问什么 😕。试着直接说："菲涅尔判据"、"光镊方案"、"什么是全息" 或 "波长 532 算近场"。', cards: [] }
}

/** 列出全部计算器 → 给 UI 用作快速推荐 */
function listCalcsShort(limit = 8) {
  return calculators.slice(0, limit).map(c => ({ id: c.id, name: c.name, sub: c.sub, symbol: c.symbol, grad: c.grad, cat: c.catName }))
}

/** 推荐 prompt：给 UI 渲染"试试问..."模块 */
function suggestPrompts() {
  return [
    '什么是菲涅尔数？',
    'GS 迭代全息算法怎么用？',
    'WGS 加权算法权重怎么选？',
    '三维 GS 多平面设计',
    '遗传算法优化全息',
    '波长 532 nm 孔径 5 mm 距离 200 mm',
    '光镊方案',
    'SLM Gamma 标定怎么测？',
    '马吕斯定律是什么？',
    '总结一下系统都有什么',
    '闪耀光栅 Littrow 设计',
    '列出所有计算器'
  ]
}

module.exports = {
  runAssistant,
  listCalcsShort,
  suggestPrompts,
  // 暴露给开发者视图：
  TOOLS: TOOLS.map(t => ({ name: t.name }))
}
