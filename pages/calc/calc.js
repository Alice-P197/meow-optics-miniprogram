// 计算器详情页
const { getCalc } = require('../../data/calculators')

function decimals(step) {
  const s = String(step)
  return (s.split('.')[1] || '').length
}

Page({
  data: {
    calc: null,
    name: '', symbol: '', grad: '', sub: '', desc: '',
    catName: '', formulas: [], formulaNote: '',
    presets: [],
    fields: [],
    result: { items: [], warning: '', notes: [] },
    flash: false,
    copied: false
  },

  onLoad(query) {
    const def = getCalc(query.id || 'snell')
    if (!def) {
      wx.showToast({ title: '未找到该计算器', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 600)
      return
    }
    this.calcDef = def
    const fields = this.buildFields(def)
    const presets = (def.presets || []).map((p, i) => ({ label: p.label, index: i }))
    this.setData({
      calc: def.id,
      name: def.name, symbol: def.symbol, grad: def.grad, sub: def.sub,
      catName: def.catName, desc: def.desc,
      formulas: def.formulas || [], formulaNote: def.formulaNote || '',
      presets,
      fields
    })
    this.compute()
    this.recordRecent(def.id)
    wx.setNavigationBarTitle && wx.setNavigationBarTitle({ title: def.name })
  },

  buildFields(def) {
    return (def.inputs || []).map(inn => {
      const o = {
        key: inn.key,
        label: inn.label,
        unit: inn.unit || '',
        signed: !!inn.signed,
        neg: !!inn.neg,
        step: inn.step || 1,
        dp: decimals(inn.step || 1),
        str: String(inn.val)
      }
      if (inn.unitOptions) {
        const labels = inn.unitOptions
        const sel = inn.unitSel || 0
        o.unitSel = sel
        o.unitOptions = labels.map((l, i) => ({
          label: l,
          factor: inn.unitFactors && inn.unitFactors[i] !== undefined
            ? inn.unitFactors[i]
            : (l === 'μm' ? 1000 : 1),
          step: inn.unitSteps && inn.unitSteps[i] !== undefined
            ? inn.unitSteps[i]
            : (l === 'μm' ? 0.05 : (inn.step || 1))
        }))
        const so = o.unitOptions[sel]
        o.step = so.step
        o.dp = decimals(so.step)
      }
      return o
    })
  },

  compute() {
    const def = this.calcDef
    if (!def) return
    const v = {}
    this.data.fields.forEach(f => {
      let n = parseFloat(f.str)
      if (!isFinite(n)) n = 0
      let val = f.signed && f.neg ? -n : n
      if (f.unitOptions) val *= f.unitOptions[f.unitSel].factor
      v[f.key] = val
    })
    const res = def.compute(v) || {}
    this.setData({ result: { items: res.items || [], warning: res.warning || '', notes: res.notes || [] } })
    this.flash()
  },

  flash() {
    if (this._t) clearTimeout(this._t)
    this.setData({ flash: false })
    this._t = setTimeout(() => this.setData({ flash: true }), 40)
  },

  onInput(e) {
    const i = e.currentTarget.dataset.index
    const f = this.data.fields[i]
    let raw = String(e.detail.value || '').replace(/[^\d.]/g, '')
    if (raw.split('.').length > 2) raw = raw.slice(0, raw.indexOf('.', raw.indexOf('.') + 1))
    if (raw.length > 12) raw = raw.slice(0, 12)
    f.str = raw
    this.setData({ [`fields[${i}]`]: f })
    this.compute()
  },

  step(e) {
    const { index, dir } = e.currentTarget.dataset
    const i = Number(index)
    const d = Number(dir)
    const f = this.data.fields[i]
    let v = (parseFloat(f.str) || 0) + d * f.step
    v = Math.max(0, v)
    f.str = String(parseFloat(v.toFixed(f.dp)))
    this.setData({ [`fields[${i}]`]: f })
    this.compute()
  },

  setSign(e) {
    const { index, neg } = e.currentTarget.dataset
    const i = Number(index)
    const f = this.data.fields[i]
    if (f.neg === !!Number(neg)) return
    f.neg = !!Number(neg)
    this.setData({ [`fields[${i}]`]: f })
    this.compute()
  },

  setUnit(e) {
    const { index, oi } = e.currentTarget.dataset
    const i = Number(index)
    const f = this.data.fields[i]
    if (!f.unitOptions) return
    const newIdx = Number(oi)
    if (newIdx === f.unitSel) return
    const old = f.unitOptions[f.unitSel].factor
    const next = f.unitOptions[newIdx]
    const num = parseFloat(f.str) || 0
    f.str = String(parseFloat((num * old / next.factor).toFixed(6)))
    f.unitSel = newIdx
    f.step = next.step
    f.dp = decimals(next.step)
    this.setData({ [`fields[${i}]`]: f })
    this.compute()
  },

  presetTap(e) {
    const i = Number(e.currentTarget.dataset.index)
    const p = (this.calcDef.presets || [])[i]
    if (!p) return
    const fields = this.data.fields.map(f => {
      const nf = Object.assign({}, f)
      if (p.unit && p.unit[nf.key] !== undefined) {
        const oi = nf.unitOptions.findIndex(o => o.label === p.unit[nf.key])
        if (oi >= 0) {
          nf.unitSel = oi
          nf.step = nf.unitOptions[oi].step
          nf.dp = decimals(nf.step)
        }
      }
      if (p.set[nf.key] !== undefined) {
        const val = p.set[nf.key]
        nf.str = String(Math.abs(val))
        if (nf.signed) nf.neg = val < 0
      }
      return nf
    })
    this.setData({ fields })
    this.compute()
  },

  reset() {
    this.setData({ fields: this.buildFields(this.calcDef) })
    this.compute()
  },

  copyResult() {
    const res = this.data.result
    if (!res || !res.items.length) return
    const p = res.items.find(it => it.primary) || res.items[0]
    if (!p || p.val === '—') return
    const text = `${this.data.name}：${p.label} = ${p.val}${p.unit ? ' ' + p.unit : ''}`
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '已复制结果', icon: 'success' })
    })
  },

  recordRecent(id) {
    let arr = wx.getStorageSync('opti_recent') || []
    arr = [{ id, t: Date.now() }, ...arr.filter(r => r.id !== id)].slice(0, 12)
    wx.setStorageSync('opti_recent', arr)
  },

  onShareAppMessage() {
    return { title: `${this.data.name} - 光学计算器`, path: `/pages/calc/calc?id=${this.data.calc}` }
  }
})
