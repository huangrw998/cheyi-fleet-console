#!/usr/bin/env bash
# 驰驿 CHEYI 一键启动：Go API(8090, Gin) + Vite 前端(5174)
# 用法:
#   ./start.sh              # 开发模式：后端 + Vite，就绪后自动打开浏览器
#   ./start.sh --prod       # 生产模式：构建前端后单端口 8090 服务
#   ./start.sh --build      # 仅构建（前端 + 单二进制），不启动
#   ./start.sh --no-open    # 启动服务但跳过自动打开浏览器
#
# 环境变量:
#   BACKEND_PORT   后端端口，默认 8090
#   FRONTEND_PORT  前端端口，默认 5174
#   DB_PATH        SQLite 路径（开发/生产通用），默认 backend/data/cheyi.db
#   BROWSER        自定义浏览器命令，例如 BROWSER=firefox
#   NO_OPEN=1      等同于 --no-open
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT="${BACKEND_PORT:-${PORT:-8090}}"
FRONTEND_PORT="${FRONTEND_PORT:-5174}"
DB_PATH="${DB_PATH:-$ROOT/backend/data/cheyi.db}"
MODE="dev"
OPEN_BROWSER=1
BACK_PID=""
FRONT_PID=""
TMP_DIR=""

# 共享函数：帮助文本、进程清理、就绪检测、浏览器打开。
source "$ROOT/scripts/start-helpers.sh"

for arg in "$@"; do
  case "$arg" in
    dev) MODE="dev" ;;
    --prod) MODE="prod" ;;
    --build) MODE="build" ;;
    --no-open) OPEN_BROWSER=0 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "错误: 未知参数 $arg"; echo ""; usage; exit 1 ;;
  esac
done

if [ "${NO_OPEN:-0}" = "1" ]; then
  OPEN_BROWSER=0
fi

FRONTEND_URL="http://127.0.0.1:$FRONTEND_PORT"
BACKEND_URL="http://127.0.0.1:$BACKEND_PORT"
BACKEND_HEALTH="$BACKEND_URL/api/health"

# ── 依赖自检 ────────────────────────────────────────────────────────────────
command -v go >/dev/null 2>&1 || { echo "错误: 未找到 go（需要 Go 1.26+）"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "错误: 未找到 node（需要 Node 20+）"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "错误: 未找到 npm"; exit 1; }
command -v curl >/dev/null 2>&1 || { echo "错误: 未找到 curl（用于检测服务就绪）"; exit 1; }

# 优先复用已经在运行的服务；避免用户重复启动导致端口冲突。
if [ "$MODE" = "dev" ] && curl -fsS "$BACKEND_HEALTH" 2>/dev/null | grep -q '"status":"ok"' && curl -fsS "$FRONTEND_URL/login" >/dev/null 2>&1; then
  echo "检测到开发服务已在运行"
  echo "  前端界面: $FRONTEND_URL"
  echo "  后端 API: $BACKEND_HEALTH"
  open_browser "$FRONTEND_URL"
  exit 0
fi

if [ "$MODE" = "prod" ] && curl -fsS "$BACKEND_HEALTH" 2>/dev/null | grep -q '"status":"ok"' && curl -fsS "$BACKEND_URL/login" >/dev/null 2>&1; then
  echo "检测到生产服务已在运行"
  echo "  页面/接口: $BACKEND_URL"
  open_browser "$BACKEND_URL"
  exit 0
fi

if [ "$MODE" = "prod" ] && curl -fsS "$BACKEND_HEALTH" 2>/dev/null | grep -q '"status":"ok"'; then
  echo "错误: 端口 $BACKEND_PORT 已有 API 服务在运行，请先停止它"
  exit 1
fi

# ── 仅构建 ──────────────────────────────────────────────────────────────────
if [ "$MODE" = "build" ]; then
  echo "[1/2] 检查前端依赖..."
  if [ ! -d "$ROOT/frontend/node_modules" ]; then
    echo "      首次运行，安装前端依赖..."
    (cd "$ROOT/frontend" && npm install --no-audit --no-fund)
  else
    echo "      前端依赖已存在，跳过安装"
  fi
  echo "[2/2] 构建前端与单二进制..."
  (cd "$ROOT" && make build)
  echo "构建完成: backend/cheyi-server"
  exit 0
fi

# ── 依赖安装与生产构建 ──────────────────────────────────────────────────────
echo "[1/4] 检查前端依赖..."
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "      首次运行，安装前端依赖..."
  (cd "$ROOT/frontend" && npm install --no-audit --no-fund)
else
  echo "      前端依赖已存在，跳过安装"
fi

if [ "$MODE" = "prod" ]; then
  echo "[2/4] 构建前端与单二进制..."
  (cd "$ROOT" && make build)
else
  echo "[2/4] 构建后端开发二进制..."
  TMP_DIR="$(mktemp -d "${TMPDIR:-/tmp}/cheyi-start.XXXXXX")"
  (cd "$ROOT/backend" && go build -o "$TMP_DIR/cheyi-server" ./cmd/server)
fi

# ── 启动服务 ────────────────────────────────────────────────────────────────
trap cleanup EXIT INT TERM

if [ "$MODE" = "prod" ]; then
  echo "[3/4] 启动生产服务..."
  (cd "$ROOT/backend" && PORT="$BACKEND_PORT" APP_ENV=production DB_PATH="$DB_PATH" "$ROOT/backend/cheyi-server") &
  BACK_PID=$!
  echo "[4/4] 等待服务就绪..."
  wait_for "$BACKEND_HEALTH" "生产服务"
  wait_for "$BACKEND_URL/login" "生产页面"
  echo ""
  echo "════════════════════════════════════════════════════"
  echo "  驰驿 CHEYI 已启动（生产单端口）"
  echo "  页面/接口: $BACKEND_URL"
  echo "  数据库:    $DB_PATH"
  echo "  管理员账号:  12388888888 / Cheyi@2026"
  echo "  按 Ctrl+C 停止"
  echo "════════════════════════════════════════════════════"
  open_browser "$BACKEND_URL"
  wait "$BACK_PID" 2>/dev/null || true
else
  echo "[3/4] 启动后端与前端..."
  (cd "$ROOT/backend" && PORT="$BACKEND_PORT" DB_PATH="$DB_PATH" "$TMP_DIR/cheyi-server") &
  BACK_PID=$!
  export VITE_API_TARGET="${VITE_API_TARGET:-http://127.0.0.1:$BACKEND_PORT}"
  if command -v setsid >/dev/null 2>&1; then
    (cd "$ROOT/frontend" && exec setsid npm run dev -- --port "$FRONTEND_PORT" --strictPort) &
  else
    (cd "$ROOT/frontend" && exec npm run dev -- --port "$FRONTEND_PORT" --strictPort) &
  fi
  FRONT_PID=$!

  echo "[4/4] 等待服务就绪..."
  wait_for "$BACKEND_HEALTH" "后端 API"
  wait_for "$FRONTEND_URL/login" "前端页面"
  echo ""
  echo "════════════════════════════════════════════════════"
  echo "  驰驿 CHEYI 已启动（开发模式）"
  echo "  前端界面: $FRONTEND_URL"
  echo "  后端 API: $BACKEND_HEALTH"
  echo "  管理员账号: 12388888888 / Cheyi@2026"
  echo "  按 Ctrl+C 停止两个进程"
  echo "════════════════════════════════════════════════════"
  open_browser "$FRONTEND_URL"
  wait "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
fi