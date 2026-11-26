# 04 · 技术方案与 API - 驰驿 CHEYI

> 版本：v1.0
> 日期：2026-11-25
> 关联：02 PRD、03 交互设计
> 代码拆分与目录结构详见 `05-代码拆分与目录结构.md`

---

## 1. 总体架构

```text
Browser
  │
  ├── React SPA (Vite, Tailwind, Three.js)
  │       │  /api/v1/*  (Vite dev proxy)
  │       ▼
  └── Go + Gin API
          │
          ├── JWT HttpOnly Cookie
          ├── GORM
          └── SQLite (WAL, foreign keys)
```

- 开发：Vite 5173 + Gin 8090
- 生产：前端 `dist` 嵌入 Go 二进制，单端口 8090
- 静态素材：`frontend/public/media`、`frontend/public/models`，生产随 `dist` 一起嵌入
- 3D：Three.js 懒加载，只有进入 3D 标签才加载

---

## 2. 目录结构

```text
cheyi-fleet-console/
├── backend/
│   ├── cmd/server/main.go
│   ├── internal/
│   │   ├── auth/            密码、JWT
│   │   ├── config/         环境变量
│   │   ├── database/       连接、迁移、种子
│   │   ├── handler/        HTTP 处理器
│   │   ├── middleware/     认证、CORS
│   │   ├── models/         GORM 模型
│   │   ├── router/         路由
│   │   └── web/            前端嵌入
│   ├── data/               SQLite 数据库
│   └── go.mod
├── frontend/
│   ├── public/
│   │   ├── media/
│   │   │   ├── models/     16 款车型图片
│   │   │   ├── stores/     场景图片
│   │   │   └── credits.json
│   │   ├── models/         5 个 GLB
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/            按领域拆分的请求函数
│   │   ├── app/            provider、router、theme、auth、toast
│   │   ├── components/     UI、layout、charts、3D
│   │   ├── lib/            通用请求、格式化、工具
│   │   ├── types/          领域类型与请求类型
│   │   ├── pages/          18 个页面
│   │   └── styles/         Tailwind v4 + Token
│   └── vite.config.ts
├── docs/
├── start.sh               一键启动（dev/prod/build、自动打开浏览器）
├── scripts/dev.sh         兼容原有开发启动
├── scripts/start-helpers.sh start.sh 共享函数
├── Makefile
├── README.md
└── ASSETS.md
```

---

## 3. 运行配置

| 环境变量 | 默认 | 说明 |
|---|---|---|
| `PORT` | `8080` | API 端口，开发脚本使用 8090 |
| `BACKEND_PORT` | `8090` | `start.sh` 使用的后端端口，会同步给 Vite 代理 |
| `FRONTEND_PORT` | `5174` | `start.sh` 使用的 Vite 端口 |
| `DB_PATH` | `backend/data/cheyi.db` | SQLite 路径（项目根目录相对路径） |
| `JWT_SECRET` | 默认密钥 | 生产必须替换 |
| `APP_ENV` | `development` | `production` 时启用静态托管与 Secure Cookie |

开发：

```bash
./start.sh
# 或跳过自动打开浏览器
./start.sh --no-open
# 兼容原有脚本
make dev
```

`start.sh` 会自动检查依赖、启动后端与 Vite、等待就绪并打开浏览器；Ctrl+C 同时停止两个进程。

生产：

```bash
make build
APP_ENV=production PORT=8090 DB_PATH=backend/data/cheyi.db ./backend/cheyi-server
```

---

## 4. 数据库

### 4.1 连接

- 驱动：`github.com/glebarez/sqlite`（纯 Go）
- DSN：`file:<path>?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)`
- GORM `AutoMigrate`
- 首次启动 `Seed`，已有用户则跳过

### 4.2 表

#### users

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| name | text | 姓名 |
| password_hash | text | bcrypt |
| role | text | admin / operator |
| phone | text | 唯一，11 位手机号登录账号；管理员允许预留号段 |
| created_at | datetime | |

#### stores

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| name | text | 门店名 |
| district | text | 区域 |
| address | text | 地址 |
| capacity | integer | 容量 |
| status | text | active/paused |
| image | text | 场景图路径 |

