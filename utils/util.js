/** 通用工具 */

// 保留有效位数并去尾零
function sigNum(v, p) {
  if (v === null || v === undefined || !isFinite(v)) return null
  if (Math.abs(v) < 1e-14) v = 0
  const s = parseFloat(v.toPrecision(p || 4))
  return String(s)
}

// 固定小数位
function fixNum(v, n) {
  if (v === null || v === undefined || !isFinite(v)) return null
  if (Math.abs(v) < 1e-14) v = 0
  return v.toFixed(n)
}

// 长度自适应: 输入 nm, 输出 nm/μm/mm 字符串
function autoLen(nm) {
  if (nm === null || !isFinite(nm)) return null
  const a = Math.abs(nm)
  if (a >= 1e6) return { v: sigNum(nm / 1e6, 4), u: 'mm' }
  if (a >= 1000) return { v: sigNum(nm / 1e3, 4), u: 'μm' }
  return { v: sigNum(nm, 4), u: 'nm' }
}

// 问候语
function greeting() {
  const h = new Date().getHours()
  if (h < 5) return '夜深了'
  if (h < 9) return '早上好'
  if (h < 12) return '上午好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
}

// 日期
function todayCN() {
  const d = new Date()
  const w = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 · 星期${w}`
}

// 相对时间
function relTime(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m} 分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小时前`
  return `${Math.floor(h / 24)} 天前`
}

// 波长(nm)近似转 RGB (0-255), Dan Bruton 近似
function waveRGB(nm) {
  let r, g, b
  const x = nm
  if (x >= 380 && x < 440) { r = -(x - 440) / 60; g = 0; b = 1 }
  else if (x >= 440 && x < 490) { r = 0; g = (x - 440) / 50; b = 1 }
  else if (x >= 490 && x < 510) { r = 0; g = 1; b = -(x - 510) / 20 }
  else if (x >= 510 && x < 580) { r = (x - 510) / 70; g = 1; b = 0 }
  else if (x >= 580 && x < 645) { r = 1; g = -(x - 645) / 65; b = 0 }
  else if (x >= 645 && x <= 780) { r = 1; g = 0; b = 0 }
  else { r = 0; g = 0; b = 0 }
  let f = 1
  if (x >= 380 && x < 420) f = 0.3 + 0.7 * (x - 380) / 40
  else if (x >= 420 && x <= 700) f = 1
  else if (x > 700 && x <= 780) f = 0.3 + 0.7 * (780 - x) / 80
  const inVis = x >= 380 && x <= 780
  const gamma = inVis ? 0.8 : 1
  const to = v => Math.max(0, Math.min(255, Math.round(255 * Math.pow(v * f, gamma))))
  return { r: to(r), g: to(g), b: to(b) }
}

module.exports = { sigNum, fixNum, autoLen, greeting, todayCN, relTime, waveRGB }
