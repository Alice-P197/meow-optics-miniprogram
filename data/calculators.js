/** 交互式计算器定义与算法库 */
const { sigNum, autoLen, waveRGB } = require('../utils/util')

const D2R = Math.PI / 180

function dLabel(v, d) {
  if (v === null || !isFinite(v)) return '—'
  return fix(v, d || 2)
}
function fix(v, n) {
  return parseFloat(v.toFixed(n)).toString()
}

/* ---------- 通用数值工具 ---------- */

// 毫米长度自适应显示（m / mm）
function mmStr(mm) {
  if (mm === null || !isFinite(mm)) return { v: '—', u: '' }
  const a = Math.abs(mm)
  if (a >= 1000) return { v: sigNum(mm / 1000, 4), u: 'm' }
  return { v: sigNum(mm, 4), u: 'mm' }
}

// 2x2 矩阵乘法（按行优先存储 [a,b,c,d]）
function mm2(m, n) {
  return [
    m[0] * n[0] + m[1] * n[2],
    m[0] * n[1] + m[1] * n[3],
    m[2] * n[0] + m[3] * n[2],
    m[2] * n[1] + m[3] * n[3]
  ]
}

// 复数工具（薄膜特征矩阵用），复数表示为 [实, 虚]
function cmul(a, b) { return [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]] }
function cinv(z) {
  const n = z[0] * z[0] + z[1] * z[1]
  if (n < 1e-30) return [0, 0]
  return [z[0] / n, -z[1] / n]
}
function cdiv(a, b) { return cmul(a, cinv(b)) }

