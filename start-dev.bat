@echo off
echo 正在清理端口和进程...

REM 查找并终止占用3000-3002端口的进程
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000"') do (
    echo 终止进程 %%a (端口 3000)
    taskkill /PID %%a /F
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001"') do (
    echo 终止进程 %%a (端口 3001)
    taskkill /PID %%a /F
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3002"') do (
    echo 终止进程 %%a (端口 3002)
    taskkill /PID %%a /F
)

REM 清理Next.js缓存
if exist ".next" (
    echo 清理Next.js缓存...
    rmdir /s /q ".next"
)

REM 查找并终止node进程
for /f "tokens=2" %%a in ('tasklist ^| findstr "node.exe"') do (
    echo 终止Node.js进程 %%a
    taskkill /PID %%a /F
)

echo.
echo 清理完成，现在启动开发服务器...
echo.

REM 启动开发服务器
npm run dev

pause