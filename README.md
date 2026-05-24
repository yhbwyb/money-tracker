# 记账本

移动端 Web App（PWA），单用户简单记账工具。随时打开，3 秒完成一笔记账。

## 核心特性

- **快速记账**：底部半屏弹窗，流水式操作，单手完成
- **完全离线**：数据存于本地 IndexedDB，不依赖网络
- **数据永不丢失**：三层防护（本地存储 + 备份提醒 + JSON/Excel 导出导入）
- **统计图表**：按月统计、公账/私账汇总、事件类型分布
- **可安装**：PWA 支持添加到手机主屏幕，像原生 App 一样

## 页面

### 1. 账单（首页）
- 按月筛选，左右箭头切换月份，默认当月
- 记录列表：日期、事件、银行卡、金额、公/私账标签、备注
- 按月合计：公账合计 / 私账合计
- 左滑删除记录
- 右下角悬浮按钮「+ 记账」
- 超过 7 天未备份时顶部显示黄色提醒条

### 2. 统计
- 月份切换
- 汇总卡片：公账合计 / 私账合计 / 总合计
- 饼图：按事件类型分布
- 柱状图：按日支出趋势
- 导出 Excel 按钮
- 上次备份时间提示

### 3. 配置
- 银行卡管理：新增 / 删除，录入卡号（后 4 位）、银行名称，标记公账或私账
- 事件类型管理：新增 / 删除，默认有发货、物流、网购、其它

## 记账流程

```
日期（默认当天）→ 选择事件 → 选择银行卡 → 输入金额
→ 公/私账自动显示 → 填写备注（选填）→ 提交
```

选择银行卡后，公账/私账根据该卡的 accountType 自动显示，无需手动选择。

## 数据模型

### bankCards（银行卡）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | number | 主键 |
| cardNumber | string | 卡号后 4 位 |
| bankName | string | 银行名称 |
| accountType | 'public' \| 'private' | 公账 / 私账 |

### eventTypes（事件类型）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | number | 主键 |
| name | string | 事件名 |

默认数据：发货、物流、网购、其它

### transactions（记账记录）

| 字段 | 类型 | 说明 |
|---|---|---|
| id | number | 主键 |
| date | string (YYYY-MM-DD) | 记账日期 |
| eventTypeId | number | 关联事件类型 |
| bankCardId | number | 关联银行卡 |
| accountType | 'public' \| 'private' | 从银行卡自动带入 |
| amount | number | 金额 |
| note | string | 备注（选填） |
| createdAt | timestamp | 创建时间 |

## 数据安全

三层防护确保数据不丢失：

1. **主存储** — Dexie.js 操作 IndexedDB，浏览器不会主动清理，完全离线可用
2. **备份提醒** — 每记 30 笔弹窗提醒，超 7 天未备份显示黄色提醒条
3. **导出/导入** — 支持导出 Excel (.xlsx)、JSON 完整备份、CSV；JSON 支持一键导入恢复

## 技术栈

| 技术 | 用途 |
|---|---|
| React 18 + TypeScript | 前端框架 |
| Vite | 构建工具 |
| Tailwind CSS | 样式 |
| Dexie.js | IndexedDB 数据库封装 |
| Recharts | 统计图表 |
| SheetJS | Excel 导出 |
| React Router | 页面路由 |
| vite-plugin-pwa | PWA / Service Worker |

## 部署

GitHub Pages（免费、HTTPS），PWA 配置 manifest.json 后浏览器自动提示「添加到主屏幕」。
