#!/usr/bin/env bash
# start.sh 的共享函数：帮助文本、进程清理、就绪检测、浏览器打开。
# 由 start.sh source 使用；不单独执行。

usage() {
  sed -n '2,14p' "$0" | sed 's/^# \{0,1\}//'
}

# 清理后台进程和临时构建产物。Ctrl+C、脚本正常退出都会经过这里。
cleanup() {
  trap - EXIT INT TERM
  echo ""
  echo "正在停止服务..."
  [ -n "$FRONT_PID" ] && kill_tree "$FRONT_PID"
  [ -n "$BACK_PID" ] && kill_tree "$BACK_PID"
  [ -n "$TMP_DIR" ] && rm -rf "$TMP_DIR"
  echo "已停止"
}

kill_tree() {
  local pid="$1"
  [ -n "$pid" ] || return 0
  pkill -TERM -P "$pid" 2>/dev/null || true
  kill -TERM -- "-$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
  sleep 0.3
  pkill -KILL -P "$pid" 2>/dev/null || true
  kill -KILL -- "-$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null || true
}

wait_for() {
  local url="$1"
  local name="$2"
  for _ in $(seq 1 40); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "错误: $name 未在 40 秒内就绪，请检查端口 $BACKEND_PORT / $FRONTEND_PORT 是否被占用"
  return 1
}

# ── 打开浏览器 ──────────────────────────────────────────────────────────────
open_browser() {
  local url="$1"
  if [ "$OPEN_BROWSER" -ne 1 ]; then
    echo "提示: 已跳过自动打开浏览器，可手动访问 $url"
    return 0
  fi

  local opener=""
  if [ -n "${BROWSER:-}" ]; then
    opener="$BROWSER"
  elif command -v xdg-open >/dev/null 2>&1; then
    opener="xdg-open"
  elif command -v open >/dev/null 2>&1; then
    opener="open"
  elif command -v wslview >/dev/null 2>&1; then
    opener="wslview"
  elif command -v cmd.exe >/dev/null 2>&1; then
    opener="cmd.exe"
  fi

  if [ -n "$opener" ]; then
    echo "正在打开浏览器: $url"
    if [ "$opener" = "cmd.exe" ]; then
      cmd.exe /c start "" "$url" >/dev/null 2>&1 &
    else
      "$opener" "$url" >/dev/null 2>&1 &
    fi
  else
    echo "提示: 未找到浏览器启动命令，请手动打开 $url"
  fi
}