#### vehicle_models

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| slug | text | 唯一，路由用 |
| brand | text | 品牌 |
| name | text | 车型 |
| body_type | text | sedan/suv/mpv/hatchback/wagon |
| energy_type | text | BEV |
| seats | integer | 座位 |
| range_km | integer | CLTC 续航 |
| battery_kwh | real | 电池 |
| fast_charge_min | integer | 快充分钟 |
| length_mm / width_mm / height_mm / wheelbase_mm | integer | 尺寸 |
| monthly_rent_cents | integer | 月租，分 |
| deposit_cents | integer | 押金，分 |
| market_price_cents | integer | 指导价，分 |
| launch_year | integer | 上市年份 |
| highlights | text | JSON 数组 |
| gallery | text | JSON 数组 |
| hero_image | text | 主图 |
| model_3d_key | text | sedan/suv/mpv/hatchback/wagon |
| source_credit | text | 素材署名 |
| status | text | active |
| sort_order | integer | 排序 |

#### vehicles

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| plate_no | text | 唯一 |
| model_id | integer | 外键 |
| store_id | integer | 外键 |
| color | text | 颜色 |
| status | text | available/reserved/rented/maintenance/dispatch/retired |
| mileage_km | integer | 里程 |
| purchase_date | datetime | 购置 |
| insurance_expiry | datetime | 保险到期 |
| inspection_expiry | datetime | 年检到期 |
| vin | text | 车架号 |
| note | text | 备注 |

#### drivers

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| name | text | 姓名 |
| phone | text | 手机 |
| id_card_no | text | 身份证 |
| license_no | text | 驾照 |
| license_expiry | datetime | 驾照到期 |
| status | text | pending/certified/leased/returned/blacklisted |
| rating | real | 评分 |
| joined_at | datetime | 加入 |
| emergency_contact | text | 紧急联系人 |
| note | text | 备注 |

#### leases

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| lease_no | text | 唯一 |
| driver_id | integer | 外键 |
| vehicle_id | integer | 外键 |
| store_id | integer | 外键 |
| start_date | datetime | 起租 |
| end_date | datetime | 到期 |
| monthly_rent_cents | integer | 月租 |
| deposit_cents | integer | 押金 |
| status | text | pending_sign/pending_pickup/active/pending_return/returned/cancelled |
| pickup_mileage | integer | 取车里程 |
| return_mileage | integer | 还车里程 |
| signed_at | datetime | 签约 |
| closed_at | datetime | 关闭 |
| note | text | 备注 |

#### lease_events

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| lease_id | integer | 外键 |
| type | text | created/signed/handover/returned/cancelled |
| note | text | 说明 |
| created_at | datetime | 时间 |

#### bills

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| bill_no | text | 唯一 |
| lease_id | integer | 外键 |
| type | text | rent/deposit/violation/damage/penalty |
| period_start / period_end | datetime | 账期 |
| amount_cents | integer | 金额 |
| paid_amount_cents | integer | 已收 |
| due_date | datetime | 到期 |
| status | text | pending/paid/overdue/waived |
| paid_at | datetime | 收款时间 |
| method | text | bank/alipay/wechat/cash |
| note | text | 备注 |

#### maintenance_orders

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| order_no | text | 唯一 |
| vehicle_id | integer | 外键 |
| type | text | maintenance/repair/inspection |
| status | text | scheduled/in_progress/pending_acceptance/completed/cancelled |
| scheduled_at | datetime | 计划 |
| completed_at | datetime | 完成 |
| cost_cents | integer | 费用 |
| vendor | text | 供应商 |
| mileage_km | integer | 里程 |
| description | text | 说明 |

#### insurance_policies

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| vehicle_id | integer | 外键 |
| provider | text | 承保公司 |
| policy_no | text | 保单号 |
| type | text | 险种 |
| premium_cents | integer | 保费 |
| start_date / end_date | datetime | 有效期 |
| status | text | active/expiring |

#### violations

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| vehicle_id | integer | 外键 |
| driver_id | integer | 外键 |
| occurred_at | datetime | 时间 |
| location | text | 地点 |
| reason | text | 原因 |
| fine_cents | integer | 罚款 |
| points | integer | 扣分 |
| status | text | pending/handled/waived |
| handled_at | datetime | 处理时间 |

