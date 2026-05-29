# 记账本 — 系统文档

## 概述

移动端 Web App（PWA），单用户记账工具。手机浏览器打开即用，支持添加到主屏幕作为独立 App。数据纯本地存储，完全离线可用。

**线上地址**：https://yhbwyb.github.io/money-tracker/

---

## 设计系统：「墨纸」

传统中式账本的现代数字演绎。暖纸底色、墨色文字、朱红点缀。

### 色彩

| Token | 色值 | 用途 |
|---|---|---|
| `--color-ink` | `#2c2416` | 主文字色 |
| `--color-ink-light` | `#6b5e4a` | 次要文字 |
| `--color-ink-muted` | `#9b8e7a` | 辅助/禁用文字 |
| `--color-paper` | `#fdf8f0` | 页面底色 |
| `--color-paper-dark` | `#f5efe0` | 输入框底色、导航栏 |
| `--color-paper-darker` | `#ebe0c8` | 分割线 |
| `--color-vermillion` | `#c43a31` | 公账标签、FAB、删除按钮 |
| `--color-vermillion-light` | `#f0d6d4` | 公账标签背景 |
| `--color-gold` | `#b8954a` | 备份提醒 |
| `--color-gold-light` | `#f5eedb` | 备份提醒背景 |
| `--color-jade` | `#5b8c5a` | 30笔提醒 |
| `--color-jade-light` | `#e2efe1` | 30笔提醒背景 |

### 字体

| Token | 字体 | 用途 |
|---|---|---|
| `--font-serif` | Noto Serif SC, SimSun, STSong, serif | 标题、金额、印章标签 |
| `--font-sans` | Noto Sans SC, PingFang SC, Microsoft YaHei | 正文 |

字体使用系统原生字体栈，无需加载外部字体资源。

### CSS 工具类

| Class | 说明 |
|---|---|
| `.seal-public` | 朱红印章风格公账标签 |
| `.seal-private` | 墨色印章风格私账标签 |
| `.btn-ink` | 墨色底白字按钮，按压缩放动画 |
| `.card-paper` | 白底微阴影卡片 |
| `.fab-ink` | 朱红浮动按钮 |
| `.divider-ink` | 渐变分割线 |
| `.input-ink` | 纸色底输入框，聚焦墨色边框 |
| `.month-btn` | 月份切换箭头 |
| `.safe-area-top` | iPhone 顶部安全区适配（刘海/灵动岛） |
| `.safe-area-bottom` | iPhone 底部安全区适配 |

### 噪点纹理

`body::before` 伪元素通过 SVG feTurbulence 生成全屏噪点纹理，opacity 0.025，营造纸质质感。

---

## 页面与交互

### Tab 1：流水 (`BillsPage`)

**月份切换**：左右箭头切换，显示 `YYYY年M月` 格式。

**汇总卡片**：公账合计（朱红）/ 私账合计（墨色），各占半栏，点击切换筛选。

**公账/私账筛选**：点击概要框切换筛选（高亮描边），另一框变暗。点击已选中框还原显示全部。筛选后仅显示对应账类记录，汇总金额同步更新。

**记录列表**：每条显示完整日期（YYYY年M月D日）→ 公/私印章 → 事由名称 → 银行·卡号 → 客户名 → 备注 → 金额。无日期分组标题，紧凑排列。

**点击编辑**：点击卡片（非滑动）弹出编辑表单（标题「改一笔」），预填原有数据，修改后点「改 账」保存。日期变更时自动跳转对应月份。

**左滑删除**：手指向左滑动 > 40px 露出朱红「删除」区域，点击确认后删除。删除按钮 touch 事件阻止冒泡，确保点击生效。同一时间只有一条记录处于滑开状态（由 `swipedId` 状态管理）。

**备份提醒条**：
- 7 天未备份 → 金色条「久未备份，请前往『账目』页导出」
- 每记 30 笔 → 翠绿条「已记 30+ 笔，建议前往『印鉴』留底备份」，可点 ✕ 关闭

**搜索栏**：月份选择器下方常驻搜索框，输入关键字跨全部历史记录搜索，匹配客户、备注、金额、银行名、事由名。清空搜索恢复当月视图。搜索时汇总卡片同步更新。

**FAB 按钮**：右下角朱红方块「记」，`fixed bottom-28 right-5`，z-index 30。

### Tab 2：账目 (`StatsPage`)

**汇总卡片**：三栏（公账 / 私账 / 合计），朱红 / 墨色 / 墨色。

