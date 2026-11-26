# 08 · 布局复用、API 分层与严格类型

> 日期：2026-11-26
> 范围：全部页面、弹窗、Tab、Header、数据请求、TypeScript 类型
> 约束：不新增自定义页面壳；不引入 `any`；不关闭正在运行的 Web 服务

---

## 1. 布局与交互组件复用

### 1.1 页面壳

| 页面类型 | 使用组件 |
|---|---|
| 登录页 | 独立登录布局 + `BrandPanel` / `LoginForm` |
| 全部业务页 | `AppShell`：`DesktopSidebar` / `MobileSidebar` / `Topbar` / `SearchDialog` |
| 素材与许可（已登录） | `AppShell` + `PageHeader` |
| 素材与许可（未登录） | `PublicHeader`，复用 `Brand` / `ButtonLink` |
| 404 | 独立错误页布局 |

`AppShell` 增加可选 `children`，已登录访问 `/credits` 时直接复用完整侧边栏和顶栏，不再切换到另一套页面壳。

### 1.2 Header 与 Tab

- 列表页统一使用 `PageHeader`。
- 详情页使用领域 Header：`VehicleHeader`、`DriverHeader`、`LeaseHeader`、`ModelSummary`，它们都位于 `AppShell` 内，并复用 `Card` / `Button` / `Badge`。
- 业务 Tab 统一使用 `Tabs`：Settings、Finance、Leases、VehicleDetail、Maintenance、车型实拍/3D、车型筛选、报表时间范围。
- `LeaseStepper` 是三步向导的流程导航，不是 Tab，保留专用组件。

### 1.3 弹窗

- 表单弹窗统一使用 `Modal`。
- 二次确认统一使用 `ConfirmDialog`。
- 抽屉使用 `Drawer`。
- 富文本链接使用 `RichTextLinkPopover`（锚定浮层，不是全屏弹窗）。
- 没有页面自行实现 `fixed inset-0` 弹窗壳。

---

## 2. API 分层

数据请求统一收口到 `frontend/src/api/`：

```text
pages / components
       ↓
hooks（useXxx）
       ↓
api/*.ts（领域 API 函数）
       ↓
lib/api.ts（通用 fetch / ApiError / query string）
```

| API 文件 | 责任 |
|---|---|
| `api/auth.ts` | 手机号登录、注册、退出、当前用户、公开概览 |
| `api/dashboard.ts` | 运营总览 |
| `api/models.ts` | 车型列表、筛选、详情、车型在库车辆 |
| `api/vehicles.ts` | 车辆列表、详情、新增、编辑 |
| `api/leases.ts` | 租约列表/详情、创建、状态动作 |
| `api/drivers.ts` | 司机列表/详情、新增、编辑 |
| `api/dispatch.ts` | 调拨列表、创建、完成 |
| `api/maintenance.ts` | 维保工单、保险、状态推进 |
| `api/finance.ts` | 账单、收款、生成月租、违章 |
| `api/reports.ts` | 报表查询 |
| `api/settings.ts` | 门店、价格方案、账号、密码、提醒规则 |
| `api/search.ts` | 全局搜索 |
| `api/health.ts` | 健康检查 |
| `api/credits.ts` | 素材许可静态数据 |

约束：

- 页面、弹窗、layout、hooks 不再直接调用 `apiGet` / `apiPost` / `apiPut` / `apiPatch`。
- 只有 `api/*.ts` 可以调用通用请求客户端。
- 所有 API 函数都有明确的返回类型，不使用 `any`。

---

## 3. 严格类型

- `tsconfig.app.json` 保持 `strict: true`。
- 请求参数统一放在 `src/types/requests.ts`：
  - 列表查询：`VehicleListQuery`、`LeaseListQuery`、`DriverListQuery`、`BillListQuery`、`ReportQuery` 等。
  - 表单写入：`VehicleCreateInput`、`DriverUpdateInput`、`LeaseCreateInput`、`PlanInput`、`StoreUpdateInput`、`ProfileInput` 等。
- `src/types/credits.ts` 保存素材许可结构。
- 页面与弹窗回调不再使用 `Record<string, unknown>`，改为明确输入类型。
- 全局扫描结果：业务代码中无 `any`、无 `as any`、无 `Record<string, unknown>`。
- `unknown` 仅保留在通用请求体、错误处理和测试辅助中，属于安全边界类型。

---

## 4. 设计 Token 与共享类

本轮新增/复用的共享表面：

| 类/组件 | 用途 |
|---|---|
| `.field-control` / `.field-control-invalid` | 表单控件表面与错误态 |
| `.info-tile` / `.info-tile-compact` | 详情/摘要信息小块 |
| `.popover-panel` | Select、DatePicker、富文本链接、Menu 的浮层表面 |
| `bg-deep` / `text-on-danger` | 深色媒体底与危险按钮前景 Token |
| `.vehicle-stage` | 3D 看车舞台背景 Token（亮/暗） |
| `Card` / `CardToolbar` | 页面卡片与 Card 内工具栏 |
| `PageHeader` / `SectionHeader` | 页面与区块标题 |
| `Tabs` | 所有业务 Tab |
| `Button` / `ButtonLink` / `CopyButton` | 按钮、链接按钮、圆形复制按钮 |
| `Modal` / `ConfirmDialog` / `Drawer` | 所有弹层 |
| `OverlayHeader` / `PasswordToggle` | 弹层头、密码显示切换 |
| `InlineError` / `BackLink` / `StatCell` | 错误提示、返回链接、统计单元格复用 |
| `DataTable` / `Pagination` | 表格与分页 |

没有页面新增一次性颜色、阴影或圆角。

---

## 5. 验证

| 项目 | 结果 |
|---|---|
| `npx tsc -b` | 通过 |
| `npm test -- --run` | 10 项通过 |
| `npm run build` | 通过 |
| 15 个业务路由 Playwright | 无控制台报错 |
| 已登录 `/credits` | 复用 AppShell，侧边栏存在 |
| 未登录 `/credits` | 公共 Header，Brand/ButtonLink 正常 |
| 全局搜索 | `api/search.ts` 正常返回 |
| 设置保存 mutation | `api/settings.ts` 调用成功，Toast 正常 |
| 车辆编辑 mutation | `api/vehicles.ts` 调用成功，Toast 正常 |
| `any` / `as any` / `Record<string, unknown>` | 0 处 |
| 直接 `apiGet` / `apiPost` / `fetch` 调用 | 仅存在于 `api/` 与 `lib/api.ts` |
| 构建期间服务 | 未关闭，Vite HMR 持续更新 |

当前开发服务：

- 前端：http://localhost:5174
- 后端：http://localhost:8090
- 管理员账号：`123 8888 8888` / `Cheyi@2026`