#### dispatch_tasks

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| task_no | text | 唯一 |
| vehicle_id | integer | 外键 |
| from_store_id / to_store_id | integer | 外键 |
| status | text | pending/in_transit/completed/cancelled |
| scheduled_at / completed_at | datetime | 时间 |
| note | text | 备注 |

#### pricing_plans

| 字段 | 类型 | 说明 |
|---|---|---|
| id | integer | 主键 |
| name | text | 方案名 |
| body_type | text | 车身类型 |
| monthly_rent_cents | integer | 月租 |
| deposit_cents | integer | 押金 |
| min_term_months | integer | 最短租期 |
| status | text | active/disabled |

#### settings

| 字段 | 类型 | 说明 |
|---|---|---|
| key | text | 主键 |
| value | text | 值 |

---

## 5. API 约定

### 5.1 基础

- Base URL：`/api/v1`
- 请求与响应：JSON
- 认证：HttpOnly Cookie `cheyi_session`
- 所有业务接口除登录、`/auth/me`、公开概览外都需要登录
- 时间：RFC3339
- 金额：整数分
- 页码从 1 开始，默认 `page_size=20`，最大 500

### 5.2 成功响应

单对象：

```json
{ "data": { "id": 1 } }
```

列表：

```json
{
  "data": [],
  "meta": { "page": 1, "page_size": 20, "total": 85 }
}
```

### 5.3 错误响应

```json
{
  "error": {
    "code": "vehicle_unavailable",
    "message": "该车辆当前不可出租"
  }
}
```

常见状态码：

| 状态 | 场景 |
|---|---|
| 400 | 参数不合法 |
| 401 | 未登录/会话过期 |
| 404 | 资源不存在 |
| 409 | 状态冲突、车辆锁定、司机已有租约 |
| 500 | 服务端错误 |

### 5.4 认证

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/auth/login` | 手机号登录，设置 Cookie |
| POST | `/auth/register` | 手机号注册，设置 Cookie |
| GET | `/auth/me` | 当前用户，未登录返回 `data:null` |
| POST | `/auth/logout` | 退出 |

登录请求：

```json
{ "phone": "123 8888 8888", "password": "Cheyi@2026" }
```

注册请求：

```json
{ "name": "新运营", "phone": "139 1234 5678", "password": "Register@2026" }
```

手机号规则：

- 注册仅接受中国大陆真实号段的 11 位手机号。
- 登录接受 11 位、1 开头的手机号；预置管理员 `12388888888` 为非真实号段例外。
- 支持 `+86` / `0086` / 空格 / 短横线输入，服务端统一归一化。
- 按号段识别中国移动、中国联通、中国电信、中国广电和虚拟运营商。
- 注册时未知号段、长度错误、非 `1[3-9]` 开头均视为无效手机号。

登录响应：

```json
{
  "data": {
    "user": {
      "id": 1,
      "name": "林知远",
      "role": "admin",
      "phone": "12388888888"
    },
    "expires_in": 28800
  }
}
```

Cookie：

- 名称：`cheyi_session`
- HttpOnly
- SameSite=Lax
- 生产环境 HTTPS 时 Secure，读取 `X-Forwarded-Proto`
- 8 小时

### 5.5 总览

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/public/overview` | 登录页公开概览 |
| GET | `/dashboard` | 总览全部数据 |
| GET | `/search?q=` | 全局搜索 |

`/dashboard` 返回：

```json
{
  "data": {
    "kpis": {
      "active_leases": 28,
      "total_vehicles": 64,
      "available_vehicles": 17,
      "maintenance_vehicles": 5,
      "overdue_bills": 3,
      "monthly_receivable_cents": 16824000,
      "utilization": 43.75
    },
    "revenue_trend": [],
    "fleet_status": [],
    "body_type_mix": [],
    "handovers": [],
    "alerts": [],
    "recent_leases": [],
    "featured_models": [],
    "stores": [],
    "month_label": "2026年11月"
  }
}
```