**饼图**（环形）：按事由分布，墨色系调色板。环内无标签，下方显示颜色圆点图例（事由名称 + 百分比）。仅显示有数据的类型。

**导出按钮**：导出当月（Excel）/ 导出全部（Excel），导出后自动标记已备份。导出列：日期、事件、银行卡、卡号、公私账、金额、客户、备注。

**上次留底提示**：天数显示于顶部。

**版本号**：页面底部显示当前版本号（如 V2.4.0）。

### Tab 3：印鉴 (`SettingsPage`)

**备份管理卡片**：
- 导出 JSON 留底：全部数据（银行卡 + 事由 + 记录）→ `.json` 文件
- 还原留底：选文件 → 确认覆盖 → 导入 → 刷新页面

**银行卡管理**：
- 新增表单：银行名称 + 卡号后4位 + 公账/私账切换
- 删除时查询关联流水记录数，有则警告「有 N 条关联记录」
- 列表展示：银行名 · 卡号 + 公/私印章

**事由管理**：
- 输入框 + 添按钮
- 标签列表，每个标签有 × 删除按钮
- 删除时同上检查关联记录
- 默认预置：发货、物流、网购、其它

### 记账弹窗 (`AddRecordSheet`)

**打开**：点击流水页 FAB（新增模式，标题「记一笔」）或点击记录卡片（编辑模式，标题「改一笔」）。

**关闭**：点击遮罩背景、或下拉拖拽条超过 100px。

**表单流程**：日期（date input，默认当天）→ 事由（chip 选一）→ 银票（select 下拉）→ 公/私账自动显示 → 金额（数字输入，大号居中）→ 客户（输入框 + 历史客户 chip 快捷选择，选填，最多保留 20 条）→ 附注（输入框 + 历史备注 chip 快捷选择，最多保留 20 条）→ 入账/改账按钮。

**编辑模式**：通过 `transaction` prop 传入记录数据，表单预填所有字段。自动选中（useEffect）逻辑在编辑模式下跳过。提交时调用 `updateTransaction` 而非 `addTransaction`。

**紧凑布局**：减小各字段间距（mb-3）、标题字号、金额字号和输入框内边距，确保新增的客户字段不超出单屏。

**数据加载同步**：useEffect 监听 cards/types 变化，数据加载完成后自动选中第一项（解决 IndexedDB 异步加载导致的 ID=0 bug）。

**遮罩防穿透**：overlay 设 `touchAction: none`，sheet 设 `onTouchMove stopPropagation`，防止背景页面滚动。

---

## 数据模型

Dexie.js 封装 IndexedDB，数据库名 `MoneyTrackerDB`，版本 2。v1 建立基础表和索引，v2 增加 `createdAt` 索引以支持全表日期排序查询。

### bankCards

```typescript
{ id?: number, cardNumber: string, bankName: string, accountType: 'public' | 'private' }
```

主键自增。`accountType` 决定记账时自动带入公/私账标记。

### eventTypes

```typescript
{ id?: number, name: string }
```

主键自增。`db.on('populate')` 首次创建时写入默认值：发货(1)、物流(2)、网购(3)、其它(4)。

### transactions

```typescript
{
  id?: number
  date: string          // YYYY-MM-DD
  eventTypeId: number
  bankCardId: number
  accountType: 'public' | 'private'  // 从银行卡自动带入
  amount: number
  customer: string      // 选填，localStorage 记忆最近 20 条
  note: string
  createdAt: number     // Date.now()
}
```

主键自增。索引：`date, eventTypeId, bankCardId, accountType, createdAt`。`customer` 无需索引。

---

## 组件树与数据流

```
App (HashRouter)
 └─ Layout (底部导航 + Outlet)
     ├─ BillsPage
     │   ├─ MonthPicker
     │   ├─ Search Bar
     │   ├─ BackupBanner (条件渲染)
     │   ├─ Summary Cards (可点击筛选公/私账)
     │   ├─ RecordItem[] (点击编辑 + 左滑删除)
     │   ├─ FAB (触发新增弹窗)
     │   └─ AddRecordSheet (新增/编辑双模式)
     ├─ StatsPage
     │   ├─ MonthPicker
     │   ├─ Summary Cards
     │   ├─ PieChart (Recharts, 图例)
     │   └─ Export Buttons (当月Excel / 全部Excel)
     └─ SettingsPage
         ├─ Backup Card (JSON 导出/还原)
         ├─ Bank Cards Card
         └─ Event Types Card
```

