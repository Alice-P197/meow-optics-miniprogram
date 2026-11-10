// components/assistant-drawer/assistant-drawer.js
// 顶部下滑抽屉式 AI 客服，复用 utils/assistant.js 的全部能力
const { runAssistant, suggestPrompts, listCalcsShort } = require('../../utils/assistant.js')

Component({
  options: {
    styleIsolation: 'apply-shared',
    multipleSlots: false
  },

  properties: {
    show: { type: Boolean, value: false }
  },

  data: {
    messages: [],
    input: '',
    typing: false,
    draftId: 0,
    promoted: [],
    calcs: [],
    scrollTop: 0,
    /** 消息流是否已滚离底部（显示"回到底部"按钮） */
    showToBot: false,
    /** 键盘是否弹出（用于收缩面板高度） */
    kbd: false,
    /** 动画状态：enter=正在滑入 / shown=已显示 / leave=正在滑出 / hidden=已隐藏 */
    phase: 'hidden',
    /** 头部下拉手势：面板向下偏移量（px） */
    dragY: 0,
    dragging: false
  },

  observers: {
    'show'(v) {
      if (v) this._enter()
      else this._leave()
    }
  },

  lifetimes: {
    attached() {
      // 预加载推荐（首次打开再显示）
    }
  },

  methods: {
    /** 滑入：先插入节点（CSS 初始在屏幕外），下一拍再加 open 类触发过渡 */
    _enter() {
      this.setData({ phase: 'enter' }, () => {
        setTimeout(() => {
          this.setData({ phase: 'shown' })
          // 记录消息流视口高度，用于精确判断是否处于底部
          this.createSelectorQuery()
            .select('#msg-scroll').boundingClientRect()
            .exec(res => { if (res && res[0]) this._streamH = res[0].height })
        }, 50)
        if (this.data.messages.length === 0) this._initChat()
      })
    },

    /** 滑出：移除 open 类，过渡结束后再卸载节点 */
    _leave() {
      this.setData({ phase: 'leave' })
      setTimeout(() => this.setData({ phase: 'hidden' }), 340)
    },

    /** 初始化对话（首次打开时） */
    _initChat() {
      this.addMsg('ai',
        '喵～我是 **小喵助手** 🐱\n\n我可以帮你做四件事：\n● 找 **光学概念**（手册里的内容都能问，如菲涅尔数 / WGS / 阿贝数）\n● **算公式**（带数字给我即可）\n● **算法库**：GS / WGS / 三维 GS / GA 参数估算\n● 给 **设计方案**（光镊 / 全息 / 显微成像等）\n\n输入"总结一下"可盘点我的全部能力 ✨',
        null, 'greeting')
      this.setData({
        promoted: suggestPrompts(),
        calcs: listCalcsShort(6)
      })
    },

    /** **bold** 解析为 segments */
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
      if (this._atBottom === false) {
        // 用户正在往回翻阅：不强行拽到底，改为亮起"回到底部"按钮
        this.setData({ messages, showToBot: true })
      } else {
        this.setData({ messages }, () => this.scrollToEnd())
      }
      return id
    },

    onInput(e) { this.setData({ input: e.detail.value }) },

    onTapSend() {
      const q = (this.data.input || '').trim()
      if (!q) return
      this.setData({ input: '' })
      this.userQuery(q)
    },

    onPromptTap(e) {
      this.userQuery(e.currentTarget.dataset.q)
    },

    onCalcTap(e) {
      const id = e.currentTarget.dataset.id
      this._emitClose()
      wx.navigateTo({ url: '/pages/calc/calc?id=' + id })
    },

    onCardTap(e) {
      const { kind, id, payload } = e.currentTarget.dataset
      this._emitClose()
      if (kind === 'calc') {
        const p = payload ? encodeURIComponent(JSON.stringify(payload)) : ''
        wx.navigateTo({ url: '/pages/calc/calc?id=' + id + (p ? '&payload=' + p : '') })
      } else if (kind === 'entry') {
        wx.navigateTo({ url: '/pages/handbook/handbook?key=' + id })
      }
    },

    userQuery(q) {
      this.addMsg('u', q)
      this.setData({ typing: true })
      setTimeout(() => {
        const out = runAssistant(q)
        this.setData({ typing: false })
        this.addMsg('ai', out.text, out.cards, out.tool)
      }, 320)
    },

    onClear() {
      this.setData({ messages: [], draftId: 0, scrollTop: 0, showToBot: false })
      this._initChat()
    },

    /** 输入框聚焦：键盘弹出 → 收缩面板，避免输入栏被键盘遮挡 */
    onFocus() {
      this.setData({ kbd: true })
    },
    /** 输入框失焦：恢复面板高度 */
    onBlur() {
      this.setData({ kbd: false })
    },

    /** 滚动监听：判断是否离开底部（节流） */
    onStreamScroll(e) {
      const now = Date.now()
      const d = e.detail
      this._atBottom = d.scrollHeight - d.scrollTop - (this._streamH || d.scrollHeight * 0.6) < 120
      if (this._scrollTs && now - this._scrollTs < 150) return
      this._scrollTs = now
      const show = !this._atBottom && this.data.messages.length > 3
      if (show !== this.data.showToBot) this.setData({ showToBot: show })
    },

    onToBottom() {
      this.setData({ showToBot: false })
      this.scrollToEnd()
    },

    scrollToEnd() {
      // 交替两个值，确保相同高度时也能触发滚动更新；避免超大数值失效
      this.setData({ scrollTop: this.data.scrollTop >= 999990 ? 999999 : 999990 + Math.floor(Math.random() * 8) })
    },

    /** 点击背景遮罩 → 关闭 */
    onMaskTap() {
      this._emitClose()
    },

    /* ---------- 头部下拉手势关闭 ---------- */
    onHeadTouchStart(e) {
      if (this.data.phase !== 'shown') return
      const t = e.touches[0]
      this._headDrag = { y: t.clientY }
    },
    onHeadTouchMove(e) {
      const d = this._headDrag
      if (!d) return
      const t = e.touches[0]
      const dy = t.clientY - d.y
      if (dy > 0) this.setData({ dragY: Math.round(dy), dragging: true })
    },
    onHeadTouchEnd() {
      const dy = this.data.dragY
      this._headDrag = null
      this.setData({ dragY: 0, dragging: false })
      if (dy > 90) this._emitClose()   // 下拉超过 90px → 关闭，否则弹回
    },

    /** 阻止事件冒泡（防止 drawer 内容点击关闭） */
    onStop() {},

    /** 关闭按钮 */
    onCloseTap() {
      this._emitClose()
    },

    _emitClose() {
      this.triggerEvent('close')
    }
  }
})