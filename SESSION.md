# 会话进度 · 2026-05-28

## 当前版本

V2.2.0

## 已完成

### 功能
- [x] 流水页：按月视图 + 搜索栏（跨全部记录按备注/金额/银行/事由搜索）
- [x] 记账弹窗：日期/事由/银票/金额/备注历史快捷选择，非当月账自动跳转月份
- [x] 账目页：月份选择器 + 公账/私账/合计 + 饼图（颜色图例）+ 导出当月/导出全部 Excel
- [x] 印鉴页：银行卡/事由管理 + JSON 备份还原 + 版本号
- [x] PWA：iOS 全屏安装 + 离线可用 + 安全区适配
- [x] 记录日期显示完整年月日，去掉日期分组标题

### 架构（2026-05-28 重构）
- [x] DB schema：v1 原始 + v2 增加 createdAt 索引
- [x] 移除 useTransactions 死代码 + MonthPicker onClear
- [x] 备注历史提取到 `src/utils/noteHistory.ts`
- [x] 导出逻辑 DRY：`formatRow`/`buildSheet` 共享
- [x] 移除 `__BUILD_TIME__` 死代码
- [x] `computeTotals` 提取到 `src/utils/totals.ts`
- [x] 移除 `useBankCards`/`useEventTypes` 透传 hook
- [x] 15 文件 → 14 文件，净删 63 行

### 文档
- [x] CONTEXT.md 同步到最新
- [x] DEPLOY-GUIDE.md 详细部署教程
- [x] HOW-TO-INSTALL.md 简化安装教程（给朋友）
- [x] 记账本安装指南.pdf 图文教程
- [x] SESSION.md 进度记录

## 下一步可做

- 朋友测试反馈后修 bug
- 编辑已记账记录
- 快捷模板（高频记账模式一键填入）
- 年度汇总统计

## 关键信息

- 仓库：`yhbwyb/money-tracker`
- 线上：`https://yhbwyb.github.io/money-tracker/`
- 部署：push master → GitHub Actions → gh-pages
- Git 代理：`http://127.0.0.1:7897`（Clash）
- 用户 iPhone PWA 已安装，翻墙时更新

## 约定

- 切换项目前说"把进度写入项目"
- 日常对话中适时说"同步 CONTEXT.md"
- 删 PWA 图标 = 数据全丢，不删 = 数据安全
