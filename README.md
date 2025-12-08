# Auth App - 用户注册与登录系统

基于 Next.js 和 Supabase 构建的用户认证系统，设计来自 Figma。

## 功能特性

✅ 用户注册（Email + Password）
✅ 用户登录
✅ 基于 Supabase Auth 的身份验证
✅ 受保护的 Dashboard 页面
✅ 响应式设计
✅ 基于 Figma 设计稿的 UI 实现

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **认证**: Supabase Auth
- **数据库**: Supabase PostgreSQL

## 项目结构

```
auth-app/
├── app/
│   ├── signup/          # 注册页面
│   ├── login/           # 登录页面
│   ├── dashboard/       # 用户 Dashboard
│   ├── auth/callback/   # 认证回调路由
│   ├── layout.tsx       # 根布局
│   ├── page.tsx         # 首页
│   └── globals.css      # 全局样式
├── lib/
│   └── supabase/        # Supabase 客户端配置
│       ├── client.ts    # 客户端 Supabase 实例
│       ├── server.ts    # 服务端 Supabase 实例
│       └── middleware.ts # 中间件工具
├── middleware.ts        # Next.js 中间件
└── .env.local          # 环境变量
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

项目已经配置好了 Supabase 连接。如果需要更改，请编辑 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 数据库设置

确保你的 Supabase 项目中已经创建了 `users` 表。该表已通过 Supabase MCP 创建，包含以下字段：

- `id` (UUID) - 主键
- `email` (TEXT) - 用户邮箱
- `username` (TEXT) - 用户名（可选）
- `full_name` (TEXT) - 全名
- `avatar_url` (TEXT) - 头像 URL
- `created_at` - 创建时间
- `updated_at` - 更新时间

### 4. 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 使用说明

### 注册新用户

1. 访问 `/signup` 或点击首页的"注册"按钮
2. 填写姓名、邮箱和密码
3. 同意条款后点击"Signup"
4. 注册成功后会收到验证邮件
5. 验证后可以登录

### 登录

1. 访问 `/login` 或点击首页的"登录"按钮
2. 输入注册时使用的邮箱和密码
3. 点击"Login"
4. 登录成功后会跳转到 Dashboard

### Dashboard

登录成功后可以看到：
- 用户邮箱
- 用户 ID
- 账户创建时间
- 退出登录按钮

## Supabase Auth 配置

项目使用了 `@supabase/ssr` 包来实现服务端渲染的身份验证：

- **客户端**: 使用 `createBrowserClient` 创建浏览器端 Supabase 实例
- **服务端**: 使用 `createServerClient` 创建服务端 Supabase 实例
- **中间件**: 自动刷新用户会话令牌

## 页面路由

- `/` - 首页
- `/signup` - 注册页面
- `/login` - 登录页面
- `/dashboard` - 用户 Dashboard（需要登录）
- `/auth/callback` - 认证回调（用于邮箱验证等）

## 设计说明

UI 设计基于 Figma 设计稿：
- 主色调: #3A5B22 (深绿色)
- 字体: Poppins
- 圆角: 10px
- 响应式布局：桌面端左右分栏，移动端单栏

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 运行生产版本
npm start

# 代码检查
npm run lint
```

## 待优化功能

- [ ] 第三方登录（Google、Apple）
- [ ] 忘记密码功能
- [ ] 用户资料编辑
- [ ] 头像上传
- [ ] 邮箱验证提示
- [ ] 更完善的错误处理
- [ ] 加载状态优化
- [ ] 表单验证增强

## 故障排除

### 注册失败
- 确保邮箱格式正确
- 密码至少 6 个字符
- 检查 Supabase 项目是否正常运行

### 登录失败
- 确认邮箱和密码正确
- 检查是否已验证邮箱（如果 Supabase 启用了邮箱验证）

### 无法访问 Dashboard
- 确保已成功登录
- 检查浏览器控制台是否有错误信息

## 许可证

MIT

## 作者

Created with Claude Code
