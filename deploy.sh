#!/bin/bash
set -euo pipefail

# ================== 变量 ==================
CUR_VERSION=$(node -v || echo "")
BUILD_VERSION="v20.14.0"
SERVER_USER="root"
SERVER_HOSTNAME="aaaa"
SERVER_DEPLOY_PATH="/home/www/blog"
DEPLOY_CONTENT="./.vitepress/dist/"

LOG_FILE="./deploy.log"

# ================== 初始化 nvm ==================
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# ================== 退出清理 ==================
cleanup() {
    local code=$?
    trap - INT TERM EXIT  # 防止重复触发

    echo "[$(date '+%F %T')] 执行退出清理... exit_code=$code" | tee -a "$LOG_FILE"

    if [ "$CUR_VERSION" != "$BUILD_VERSION" ] && command -v nvm >/dev/null 2>&1; then
        echo "[$(date '+%F %T')] restoring to original node version: $CUR_VERSION" | tee -a "$LOG_FILE"
        nvm use "$CUR_VERSION" > /dev/null 2>&1 || true
    fi
}

# ================== 错误守卫函数 ==================
exit_if_fail() {
    local code=$?
    local msg="$1"
    if [ $code -ne 0 ]; then
        echo "[$(date '+%F %T')] ❌ Error: $msg (exit=$code)" | tee -a "$LOG_FILE"
        exit $code
    fi
}

# ================== 信号捕获 ==================
trap cleanup EXIT INT TERM

# ================== 主流程 ==================

echo "[$(date '+%F %T')] deploy.sh started..." | tee -a "$LOG_FILE"

# 切换 node 版本
if [ "$CUR_VERSION" != "$BUILD_VERSION" ]; then
    echo "[$(date '+%F %T')] switching to node version: $BUILD_VERSION" | tee -a "$LOG_FILE"
    nvm install "$BUILD_VERSION" > /dev/null 2>&1
    nvm use "$BUILD_VERSION"
fi
echo "Using node version: $(node -v)" | tee -a "$LOG_FILE"

# 安装依赖
echo "[$(date '+%F %T')] npm install..." | tee -a "$LOG_FILE"
npm install
exit_if_fail "npm install failed!"

# 构建项目
echo "[$(date '+%F %T')] npm run build..." | tee -a "$LOG_FILE"
npm run build
exit_if_fail "build failed!"

# 部署到服务器
echo "[$(date '+%F %T')] deploying to $SERVER_HOSTNAME:$SERVER_DEPLOY_PATH..." | tee -a "$LOG_FILE"
scp -r "${DEPLOY_CONTENT}"* "$SERVER_USER@$SERVER_HOSTNAME:$SERVER_DEPLOY_PATH" >> "$LOG_FILE" 2>&1
exit_if_fail "deployment failed!"

echo "[$(date '+%F %T')] deployment succeeded!" | tee -a "$LOG_FILE"