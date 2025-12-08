#!/bin/bash

echo "🧹 清理端口和进程..."

# 查找并终止占用3000-3002端口的进程
for port in 3000 3001 3002; do
    pid=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo "📛 终止进程 $pid (端口 $port)"
        kill -9 $pid 2>/dev/null || true
    fi
done

# 清理Next.js缓存
if [ -d ".next" ]; then
    echo "🗂️  清理Next.js缓存..."
    rm -rf .next
fi

# 查找并终止相关的node进程
echo "🔍 查找并终止Node.js进程..."
pkill -f "next dev" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true

echo ""
echo "✅ 清理完成！"
echo "🚀 启动开发服务器..."
echo ""

# 启动开发服务器
npm run dev