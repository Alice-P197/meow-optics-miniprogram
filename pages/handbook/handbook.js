// 手册详情页
const { findEntry } = require('../../data/handbook')

const LIGHTER = { const: '#7ea5ff', material: '#38c9ad', imaging: '#a48bff', rad: '#ffb057', phys: '#b48cff' }

Page({
  data: {
    entry: null,
    title: '',
    blocks: [],
    catName: '',
    catColor: '#4a7cff',
    bg: '',
    tag: ''
  },

  onLoad(query) {
    const en = findEntry(query.key || '')
    if (!en) {
      wx.showToast({ title: '未找到该词条', icon: 'none' })
      setTimeout(() => wx.navigateBack(), 600)
      return
    }
    const color2 = LIGHTER[en.catId] || en.catColor
    this.setData({
      entry: en.key,
      title: en.title,
      tag: en.tag || '词条',
      catName: en.catName || '',
      catColor: en.catColor,
      bg: `linear-gradient(135deg, ${en.catColor}, ${color2})`,
      blocks: en.blocks
    })
  },

  onShareAppMessage() {
    return { title: `${this.data.title} - 光学手册`, path: `/pages/handbook/handbook?key=${this.data.entry}` }
  },

  copyCode(e) {
    const text = e.currentTarget.dataset.text || ''
    if (!text) return
    wx.setClipboardData({
      data: text,
      success: () => wx.showToast({ title: '代码已复制', icon: 'success' })
    })
  }
})