**路由**：HashRouter（适配 GitHub Pages 子路径，URL 格式 `#/bills` `#/stats` `#/settings`）。

**数据流**：全部通过 Dexie.js hooks (`useLiveQuery`) 实时响应，无全局状态管理库。

---

## 数据安全

### 三层防护

| 层级 | 机制 | 触发 |
|---|---|---|
| L1 | IndexedDB 本地存储 | 始终 |
| L2 | 翠绿提醒条 | 每 30 笔 |
| L2 | 金色提醒条 | 7 天未备份 |
| L3 | Excel 导出 | 手动按月 |
| L3 | Excel 导出全部 | 手动全量 |
| L3 | JSON 完整留底 | 手动全量 |
| L3 | JSON 还原 | 手动导入 |

备份日期存于 `localStorage['lastBackupDate']`。30提醒计数存于 `localStorage['lastRemindCount']`。

---

## 技术栈详情

| 技术 | 版本 | 用途 |
|---|---|---|
| React | 18.x | UI 框架 |
| TypeScript | 5.7.x | 类型检查 |
| Vite | 6.x | 构建/开发服务器 |
| Tailwind CSS | 4.x | 样式引擎 (`@tailwindcss/vite`) |
| Dexie.js | 4.x | IndexedDB ORM |
| dexie-react-hooks | 1.x | `useLiveQuery` 响应式查询 |
| Recharts | 2.x | 统计图表 |
| SheetJS (xlsx) | 0.18.x | Excel 生成 |
| file-saver | 2.x | 文件下载 |
| React Router | 6.x | 路由（HashRouter） |
| vite-plugin-pwa | 0.21.x | PWA manifest + Service Worker |

---

## 部署

### GitHub Pages

仓库：`yhbwyb/money-tracker`

`.github/workflows/deploy.yml`：
- 触发：push master
- 步骤：checkout → setup Node 20 → npm install → npm run build → peaceiris/actions-gh-pages@v4
- 发布目录：`dist/`
- 目标分支：`gh-pages`
- Pages 设置：Deploy from branch → `gh-pages` → `/ (root)`

### Git 代理

开发机位于国内，Git 走 Clash 代理 `http://127.0.0.1:7897`：
```bash
git config --global http.proxy http://127.0.0.1:7897
git config --global https.proxy http://127.0.0.1:7897
```

---

## 开发

```bash
cd d:/cc-project/money-tracker
npm install
npm run dev       # 默认 HTTP 开发服务器，端口自动分配
npm run build     # → dist/
```

手机局域网测试：`npm run dev` 默认 `--host`，手机连同一 Wi-Fi 访问 Network 地址即可。

---

## 关键设计决策

1. **HashRouter 而非 BrowserRouter** — GitHub Pages 不支持 SPA fallback，HashRouter 天然兼容子路径部署。

2. **纯前端无后端** — 单用户场景无需服务端，IndexedDB 满足所有存储需求。

3. **Dexie.js on('populate')** — 首次创建数据库时写入默认事由，仅触发一次。

4. **useEffect 同步选中值** — 记账弹窗的 `bankCardId`/`eventTypeId` 初始值为 0，数据异步加载后通过 useEffect 同步到第一项，避免存入无效 ID。

5. **左滑状态提升至父组件** — `swipedId` 由 BillsPage 管理，确保同时只有一条记录处于滑开状态，且点击任意位置可关闭。

6. **弹窗下滑关闭** — 使用独立拖拽把手（`touch-none` + touch event handlers），遮罩层设 `touchAction: none` 防穿透。

7. **记账弹窗双模式复用** — `AddRecordSheet` 通过 `transaction` prop 区分新增/编辑模式，避免创建两个几乎相同的组件。表单预填、按钮文案、提交接口均根据模式切换。

8. **客户/备注历史分离** — 客户和备注各有独立的 localStorage 存储（`customerHistory` / `noteHistory`），各自保留最近 20 条，输入时按当前输入过滤显示快捷标签。

9. **公账/私账筛选 toggle** — 点击已选中框复原为"全部"，而非必须点击第三个按钮。交互简单且不占额外 UI 空间。

10. **导入兼容旧备份** — `importFullJSON` 对旧备份中无 `customer` 字段的记录自动补空字符串（`{ customer: '', ...t }`），确保跨版本备份可还原。

---

## 已知限制

- 统计页仅支持单月视图，导出全部数据功能可导出全量记录
- Service Worker 缓存策略为基础 precache，未实现运行时缓存
- 大 chunk 警告（recharts + xlsx 体积约 1MB），使用时可考虑代码分割
