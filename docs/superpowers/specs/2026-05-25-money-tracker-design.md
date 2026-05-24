# 记账本 — 设计文档

## 概述

移动端 Web App（PWA），单用户简单记账工具。手机随时打开，3 秒完成一笔记账，数据本地离线存储，支持 Excel 导出备份。

## 技术栈

- React 18 + TypeScript
- Vite（构建工具）
- Tailwind CSS（样式）
- Dexie.js（IndexedDB 封装）
- Recharts（统计图表）
- SheetJS（Excel 导出）
- React Router（页面路由）
- vite-plugin-pwa（PWA 支持）

## 项目结构

```
src/
├── db/           # Dexie 数据库定义和操作
├── pages/        # 记账页 / 统计页 / 配置页
├── components/   # 可复用组件（分类选择、银行卡选择等）
├── hooks/        # 自定义 hooks
├── utils/        # 工具函数（导出、格式化等）
└── App.tsx       # 路由入口
```

## 数据模型

### 银行卡表 (bankCards)

| 字段 | 类型 | 说明 |
|---|---|---|
| id | number (自增) | 主键 |
| cardNumber | string | 卡号（后 4 位） |
| bankName | string | 银行名称 |
| accountType | 'public' \| 'private' | 公账 / 私账 |

### 事件类型表 (eventTypes)

| 字段 | 类型 | 说明 |
|---|---|---|
| id | number (自增) | 主键 |
| name | string | 事件名 |

默认数据：发货、物流、网购、其它

### 记账记录表 (transactions)

| 字段 | 类型 | 说明 |
|---|---|---|
| id | number (自增) | 主键 |
| date | string (YYYY-MM-DD) | 记账日期，默认当天 |
| eventTypeId | number | 关联事件类型 |
| bankCardId | number | 关联银行卡 |
| accountType | 'public' \| 'private' | 从银行卡自动带入 |
| amount | number | 金额 |
| note | string | 备注（选填） |
| createdAt | timestamp | 创建时间 |

关系：
- transactions.eventTypeId → eventTypes.id
- transactions.bankCardId → bankCards.id
- transactions.accountType ← bankCards.accountType（自动填入）

## 页面结构

底部导航栏，三个 Tab：

### Tab 1：账单（首页）
- 按月筛选（左右箭头切换月份，默认当月）
- 记录列表：日期、事件、银行卡、金额、公/私账标签、备注
- 按月合计显示（公账合计 / 私账合计）
- 左滑删除记录
- 右下角「+ 记账」悬浮按钮

### Tab 2：统计
- 月份切换
- 饼图：按事件类型分布
- 柱状图：按日支出趋势
- 汇总卡片：公账合计 / 私账合计 / 总合计
- 「导出 Excel」按钮

### Tab 3：配置
- 银行卡管理：列表 + 新增/删除
- 事件类型管理：列表 + 新增/删除

### 记账弹窗（底部半屏 Bottom Sheet）
- 流水式操作：日期 → 事件 → 银行卡 → 金额 → 公/私账自动显示 → 备注 → 提交
- 提交后自动关闭，账单页刷新

## 数据安全策略（三层防护）

### 第一层：主存储
- Dexie.js 操作 IndexedDB，浏览器不会主动清理
- 完全离线可用，记账不依赖网络

### 第二层：备份提醒
- 每记账 30 笔，弹窗提醒备份
- 统计页和配置页顶部显示「上次备份：X 天前」
- 超过 7 天未备份，账单页顶部黄色提醒条

### 第三层：导出/导入
- 导出 Excel（SheetJS）：生成 .xlsx 下载
- 导出 JSON：完整备份（银行卡 + 事件类型 + 所有记录）
- 导入 JSON：一键恢复全部数据
- 导出 CSV：轻量格式，Excel/WPS 直接打开

## PWA 配置

- manifest.json：名称「记账本」、图标（192×192 / 512×512）、主题色
- Service Worker：静态资源缓存，离线秒开
- 部署：GitHub Pages（免费、HTTPS）
