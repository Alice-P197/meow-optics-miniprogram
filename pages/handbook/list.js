// 光学手册目录页
const { handbook } = require('../../data/handbook')

const LIGHTER = { const: '#7ea5ff', material: '#38c9ad', imaging: '#a48bff', rad: '#ffb057', phys: '#b48cff' }

Page({
  data: {
    chips: [],
    active: 'all',
    keyword: '',
    groups: [],
    empty: false
  },

  onLoad(query) {
    const chips = [{ id: 'all', label: '全部' }].concat(handbook.map(c => ({ id: c.id, label: c.name })))
    const initial = query.cat && chips.some(c => c.id === query.cat) ? query.cat : 'all'
    this.all = handbook.map(c => {
      const color2 = LIGHTER[c.id] || c.color
      return {
        id: c.id, name: c.name, icon: c.icon, color: c.color,
        bg: `linear-gradient(135deg, ${c.color}, ${color2})`,
        desc: c.desc,
        entries: c.entries.map(en => ({
          key: en.key, title: en.title, tag: en.tag || '词条', summary: en.summary,
          hay: (en.title + en.summary).toLowerCase()
        }))
      }
    })
    this.setData({ chips, active: initial })
    this.apply()
  },

  setCat(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.active) return
    this.setData({ active: id })
    this.apply()
  },

  onInput(e) {
    this.setData({ keyword: (e.detail.value || '').trim().toLowerCase() })
    this.apply()
  },

  clearSearch() {
    this.setData({ keyword: '' })
    this.apply()
  },

  apply() {
    const { active, keyword } = this.data
    let groups = this.all
      .filter(g => active === 'all' || g.id === active)
      .map(g => {
        const entries = keyword ? g.entries.filter(en => en.hay.indexOf(keyword) >= 0) : g.entries
        return Object.assign({}, g, { entries })
      })
      .filter(g => g.entries.length)
    const empty = groups.length === 0
    groups = groups.map((g, i) => {
      const list = g.entries.map((en, j) => Object.assign({}, en, { delay: i * 90 + j * 45 }))
      return Object.assign({}, g, { entries: list })
    })
    this.setData({ groups, empty })
  },

  openEntry(e) {
    const key = e.currentTarget.dataset.key
    wx.navigateTo({ url: `/pages/handbook/handbook?key=${key}` })
  },

  onShareAppMessage() {
    return { title: '光学手册 - 工程师光学知识速查', path: '/pages/handbook/list' }
  }
})