const calculators = [
  /* ---------- 1 斯涅尔折射 ---------- */
  {
    id: 'snell',
    name: '折射与全反射',
    symbol: 'n·θ',
    cat: 'geo',
    catName: '几何光学',
    sub: '斯涅尔定律 · 临界角判断',
    grad: 'linear-gradient(135deg,#4f66ff,#1fb0d8)',
    desc: '计算光通过两种介质界面时的折射角，并自动判断是否发生全内反射（TIR）。',
    formulas: ['n₁ · sinθ₁ = n₂ · sinθ₂', 'sinθc = n₂ / n₁  (n₁ > n₂ 时)'],
    formulaNote: 'θ 均以入射界面法线为基准计量；θc 为全反射临界角。',
    inputs: [
      { key: 'n1', label: '入射介质折射率 n₁', unit: '', val: 1.0003, step: 0.01 },
      { key: 'n2', label: '出射介质折射率 n₂', unit: '', val: 1.5168, step: 0.01 },
      { key: 'a1', label: '入射角 θ₁', unit: '°', val: 30, step: 1 }
    ],
    presets: [
      { label: '空气 → BK7', set: { n1: 1.0003, n2: 1.5168, a1: 45 } },
      { label: '空气 → 水', set: { n1: 1.0003, n2: 1.3330, a1: 45 } },
      { label: 'BK7 → 空气', set: { n1: 1.5168, n2: 1.0003, a1: 45 } },
      { label: '水 → 空气', set: { n1: 1.3330, n2: 1.0003, a1: 60 } }
    ],
    compute(v) {
      const s1 = Math.sin(v.a1 * D2R)
      const ratio = v.n1 / v.n2
      const sin2 = ratio * s1
      const tir = sin2 >= 1
      const items = []
      let warning = ''
      let notes = []
      if (tir) {
        items.push({ label: '折射角 θ₂', val: '全反射', unit: '', primary: true })
        warning = '入射角超过临界角，发生全内反射（TIR），界面只存在反射光。'
      } else {
        const t2 = Math.asin(sin2) / D2R
        items.push({ label: '折射角 θ₂', val: dLabel(t2, 2), unit: '°', primary: true })
      }
      if (v.n1 > v.n2) {
        const tc = Math.asin(v.n2 / v.n1) / D2R
        items.push({ label: '临界角 θc', val: dLabel(tc, 2), unit: '°' })
        notes.push('n₁ > n₂（光从光密介质进入光疏介质）时存在临界角，仅当入射角 θ₁ < θc 才透射。')
      }
      if (v.n1 <= v.n2) {
        notes.push('n₁ < n₂ 时为光疏进光密，折射光偏向法线，不会全反射。')
      }
      return { items, warning, notes }
    }
  },

  /* ---------- 2 高斯成像 ---------- */
  {
    id: 'thinlens',
    name: '薄透镜成像',
    symbol: '1/f',
    cat: 'geo',
    catName: '几何光学',
    sub: '高斯公式 · 放大率 · 虚实像',
    grad: 'linear-gradient(135deg,#5f66ff,#4e9bff)',
    desc: '按薄透镜高斯公式由物距、焦距求像距，并判断像的虚实、正倒与放大关系。',
    formulas: ['1/f = 1/u + 1/v', 'v = u·f / (u − f)', '|m| = |v| / u'],
    formulaNote: '物距 u、像距 v、焦距 f 单位统一；u = f 时成像于无穷远。',
    inputs: [
      { key: 'f', label: '焦距 f', unit: 'mm', val: 100, step: 5 },
      { key: 'u', label: '物距 u', unit: 'mm', val: 150, step: 5 }
    ],
    presets: [
      { label: '实物实像', set: { f: 100, u: 250 } },
      { label: '等大实像 (u=2f)', set: { f: 100, u: 200 } },
      { label: '放大镜 (u<f)', set: { f: 100, u: 60 } },
      { label: '投影 (短焦)', set: { f: 25, u: 30 } }
    ],
    compute(v) {
      const { f, u } = v
      const items = []
      const notes = []
      let warning = ''
      if (Math.abs(u - f) < 1e-9) {
        items.push({ label: '像距 v', val: '无穷远', unit: '', primary: true })
        notes.push('物距恰等于焦距时，出射光为平行光，像在无穷远。')
        return { items, warning, notes }
      }
      const vv = f * u / (u - f)
      const mag = Math.abs(vv / u)
      items.push({ label: '像距 v（带符号）', val: sigNum(vv, 4), unit: 'mm', primary: true })
      items.push({ label: '像的位置', val: vv > 0 ? '透镜另一侧（实像）' : '物同侧（虚像）', unit: '' })
      items.push({ label: '横向放大率 |m|', val: sigNum(mag, 4), unit: '×' })
      if (u > f) {
        notes.push('u > f：成实像、倒立；' + (mag > 1 ? '物在 f~2f 之间放大，超过 2f 缩小。' : '物距 > 2f 时缩小。'))
      } else if (u < f) {
        notes.push('u < f：成虚像、正立、放大，等效放大镜/目镜使用。')
      }
      return { items, warning, notes }
    }
  },

  /* ---------- 3 透镜制造者方程 ---------- */
  {
    id: 'lensmaker',
    name: '透镜焦距计算',
    symbol: 'n−1',
    cat: 'geo',
    catName: '几何光学',
    sub: '透镜制造者方程 · 屈光度',
    grad: 'linear-gradient(135deg,#4a78ff,#3f5eff)',
    desc: '由折射率与两球面曲率半径计算薄透镜焦距与光焦度（空气中）。',
    formulas: ['1/f = (n − 1)·(1/R₁ − 1/R₂)', 'Φ(D) = 1000 / f(mm)'],
    formulaNote: '符号约定：光自左向右，曲率半径以球心位于表面右侧为正。双凸透镜 R₁ > 0、R₂ < 0。',
    inputs: [
      { key: 'n', label: '镜片折射率 n', unit: '', val: 1.5168, step: 0.01 },
      { key: 'R1', label: '第一面半径 R₁', unit: 'mm', val: 100, step: 5, signed: true, neg: false },
      { key: 'R2', label: '第二面半径 R₂', unit: 'mm', val: 100, step: 5, signed: true, neg: true }
    ],
    presets: [
      { label: '双凸 BK7', set: { n: 1.5168, R1: 100, R2: -100 } },
      { label: '双凹 BK7', set: { n: 1.5168, R1: -100, R2: 100 } },
      { label: '平凸 BK7', set: { n: 1.5168, R1: 100, R2: -1000000 } },
      { label: '弯月正', set: { n: 1.5168, R1: 100, R2: 300 } },
      { label: '高折射 SF11', set: { n: 1.7847, R1: 80, R2: -80 } }
    ],
    compute(v) {
      const phi = (v.n - 1) * (1 / v.R1 - 1 / v.R2) // mm^-1
      const items = []
      const notes = []
      if (Math.abs(phi) < 1e-9) {
        items.push({ label: '焦距 f', val: '无穷大', unit: '', primary: true })
        notes.push('两表面无净光焦度，等效平行平板（如等半径反向弯月）。')
        return { items, notes }
      }
      const f = 1 / phi
      const D = 1000 / f
      items.push({ label: '焦距 f', val: sigNum(f, 4), unit: 'mm', primary: true })
      items.push({ label: '光焦度 Φ', val: sigNum(D, 3), unit: 'D (m⁻¹)' })
      notes.push(f > 0 ? 'f > 0：正（会聚）透镜。' : 'f < 0：负（发散）透镜。')
      notes.push('R 取 ±1000000 近似代表平面（实际平面曲率半径为无穷大）。')
      notes.push('薄透镜近似忽略了厚度，厚透镜需按主面位置修正。')
      return { items, notes }
    }
  },

  /* ---------- 4 F数 ---------- */
  {
    id: 'fnum',
    name: 'F 数与口径',
    symbol: 'F/#',
    cat: 'geo',
    catName: '几何光学',
    sub: '相对孔径 · 数值孔径估算',
    grad: 'linear-gradient(135deg,#2f8cf2,#1bb6d8)',
    desc: '由焦距与入瞳直径求 F 数（相对孔径）及对应数值孔径 NA。',
    formulas: ['F/# = f / D', 'NA ≈ 1 / (2·F/#)'],
    formulaNote: 'NA ≈ 1/(2F/#) 适用于空气中无穷远物距的近似；像面照度正比于 1/(F/#)²。',
    inputs: [
      { key: 'f', label: '焦距 f', unit: 'mm', val: 50, step: 1 },
      { key: 'D', label: '入瞳直径 D', unit: 'mm', val: 25, step: 1 }
    ],
    presets: [
      { label: 'F/2.8', set: { f: 50, D: 18 } },
      { label: 'F/4', set: { f: 50, D: 12.5 } },
      { label: 'F/1.4', set: { f: 35, D: 25 } },
      { label: 'F/8 长焦', set: { f: 200, D: 25 } }
    ],
    compute(v) {
      const N = v.f / v.D
      const NA = 1 / (2 * N)
      const std = [1, 1.2, 1.4, 1.8, 2, 2.8, 3.5, 4, 5.6, 8, 11, 16, 22, 32]
      let best = std[0], diff = Infinity
      std.forEach(s => { const d = Math.abs(Math.log2(s) - Math.log2(N)); if (d < diff) { diff = d; best = s } })
      const items = [
        { label: 'F 数', val: 'F/' + sigNum(N, 4), unit: '', primary: true },
        { label: '最近标准档', val: 'F/' + best, unit: '' },
        { label: '数值孔径 NA (近似)', val: sigNum(NA, 3), unit: '' },
        { label: '相对孔径 D/f', val: '1:' + sigNum(N, 3), unit: '' }
      ]
      const notes = ['F 数越小，像面照度越高（每收小一档进光量减半），但景深与衍射随之变化。']
      return { items, notes }
    }
  },

  /* ---------- 5 望远镜 ---------- */
  {
    id: 'tele',
    name: '望远镜系统',
    symbol: 'f₁/f₂',
    cat: 'geo',
    catName: '几何光学',
    sub: '放大倍率 · 出瞳直径',
    grad: 'linear-gradient(135deg,#7a66ff,#4e9bff)',
    desc: '按伽利略/开普勒形式计算望远镜角放大倍率与出瞳直径。',
    formulas: ['M = f₁ / f₂', 'D_exit = D / M'],
    formulaNote: 'f₁ 物镜焦距、f₂ 目镜焦距、D 物镜入瞳直径。',
    inputs: [
      { key: 'f1', label: '物镜焦距 f₁', unit: 'mm', val: 500, step: 10 },
      { key: 'f2', label: '目镜焦距 f₂', unit: 'mm', val: 25, step: 5 },
      { key: 'D', label: '物镜口径 D', unit: 'mm', val: 60, step: 5 }
    ],
    presets: [
      { label: '天文望远镜', set: { f1: 1000, f2: 25, D: 100 } },
      { label: '观鸟镜', set: { f1: 540, f2: 20, D: 82 } },
      { label: '入门折射', set: { f1: 700, f2: 20, D: 60 } },
      { label: '双筒常用', set: { f1: 150, f2: 15, D: 30 } }
    ],
    compute(v) {
      const M = v.f1 / v.f2
      const Dp = v.D / M
      const cap = 2 * v.D
      const items = [
        { label: '放大倍率 M', val: sigNum(M, 4), unit: '×', primary: true },
        { label: '出瞳直径', val: sigNum(Dp, 3), unit: 'mm' }
      ]
      const notes = []
      if (Dp > 7.5) notes.push('出瞳直径超过人眼瞳孔（明视 ~2-3mm、暗适应最大 ~7mm），口径有浪费，低倍观察亮度受限。')
      if (Dp < 0.5) notes.push('出瞳过小，成像暗且易见飞蚊/灰尘，说明放大率超出有效范围。')
      notes.push(`经验上有效放大倍率上限约为口径毫米数 × 2（≈${Math.round(cap)}×），此时出瞳约 0.5mm。`)
      return { items, notes }
    }
  },

  /* ---------- 6 光子能量 ---------- */
  {
    id: 'photon',
    name: '波长·频率·能量',
    symbol: 'E=hc/λ',
    cat: 'wave',
    catName: '波动光学',
    sub: '光子能量 · 波数 · 波段',
    grad: 'linear-gradient(135deg,#1fb0d8,#12c2b0)',
    desc: '由波长换算光子频率、能量（eV/J）、波数，并识别所在波段。',
    formulas: ['E = h·c / λ', 'E(eV) = 1239.84 / λ(nm)', 'ν = c / λ'],
    formulaNote: '常用记忆：E(eV) × λ(nm) ≈ 1240。',
    inputs: [
      { key: 'wl', label: '波长 λ', unit: 'nm', val: 532, step: 1, unitOptions: ['nm', 'μm'], unitSel: 0 }
    ],
    presets: [
      { label: '绿光 532', set: { wl: 532 } },
      { label: 'He-Ne 633', set: { wl: 632.8 } },
      { label: 'DUV 193', set: { wl: 193 } },
      { label: 'Nd:YAG 1064', set: { wl: 1064 } },
      { label: '通信 1550', set: { wl: 1550 } },
      { label: 'CO₂ 10.6μm', unit: { wl: 'μm' }, set: { wl: 10.6 } }
    ],
    compute(v) {
      const nm = v.wl // 已折算到 nm
      const EeV = 1239.841984 / nm
      const EJ = EeV * 1.602176634e-19
      const THz = 299792.458 / nm
      const cm1 = 1e7 / nm
      let region = '远红外'
      if (nm < 100) region = '极紫外 EUV'
      else if (nm < 200) region = '深紫外 DUV'
      else if (nm < 400) region = '紫外 UV'
      else if (nm <= 780) region = '可见光'
      else if (nm <= 1400) region = '近红外 NIR'
      else if (nm <= 3000) region = '短波红外 SWIR'
      else if (nm <= 8000) region = '中波红外 MWIR'
      else region = '长波红外 LWIR'
      const items = [
        { label: '光子能量 E', val: sigNum(EeV, 5), unit: 'eV', primary: true },
        { label: '能量 E', val: sigNum(EJ, 3), unit: 'J' },
        { label: '频率 ν', val: sigNum(THz, 5), unit: 'THz' },
        { label: '波数 ṽ', val: sigNum(cm1, 5), unit: 'cm⁻¹' },
        { label: '波段', val: region, unit: '' }
      ]
      const swatch = nm >= 380 && nm <= 780 ? waveRGB(nm) : null
      if (swatch) {
        const cname = nm < 450 ? '紫' : nm < 490 ? '蓝' : nm < 510 ? '青' : nm < 575 ? '绿' : nm < 590 ? '黄' : nm < 620 ? '橙' : '红'
        items.push({ label: '近似颜色', val: cname + '（可见光）', unit: '', swatch: `rgb(${swatch.r},${swatch.g},${swatch.b})` })
      }
      const notes = ['若输入 μm，波长已自动折算为 nm 后计算。']
      return { items, notes }
    }
  },

  /* ---------- 7 菲涅尔反射 ---------- */
  {
    id: 'fresnel',
    name: '界面反射率',
    symbol: 'R=(n₁-n₂)²',
    cat: 'wave',
    catName: '波动光学',
    sub: '正入射反射 · 透过率',
    grad: 'linear-gradient(135deg,#12c2b0,#12a594)',
    desc: '计算光正入射两种介质界面时的菲涅尔反射率与透过率。',
    formulas: ['R = [(n₁ − n₂)/(n₁ + n₂)]²', 'T = 4·n₁·n₂ / (n₁ + n₂)²'],
    formulaNote: '适用于正入射（或小角度），忽略吸收；空气玻璃单面约 4%。',
    inputs: [
      { key: 'n1', label: '介质 1 折射率 n₁', unit: '', val: 1.0003, step: 0.01 },
      { key: 'n2', label: '介质 2 折射率 n₂', unit: '', val: 1.5168, step: 0.01 }
    ],
    presets: [
      { label: '空气 → BK7', set: { n1: 1.0003, n2: 1.5168 } },
      { label: '空气 → 熔石英', set: { n1: 1.0003, n2: 1.4585 } },
      { label: '空气 → 硅 (IR)', set: { n1: 1.0003, n2: 3.5 } },
      { label: '玻璃 → 水', set: { n1: 1.5168, n2: 1.3330 } },
      { label: '空气 → 金刚石', set: { n1: 1.0003, n2: 2.417 } }
    ],
    compute(v) {
      const a = v.n1 - v.n2
      const b = v.n1 + v.n2
      const R = (a * a) / (b * b)
      const T = 1 - R
      const T2 = (1 - R) * (1 - R)
      const items = [
        { label: '反射率 R', val: sigNum(R * 100, 4), unit: '%', primary: true },
        { label: '透过率 T (单界面)', val: sigNum(T * 100, 4), unit: '%' },
        { label: '双面裸窗透过 (约)', val: sigNum(T2 * 100, 3), unit: '%' }
      ]
      const notes = ['界面两侧折射率差越大反射越强；镀增透膜可显著降低界面反射。']
      return { items, notes }
    }
  },

  /* ---------- 8 NA 与衍射极限 ---------- */
  {
    id: 'diff',
    name: 'NA 与衍射极限',
    symbol: 'λ/2NA',
    cat: 'wave',
    catName: '波动光学',
    sub: '分辨率 · 艾里斑',
    grad: 'linear-gradient(135deg,#8a5cff,#c24dff)',
    desc: '由波长与数值孔径 NA 计算显微/成像系统的衍射极限分辨率。',
    formulas: ['d_Abbe = λ / (2·NA)', 'd_Rayleigh = 0.61·λ / NA', 'D_Airy = 1.22·λ / NA'],
    formulaNote: 'NA = n·sinθ，θ 为物方孔径半角；λ 取真空中波长。',
    inputs: [
      { key: 'wl', label: '波长 λ', unit: 'nm', val: 550, step: 1, unitOptions: ['nm', 'μm'], unitSel: 0 },
      { key: 'na', label: '数值孔径 NA', unit: '', val: 0.8, step: 0.05 }
    ],
    presets: [
      { label: '干镜 0.8', set: { na: 0.8, wl: 550 } },
      { label: '油浸 1.45', set: { na: 1.45, wl: 550 } },
      { label: '水浸 1.2', set: { na: 1.2, wl: 550 } },
      { label: 'DUV 光刻 0.9', set: { na: 0.9, wl: 193 } },
      { label: '空气 0.25', set: { na: 0.25, wl: 550 } }
    ],
    compute(v) {
      const nm = v.wl
      const NA = v.na
      const abbe = nm / (2 * NA)
      const ray = 0.61 * nm / NA
      const airy = 1.22 * nm / NA
      const mk = a => { const o = autoLen(a); return o.v + ' ' + o.u }
      const items = [
        { label: 'Abbe 分辨极限', val: mk(abbe), unit: '', primary: true },
        { label: 'Rayleigh 判据', val: mk(ray), unit: '' },
        { label: '艾里斑直径', val: mk(airy), unit: '' }
      ]
      const notes = ['NA 越大、波长越短，分辨率越高。对浸液系统，实际 NA 上限接近介质折射率 n。']
      return { items, notes }
    }
  },

  /* ---------- 9 ABCD 矩阵光学 ---------- */
  {
    id: 'abcd',
    name: 'ABCD 矩阵光学',
    symbol: 'A B C D',
    cat: 'geo',
    catName: '几何光学',
    sub: '光线矩阵 · 等效焦距',
    grad: 'linear-gradient(135deg,#6b7aff,#4f9bff)',
    desc: '用近轴光线矩阵描述「透镜1 → 自由空间 d → 透镜2」系统，求传输矩阵、等效焦距、主点与出射光线。',
    formulas: ['M = L(f₂)·T(d)·L(f₁)', 'T(d) = [[1, d], [0, 1]]', 'L(f) = [[1, 0], [−1/f, 1]]', 'f_eff = −1 / C'],
    formulaNote: '会聚透镜 f > 0、发散透镜 f < 0；矩阵按光线实际经过的顺序相乘（最右先作用）。',
    inputs: [
      { key: 'f1', label: '透镜1 焦距 f₁', unit: 'mm', val: 100, step: 5, signed: true, neg: false },
      { key: 'd', label: '两透镜间距 d', unit: 'mm', val: 60, step: 5 },
      { key: 'f2', label: '透镜2 焦距 f₂', unit: 'mm', val: 50, step: 5, signed: true, neg: false },
      { key: 'y0', label: '入射光线高度 y₀', unit: 'mm', val: 10, step: 1, signed: true, neg: false },
      { key: 't0', label: '入射光线斜率 θ₀', unit: 'mrad', val: 0, step: 0.5, signed: true, neg: false }
    ],
    presets: [
      { label: '开普勒望远镜', set: { f1: 150, d: 175, f2: 25, y0: 10, t0: 0 } },
      { label: '4f 中继系统', set: { f1: 100, d: 200, f2: 100, y0: 10, t0: 0 } },
      { label: '伽利略望远镜', set: { f1: 200, d: 150, f2: -50, y0: 10, t0: 0 } },
      { label: '密接会聚组合', set: { f1: 100, d: 0, f2: 100, y0: 10, t0: 0 } },
      { label: '无焦缩束 2:1', set: { f1: 200, d: 300, f2: 100, y0: 10, t0: 0 } }
    ],
    compute(v) {
      const items = []
      const notes = []
      let warning = ''
      const tiny = 1e-6
      const f1 = Math.abs(v.f1) < tiny ? Infinity : v.f1
      const f2 = Math.abs(v.f2) < tiny ? Infinity : v.f2
      const i1 = isFinite(f1) ? 1 / f1 : 0
      const i2 = isFinite(f2) ? 1 / f2 : 0
      // M = L2 · T(d) · L1
      const M = mm2([1, 0, -i2, 1], mm2([1, v.d, 0, 1], [1, 0, -i1, 1]))
      const A = M[0], B = M[1], C = M[2], D = M[3]
      const det = A * D - B * C
      items.push({ label: '矩阵元 A', val: sigNum(A, 5), unit: '' })
      items.push({ label: '矩阵元 B', val: sigNum(B, 5), unit: 'mm' })
      items.push({ label: '矩阵元 C', val: sigNum(C, 6), unit: 'mm⁻¹' })
      items.push({ label: '矩阵元 D', val: sigNum(D, 5), unit: '' })

      const afocal = Math.abs(C) < 1e-12
      if (afocal) {
        items.push({ label: '系统等效焦距', val: '∞（无焦系统）', unit: '', primary: true })
        notes.push('C ≈ 0：系统无焦（准直），平行光出射仍为平行光；开普勒型倒立、伽利略型正立。')
      } else {
        const fe = -1 / C
        const fs = mmStr(fe)
        items.push({ label: '等效焦距 f_eff', val: fs.v, unit: fs.u, primary: true })
        const bfd = -A / C
        const bfdS = mmStr(bfd)
        items.push({ label: '后焦距（透镜2右侧）', val: bfdS.v, unit: bfdS.u })
        const ffd = D / C
        const ffdS = mmStr(ffd)
        items.push({ label: '前焦距（透镜1左侧）', val: ffdS.v, unit: ffdS.u })
        notes.push('前/后焦距分别自透镜1与透镜2主面位置起算；数值为正表示焦点位于元件外侧。')
      }

      // 光线追迹
      const th0 = (v.t0 || 0) * 1e-3
      const y1 = v.y0 || 0
      const y2 = A * y1 + B * th0
      const th2 = (C * y1 + D * th0) * 1e3 // mrad
      items.push({ label: '出射高度 y₂', val: sigNum(y2, 4), unit: 'mm' })
      items.push({ label: '出射斜率 θ₂', val: sigNum(th2, 3), unit: 'mrad' })
      if (Math.abs(det - 1) > 1e-6) warning = '矩阵行列式偏离 1，可能参数矛盾（理想系统 det = 1）。'
      if (!afocal && isFinite(f1) && Math.abs(v.d - (f1 + f2)) < 1e-6) {
        notes.push('d = f₁ + f₂：两焦点重合，组合为无焦望远镜系统。')
      }
      notes.push('θ 以 mrad 输入，内部自动换算为弧度参与矩阵乘法。')
      return { items, warning, notes }
    }
  },

  /* ---------- 10 布儒斯特角 ---------- */
  {
    id: 'brewster',
    name: '布儒斯特角',
    symbol: 'tanθB',
    cat: 'wave',
    catName: '波动光学',
    sub: '起偏角 · s/p 反射率',
    grad: 'linear-gradient(135deg,#00b8b4,#2fcb7a)',
    desc: '计算光从介质1斜入射介质2的布儒斯特角，p 偏振反射消失，反射光为完全 s 偏振。',
    formulas: ['tanθ_B = n₂ / n₁', 'R_p(θ_B) = 0'],
    formulaNote: 'θ_B 自界面法线起算；n₁ 为入射介质、n₂ 为透射介质折射率。',
    inputs: [
      { key: 'n1', label: '入射介质折射率 n₁', unit: '', val: 1.0003, step: 0.01 },
      { key: 'n2', label: '透射介质折射率 n₂', unit: '', val: 1.5168, step: 0.01 }
    ],
    presets: [
      { label: '空气 → 冕牌玻璃', set: { n1: 1.0003, n2: 1.5168 } },
      { label: '空气 → 水', set: { n1: 1.0003, n2: 1.3330 } },
      { label: '空气 → 硅 (IR)', set: { n1: 1.0003, n2: 3.5 } },
      { label: '玻璃 → 空气', set: { n1: 1.5168, n2: 1.0003 } }
    ],
    compute(v) {
      const thB = Math.atan2(v.n2, v.n1)
      const c1 = Math.cos(thB)
      const s1 = Math.sin(thB)
      const s2 = (v.n1 / v.n2) * s1
      const c2 = Math.sqrt(Math.max(0, 1 - s2 * s2))
      const rs = (v.n1 * c1 - v.n2 * c2) / (v.n1 * c1 + v.n2 * c2)
      const rp = (v.n2 * c1 - v.n1 * c2) / (v.n2 * c1 + v.n1 * c2)
      const items = [
        { label: '布儒斯特角 θ_B', val: dLabel(thB / D2R, 2), unit: '°', primary: true },
        { label: 'p 偏振反射率 R_p', val: sigNum(Math.abs(rp * rp) * 100, 3), unit: '%' },
        { label: 's 偏振反射率 R_s', val: sigNum(Math.abs(rs * rs) * 100, 3), unit: '%' },
        { label: '反射光偏振', val: '完全 s 偏振（⊥ 入射面）', unit: '' }
      ]
      const notes = [
        '以布儒斯特角入射时，p 偏振（∥ 入射面）反射率严格为 0，反射光为纯 s 偏振，透射光 p 分量最强。',
        '激光器常用布儒斯特窗：对 p 偏振的插入损耗极低，同时让腔内光呈线偏振。'
      ]
      return { items, notes }
    }
  },

  /* ---------- 11 偏振片与马吕斯定律 ---------- */
  {
    id: 'malus',
    name: '偏振片与马吕斯定律',
    symbol: 'cos²θ',
    cat: 'wave',
    catName: '波动光学',
    sub: '线偏光透射 · 消光',
    grad: 'linear-gradient(135deg,#16c4c4,#3ecfa8)',
    desc: '线偏振光通过偏振片（检偏器）的透射强度按马吕斯定律随夹角变化。',
    formulas: ['I = I₀ · cos²θ'],
    formulaNote: 'θ 为入射偏振方向与检偏器透光轴的夹角；仅对理想线偏振光成立。',
    inputs: [
      { key: 'i0', label: '入射光强 I₀', unit: 'mW', val: 100, step: 5 },
      { key: 'th', label: '夹角 θ', unit: '°', val: 45, step: 5 }
    ],
    presets: [
      { label: '45° 斜放', set: { i0: 100, th: 45 } },
      { label: '平行（θ=0）', set: { i0: 100, th: 0 } },
      { label: '正交（θ=90°）', set: { i0: 100, th: 90 } },
      { label: '布儒斯特反射后', set: { i0: 100, th: 30 } }
    ],
    compute(v) {
      const c2 = Math.cos(v.th * D2R) * Math.cos(v.th * D2R)
      const T = c2 * 100
      const I = v.i0 * c2
      const items = [
        { label: '透射率 T = cos²θ', val: sigNum(T, 4), unit: '%', primary: true },
        { label: '透射光强 I', val: sigNum(I, 4), unit: 'mW' }
      ]
      const notes = []
      if (Math.abs(v.th - 90) < 0.5) {
        notes.push('θ = 90°（正交放置）时理想透射为零，可实现暗场/消光。')
      } else if (Math.abs(v.th) < 0.5) {
        notes.push('θ = 0 平行放置：透过最大，剩余损耗来自吸收与表面反射。')
      } else {
        notes.push(`夹角 ${sigNum(v.th, 4)}°：仅透射与透光轴平行的分量。`)
      }
      notes.push('实际偏振片存在消光比（透过/正交透过可达 10³–10⁵），且在大角度离轴时仍有残余透过。')
      return { items, notes }
    }
  },

  /* ---------- 12 波片与偏振变换 ---------- */
  {
    id: 'waveplate',
    name: '波片与偏振变换',
    symbol: 'δ·β',
    cat: 'wave',
    catName: '波动光学',
    sub: '相位延迟 · 出射偏振态',
    grad: 'linear-gradient(135deg,#38b2ff,#8f6bff)',
    desc: '用琼斯矢量计算线偏振光通过相位延迟片后的偏振态（线/圆/椭圆）。',
    formulas: ['E_f = cosβ,  E_s = sinβ·e^{iδ}', 'S₁ = cos2β,  S₂ = sin2β·cosδ,  S₃ = sin2β·sinδ'],
    formulaNote: 'β 为入射偏振与快轴夹角，δ 为快慢轴相位延迟（λ/4 片 δ=90°、λ/2 片 δ=180°）；结果相对快轴给出。',
    inputs: [
      {
        key: 'ret', label: '相位延迟 δ', val: 90,
        unitOptions: ['°', 'λ'], unitSel: 0, unitFactors: [1, 360], unitSteps: [15, 0.05]
      },
      { key: 'beta', label: '入射偏振与快轴夹角 β', unit: '°', val: 45, step: 5 }
    ],
    presets: [
      { label: 'λ/4 + 45° → 圆偏', unit: { ret: 'λ' }, set: { ret: 0.25, beta: 45 } },
      { label: 'λ/4 + 30° → 椭圆', unit: { ret: 'λ' }, set: { ret: 0.25, beta: 30 } },
      { label: 'λ/2 旋转 2β', unit: { ret: 'λ' }, set: { ret: 0.5, beta: 45 } },
      { label: 'λ/2 + 22.5°', unit: { ret: 'λ' }, set: { ret: 0.5, beta: 22.5 } },
      { label: '全波片（不改变）', unit: { ret: 'λ' }, set: { ret: 1, beta: 45 } },
      { label: '3λ/4（反向圆偏）', unit: { ret: 'λ' }, set: { ret: 0.75, beta: 45 } }
    ],
    compute(v) {
      const dR = v.ret * D2R
      const bR = v.beta * D2R
      const S1 = Math.cos(2 * bR)
      const S2 = Math.sin(2 * bR) * Math.cos(dR)
      const S3 = Math.sin(2 * bR) * Math.sin(dR)
      const s3c = Math.max(-1, Math.min(1, S3))
      const psi = 0.5 * Math.atan2(S2, S1) / D2R
      const chi = 0.5 * Math.asin(s3c) / D2R
      const ratio = Math.tan(Math.abs(chi) * D2R)
      let state
      if (Math.abs(S3) > 0.995) state = '圆偏振'
      else if (Math.abs(S3) < 0.02) state = '线偏振'
      else state = '椭圆偏振'
      const items = [
        { label: '出射偏振态', val: state, unit: '', primary: true },
        { label: '长轴方位角 ψ（相对快轴）', val: sigNum(psi, 3), unit: '°' },
        { label: '椭率角 χ', val: sigNum(chi, 3), unit: '°' },
        { label: '短/长轴比 b/a', val: sigNum(ratio, 4), unit: '' },
        { label: '圆度分量 S₃', val: sigNum(S3, 4), unit: '' },
        { label: 'S₁ / S₂', val: sigNum(S1, 4) + ' / ' + sigNum(S2, 4), unit: '' }
      ]
      const notes = []
      const retL = v.ret
      if (Math.abs(retL - 90) < 0.5 && Math.abs(v.beta - 45) < 0.5) {
        notes.push('λ/4 片且 β = 45°：线偏转圆偏振，是产生圆偏振的标准方法。')
      }
      if (Math.abs(retL - 180) < 0.5) {
        notes.push('λ/2 片：出射仍为线偏振，偏振方向相对输入旋转 2β。')
      }
      if (Math.abs(retL) < 0.5 || Math.abs(retL - 360) < 0.5) {
        notes.push('零/全波延迟：偏振态不变（β≠0 时有附加整体相位）。')
      }
      notes.push('S₃ 正负代表旋向，不同教材对“左旋/右旋”的定义可能相反，手性需结合琼斯约定核对。')
      return { items, notes }
    }
  },

  /* ---------- 13 单层增透膜 ---------- */
  {
    id: 'coat',
    name: '单层增透膜设计',
    symbol: 'λ/4',
    cat: 'wave',
    catName: '波动光学',
    sub: '减反条件 · 膜厚估算',
    grad: 'linear-gradient(135deg,#7f8cff,#b45bff)',
    desc: '按 λ/4 单层干涉计算镀膜界面的反射率、最佳膜料折射率与物理膜厚。',
    formulas: ['R = [(n₀n_s − n₁²) / (n₀n_s + n₁²)]²', 'n₁_opt = √(n₀·n_s)', 'd = λ₀ / (4·n₁)'],
    formulaNote: 'n₀ 入射介质、n₁ 膜层、n_s 基底；仅在 λ₀ 处膜层光学厚度为 λ₀/4 时成立。',
    inputs: [
      { key: 'n0', label: '入射介质折射率 n₀', unit: '', val: 1, step: 0.01 },
      { key: 'n1', label: '膜层折射率 n₁', unit: '', val: 1.38, step: 0.01 },
      { key: 'ns', label: '基底折射率 n_s', unit: '', val: 1.5168, step: 0.01 },
      { key: 'wl', label: '设计波长 λ₀', unit: 'nm', val: 550, step: 5, unitOptions: ['nm', 'μm'], unitSel: 0 }
    ],
    presets: [
      { label: 'MgF₂/BK7 (可见)', set: { n0: 1, n1: 1.38, ns: 1.5168, wl: 550 } },
      { label: 'SiO₂/熔石英', set: { n0: 1, n1: 1.4585, ns: 1.4585, wl: 550 } },
      { label: 'ZnS/Ge 红外 (10.6μm)', unit: { wl: 'μm' }, set: { n0: 1, n1: 2.2, ns: 4.0, wl: 10.6 } },
      { label: '高反情形 TiO₂/玻璃', set: { n0: 1, n1: 2.35, ns: 1.5168, wl: 550 } }
    ],
    compute(v) {
      const num = v.n0 * v.ns - v.n1 * v.n1
      const den = v.n0 * v.ns + v.n1 * v.n1
      const R = (num / den) * (num / den)
      const R0 = ((v.ns - v.n0) / (v.ns + v.n0)) * ((v.ns - v.n0) / (v.ns + v.n0))
      const nOpt = Math.sqrt(v.n0 * v.ns)
      const d = v.wl / (4 * v.n1) // nm
      const items = [
        { label: 'λ/4 单层反射率 R', val: sigNum(R * 100, 4), unit: '%', primary: true },
        { label: '裸基底反射率 R₀', val: sigNum(R0 * 100, 3), unit: '%' },
        { label: '最佳膜料折射率 n₁_opt', val: sigNum(nOpt, 4), unit: '' },
        { label: '膜层物理厚度 d', val: sigNum(d, 3), unit: 'nm' },
        { label: '光学厚度 n₁·d', val: sigNum(v.n1 * d, 3), unit: 'nm (≈λ₀/4)' }
      ]
      const notes = []
      if (Math.abs(v.n1 - nOpt) < 0.005) notes.push('膜料折射率接近最佳值 √(n₀n_s)，中心波长处反射趋近于零。')
      else if (v.n1 < nOpt) notes.push('n₁ < √(n₀n_s)：膜层偏“欠匹配”，仍可减反但残留反射。')
      else if (v.n1 > nOpt) notes.push('n₁ > √(n₀n_s)：膜层“过匹配”，λ/4 层反而增强反射。')
      notes.push('λ/4 减反膜是窄带设计：偏离 λ₀ 后反射率上升，宽带需多层梯度膜系。')
      return { items, notes }
    }
  },

  /* ---------- 14 λ/4 多层高反膜 ---------- */
  {
    id: 'stack',
    name: 'λ/4 多层反射膜',
    symbol: '(L H)^N',
    cat: 'wave',
    catName: '波动光学',
    sub: '介质反射镜 · 周期堆',
    grad: 'linear-gradient(135deg,#8f6bff,#ec6bff)',
    desc: '用光学特征矩阵计算 λ/4 高低折射率周期堆的中心反射率与单层膜厚。',
    formulas: ['结构：基底 | (L·H)^N | 空气（每层光学厚度 λ₀/4）', 'R = |(η₀ − Y) / (η₀ + Y)|²'],
    formulaNote: 'N 为周期对数，共 2N 层；η 为导纳（正入射时取折射率），Y 由特征矩阵逐层级联求得，H 顶层朝入射侧。',
    inputs: [
      { key: 'nH', label: '高折射率层 n_H', unit: '', val: 2.35, step: 0.01 },
      { key: 'nL', label: '低折射率层 n_L', unit: '', val: 1.46, step: 0.01 },
      { key: 'ns', label: '基底折射率 n_s', unit: '', val: 1.52, step: 0.01 },
      { key: 'wl', label: '中心波长 λ₀', unit: 'nm', val: 1064, step: 1, unitOptions: ['nm', 'μm'], unitSel: 0 },
      { key: 'N', label: '周期对数 N', unit: '', val: 4, step: 1 }
    ],
    presets: [
      { label: 'TiO₂/SiO₂ @1064', set: { nH: 2.35, nL: 1.46, ns: 1.52, wl: 1064, N: 4 } },
      { label: 'TiO₂/SiO₂ @532', set: { nH: 2.35, nL: 1.46, ns: 1.52, wl: 532, N: 5 } },
      { label: 'Ta₂O₅/SiO₂ @1550', set: { nH: 2.1, nL: 1.46, ns: 1.52, wl: 1550, N: 4 } },
      { label: 'ZnS/Ge @10.6μm', unit: { wl: 'μm' }, set: { nH: 2.2, nL: 1.46, ns: 4.0, wl: 10.6, N: 3 } }
    ],
    compute(v) {
      const n0 = 1 // 入射介质默认空气
      let Bc = [1, 0]
      let Cc = [v.ns, 0]
      const nLayer = Math.max(0, Math.round(v.N)) * 2
      for (let i = 0; i < nLayer; i++) {
        const eta = i % 2 === 0 ? v.nL : v.nH // 基底侧起交替 L/H，顶层为 H
        const pb = Bc, pc = Cc
        Bc = [-pc[1] / eta, pc[0] / eta]
        Cc = [-eta * pb[1], eta * pb[0]]
      }
      const Y = cdiv(Cc, Bc)
      const re = cdiv([n0 - Y[0], -Y[1]], [n0 + Y[0], Y[1]])
      const R = Math.min(0.999999, re[0] * re[0] + re[1] * re[1])
      const dH = v.wl / (4 * v.nH)
      const dL = v.wl / (4 * v.nL)
      const items = [
        { label: '中心反射率 R(λ₀)', val: sigNum(R * 100, 4), unit: '%', primary: true },
        { label: '总层数', val: String(nLayer), unit: '层' },
        { label: '单层 H 物理厚度', val: sigNum(dH, 3), unit: 'nm' },
        { label: '单层 L 物理厚度', val: sigNum(dL, 3), unit: 'nm' },
        { label: '一个周期厚度', val: sigNum(dH + dL, 3), unit: 'nm' }
      ]
      const notes = [
        '每层为 λ₀/4 光学厚度，周期数越多反射率越接近 1，但反射带宽基本不变。',
        '高反带的近似相对带宽 Δλ/λ₀ ≈ (4/π)·arcsin[(n_H − n_L)/(n_H + n_L)]，与周期数无关。'
      ]
      return { items, notes }
    }
  },

  /* ---------- 15 阶跃光纤 ---------- */
  {
    id: 'fiber',
    name: '阶跃光纤与模式',
    symbol: 'V 数',
    cat: 'phys',
    catName: '光子学',
    sub: 'NA · 归一化频率 · 单模',
    grad: 'linear-gradient(135deg,#0fb3a0,#12d0a4)',
    desc: '由纤芯半径、数值孔径与波长计算阶跃光纤的 V 数、模式数、截止波长与接受锥角。',
    formulas: ['V = 2π·a·NA / λ', 'λ_c = 2π·a·NA / 2.4048', 'M ≈ V²/2（多模近似）'],
    formulaNote: '单模条件 V < 2.4048；V²/2 为阶跃光纤近似模式总数（含简并）。',
    inputs: [
      { key: 'a', label: '纤芯半径 a', unit: 'μm', val: 4, step: 0.1 },
      { key: 'na', label: '数值孔径 NA', unit: '', val: 0.12, step: 0.005 },
      { key: 'wl', label: '工作波长 λ', unit: 'nm', val: 1550, step: 1, unitOptions: ['nm', 'μm'], unitSel: 0 }
    ],
    presets: [
      { label: '单模 @1550', set: { a: 4, na: 0.12, wl: 1550 } },
      { label: '单模 @1310', set: { a: 4, na: 0.12, wl: 1310 } },
      { label: '62.5/125 多模', set: { a: 31.25, na: 0.275, wl: 850 } },
      { label: 'OM3 50/125', set: { a: 25, na: 0.2, wl: 850 } },
      { label: '105/125 泵浦纤', set: { a: 52.5, na: 0.22, wl: 940 } }
    ],
    compute(v) {
      const lam = v.wl / 1000 // μm
      const V = (2 * Math.PI * v.a * v.na) / lam
      const lamC = (2 * Math.PI * v.a * v.na) / 2.4048 * 1000 // nm
      const thA = Math.asin(Math.min(1, v.na)) / D2R
      const items = []
      let warning = ''
      items.push({ label: '归一化频率 V', val: sigNum(V, 4), unit: '', primary: true })
      if (V < 2.4048) {
        items.push({ label: '模式状态', val: '单模（仅 LP₀₁）', unit: '' })
      } else {
        items.push({ label: '模式状态', val: '多模', unit: '' })
        items.push({ label: '导模数 M ≈ V²/2', val: sigNum(V * V / 2, 4), unit: '' })
      }
      items.push({ label: '单模截止波长 λ_c', val: sigNum(lamC, 4), unit: 'nm' })
      items.push({ label: '接受半角 θ_a (空气)', val: sigNum(thA, 3), unit: '°' })
      items.push({ label: '数值孔径 NA', val: sigNum(v.na, 4), unit: '' })
      if (V < 2.4048 && V > 1.1) {
        const mfd = 2 * v.a * (0.65 + 1.619 * Math.pow(V, -1.5) + 2.879 * Math.pow(V, -6))
        items.push({ label: '模场直径 MFD (近似)', val: sigNum(mfd, 4), unit: 'μm' })
      }
      const notes = []
      if (V > 2.4048) {
        notes.push('V ≥ 2.4048：高阶模开始导波，光纤进入多模；模式越多模间色散越大。')
      } else {
        notes.push('λ > λ_c：光纤运行在单模区。NA 越大或芯径越大，单模截止波长越长。')
      }
      notes.push('接受锥角 = 2·θ_a（空气中）；数值孔径由 Δn = n_co² − n_cl² 开方决定。')
      return { items, warning, notes }
    }
  },

  /* ---------- 16 高斯光束传播 ---------- */
  {
    id: 'gauss',
    name: '高斯光束传播',
    symbol: 'w(z)',
    cat: 'phys',
    catName: '光子学',
    sub: '瑞利长度 · 发散角 · M²',
    grad: 'linear-gradient(135deg,#ff7b5f,#c86bff)',
    desc: '由束腰、波长与 M² 计算瑞利长度、发散角及任意距离处的光斑与波前曲率半径。',
    formulas: ['z_R = π·w₀² / (λ·M²)', 'w(z) = w₀·√(1 + (z/z_R)²)', 'R(z) = z·[1 + (z_R/z)²]', 'θ = M²·λ / (π·w₀)'],
    formulaNote: 'z_R 为瑞利长度；θ 为远场半角发散；w₀、θ 之积即束参积 BPP = M²·λ/π。',
    inputs: [
      { key: 'wl', label: '波长 λ', unit: 'nm', val: 632.8, step: 0.5, unitOptions: ['nm', 'μm'], unitSel: 0 },
      { key: 'M2', label: '光束质量 M²', unit: '', val: 1, step: 0.05 },
      {
        key: 'w0', label: '束腰半径 w₀', val: 0.5,
        unitOptions: ['μm', 'mm'], unitSel: 1, unitFactors: [1, 1000], unitSteps: [10, 0.005]
      },
      {
        key: 'z', label: '观察距离 z', val: 500,
        unitOptions: ['mm', 'm'], unitSel: 0, unitFactors: [1, 1000], unitSteps: [5, 0.005]
      }
    ],
    presets: [
      { label: 'He-Ne 标准', set: { wl: 632.8, M2: 1, w0: 0.5, z: 1000 } },
      { label: '532 nm DPSS', set: { wl: 532, M2: 1.05, w0: 0.3, z: 500 } },
      { label: '单模光纤 1550', unit: { w0: 'μm' }, set: { wl: 1550, M2: 1, w0: 5.2, z: 100 } },
      { label: '高功率光纤激光', unit: { w0: 'μm' }, set: { wl: 1070, M2: 1.4, w0: 22, z: 300 } }
    ],
    compute(v) {
      const lam = v.wl * 1e-6 // mm
      const w0 = v.w0 / 1000 // mm
      const zR = Math.PI * w0 * w0 / (lam * v.M2)
      const theta = v.M2 * lam / (Math.PI * w0) // rad 半角
      const thm = theta * 1000 // mrad
      const bpp = w0 * thm // mm·mrad
      const z = v.z
      const wz = w0 * Math.sqrt(1 + Math.pow(z / zR, 2))
      const items = []
      const notes = []
      const zr = mmStr(zR)
      items.push({ label: '瑞利长度 z_R', val: zr.v, unit: zr.u, primary: true })
      items.push({ label: '共焦参数 b = 2z_R', val: mmStr(2 * zR).v, unit: mmStr(2 * zR).u })
      items.push({ label: '远场半角发散 θ', val: sigNum(thm, 4), unit: 'mrad' })
      items.push({ label: '全角发散 2θ', val: sigNum(2 * thm, 4), unit: 'mrad' })
      items.push({ label: '束参积 BPP', val: sigNum(bpp, 4), unit: 'mm·mrad' })
      const ws = mmStr(wz)
      items.push({ label: `光斑半径 w(${z >= 1000 ? sigNum(z / 1000, 4) + 'm' : sigNum(z, 4) + 'mm'})`, val: ws.v, unit: ws.u })
      if (Math.abs(z) < 1e-9) {
        items.push({ label: '波前曲率半径 R(z)', val: '∞（束腰处波前为平面）', unit: '' })
      } else {
        const Rc = z * (1 + Math.pow(zR / z, 2))
        items.push({ label: '波前曲率半径 R(z)', val: mmStr(Rc).v, unit: mmStr(Rc).u })
      }
      if (Math.abs(z) < 1e-9) notes.push('z = 0 为束腰位置：光斑最小、波前为平面，瑞利长度内光斑几乎不扩散。')
      if (z > 3 * zR) notes.push('已进入远场区：w(z) ≈ w₀·z/z_R 线性扩展，R(z) ≈ z。')
      if (z < zR * 0.5 && z > 0) notes.push('近场区：光斑尺寸变化小于 12%，波前曲率大（接近平面波）。')
      notes.push('M² = 1 为理想基模 TEM₀₀；实际光束 M² > 1，其瑞利长度按 λ·M² 折算。')
      return { items, notes }
    }
  },

  /* ---------- 17 激光谐振腔稳定性 ---------- */
  {
    id: 'cavity',
    name: '谐振腔稳定性',
    symbol: 'g₁g₂',
    cat: 'phys',
    catName: '光子学',
    sub: 'g 参数 · 稳定判据',
    grad: 'linear-gradient(135deg,#ff8a3d,#ff5f7e)',
    desc: '按 g₁g₂ 判据判断两镜谐振腔的稳定性，并识别共焦、同心等典型腔型。',
    formulas: ['g₁ = 1 − L/R₁', 'g₂ = 1 − L/R₂', '稳定条件：0 < g₁·g₂ < 1'],
    formulaNote: '凹面镜面向腔内 R > 0，平面镜用极大值（如 1000000 mm）近似；L 为镜间光学腔长。',
    inputs: [
      { key: 'R1', label: '反射镜1 曲率半径 R₁', unit: 'mm', val: 1000, step: 50, signed: true, neg: false },
      { key: 'R2', label: '反射镜2 曲率半径 R₂', unit: 'mm', val: 1000, step: 50, signed: true, neg: false },
      { key: 'L', label: '腔长 L', unit: 'mm', val: 400, step: 10 }
    ],
    presets: [
      { label: '对称稳定腔', set: { R1: 1000, R2: 1000, L: 400 } },
      { label: '平凹腔', set: { R1: 1000, R2: 1000000, L: 300 } },
      { label: '共焦腔（临界）', set: { R1: 1000, R2: 1000, L: 1000 } },
      { label: '同心腔（临界）', set: { R1: 500, R2: 500, L: 1000 } },
      { label: '平行平面腔', set: { R1: 1000000, R2: 1000000, L: 300 } },
      { label: '非稳腔 (L>2R)', set: { R1: 500, R2: 500, L: 1500 } }
    ],
    compute(v) {
      const g1 = 1 - v.L / v.R1
      const g2 = 1 - v.L / v.R2
      const p = g1 * g2
      const items = []
      let warning = ''
      const notes = []
      items.push({ label: 'g₁ = 1 − L/R₁', val: sigNum(g1, 5), unit: '' })
      items.push({ label: 'g₂ = 1 − L/R₂', val: sigNum(g2, 5), unit: '' })
      let state
      if (Math.abs(p) < 1e-4 || Math.abs(p - 1) < 1e-4) {
        state = '临界（边界）'
        warning = '工作在稳定性边界：参数漂移或热透镜即失稳，实际工程需留余量。'
      } else if (p > 0 && p < 1) {
        state = '稳定'
        notes.push('0 < g₁g₂ < 1：腔内高斯模可自洽往返，衍射损耗低，适合连续/低增益激光器。')
      } else {
        state = '不稳定'
        warning = '不满足稳定判据：腔内模损耗极大，难以起振；可用作非稳腔获取大模体积与高功率输出。'
      }
      items.push({ label: 'g₁·g₂', val: sigNum(p, 5), unit: '', primary: true })
      items.push({ label: '腔型判定', val: state, unit: '' })
      const rel = v.R1 / v.R2
      if (Math.abs(p) < 1e-3 && rel > 0.99 && rel < 1.01 && Math.abs(v.R1 - v.L) < 1) {
        notes.push('识别为共焦腔：R₁ = R₂ = L，束腰位于腔中心。')
      }
      if (Math.abs(p - 1) < 1e-4 && Math.abs(v.R1 + v.R2 - v.L) < 1 && rel > 0.99) {
        notes.push('识别为同心腔：R₁ + R₂ = L，束腰极小、腔中心光强极高。')
      }
      notes.push('R 输入为负代表凸面（面向腔内发散），平面镜输入大数近似即可。')
      return { items, warning, notes }
    }
  },

  /* ---------- 18 激光增益与阈值 ---------- */
  {
    id: 'laser',
    name: '激光增益与阈值',
    symbol: 'G·R',
    cat: 'phys',
    catName: '光子学',
    sub: '往返增益 · 起振条件',
    grad: 'linear-gradient(135deg,#ff5f7e,#ffa03d)',
    desc: '由单程小信号增益、腔镜反射率与内腔损耗判断激光器是否达到振荡阈值。',
    formulas: ['G_rt = G₀²·R₁·R₂·(1−δ)²', '阈值条件：G_rt ≥ 1', 'G₀_th = 1 / √[R₁·R₂·(1−δ)²]'],
    formulaNote: 'G₀ 为单程小信号增益（倍），R₁ 高反镜反射率，T 输出耦合（R₂ = 1−T），δ 为单程内腔损耗。',
    inputs: [
      { key: 'g0', label: '单程小信号增益 G₀', unit: '×', val: 1.6, step: 0.05 },
      { key: 'R1', label: '高反镜反射率 R₁', unit: '%', val: 99.9, step: 0.1 },
      { key: 'T', label: '输出镜透过率 T', unit: '%', val: 10, step: 1 },
      { key: 'lp', label: '单程内腔损耗 δ', unit: '%', val: 2, step: 0.5 }
    ],
    presets: [
      { label: 'Nd:YAG 灯泵', set: { g0: 1.8, R1: 99.5, T: 10, lp: 1 } },
      { label: 'He-Ne 低增益', set: { g0: 1.06, R1: 99.9, T: 1, lp: 2 } },
      { label: '高功率光纤', set: { g0: 3, R1: 99, T: 30, lp: 5 } },
      { label: '紧邻阈值', set: { g0: 1.1, R1: 99, T: 5, lp: 5 } }
    ],
    compute(v) {
      const R1 = v.R1 / 100
      const R2 = 1 - v.T / 100
      const lf = 1 - v.lp / 100
      const net = v.g0 * v.g0 * R1 * R2 * lf * lf
      const Gth = Math.sqrt(1 / Math.max(1e-9, R1 * R2 * lf * lf))
      const db = 10 * Math.log10(Math.max(1e-9, net))
      const items = []
      let warning = ''
      items.push({ label: '往返净增益 G_rt', val: sigNum(net, 4), unit: '×', primary: true })
      items.push({ label: '相对阈值裕度', val: sigNum(db, 3), unit: 'dB' })
      items.push({ label: '阈值单程增益 G₀_th', val: sigNum(Gth, 4), unit: '×' })
      items.push({ label: '输出耦合 (1−R₂)', val: sigNum(v.T, 3), unit: '%' })
      items.push({ label: '往返总反射 R₁R₂', val: sigNum(R1 * R2 * 100, 3), unit: '%' })
      const notes = []
      if (net >= 1) {
        notes.push(`净增益为正（+${sigNum(db, 3)} dB），振荡建立；稳态输出功率由增益饱和决定。`)
      } else {
        notes.push('净增益 < 0：低于阈值，自发辐射无法放大为激光振荡。')
        warning = '未达阈值：请提高增益 G₀ 或减小输出透过率 T / 内腔损耗 δ。'
      }
      notes.push('输出镜透过率 T 与腔内损耗存在最优匹配：T 太小“激光憋在腔内”，太大增益不足。')
      return { items, warning, notes }
    }
  },

  /* ---------- 19 非线性频率变换 ---------- */
  {
    id: 'nl',
    name: '非线性频率变换',
    symbol: 'χ⁽²⁾',
    cat: 'phys',
    catName: '光子学',
    sub: '和频 · 差频 · 谐波',
    grad: 'linear-gradient(135deg,#b44bff,#ff5fa8)',
    desc: '由两束输入波长计算和频（SFG/二次谐波）与差频（DFG/OPO 闲频光）输出波长。',
    formulas: ['1/λ_sum = 1/λ₁ + 1/λ₂', '1/λ_idler = |1/λ₁ − 1/λ₂|', 'E(eV) = 1239.84 / λ(nm)'],
    formulaNote: 'λ₁ = λ₂ 时和频退化为二次谐波 SHG（λ/2），差频为零（简并）。能量守恒：ħω₃ = ħω₁ ± ħω₂。',
    inputs: [
      { key: 'wl1', label: '输入波长 λ₁', unit: 'nm', val: 1064, step: 1, unitOptions: ['nm', 'μm'], unitSel: 0 },
      { key: 'wl2', label: '输入波长 λ₂', unit: 'nm', val: 1550, step: 1, unitOptions: ['nm', 'μm'], unitSel: 0 }
    ],
    presets: [
      { label: 'SHG 1064 → 532', set: { wl1: 1064, wl2: 1064 } },
      { label: '和频 355 (1064+532)', set: { wl1: 1064, wl2: 532 } },
      { label: '和频 321 (532+808)', set: { wl1: 532, wl2: 808 } },
      { label: 'OPO 闲频 (1064+1550)', set: { wl1: 1064, wl2: 1550 } },
      { label: 'THG 355 (1064×3)', set: { wl1: 1064, wl2: 532 } }
    ],
    compute(v) {
      const k1 = 1 / v.wl1
      const k2 = 1 / v.wl2
      const items = []
      const notes = []
      // 和频
      const ls = 1 / (k1 + k2)
      const as = autoLen(ls)
      const degenerate = Math.abs(v.wl1 - v.wl2) < 1e-6
      items.push({
        label: degenerate ? '二次谐波波长 SHG' : '和频波长 λ_sum',
        val: as.v, unit: as.u, primary: true
      })
      items.push({ label: '和频光子能量', val: sigNum(1239.841984 / ls, 4), unit: 'eV' })
      // 差频
      const dk = Math.abs(k1 - k2)
      if (dk < 1e-12) {
        items.push({ label: '差频/闲频输出', val: '简并（无差频）', unit: '' })
      } else {
        const li = 1 / dk
        const ai = autoLen(li)
        items.push({ label: '差频/闲频波长 λ_idler', val: ai.v, unit: ai.u })
        items.push({ label: '闲频光子能量', val: sigNum(1239.841984 / li, 4), unit: 'eV' })
      }
      notes.push('和频/差频的实际效率取决于晶体 χ⁽²⁾、相位匹配（角度/温度）与峰值功率密度。')
      notes.push('OPO 可调谐输出即差频过程：泵浦 λ_p 满足 1/λ_p = 1/λ_s + 1/λ_i。')
      return { items, notes }
    }
  },

  /* ============== 光场调控 / 计算全息 ============== */

  /* ---------- 20 菲涅尔近/远场判据 ---------- */
  {
    id: 'holo-nearfar',
    name: '菲涅尔近/远场判据',
    symbol: 'N_F',
    cat: 'holo',
    catName: '光场调控',
    sub: 'Fresnel 数 · Fraunhofer 距离',
    grad: 'linear-gradient(135deg,#0ea5b7,#3b82f6)',
    desc: '由波长与等效孔径尺寸，计算判断当前传播距离属于近场（菲涅尔）还是远场（夫琅禾费）区域，并给出 Fresnel 数。',
    formulas: [
      'Fresnel 数: N_F = a² / (λ·z)',
      '近/远场临界: z_c = 2·a² / λ',
      '远场判据: z ≥ z_c ⇔ N_F ≤ 1/2'
    ],
    formulaNote: 'a 为物体（孔径）等效半径；λ 为光波波长；z 为传播距离。N_F ≫ 1 几何像主导，N_F ≪ 1 纯衍射包络。',
    inputs: [
      { key: 'wl', label: '波长 λ', unit: 'nm', val: 532, step: 1, unitOptions: ['nm', 'μm'], unitSel: 0 },
      { key: 'a', label: '孔径半径 a', unit: 'mm', val: 5, step: 0.5 },
      { key: 'z', label: '传播距离 z', unit: 'mm', val: 200, step: 10 }
    ],
    presets: [
      { label: '小孔近场', set: { wl: 532, a: 1, z: 50 } },
      { label: '焦面远场', set: { wl: 633, a: 5, z: 5000 } },
      { label: '光学镊尺度', set: { wl: 1064, a: 0.05, z: 0.5 } },
      { label: '4f 中继', set: { wl: 532, a: 5, z: 300 } }
    ],
    compute(v) {
      const a_m = v.a / 1000
      const lam = v.wl * 1e-9
      const z_m = v.z / 1000
      const zc = 2 * a_m * a_m / Math.max(lam, 1e-12)
      const NF = (a_m * a_m) / Math.max(lam * z_m, 1e-18)
      const far = z_m >= zc
      const items = []
      const notes = []
      let warning = ''
      items.push({ label: '菲涅尔数 N_F', val: sigNum(NF, 4), unit: '', primary: true })
      items.push({ label: '近远场临界 z_c', val: sigNum(zc * 1000, 4), unit: 'mm' })
      items.push({ label: '当前 z / z_c', val: sigNum(z_m / Math.max(zc, 1e-12), 4), unit: '×' })
      if (far) {
        notes.push('当前已处于远场（Fraunhofer 区域）：单次 FFT 即给出衍射图。')
      } else {
        notes.push('当前处于近场（Fresnel 区域），单次 FFT 不成立；需用菲涅尔 FFT / 角谱法传播。')
      }
      notes.push('N_F > 1 时几何像清晰；N_F ≪ 1 时只见纯衍射包络。')
      if (NF > 50) warning = 'N_F 过大（> 50）：物体几乎为几何投影；可忽略衍射、或加大传播距离。'
      return { items, warning, notes }
    }
  },

  /* ---------- 21 菲涅尔 FFT 一步近似采样参数 ---------- */
  {
    id: 'holo-fresnel-fft',
    name: '菲涅尔 FFT 采样',
    symbol: 'Δx′',
    cat: 'holo',
    catName: '光场调控',
    sub: '一步傅里叶近似 · 像素尺度',
    grad: 'linear-gradient(135deg,#1e6df0,#5fa8ff)',
    desc: '基于菲涅尔积分的"一步傅里叶近似"（Single-FFT Fresnel），输入 SLM 像素与距离，立即得到输出平面像素间隔、幅面与等效放大率。',
    formulas: [
      'Δx′ = λ·z / (N · Δx)',
      '输出 FOV: L_out = N · Δx′ = λ·z / Δx',
      '适用区间: N_F ≤ 1（即 z ≥ a²/λ）'
    ],
    formulaNote: 'Δx 为输入采样间隔，N 为采样点数。该近似跳过输出端二次相位卷积，节省一半计算量；远场极限下与夫琅禾费一致。',
    inputs: [
      { key: 'wl', label: '波长 λ', unit: 'nm', val: 532, step: 1, unitOptions: ['nm', 'μm'], unitSel: 0 },
      { key: 'dx', label: '输入采样 Δx', unit: 'μm', val: 8, step: 0.5 },
      { key: 'N', label: '采样点数 N', unit: 'px', val: 1024, step: 32 },
      { key: 'z', label: '传播距离 z', unit: 'mm', val: 100, step: 10 }
    ],
    presets: [
      { label: '4f 系统 SLM', set: { wl: 532, dx: 8, N: 1024, z: 100 } },
      { label: '显微投影', set: { wl: 633, dx: 6.5, N: 600, z: 80 } },
      { label: '大像素全息', set: { wl: 532, dx: 36, N: 256, z: 30 } }
    ],
    compute(v) {
      const lam = v.wl * 1e-9
      const dx_m = v.dx * 1e-6
      const N = v.N
      const z_m = v.z / 1000
      const dxOut = lam * z_m / (N * dx_m)
      const Lout = N * dxOut
      const Lin = N * dx_m
      const m = dxOut / dx_m
      const NF = (Lin * Lin) / Math.max(4 * lam * z_m, 1e-18)
      const items = []
      const notes = []
      let warning = ''
      items.push({ label: '输出像素 Δx′', val: sigNum(dxOut * 1e6, 4), unit: 'μm', primary: true })
      items.push({ label: '输出幅面 L_out', val: sigNum(Lout * 1000, 4), unit: 'mm' })
      items.push({ label: '输入幅面 L_in', val: sigNum(Lin * 1000, 4), unit: 'mm' })
      items.push({ label: '放大率 m', val: sigNum(m, 4), unit: '×' })
      items.push({ label: 'Fresnel 数 N_F', val: sigNum(NF, 4), unit: '' })
      if (NF > 1) {
        warning = '当前 N_F > 1，仍属近场；一步菲涅尔近似误差较大，建议改用角谱传播或分步卷积。'
      }
      notes.push('角谱法（Angular Spectrum）对距离不敏感，且不污染高频分量，是任意距离的稳妥方案。')
      notes.push('为避免“绕回环 wrap-around”，应保持 N ≥ 2×视场所需点数。')
      return { items, warning, notes }
    }
  },

  /* ---------- 22 SLM Gamma 标定查找表 ---------- */
  {
    id: 'holo-slm-gamma',
    name: 'SLM Gamma 标定查找表',
    symbol: 'LUT',
    cat: 'holo',
    catName: '光场调控',
    sub: '电压↔相位 校正曲线',
    grad: 'linear-gradient(135deg,#0099b8,#0ed5a3)',
    desc: '由 SLM 实测的电压-相位响应（指数形式 φ(g) = φ_max·(g/255)^γ），生成线性 LUT，使显示灰度线性对应目标相位；并提供 5 个采样点用于人工核验。',
    formulas: [
      '实测响应: φ(g) = φ_max·(g/255)^γ',
      'LUT 公式: g_lut(φ_t) = 255·(φ_t / φ_max)^(1/γ)',
      '量化误差: Δφ_step ≈ φ_max / (N−1)'
    ],
    formulaNote: 'γ > 1 时实测响应向上凸；LUT 把查找索引向高端集中；γ < 1 相反。SLM 漂移随温度/老化，建议每实验条件重新标定。',
    inputs: [
      { key: 'gamma', label: '实测 γ 指数', unit: '', val: 0.8, step: 0.05 },
      { key: 'depth', label: '相位深度 φ_max', unit: 'rad', val: Math.PI * 2, step: 0.1 },
      { key: 'levels', label: '灰度级数', unit: '', val: 256, step: 16 }
    ],
    presets: [
      { label: '标准 γ = 0.8', set: { gamma: 0.8, depth: Math.PI * 2, levels: 256 } },
      { label: '高 γ = 0.95', set: { gamma: 0.95, depth: Math.PI * 2, levels: 256 } },
      { label: '4 级量化', set: { gamma: 0.7, depth: Math.PI * 2, levels: 4 } },
      { label: '亚 2π 深度', set: { gamma: 0.6, depth: Math.PI, levels: 256 } }
    ],
    compute(v) {
      const G = v.gamma
      const phiMax = v.depth
      const N = v.levels
      const step = phiMax / Math.max(N - 1, 1)
      const fracs = [0, 0.25, 0.5, 0.75, 1.0]
      const rows = fracs.map(f => {
        const phi = f * phiMax
        const g_raw = 255 * Math.pow(f, Math.max(G, 1e-6))
        const g_target = 255 * Math.pow(f, 1 / Math.max(G, 1e-6))
        return [phi, g_raw, g_target]
      })
      const items = []
      const notes = []
      let warning = ''
      items.push({ label: '相位深度 φ_max', val: sigNum(phiMax, 4), unit: 'rad', primary: true })
      items.push({ label: '每级 Δφ_step', val: sigNum(step * 1000, 3), unit: 'mrad' })
      items.push({ label: '灰度级数 N', val: String(N) })
      items.push({ label: '查表反向 γ⁻¹', val: sigNum(1 / Math.max(G, 1e-6), 4), unit: '' })
      notes.push('=== LUT 5 个采样点（目标比例 → 期望 φ, 实测灰度 g_raw, 校正后 g_lut） ===')
      rows.forEach(([phi, gr, gt], i) => {
        notes.push(`  ${(fracs[i] * 100).toFixed(0).padStart(3)}%   φ=${sigNum(phi, 3).padStart(8)} rad   g_raw=${sigNum(gr, 3).padStart(8)}   g_lut=${sigNum(gt, 3).padStart(8)}`)
      })
      notes.push('总结：把 phaseMap[i,j] = 2π·target 变换为 display[i,j] = 255·(target)^(1/γ) 后送往 SLM。')
      if (G <= 0) warning = 'γ 必须 > 0。'
      if (phiMax > 2 * Math.PI + 1e-3) warning = 'φ_max > 2π 时存在相位卷绕折叠；建议限定在 [0, 2π)。'
      return { items, notes, warning }
    }
  },

  /* ---------- 23 GS 迭代算法参数估算 ---------- */
  {
    id: 'holo-gs',
    name: 'GS 迭代算法估算',
    symbol: 'η·NMSE',
    cat: 'holo',
    catName: '光场调控',
    sub: 'Gerchberg-Saxton 收敛估算',
    grad: 'linear-gradient(135deg,#6a4dff,#0070d8)',
    desc: '估算 Gerchberg-Saxton (GS) 迭代全息算法在不同迭代次数与目标均匀度下的衍射效率 η、归一化均方误差 NMSE，及 MATLAB / Python 单次迭代耗时。',
    formulas: [
      '经验衍射效率: η ≈ 1 − 0.5 / √N_iter（对均匀目标）',
      '归一化均方误差: NMSE ≈ 0.4 / √N_iter · (1.1 − U)',
      '单次迭代约 2 次 N×N FFT，开销 O(N² log N)'
    ],
    formulaNote: 'GS 对均匀目标约 20–50 次迭代可达 90%+ 效率；超高均匀度目标需配合 MRAF / Wirtinger / 双平面 AA-AP。',
    inputs: [
      { key: 'N', label: '阵列边长 N', unit: 'px', val: 512, step: 64 },
      { key: 'iter', label: '迭代次数', unit: '', val: 30, step: 5 },
      { key: 'u', label: '目标均匀度 U (0~1)', unit: '', val: 0.9, step: 0.05 }
    ],
    presets: [
      { label: '标准点阵', set: { N: 512, iter: 30, u: 0.9 } },
      { label: '高质量全息', set: { N: 1024, iter: 100, u: 0.95 } },
      { label: '快速预览', set: { N: 256, iter: 10, u: 0.8 } }
    ],
    compute(v) {
      const N = v.N
      const it = v.iter
      const u = v.u
      const eta = Math.max(0, 1 - 0.5 / Math.sqrt(Math.max(it, 1)))
      const etaEff = eta * (0.95 + 0.05 * u)
      const nmse = Math.max(0, 0.4 / Math.sqrt(Math.max(it, 1)) * (1.1 - u))
      // 经验系数：1024^2 FFT@100MHz 约 4e-8 s/element/log step
      const t_one = 4e-8 * N * N * Math.log2(Math.max(N, 2)) * 8
      const t_total = t_one * it
      const items = []
      const notes = []
      items.push({ label: '估算衍射效率 η', val: sigNum(etaEff * 100, 4), unit: '%', primary: true })
      items.push({ label: '归一化均方误差 NMSE', val: sigNum(nmse, 4), unit: '' })
      items.push({ label: '单次迭代耗时 (CPU)', val: sigNum(t_one * 1000, 3), unit: 'ms' })
      items.push({ label: '总计算时间 (CPU)', val: sigNum(t_total, 3), unit: 's' })
      notes.push('MATLAB fft2 在 1024×1024 双精度下，单次 ~ 60 ms；GS 需 2 次 FFT。')
      notes.push('GPU (cuFFT / pyTorch.fft2) 可提速 5–50 倍，迭代 100 次仍可在秒级完成。')
      notes.push('极致均匀度或多平面（如 3D 全息）建议改用 MRAF、Wirtinger、AA-AP 等梯度下降算法。')
      notes.push('可加入二值化（binary phase）作为额外约束，提高 SLM 衍射效率 ~10%。')
      return { items, notes }
    }
  },

  /* ---------- 24 闪耀光栅设计（Littrow） ---------- */
  {
    id: 'holo-blazed',
    name: '闪耀光栅设计',
    symbol: 'Λ·α',
    cat: 'holo',
    catName: '光场调控',
    sub: 'Littrow · 一级衍射效率',
    grad: 'linear-gradient(135deg,#ff8a00,#f23b5b)',
    desc: '计算闪耀光栅在 Littrow 自闪耀条件下的周期、空间频率与一级衍射角，并估算一级衍射效率（斜入射角与闪耀角一致时取最大值）。',
    formulas: [
      'Littrow: Λ = λ / (2 sin α_b)',
      '光栅方程: d·(sin θ − sin θ_i) = m·λ （m = 1）',
      '一级衍射效率 ≈ 70–90%（峰值附近）'
    ],
    formulaNote: 'α_b 为闪耀角（基面与刻槽面夹角）；偏离 Littrow 入射时衍射效率随 |θ_i − α_b| 迅速下降。',
    inputs: [
      { key: 'lambda', label: '中心波长 λ', unit: 'nm', val: 632.8, step: 1, unitOptions: ['nm', 'μm'], unitSel: 0 },
      { key: 'ab', label: '闪耀角 α_b', unit: '°', val: 17.5, step: 0.5 },
      { key: 'theta_i', label: '入射角 θ_i', unit: '°', val: 17.5, step: 0.5 }
    ],
    presets: [
      { label: '可见 Littrow', set: { lambda: 532, ab: 17.5, theta_i: 17.5 } },
      { label: 'HeNe 经典', set: { lambda: 632.8, ab: 17.5, theta_i: 17.5 } },
      { label: '红外 1550', set: { lambda: 1550, ab: 28, theta_i: 28 } },
      { label: '深紫外', set: { lambda: 266, ab: 22.5, theta_i: 22.5 } }
    ],
    compute(v) {
      const lam = v.lambda * 1e-9
      const ab = v.ab * D2R
      const ti = v.theta_i * D2R
      const Lambda = lam / (2 * Math.sin(ab))
      const sd = Math.sin(ti) + lam / Lambda
      const theta_d_deg = (Math.asin(Math.max(-1, Math.min(1, sd)))) / D2R
      const items = []
      const notes = []
      let warning = ''
      items.push({ label: '光栅周期 Λ', val: sigNum(Lambda * 1e6, 4), unit: 'μm', primary: true })
      items.push({ label: '空间频率 1/Λ', val: sigNum(1 / Lambda * 1e-3, 4), unit: 'lines/mm' })
      items.push({ label: '1 级衍射角 θ_d', val: sigNum(theta_d_deg, 4), unit: '°' })
      const ratio = Math.min(v.ab, v.theta_i) / Math.max(v.ab, 1e-6)
      const etaPeak = 0.78 + 0.12 * ratio
      items.push({ label: '估算 1 级效率', val: sigNum(etaPeak * 100, 3), unit: '%' })
      notes.push('实际衍射效率随 λ/λ_blaze 偏差快速衰减；±0.3 倍设计波长带内仍保持高效。')
      notes.push('SLM 上可编程产生等效 blazed grating：相位梯度 = 2π/Λ_pix，把光束偏转到 1 级。')
      notes.push('当 Λ ≈ 输入像素整数倍时，离散步进伪影明显；建议至少 4 像素周期。')
      if (sd > 1 || sd < -1) warning = '衍射角已超过 90°，请减小周期或增大闪耀角。'
      return { items, warning, notes }
    }
  },

  /* ---------- 25 WGS 加权 GS 迭代 ---------- */
  {
    id: 'holo-wgs',
    name: 'WGS 加权迭代估算',
    symbol: 'w·GS',
    cat: 'holo',
    catName: '光场调控',
    sub: 'Weighted GS · 均匀度加速收敛',
    grad: 'linear-gradient(135deg,#7b5cff,#00b4d8)',
    desc: '估算加权 Gerchberg-Saxton (WGS) 算法在给定反馈权重 β 与迭代次数下的目标均匀度 U、衍射效率 η，并与标准 GS 对比收敛加速比。',
    formulas: [
      '权重更新: wᵏ⁺¹ = wᵏ · (I_target / max(Iᵏ, ε))^β',
      '均匀度: U = 1 − σ(I) / mean(I)',
      '经验效率: η ≈ 1 − 0.35 / √N_iter'
    ],
    formulaNote: 'β 为反馈指数（0.3–0.8 常用）：β 大收敛快但易震荡；β → 0 退化为标准 GS。WGS 对点阵 / 多焦点目标的均匀度提升最显著。',
    inputs: [
      { key: 'N', label: '阵列边长 N', unit: 'px', val: 512, step: 64 },
      { key: 'iter', label: '迭代次数', unit: '', val: 30, step: 5 },
      { key: 'beta', label: '反馈权重 β', unit: '', val: 0.5, step: 0.05 },
      { key: 'u', label: '目标均匀度 U (0~1)', unit: '', val: 0.95, step: 0.01 }
    ],
    presets: [
      { label: '标准 WGS', set: { N: 512, iter: 30, beta: 0.5, u: 0.95 } },
      { label: '强反馈', set: { N: 512, iter: 20, beta: 0.8, u: 0.97 } },
      { label: '弱反馈高精度', set: { N: 1024, iter: 60, beta: 0.3, u: 0.99 } }
    ],
    compute(v) {
      const it = Math.max(v.iter, 1)
      const b = Math.min(Math.max(v.beta, 0), 1)
      // GS 基线均匀度（经验模型）
      const uGS = Math.max(0, Math.min(1, 1 - 0.3 / Math.sqrt(it)))
      // WGS：误差经权重反馈压缩
      const gain = 1 + b * Math.min(Math.sqrt(it) / 10, 2.5)
      const uWGS = Math.max(0, Math.min(0.999, 1 - (1 - uGS) / gain))
      const eta = Math.max(0, 1 - 0.35 / Math.sqrt(it))
      const nmseGS = 0.4 / Math.sqrt(it) * (1.1 - Math.min(v.u, 1))
      const nmseW = nmseGS / gain
      const t_one = 4e-8 * v.N * v.N * Math.log2(Math.max(v.N, 2)) * 8
      const items = []
      const notes = []
      let warning = ''
      items.push({ label: 'WGS 均匀度 U', val: sigNum(uWGS * 100, 3), unit: '%', primary: true })
      items.push({ label: 'GS 基线均匀度', val: sigNum(uGS * 100, 3), unit: '%' })
      items.push({ label: '均匀度提升倍数', val: sigNum((1 - uGS) / Math.max(1 - uWGS, 1e-9), 2), unit: '×' })
      items.push({ label: '估算衍射效率 η', val: sigNum(eta * 100, 3), unit: '%' })
      items.push({ label: 'NMSE (GS→WGS)', val: sigNum(nmseGS, 4) + ' → ' + sigNum(nmseW, 4) })
      items.push({ label: '总耗时 (CPU)', val: sigNum(t_one * it, 3), unit: 's' })
      notes.push('达到同一均匀度所需迭代数：WGS 约为 GS 的 1/' + sigNum(gain, 2) + '。')
      notes.push('β 建议 0.3–0.8；β > 0.8 时权重易发散震荡，可改用 β 递减策略。')
      notes.push('WGS 与 MRAF、AA-AP 同属振幅自由度类改进；点阵目标首选 DPAC，任意图样用 WGS / Wirtinger。')
      if (b > 0.85) warning = 'β > 0.85 收敛可能震荡，建议降到 0.8 以下或分阶段递减。'
      return { items, warning, notes }
    }
  },

  /* ---------- 26 三维 GS（多平面） ---------- */
  {
    id: 'holo-3dgs',
    name: '三维 GS 多平面估算',
    symbol: '3D·GS',
    cat: 'holo',
    catName: '光场调控',
    sub: '多平面 3D 全息 · 轴向采样',
    grad: 'linear-gradient(135deg,#0aa5a0,#3b6cf6)',
    desc: '估算三维（多焦面）Gerchberg-Saxton 算法的计算量、总衍射效率与轴向分辨率，并给出多平面间距的采样判据。',
    formulas: [
      'FFT 总次数: 2·P·N_iter （P 为目标平面数）',
      '总衍射效率: η_total ≈ 1 − 0.5/√N_iter − 0.06·(P−1)',
      '轴向分辨率: δz ≈ 2·λ / NA²'
    ],
    formulaNote: '多平面 3D GS 把不同 z 的目标面依次施加振幅约束后取平均相位；平面间距小于 δz/2 会产生相邻面串扰、均匀度下降。',
    inputs: [
      { key: 'wl', label: '波长 λ', unit: 'nm', val: 532, step: 1, unitOptions: ['nm', 'μm'], unitSel: 0 },
      { key: 'NA', label: '聚焦 NA', unit: '', val: 0.3, step: 0.05 },
      { key: 'N', label: '阵列边长 N', unit: 'px', val: 512, step: 64 },
      { key: 'P', label: '目标平面数 P', unit: '', val: 3, step: 1 },
      { key: 'dz', label: '平面间距 Δz', unit: 'mm', val: 5, step: 0.5 },
      { key: 'iter', label: '迭代次数', unit: '', val: 30, step: 5 }
    ],
    presets: [
      { label: '3 层光镊 (1064)', set: { wl: 1064, NA: 0.8, N: 512, P: 3, dz: 2, iter: 30 } },
      { label: '体显示 8 层', set: { wl: 532, NA: 0.25, N: 1024, P: 8, dz: 10, iter: 50 } },
      { label: '双焦面', set: { wl: 532, NA: 0.3, N: 512, P: 2, dz: 5, iter: 20 } }
    ],
    compute(v) {
      const lam = v.wl * 1e-9
      const NA = Math.max(v.NA, 1e-3)
      const P = Math.max(Math.round(v.P), 1)
      const it = Math.max(v.iter, 1)
      const dz_m = v.dz / 1000
      const fftCount = 2 * P * it
      const t_one = 4e-8 * v.N * v.N * Math.log2(Math.max(v.N, 2)) * 8   // 单次迭代(含2FFT)
      const t_total = t_one * P * it
      const deltaZ = 2 * lam / (NA * NA)                                  // 轴向分辨率
      const eta = Math.max(0, 1 - 0.5 / Math.sqrt(it) - 0.06 * (P - 1))
      const items = []
      const notes = []
      let warning = ''
      items.push({ label: '轴向分辨率 δz', val: sigNum(deltaZ * 1e6, 4), unit: 'μm', primary: true })
      items.push({ label: 'FFT 总次数', val: sigNum(fftCount, 4), unit: '次' })
      items.push({ label: '相对单面 GS 计算量', val: sigNum(P, 2), unit: '×' })
      items.push({ label: '总耗时 (CPU)', val: sigNum(t_total, 3), unit: 's' })
      items.push({ label: '总衍射效率 η', val: sigNum(eta * 100, 3), unit: '%' })
      items.push({ label: '每平面平均效率', val: sigNum(eta / P * 100, 3), unit: '%' })
      notes.push('采样判据：Δz ≥ δz/2（当前 δz/2 ≈ ' + sigNum(deltaZ * 5e5, 4) + ' μm），否则相邻目标面互相串扰。')
      notes.push('常用流程：初始化随机相位 → 对每个 z_p 平面传播-约束-反传 → 取各平面复振幅平均回 SLM 面。')
      notes.push('3D GS 对层数敏感：P > 8 时建议改用加权多平面（每平面按功率归一）或 GS+梯度混合。')
      if (dz_m < deltaZ / 2) warning = '平面间距 Δz < δz/2，相邻目标面将互相串扰；增大 Δz 或降低 NA。'
      if (P > 8) warning = '平面数 P > 8，总效率与均匀度都会明显下降，建议分区域复用或降低层数。'
      return { items, warning, notes }
    }
  },

  /* ---------- 27 GA 遗传算法优化 ---------- */
  {
    id: 'holo-ga',
    name: 'GA 遗传算法估算',
    symbol: 'GA',
    cat: 'holo',
    catName: '光场调控',
    sub: '遗传算法 · 离散相位搜索',
    grad: 'linear-gradient(135deg,#ff8a3d,#d8325b)',
    desc: '估算遗传算法（GA）优化全息相位的计算量、搜索空间量级与耗时，并与 GS 系迭代算法对比适用场景。',
    formulas: [
      '评估次数: N_eval = N_pop · N_iter',
      '搜索空间: (2^bits)^(N²)，log₁₀ ≈ 0.301·bits·N²',
      '单次评估 ≈ 1 次 N×N FFT'
    ],
    formulaNote: 'GA 把每个像素的相位级次当作基因，适合二值 / 少级量化、离散器件约束与多目标折中；连续相位问题用 GS / WGS / Wirtinger 快几个量级。',
    inputs: [
      { key: 'N', label: '阵列边长 N', unit: 'px', val: 256, step: 32 },
      { key: 'pop', label: '种群规模', unit: '', val: 50, step: 10 },
      { key: 'iter', label: '进化代数', unit: '', val: 30, step: 5 },
      { key: 'bits', label: '相位量化位数', unit: 'bit', val: 1, step: 1 }
    ],
    presets: [
      { label: '二值相位 GA', set: { N: 256, pop: 50, iter: 30, bits: 1 } },
      { label: '4 级相位', set: { N: 256, pop: 80, iter: 50, bits: 2 } },
      { label: '8 级粗搜', set: { N: 128, pop: 100, iter: 100, bits: 3 } }
    ],
    compute(v) {
      const N = v.N
      const pop = Math.max(v.pop, 1)
      const it = Math.max(v.iter, 1)
      const bits = Math.max(v.bits, 1)
      const evals = pop * it
      const t_fft = 4e-8 * N * N * Math.log2(Math.max(N, 2)) * 4   // 单次 FFT
      const t_total = evals * t_fft
      const spaceLog10 = 0.30103 * bits * N * N
      const gsFFTs = 60                                              // GS 30 迭代 × 2 FFT
      const items = []
      const notes = []
      let warning = ''
      items.push({ label: '总评估次数', val: sigNum(evals, 4), unit: '次', primary: true })
      items.push({ label: '总耗时 (CPU)', val: sigNum(t_total, 3), unit: 's' })
      items.push({ label: '搜索空间 log₁₀', val: sigNum(spaceLog10, 4), unit: '' })
      items.push({ label: '等价 GS 迭代量', val: sigNum(evals / 2, 1), unit: '次迭代' })
      items.push({ label: 'vs GS(30次) 计算量', val: sigNum(evals / gsFFTs, 2), unit: '×' })
      notes.push('GA 无法直接利用 FFT 梯度结构，计算量随 N² 迅速爆炸；建议 N ≤ 256 并配合粗粒度 / 分块编码。')
      notes.push('典型用法：GA 全局粗搜 → 以最优个体初始化 GS / WGS 精修（混合算法），兼顾全局性与收敛速度。')
      notes.push('适应度常取 η − λ·NMSE + μ·U；选择用锦标赛，交叉用单点 / 均匀，变异率 0.5–2%。')
      if (N > 256) warning = 'N > 256 时 GA 搜索空间过大（log₁₀ ≈ ' + sigNum(spaceLog10, 0) + '），建议改用 GA+GS 混合策略。'
      return { items, warning, notes }
    }
  }
]

const calcMap = {}
calculators.forEach(c => { calcMap[c.id] = c })

module.exports = { calculators, getCalc: id => calcMap[id] }