### 5.6 车型

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/models` | 列表，支持 `q`、`body_type`、`brand`、`sort` |
| GET | `/models/filters` | 品牌、车身类型、租金范围 |
| GET | `/models/:slug` | 详情 + 在库车辆 + 相关车型 |
| GET | `/models/:slug/vehicles` | 该车型全部车辆 |

车型返回包含 `fleet_total`、`fleet_active`、`available_count`、`utilization`。

### 5.7 车辆

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/vehicles` | 列表，支持 `q`、`status`、`store_id`、`model_id`、分页 |
| POST | `/vehicles` | 新增 |
| GET | `/vehicles/:id` | 详情 + 租约 + 维保 + 保险 + 违章 |
| PATCH | `/vehicles/:id` | 更新状态、门店、里程、保险/年检、备注 |
| GET | `/vehicles/:id/leases` | 租约记录 |
| GET | `/vehicles/:id/maintenance` | 维保记录 |
| GET | `/vehicles/:id/insurance` | 保单 |
| GET | `/vehicles/:id/violations` | 违章 |

新增车辆请求：

```json
{
  "plate_no": "沪A D8888",
  "model_id": 1,
  "store_id": 1,
  "color": "珍珠白",
  "status": "available",
  "mileage_km": 12000,
  "purchase_date": "2025-06-01",
  "insurance_expiry": "2026-12-31",
  "inspection_expiry": "2027-06-01",
  "vin": "LSVCH6A46N21000000"
}
```

### 5.8 司机

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/drivers` | 列表，支持 `q`、`status`、分页 |
| POST | `/drivers` | 新增 |
| GET | `/drivers/:id` | 详情 + 租约 + 账单 + 违章 |
| PATCH | `/drivers/:id` | 更新状态、驾照、评分、备注 |
| GET | `/drivers/:id/leases` | 租约历史 |

列表返回会附加 `current_vehicle` 和 `current_lease`，便于判断可租状态。

### 5.9 租约

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/leases` | 列表，支持 `q`、`status`、`store_id`、分页 |
| POST | `/leases` | 创建 |
| GET | `/leases/:id` | 详情 + 账单 + 事件 |
| POST | `/leases/:id/sign` | 签约 |
| POST | `/leases/:id/handover` | 交车 |
| POST | `/leases/:id/return` | 退租 |
| POST | `/leases/:id/cancel` | 取消 |

创建请求：

```json
{
  "driver_id": 1,
  "vehicle_id": 1,
  "store_id": 1,
  "start_date": "2026-11-25",
  "end_date": "2027-05-25",
  "monthly_rent_cents": 428000,
  "deposit_cents": 1000000,
  "note": ""
}
```

交车请求：

```json
{ "mileage_km": 32000, "note": "车辆外观完好" }
```

退租请求：

```json
{ "mileage_km": 48000, "deductions_cents": 50000, "note": "前保险杠轻微划痕" }
```

状态冲突返回 409，例如：

- `driver_has_lease`
- `driver_unavailable`
- `vehicle_unavailable`
- `invalid_state`

### 5.10 账单

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/bills` | 列表，支持 `q`、`status`、`type`、`lease_id`、分页 |
| GET | `/bills/:id` | 详情 |
| POST | `/bills/:id/pay` | 登记收款 |
| POST | `/bills/generate` | 生成月租账单 |
| GET | `/bills/export.csv` | 导出 CSV，UTF-8 BOM |

收款请求：

```json
{ "method": "bank", "paid_at": "2026-11-25", "amount_cents": 428000 }
```

### 5.11 维保与保险

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/maintenance-orders` | 工单列表 |
| POST | `/maintenance-orders` | 创建工单 |
| PATCH | `/maintenance-orders/:id/status` | 推进状态 |
| GET | `/insurance-policies` | 保单列表，支持 `expiring=true` |

创建工单请求：

```json
{
  "vehicle_id": 1,
  "type": "maintenance",
  "scheduled_at": "2026-11-30",
  "cost_cents": 68000,
  "vendor": "驰驿自营维修中心",
  "mileage_km": 32000,
  "description": "常规保养"
}
```

### 5.12 违章

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/violations` | 列表，支持 `status` |
| POST | `/violations` | 新增 |
| PATCH | `/violations/:id/handle` | 处理并生成账单 |

### 5.13 调度

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/dispatch-tasks` | 任务 + 车辆池 + 门店 |
| POST | `/dispatch-tasks` | 创建调拨 |
| POST | `/dispatch-tasks/:id/complete` | 完成调拨 |

