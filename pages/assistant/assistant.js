// pages/assistant/assistant.js — 智能客服对话页
const { runAssistant, suggestPrompts, listCalcsShort } = require('../../utils/assistant')

Page({
  data: {
    messages: [],            // { role: 'u'|'ai', text, cards?, ts, tool? }
    input: '',
    typing: false,
    draftId: 0,
    promoted: [],            // 推荐 prompt
    calcs: [],               // 推荐的计算器快捷入口
    listShrink: false,       // 输入时隐藏长列表
    scrollTop: 999999,
    title: '光学小助手'
  },

  onLoad() {
    this.addMsg('ai', '你好，我是 **OPTILAB 小助手** 🤖\n\n我可以帮你做三件事：\n● 找 **光学概念**（如菲涅尔数 / GS 算法）\n● **算公式**（带数字给我即可）\n● 给 **设计方案**（光镊 / 全息 / 显微成像等）', null, 'greeting')
    this.setData({
      promoted: suggestPrompts(),
      calcs: listCalcsShort(6)
    })
  },

  /** 系统重置（清空）时也走一遍 onLoad 的初始化流程 */
  _reset() {
    this.setData({ messages: [], draftId: 0 })
    this.onLoad()
  },

  /** 把 **xxx** 语法预解析为 segments */
  parseBold(text) {
    const segs = []
    const re = /\*\*(.+?)\*\*/g
    let last = 0, m
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) segs.push({ bold: false, text: text.slice(last, m.index) })
      segs.push({ bold: true, text: m[1] })
      last = m.index + m[0].length
    }
    if (last < text.length) segs.push({ bold: false, text: text.slice(last) })
    return segs
  },

  addMsg(role, text, cards, tool) {
    const id = ++this.data.draftId
    const msg = {
      id, role,
      text: text || '',
      textArr: this.parseBold(text || ''),
      cards: cards || [],
      tool: tool || '',
      ts: Date.now()
    }
    const messages = this.data.messages.concat(msg)
    this.setData({ messages }, () => this.scrollToEnd())
    return id
  },

  /** 用户从输入框发送 */
  onInput(e) { this.setData({ input: e.detail.value }) },
  onTapSend() {
    const q = this.data.input.trim()
    if (!q) return
    this.setData({ input: '' })
    this.userQuery(q)
  },
  /** 从推荐 prompt 直接发送 */
  onPromptTap(e) {
    const q = e.currentTarget.dataset.q
    this.userQuery(q)
  },
  /** 计算器快捷卡片 */
  onCalcTap(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/calc/calc?id=' + id })
  },

  userQuery(q) {
    this.addMsg('u', q)
    this.setData({ typing: true })
    // 模拟一点思考延迟
    setTimeout(() => {
      const out = runAssistant(q)
      this.setData({ typing: false })
      this.addMsg('ai', out.text, out.cards, out.tool)
    }, 350)
  },

  /** 工具卡片被点击：跳转到详情页 */
  onCardTap(e) {
    const { kind, id, payload } = e.currentTarget.dataset
    if (kind === 'calc') {
      const p = payload ? encodeURIComponent(JSON.stringify(payload)) : ''
      wx.navigateTo({ url: '/pages/calc/calc?id=' + id + (p ? '&payload=' + p : '') })
    } else if (kind === 'entry') {
      wx.navigateTo({ url: '/pages/handbook/handbook?key=' + id })
    }
  },

  /** 清空对话 */
  onClear() { this._reset() },

  scrollToEnd() {
    this.setData({ scrollTop: 999999 + Date.now() })
  },

  onShareAppMessage() {
    return { title: 'OPTILAB 智能客服 — 找概念、算公式、给方案', path: '/pages/assistant/assistant' }
  }
})
