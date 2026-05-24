# 记账本

移动端 Web App（PWA），单用户简单记账工具。随时打开，3 秒完成一笔记账。

## 设计美学：「墨纸」— 传统账本的现代演绎

- **暖纸底色** `#fdf8f0` + 噪点纹理，模拟纸质账本质感
- **墨色文字** `#2c2416`，分层透明度营造层次
- **朱红点缀** `#c43a31`（印章风格标签、记账按钮）
- **衬线字体** Noto Serif SC（标题）+ Noto Sans SC（正文）
- **Tab 命名**：簿 · 流水 / 图 · 账目 / 印 · 印鉴

## 页面

### 1. 流水（首页）

- 月份切换：左右箭头切换月份，默认当月
- 公账/私账合计卡片（朱红 / 墨色双栏）
- 记录列表：日期、公/私印章标签、事件名、银行卡、金额、备注
- **左滑删除**：向左滑动记录露出朱红删除按钮，确认后删除
- 右下角朱红 FAB 按钮「记」，点击弹出记账弹窗
- **备份提醒**：超过 7 天未备份显示金色提醒条；每记 30 笔显示翠绿提醒条（可关闭）

### 2. 账目（统计）

- 月份切换
- 三栏汇总卡片：公账（朱红）/ 私账（墨色）/ 合计
- 环形饼图：按事由分布，墨色系调色板
- 柱状图：按日流水趋势
- 导出 Excel / CSV 按钮
- 上次留底时间提示

### 3. 印鉴（配置）

- **备份管理**：导出 JSON 留底 / 导入 JSON 还原，显示上次留底天数
- **银行卡管理**：新增/删除（录入银行名称、卡号后4位、标记公账/私账），删除时检查关联记录数并确认
- **事由管理**：新增/删除，删除时检查关联记录数并确认，默认预置发货/物流/网购/其它

## 记账流程

```
点击「记」→ 日期（默认当天）→ 选择事由 → 选择银票
→ 公/私账自动显示 → 输入金额 → 附注（选填）→ 入账
```

选择银行卡后，公账/私账根据该卡自动显示，无需手动选择。

## 数据模型

### bankCards（银票）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | number | 主键自增 |
| cardNumber | string | 卡号后 4 位 |
| bankName | string | 银行名称 |
| accountType | 'public' \| 'private' | 公账 / 私账 |

### eventTypes（事由）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | number | 主键自增 |
| name | string | 事由名称 |

默认数据：发货、物流、网购、其它

### transactions（流水记录）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | number | 主键自增 |
| date | string (YYYY-MM-DD) | 记账日期 |
| eventTypeId | number | 关联事由 |
| bankCardId | number | 关联银票 |
| accountType | 'public' \| 'private' | 从银票自动带入 |
| amount | number | 金额 |
| note | string | 附注（选填） |
| createdAt | timestamp | 创建时间戳 |

## 数据安全（三层防护）

| 层级 | 机制 | 触发条件 |
|---|---|---|
| 第一层 | IndexedDB 本地存储（Dexie.js 封装） | 始终在线 |
| 第二层 | 翠绿提醒条 | 每记 30 笔 |
| 第二层 | 金色提醒条 | 超过 7 天未留底 |
| 第三层 | 导出 Excel (.xlsx) / CSV | 手动，按月导出 |
| 第三层 | 导出 JSON 完整留底 | 手动（含所有银票+事由+记录） |
| 第三层 | 导入 JSON 还原 | 换机/恢复场景，覆盖全部数据 |

## 技术栈

| 技术 | 用途 |
|---|---|
| React 18 + TypeScript | 前端框架 |
| Vite | 构建工具 |
| Tailwind CSS v4 | 样式引擎 |
| Dexie.js | IndexedDB 数据库封装 |
| Recharts | 统计图表（饼图 + 柱状图） |
| SheetJS | Excel 导出 |
| React Router v6 | 页面路由 |
| vite-plugin-pwa | PWA / Service Worker / manifest |

## 项目结构

```
src/
├── db/index.ts                  # Dexie 数据库定义与 schema
├── utils/
│   ├── format.ts                # 日期/金额/月份格式化工具
│   ├── export.ts                # Excel/CSV/JSON 导出
│   └── import.ts                # JSON 导入恢复
├── hooks/
│   ├── useTransactions.ts       # 流水查询/新增/删除
│   ├── useBankCards.ts          # 银票 CRUD
│   ├── useEventTypes.ts         # 事由 CRUD
│   └── useBackup.ts             # 备份提醒逻辑
├── components/
│   ├── Layout.tsx               # 底部三 Tab 导航
│   ├── MonthPicker.tsx          # 月份切换器
│   ├── RecordItem.tsx           # 单条记录（含左滑删除）
│   ├── AddRecordSheet.tsx       # 底部半屏记账弹窗
│   └── BackupBanner.tsx         # 备份提醒横条
├── pages/
│   ├── BillsPage.tsx            # 流水页
│   ├── StatsPage.tsx            # 账目统计页
│   └── SettingsPage.tsx         # 印鉴配置页
├── App.tsx                      # 路由入口
├── main.tsx                     # 应用挂载
└── index.css                    # Tailwind + 全局设计系统
```

## 开发

```bash
npm install
npm run dev        # 开发服务器 → http://localhost:5173
npm run build      # 生产构建 → dist/
```

## 部署

GitHub Pages（免费、HTTPS），PWA manifest 已配置，浏览器自动提示「添加到主屏幕」。
