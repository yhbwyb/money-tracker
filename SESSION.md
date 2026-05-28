# 会话进度 · 2026-05-28

## 当前版本

V2.2.0

## 已完成工作

### 核心功能
- [x] 流水页：按月视图 + 搜索栏（跨全部记录搜索备注/金额/银行/事由）
- [x] 记账弹窗：日期/事由/银票/金额/备注历史快捷选择，记非当月账自动跳转月份
- [x] 账目页：月份选择器 + 公账/私账/合计汇总 + 饼图（彩色图例）+ 导出当月/导出全部 Excel
- [x] 印鉴页：银行卡管理 + 事由管理 + JSON 备份/还原 + 版本号显示
- [x] PWA：iOS 全屏安装、桌面图标、离线可用、安全区适配

### 架构优化（2026-05-28）
- [x] DB schema：v1 原始 + v2 增加 createdAt 索引
- [x] 移除 useTransactions 死代码、MonthPicker onClear
- [x] 备注历史提取到 `src/utils/noteHistory.ts`
- [x] 导出逻辑 DRY：`formatRow` / `buildSheet` 共享
- [x] 移除 `__BUILD_TIME__` 死代码
- [x] `computeTotals` 提取到 `src/utils/totals.ts`
- [x] 移除 `useBankCards` / `useEventTypes` 透传 hook
- [x] CONTEXT.md 同步更新

### 体验优化
- [x] 记录日期显示完整年月日，去掉了日期分组标题
- [x] 饼图标签改为下方颜色图例

### 文档
- [x] CONTEXT.md 更新到最新状态
- [x] DEPLOY-GUIDE.md 详细部署教程
- [x] HOW-TO-INSTALL.md 简化安装教程
- [x] 记账本安装指南.pdf 图文教程

## 下一步可做

1. 朋友测试反馈后的 bug 修复
2. 编辑已记账记录功能（如需）
3. 快捷模板（高频记账模式一键填入）
4. 年度汇总统计

## 关键信息

- 仓库：`yhbwyb/money-tracker`
- 线上地址：`https://yhbwyb.github.io/money-tracker/`
- 部署：GitHub Actions 自动部署，push master 触发
- Git 代理：`http://127.0.0.1:7897`（Clash）
- 用户 iPhone PWA 已安装，翻墙时更新

## 约定

- 切换项目前，用户会告知"把当前进度写到项目里"
- 日常对话中适时同步 CONTEXT.md
- 数据都在本地 IndexedDB，删 PWA 会丢数据
- 不删 PWA 图标 = 数据安全
