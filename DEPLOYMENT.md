# 三角洲行动大红商品购买系统 - 部署指南

## 🚀 快速开始

### 1. 环境准备

确保您的系统已安装：
- Node.js 18+
- npm 或 yarn
- Git

### 2. 项目配置

```bash
# 1. 复制环境变量模板
cp .env.local.example .env.local

# 2. 配置 Supabase
# 访问 https://supabase.com/dashboard
# 创建项目 -> 获取 URL 和 API 密钥

# 3. 配置 Stripe
# 访问 https://dashboard.stripe.com/
# 注册账户 -> 获取 API 密钥
```

### 3. 数据库设置

1. 在 Supabase SQL Editor 中执行：
```sql
-- 复制 supabase-schema.sql 的内容到此处执行
```

2. 验证表创建成功：
```sql
SELECT * FROM products;
SELECT * FROM orders;
SELECT * FROM order_items;
```

### 4. 启动应用

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问：
- 商店页面: http://localhost:3000/shop
- 管理后台: http://localhost:3000/admin
- 支付成功页: http://localhost:3000/success

## 🛠️ 生产环境部署

### 1. 环境变量配置

生产环境需要设置以下环境变量：

```env
# Supabase 生产环境
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe 生产环境
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_你的公钥
STRIPE_SECRET_KEY=sk_live_你的私钥
STRIPE_WEBHOOK_SECRET=whsec_你的webhook密钥

# 应用配置
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 2. Vercel 部署 (推荐)

1. **连接 GitHub 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/delta-shop.git
   git push -u origin main
   ```

2. **部署到 Vercel**
   - 访问 https://vercel.com/
   - 导入 GitHub 仓库
   - 配置环境变量
   - 点击部署

3. **配置 Webhook**
   - 在 Vercel 中获取部署域名
   - 在 Stripe Dashboard 中添加 Webhook URL:
     `https://your-domain.vercel.app/api/webhook`

### 3. 其他平台部署

#### Netlify
```bash
# 构建命令
npm run build

# 发布目录
out
```

#### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 配置详解

### Supabase 配置

1. **项目创建**
   - 访问 Supabase Dashboard
   - 点击 "New Project"
   - 选择组织，设置项目名称
   - 设置数据库密码

2. **获取 API 密钥**
   ```
   Dashboard -> Project Settings -> API
   - Project URL
   - anon public key
   - service_role key (保密)
   ```

3. **数据库表创建**
   - 进入 SQL Editor
   - 粘贴 `supabase-schema.sql` 内容
   - 点击 "Run" 执行

### Stripe 配置

1. **账户设置**
   - 注册 Stripe 账户
   - 完成身份验证
   - 设置银行账户信息

2. **API 密钥**
   ```
   Dashboard -> Developers -> API keys
   - Publishable key (前端使用)
   - Secret key (后端使用)
   ```

3. **Webhook 配置**
   ```
   Dashboard -> Developers -> Webhooks
   - 添加端点: https://your-domain.com/api/webhook
   - 选择事件:
     * checkout.session.completed
     * checkout.session.expired
     * payment_intent.payment_failed
   - 获取签名密钥
   ```

## 🧪 测试

### 开发环境测试

1. **Stripe 测试卡号**
   - 成功支付: 4242424242424242
   - 需要验证: 4000002500003155
   - 支付失败: 4000000000009995

2. **测试流程**
   ```
   1. 访问 /shop 查看商品
   2. 添加商品到购物车
   3. 点击结算，填写信息
   4. 使用测试卡完成支付
   5. 验证支付成功页面
   6. 检查 Supabase 数据库订单记录
   ```

### 本地 Webhook 测试

```bash
# 安装 Stripe CLI
curl -s https://packages.stripe.com/api/security/keypairs/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt-get update
sudo apt-get install stripe

# 登录 Stripe
stripe login

# 转发 webhook
stripe listen --forward-to localhost:3000/api/webhook

# 获取测试密钥
stripe listen --print-secret
```

## 📊 监控和维护

### 1. 日志监控

```javascript
// 添加到 API 路由
console.log(`[${new Date().toISOString()}] ${event.type}:`, data);
```

### 2. 错误追踪

```javascript
// 在 API 路由中添加错误处理
try {
  // API 逻辑
} catch (error) {
  console.error('API Error:', error);
  // 发送到错误监控服务
  // Sentry.captureException(error);
}
```

### 3. 性能监控

- 使用 Vercel Analytics
- 集成 Sentry
- 监控数据库性能

## 🔒 安全最佳实践

### 1. 环境变量安全
- ✅ 使用 `.env.local` 本地开发
- ✅ 生产环境使用平台环境变量
- ❌ 不要提交 `.env.local` 到 Git

### 2. API 密钥管理
- ✅ 使用受限制的 API 密钥
- ✅ 定期轮换密钥
- ✅ 最小权限原则

### 3. Webhook 安全
- ✅ 验证 webhook 签名
- ✅ 使用 HTTPS
- ✅ 限制 webhook 来源 IP

## 📈 扩展功能

### 1. 用户系统
```javascript
// 集成现有用户认证
const { data: { user } } = await supabase.auth.getUser();
if (user) {
  // 用户已登录，可以购买
}
```

### 2. 库存管理
```sql
-- 添加库存字段
ALTER TABLE products ADD COLUMN stock_count INTEGER DEFAULT 100;
```

### 3. 优惠券系统
```sql
-- 创建优惠券表
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- percentage or fixed
  discount_value INTEGER NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0
);
```

## 🆘 故障排除

### 常见问题

1. **Stripe 支付失败**
   - 检查 API 密钥配置
   - 验证 webhook 配置
   - 查看 Stripe 日志

2. **数据库连接错误**
   - 检查 Supabase URL 和密钥
   - 验证网络连接
   - 检查表是否存在

3. **图片不显示**
   - 检查图片路径
   - 验证文件权限
   - 查看浏览器控制台错误

### 获取帮助

- 📧 邮箱: support@delta-game.com
- 📖 文档: [项目README](README-Shop.md)
- 🐛 问题反馈: GitHub Issues

## 📝 更新日志

### v1.0.0 (2024-11-24)
- ✅ 基础商品展示功能
- ✅ Stripe 支付集成
- ✅ Supabase 数据库存储
- ✅ 管理后台界面
- ✅ Replica 图片生成集成
- ✅ 响应式设计

---

**部署完成后，您的三角洲行动大红商品购买系统就准备好为玩家服务了！** 🎮