### 5.14 报表

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/reports?from=&to=&store_id=` | 报表数据 |

返回：

```json
{
  "data": {
    "range": { "from": "2026-10-27", "to": "2026-11-25" },
    "kpis": {
      "utilization": 39.7,
      "revenue_cents": 17194000,
      "avg_revenue_cents": 268656,
      "overdue_rate": 2.94,
      "maintenance_cost_cents": 172000,
      "total_vehicles": 64
    },
    "trend": [],
    "revenue_by_model": [],
    "store_ranking": []
  }
}
```

### 5.15 设置

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/settings` | 门店、价格方案、账号、提醒、企业 |
| PUT | `/settings/stores/:id` | 更新门店 |
| POST | `/settings/pricing-plans` | 新增价格方案 |
| PUT | `/settings/pricing-plans/:id` | 更新价格方案 |
| PUT | `/settings/profile` | 更新账号 |
| PUT | `/settings/password` | 修改密码 |
| PUT | `/settings/reminders` | 更新提醒规则 |

---

## 6. 业务事务

### 6.1 创建租约

```text
BEGIN
  校验司机、车辆、门店、日期、金额
  INSERT lease (pending_sign)
  INSERT lease_event (created)
  INSERT bill (rent, pending)
  UPDATE vehicle SET status = reserved
COMMIT
```

### 6.2 交车

```text
BEGIN
  UPDATE lease SET status = active, pickup_mileage = ?
  UPDATE vehicle SET status = rented, mileage_km = ?
  UPDATE driver SET status = leased
  INSERT lease_event (handover)
COMMIT
```

### 6.3 退租

```text
BEGIN
  UPDATE lease SET status = returned, return_mileage = ?, closed_at = now
  UPDATE vehicle SET status = available, mileage_km = ?
  UPDATE driver SET status = certified
  INSERT lease_event (returned)
  IF deductions > 0: INSERT bill (damage, pending)
COMMIT
```

### 6.4 收款

```text
UPDATE bill
SET status = paid, paid_at = ?, paid_amount_cents = ?, method = ?
WHERE id = ? AND status IN (pending, overdue)
```

### 6.5 完成维保

```text
UPDATE maintenance_order SET status = completed, completed_at = now
IF no active lease for vehicle: UPDATE vehicle SET status = available
```

### 6.6 完成调拨

```text
UPDATE dispatch_task SET status = completed, completed_at = now
UPDATE vehicle SET store_id = to_store_id, status = available
```

---

## 7. 素材管线

### 7.1 图片来源

1. Wikimedia Commons（免费授权优先）
2. 车企官方新闻图（缺失兜底，仅展示）
3. Unsplash（场景图）
4. 品牌占位卡（最后兜底）

### 7.2 处理

- 原图下载到临时目录
- 生成 640 / 1280 WebP
- 生成主图、缩略图、16:9 宽图
- 写入 `credits.json`
- 页面使用 `loading="lazy"`、`decoding="async"`

### 7.3 3D

- 5 个 Innerscene CC0 GLB
- 按车身类型映射：
  - sedan → `sedan.glb`
  - suv → `suv.glb`
  - mpv → `mpv.glb`
  - hatchback → `hatchback.glb`
  - wagon → `wagon.glb`
- 使用 `gltf-transform optimize --compress meshopt --texture-compress webp --texture-size 1024` 压缩
- SUV/MPV/两厢/旅行车从 4.3-4.8MB 压缩到约 1.2MB
- 轿车保持 627KB
- 目标：每个 GLB 小于 2.5MB
- 3D 标签激活时才加载 Three.js 和 GLB
- 离开视口暂停渲染
- 卸载时释放几何体、材质、纹理
- WebGL 不可用回退 poster
- 页面标注“通用车身示意，非实车 CAD”

### 7.4 许可

- CC BY-SA 保留署名与相同方式共享
- CC0 可自由使用
- Unsplash 遵循 Unsplash License
- 官方图仅展示，商用前替换
- `/credits` 与 `ASSETS.md` 明示

