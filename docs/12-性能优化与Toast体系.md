# 性能优化与 Toast 体系

## 1. 性能瓶颈审计

### 1.1 组件重渲染

| 发现 | 处理 |
|---|---|
| 筛选栏搜索每次按键都会更新 URL、触发页面重渲染并重新请求列表 | `SearchInput` 新增本地草稿层与 250ms 防抖；筛选页统一启用 `debounce={250}` |
| 输入框清空和回车需要立即生效 | 清空、Enter 立即提交，其余输入按防抖提交 |
| Dashboard 收入/利用率、租约月租、车型平均出租率、调拨统计、维保统计每次渲染重复计算 | 统一放入 `useMemo` |
| 页面组件大量使用 20 行分页表格、16 个车型卡片，规模小 | 不额外加 `memo`，避免无收益的浅比较开销 |

效果：输入过程中只有 `SearchInput` 自身重渲染，页面、表格和查询在 250ms 后才更新。

### 1.2 路由与首屏资源

路由页面改为 `React.lazy`，`AppShell` 内使用 `Suspense` 统一承载页面加载态。

构建对比：

| 指标 | 优化前 | 优化后 |
|---|---|---|
| 主入口 JS | 973.37 kB / 265.62 kB gzip | 477.82 kB / 142.92 kB gzip |
| 页面 chunk | 全部在主入口 | 5.6–26.8 kB 按需加载 |
| UI 共享 chunk | 混在主入口 | 268.75 kB / 78.81 kB gzip |
| Three.js chunk | 690 kB / 174 kB gzip | 690.16 kB / 174.01 kB gzip，仍按 3D Tab 懒加载 |

首屏入口 gzip 体积下降约 46%。业务页面在首次访问时加载对应 chunk，之后由浏览器缓存。

### 1.3 图片与 3D 资源

- 登录品牌图、Dashboard Hero、车辆详情头图、车型主图：`loading="eager"` + `fetchPriority="high"` + `decoding="async"`，保证 LCP。
- 列表缩略图、搜索结果图、门店图、租约侧栏图、素材许可图：`loading="lazy"` + `decoding="async"`。
- 3D GLB 仍只在打开「3D 看车」Tab 时加载；`VehicleScene` 在容器离开视口或页面隐藏时停止 `requestAnimationFrame`。
- 3D 窗口尺寸变化的 60ms 延迟 resize 计时器在销毁时清理。

### 1.4 定时器、事件监听与连接

| 资源 | 状态 |
|---|---|
| Toast 自动关闭定时器 | 使用 `Map` 记录，关闭时清理，Provider 卸载时全部清理 |
| 主题降级过渡定时器 | 使用 ref 记录，卸载时清理 |
| 3D `visibilitychange` / `fullscreenchange` | 已移除；3D 容器和文档可见性分开判断 |
| 3D `ResizeObserver` / `IntersectionObserver` / RAF | `dispose()` 中清理 |
| AppShell Cmd/Ctrl+K 监听 | 已清理 |
| Auth 未授权事件监听 | 已清理 |
| Popover / Select / DatePicker / Modal / CopyButton / RichText | 均有对应清理 |
| 健康检查轮询 | React Query `refetchInterval`，组件卸载自动停止；后台标签页不轮询 |
| WebSocket | 项目未使用 WebSocket |

### 1.5 虚拟滚动

当前最大重复列表：

- 调拨车辆池 / 门店矩阵：85 台车
- 租约向导可选司机：66 人
- 列表页：默认 20 行，可调分页
- 车型展厅：16 个车型
- 保险：按到期日前 20 条

当前规模不需要虚拟滚动。若单页超过 200 行或选择器超过 500 项，再引入 `@tanstack/react-virtual`，避免现在增加复杂度。

## 2. Toast 体系

### 2.1 视觉

- 固定在顶部居中，最大宽度 420px
- 12px 圆角、1px 语义边框、`shadow-card`
- 语义纯色柔和表面：success / error / warning / info，使用 `color-mix` 与 card 融合
- 36px 圆角方形图标，与文字整体垂直居中
- 不使用状态标签
- 不使用关闭按钮，避免视觉噪音，4.2s 后自动消失
- 底部 3px 进度轨
- 错误使用 `role="alert"`，其余使用 `role="status"`

### 2.2 使用范围

- 页面级创建、保存、收款、调拨、维保、租约状态变更：成功 Toast + API 失败 Toast
- 设置页所有保存动作：成功 Toast + 保存失败 Toast
- 复制失败：warning Toast，提示手动选择文本
- 跨字段校验、步骤校验、账号协议勾选：统一使用 warning Toast
- 表单字段校验：warning Toast + 字段下方 inline error
- 列表加载失败：保留页面 `ErrorState`，不重复弹 Toast

## 3. 验证

- `npx tsc -b` 通过
- `npm test -- --run`：10 项通过
- `npm run build` 通过
- `make build` 通过
- 15 个业务路由无控制台报错
- 3D Tab 正常渲染
- 搜索防抖：快速输入“周启明”后 100ms 内 0 次列表请求，400ms 内仅 1 次
- Toast 实测 420 × 76px（带描述），亮/暗主题均正常
- Toast 亮/暗主题截图验证
