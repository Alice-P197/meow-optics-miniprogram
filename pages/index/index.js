// 首页
const { calculators, getCalc } = require('../../data/calculators')
const { handbook } = require('../../data/handbook')
const { greeting, todayCN, relTime } = require('../../utils/util')

const CATS = [
  { id: 'geo', label: '几何光学' },
  { id: 'wave', label: '波动光学' },
  { id: 'phys', label: '光子学' },
  { id: 'holo', label: '光场调控' }
]
Page({
  data: {
    greet: '',
    date: '',
    calcFilter: 'all',
    calcFilters: [{ id: 'all', label: '全部' }, ...CATS],
    calcList: [],
    calcTotal: 0,
    recent: [],
    cats: [],
    hot: [],
    entryTotal: 0,
    shown: { calc: false, book: false },
    showAssistant: false,
    showBubble: false,      // 小猫自动问候气泡
    bubbleGone: false,      // 用户手动关闭过气泡则不再打扰
    catX: 0,               // 小猫位置（px，拖拽用）
    catY: 0,
    dragging: false,        // 正在拖拽小猫
    bubbleDown: false       // 小猫在屏幕上半部时，气泡改到下方弹出
  },

  onLoad() {
    const LIGHTER = { const: '#7ea5ff', material: '#38c9ad', imaging: '#a48bff', rad: '#ffb057', phys: '#b48cff', holo: '#3be6c8' }
    const totalEntries = handbook.reduce((s, c) => s + c.entries.length, 0)
    const cats = handbook.map(c => {
      const color2 = LIGHTER[c.id] || c.color
      return {
        id: c.id, name: c.name, icon: c.icon, desc: c.desc,
        color: c.color, color2,
        count: c.entries.length,
        bg: `linear-gradient(135deg, ${c.color}, ${color2})`
      }
    })
    const hot = []
    handbook.forEach(c => c.entries.forEach(en => {
      if (en.hot) hot.push({ key: en.key, title: en.title, tag: en.tag, catName: c.name, catColor: c.color, summary: en.summary })
    }))
    this.allCalcs = calculators
    this.setData({
      greet: greeting(),
      date: todayCN(),
      calcTotal: calculators.length,
      entryTotal: totalEntries,
      cats,
      hot,
      calcList: calculators
    })
    // 小猫初始位置：屏幕右下角（与原 CSS right/bottom 一致）
    this._win = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    this._rpx = n => n * this._win.windowWidth / 750
    this._catSize = this._rpx(124)
    const insetB = Math.max(0, this._win.windowHeight - (this._win.safeArea ? this._win.safeArea.bottom : this._win.windowHeight))
    this.setData({
      catX: this._win.windowWidth - this._catSize - this._rpx(30),
      catY: this._win.windowHeight - this._catSize - this._rpx(56) - insetB
    })
  },

  onReady() {
    this._base = { calc: 0, book: 0 }
    this._vh = 0
    const q = wx.createSelectorQuery()
    q.select('#sec-book').boundingClientRect(rect => { if (rect) this._base.book = rect.top })
    q.select('.body').boundingClientRect(rect => { if (rect) this._vh = rect.height })
    q.exec(() => this.tryReveal())
    // 兜底：若测量/滚动异常，保证内容最终可见
    this._fallback = setTimeout(() => this.revealAll(), 1600)
  },

  tryReveal() {
    if (this._revealedAll) return
    const top = this._pageScrollTop || 0
    const th = Math.max(this._vh || 660, 600)
    const s = this.data.shown
    const next = Object.assign({}, s)
    if (!next.calc && this._base.calc < th * 0.96) next.calc = true
    if (!next.book && this._base.book - top < th * 0.92) next.book = true
    this._revealedAll = next.calc && next.book
    if (next.calc !== s.calc || next.book !== s.book) this.setData({ shown: next })
  },

  revealAll() {
    if (this._revealedAll) return
    this._revealedAll = true
    this.setData({ shown: { calc: true, book: true } })
  },

  onScrollTop(e) {
    this._pageScrollTop = e.detail.scrollTop || 0
    this.tryReveal()
  },

  onShow() {
    this.loadRecent()
    this.scheduleCatGreeting()
  },

  onHide() {
    this.clearCatGreeting()
  },

  /** 小猫自动问候：页面稳定 2.6s 后弹气泡，10s 后自动收起 */
  scheduleCatGreeting() {
    this.clearCatGreeting()
    if (this.data.bubbleGone || this.data.showAssistant) return
    this._catShow = setTimeout(() => {
      this.setData({ showBubble: true })
      this._catHide = setTimeout(() => {
        this.setData({ showBubble: false })
      }, 10000)
    }, 2600)
  },

  clearCatGreeting() {
    clearTimeout(this._catShow)
    clearTimeout(this._catHide)
  },

  /** 用户手动关闭气泡（之后不再自动弹出） */
  onBubbleClose() {
    this.clearCatGreeting()
    this.setData({ showBubble: false, bubbleGone: true })
  },

  onUnload() {
    if (this._fallback) clearTimeout(this._fallback)
  },

  loadRecent() {
    let arr = wx.getStorageSync('opti_recent') || []
    const recent = arr
      .filter(r => getCalc(r.id))
      .slice(0, 8)
      .map(r => {
        const c = getCalc(r.id)
        return { id: c.id, name: c.name, symbol: c.symbol, grad: c.grad, sub: c.sub, time: relTime(r.t) }
      })
    this.setData({ recent })
  },

  setFilter(e) {
    const id = e.currentTarget.dataset.id
    if (id === this.data.calcFilter) return
    this.setData({ calcFilter: id })
    this.applyFilter()
  },

  applyFilter() {
    const { calcFilter } = this.data
    const list = calcFilter === 'all' ? this.allCalcs : this.allCalcs.filter(c => c.cat === calcFilter)
    this.setData({ calcList: list, calcFilter })
  },

  openCalc(e) {
    const id = e.currentTarget.dataset.id
    this.recordRecent(id)
    wx.navigateTo({ url: `/pages/calc/calc?id=${id}` })
  },

  openCat(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/handbook/list?cat=${id}` })
  },

  openEntry(e) {
    const key = e.currentTarget.dataset.key
    wx.navigateTo({ url: `/pages/handbook/handbook?key=${key}` })
  },

  openHandbook() {
    wx.navigateTo({ url: '/pages/handbook/list' })
  },

  openAssistant() {
    this.clearCatGreeting()
    this.setData({ showAssistant: !this.data.showAssistant, showBubble: false })
  },

  /* ---------- 小猫拖拽 ---------- */
  onCatStart(e) {
    const t = e.touches[0]
    this._catDrag = { sx: t.clientX, sy: t.clientY, ox: this.data.catX, oy: this.data.catY, moved: false }
  },
  onCatMove(e) {
    const d = this._catDrag
    if (!d) return
    const t = e.touches[0]
    const dx = t.clientX - d.sx, dy = t.clientY - d.sy
    if (!d.moved && Math.abs(dx) < 6 && Math.abs(dy) < 6) return
    d.moved = true
    const W = this._win.windowWidth, H = this._win.windowHeight, S = this._catSize
    let x = Math.max(6, Math.min(d.ox + dx, W - S - 6))
    let y = Math.max(6, Math.min(d.oy + dy, H - S - 6))
    this.setData({ catX: x, catY: y, dragging: true })
  },
  onCatEnd() {
    const d = this._catDrag || {}
    this._catDrag = null
    // 未拖动 → 视为点击，打开对话
    if (!d.moved) {
      this.setData({ dragging: false })
      this.openAssistant()
      return
    }
    // 松手吸边 + 气泡方向
    const W = this._win.windowWidth, S = this._catSize
    const x = this.data.catX < (W - S) / 2 ? 6 : W - S - 6
    const bubbleDown = this.data.catY < 200
    this.setData({ catX: x, dragging: false, bubbleDown })
  },

  onCloseAssistant() {
    this.setData({ showAssistant: false })
  },

  recordRecent(id) {
    let arr = wx.getStorageSync('opti_recent') || []
    arr = [{ id, t: Date.now() }, ...arr.filter(r => r.id !== id)].slice(0, 12)
    wx.setStorageSync('opti_recent', arr)
  },

  onShareAppMessage() {
    return { title: '光学工坊 - 工程师的光学手册与计算工具', path: '/pages/index/index' }
  }
})