---

## 8. 3D 查看器

### 8.1 技术

- Three.js
- `GLTFLoader` + `MeshoptDecoder`
- `OrbitControls`
- `RoomEnvironment`
- `PMREMGenerator`
- `ACESFilmicToneMapping`
- `SRGBColorSpace`
- 透明画布 + CSS 渐变背景

### 8.2 交互

- 拖拽旋转
- 滚轮/双指缩放
- 颜色切换
- 自动旋转开关
- 重置视角
- 全屏
- 加载进度
- 错误回退

### 8.3 颜色

| 名称 | 色值 |
|---|---|
| 珍珠白 | `#E9E9E5` |
| 曜石黑 | `#161A1F` |
| 星河蓝 | `#2F4F6F` |
| 云雾灰 | `#8A9198` |
| 青柠绿 | `#7D9B6A` |

轿车模型的主漆材质名为 `blue`，其他车身使用 `paint`。加载时克隆材质，避免影响共享材质。

### 8.4 性能

- `setPixelRatio(min(devicePixelRatio, 2))`
- `IntersectionObserver` 离开视口暂停
- `document.visibilitychange` 暂停
- `ResizeObserver` 自适应
- 卸载清理
- 3D 组件动态 import，独立 chunk

---

## 9. 主题实现

- CSS 变量定义在 `:root` 与 `[data-theme="dark"]`
- Tailwind v4 `@theme inline` 映射为 `bg-canvas`、`text-ink`、`border-line` 等
- 主题存 `localStorage`，首屏内联脚本提前设置
- View Transitions 圆形扩散：固定从左下角开始，700ms
- 切换期间 `theme-switching` 类控制 240ms 颜色过渡
- 布局、尺寸、字体、间距不变
- `prefers-reduced-motion` 立即切换
- 不支持 View Transitions 降级淡入

---

## 10. 构建与部署

### 10.1 开发

```bash
./start.sh
```

- 后端 8090
- 前端 5174，Vite 代理 `/api` 到后端端口
- 脚本会等待两端就绪后打开浏览器；`--no-open` 可跳过
- 如果端口被占用，可用 `BACKEND_PORT` / `FRONTEND_PORT` 覆盖

### 10.2 生产

```bash
./start.sh --prod
```

或手动构建：

```bash
make build
```

执行：

1. `frontend npm run build`
2. 复制 `frontend/dist` 到 `backend/internal/web/dist`
3. `go build -tags prod -o cheyi-server ./cmd/server`

启动：

```bash
APP_ENV=production PORT=8090 DB_PATH=backend/data/cheyi.db ./backend/cheyi-server
```

静态托管：

- `//go:embed all:dist`（仅 `prod` 构建标签生效，开发构建使用空 FS）
- 非 API 路由回退 `index.html`
- API 404 返回 JSON

### 10.3 数据重置

```bash
make reset-db
```

删除 `backend/data/cheyi.db`，下次启动重新种子。

---

## 11. 测试

### 11.1 后端

```bash
cd backend && go test ./...
```

- `internal/auth/auth_test.go`：密码 hash、JWT 签发与校验
- `internal/database/seed_test.go`：种子数量、幂等

### 11.2 前端

```bash
cd frontend && npm test
```

- 金额格式化
- 百分比
- 状态标签
- 月末加月份不溢出

### 11.3 手工验收

- 登录
- 新建租约 → 签约 → 交车 → 退租
- 收款
- 维保推进
- 调拨完成
- 违章处理
- 3D 加载、换色、全屏
- 亮暗主题
- 390 / 768 / 1024 / 1440
- 控制台无报错

---

## 12. 已知限制

- SQLite 适合单机部署，不适合高并发多写
- 预置管理员 + 手机号注册运营账号，无真实 RBAC
- 3D 是通用车身，不是具体车型 CAD
- 图片以免费授权为主，官方图兜底仅展示
- 不接支付、地图、短信、电子合同、发票、文件上传
- 月租按自然月生成，未实现按天折算
- Go 的 `AddDate` 与前端 `addMonths` 在月末边界可能有一天的差异
- View Transitions 在部分浏览器降级为淡入
- 生产环境的 `JWT_SECRET` 必须替换