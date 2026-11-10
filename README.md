# 小黑喵智光计算 · 微信小程序源码

「光学工坊」小程序（项目名 `meowoptics`），原作：小黑喵工作室。

## 导入

1. 微信开发者工具 → 导入项目 → 选本目录
2. 把 `project.config.json` 里的 `"appid": "touristappid"` 换成你自己的小程序 AppID（测试号也能跑，但真机预览/上传需要自己的）
3. 基础库建议 3.x（开发时用 3.17.2）

## 目录

```
app.js / app.json / app.wxss     小程序入口与全局样式
pages/index                       首页（入口瓷片、常用词条）
pages/calc                        计算器列表 / 详情
pages/handbook                    手册分类 / 词条列表 / 词条详情（list.* 是列表页）
pages/assistant                   助手对话页
components/navigation-bar         自定义导航栏
components/assistant-drawer       助手抽屉
data/calculators.js               全部计算器数据（每个带 compute()）
data/handbook.js                  全部手册词条（分类 → 词条 → 内容块）
utils/assistant.js                规则式助手：意图分类 + 关键词打分 + 调度计算器
utils/util.js                     纯函数工具（数值格式化、问候语、日期、波形配色）
assets/cat-assistant.png          助手形象
```

## 数据怎么加

- **加计算器**：在 `data/calculators.js` 里追加一条，字段为 `id / name / symbol / cat / catName / sub / desc / formulas / params / compute`，`compute(p)` 返回 `{ rows: [{k,label,v,u}], note, refs }`。加完不需要改页面，列表按 `catName` 自动分组。
- **加词条**：在 `data/handbook.js` 对应分类的 `entries` 里追加，字段为 `key / title / tag / summary / blocks`；`blocks` 支持 `p / h3 / formula / note / list / table / code` 七种块。
- 两个文件都是纯 JS 数据，无网络依赖，改完直接生效。

## 说明

- 本目录为小程序源码，**不是** Android 版；Android 版（本地手册 + 大模型对话 + 自扩展）见仓库根目录的下载页与 Release。
- 原 `project.private.config.json`（含本机开发设置）与真实 AppID 已移除，导入后按第 2 步自行填写。