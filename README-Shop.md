# 三角洲行动大红商品购买系统

一个基于 Next.js、Stripe 和 Supabase 构建的游戏内购买系统，专为三角洲行动游戏设计。

## 功能特性

- 🎮 **商品展示**：展示三角洲行动热门大红商品
- 🛒 **购物车系统**：支持添加、删除、修改商品数量
- 💳 **Stripe支付集成**：安全快捷的在线支付
- 📊 **订单管理**：完整的订单追踪和管理
- 🗄️ **数据库存储**：使用 Supabase 存储商品和订单信息
- 📱 **响应式设计**：适配桌面和移动设备

## 商品列表

### 1. AK-47 烈焰战士皮肤 - $29.99
- 限量版武器皮肤
- 炫酷烈焰特效
- 战场辨识度极高

### 2. 特种兵精英套装 - $49.99
- 完整角色外观
- 战术装备包
- 专属动作表情

### 3. 战斗通行证高级版 - $19.99
- 解锁全部100级奖励
- 独家皮肤和武器蓝图
- 限定道具奖励

### 4. 钻石币大礼包 - $9.99
- 10000钻石币
- 额外赠送2000钻石币
- 可购买任意游戏道具

## 技术栈

- **前端框架**: Next.js 16 + React 19
- **样式**: Tailwind CSS
- **支付系统**: Stripe
- **数据库**: Supabase (PostgreSQL)
- **类型安全**: TypeScript
- **图片处理**: Next.js Image

## 项目结构

```
auth-app/
├── app/
│   ├── api/
│   │   ├── checkout/       # Stripe结账API
│   │   ├── webhook/        # Stripe webhook处理
│   │   └── products/       # 商品API
│   ├── shop/               # 商店页面
│   └── success/            # 支付成功页面
├── public/
│   └── images/             # 商品图片
└── supabase-schema.sql     # 数据库结构
```

## 环境配置

### 1. 复制环境变量模板

```bash
cp .env.local.example .env.local
```

### 2. 配置 Supabase

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 创建新项目
3. 在 Project Settings > API 中获取以下信息：
   - Project URL
   - anon public key
   - service_role key

### 3. 配置 Stripe

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 注册账户并获取 API 密钥
3. 在 Developers > API keys 中获取：
   - Publishable key
   - Secret key
4. 配置 Webhook 端点：`your-domain.com/api/webhook`

### 4. 更新环境变量

```env
# Supabase配置
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe配置
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_你的公钥
STRIPE_SECRET_KEY=sk_test_你的私钥
STRIPE_WEBHOOK_SECRET=whsec_你的webhook密钥

# 应用配置
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 设置数据库

在 Supabase SQL Editor 中执行 `supabase-schema.sql` 文件：

```sql
-- 复制 supabase-schema.sql 的内容到此处执行
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000/shop 查看商店页面。

## API 接口

### GET /api/products
获取所有商品信息

**响应示例:**
```json
{
  "products": [
    {
      "id": "uuid",
      "name": "AK-47 烈焰战士皮肤",
      "description": "限量版AK-47武器皮肤",
      "price": 2999,
      "currency": "USD",
      "image_url": "/images/ak47-flame.jpg",
      "category": "weapon_skin"
    }
  ]
}
```

### POST /api/checkout
创建支付会话

**请求体:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 1
    }
  ],
  "customerEmail": "user@example.com",
  "customerName": "张三"
}
```

### POST /api/webhook
处理 Stripe webhook 事件

## 数据库表结构

### products 表
- `id`: 商品ID
- `name`: 商品名称
- `description`: 商品描述
- `price`: 价格（分为单位）
- `currency`: 货币类型
- `image_url`: 商品图片URL
- `category`: 商品分类
- `in_stock`: 是否有库存

### orders 表
- `id`: 订单ID
- `customer_email`: 客户邮箱
- `customer_name`: 客户姓名
- `total_amount`: 订单总金额
- `status`: 订单状态 (pending/paid/failed/cancelled)
- `stripe_payment_intent_id`: Stripe支付ID
- `stripe_checkout_session_id`: Stripe会话ID

### order_items 表
- `id`: 订单项ID
- `order_id`: 关联订单ID
- `product_id`: 商品ID
- `quantity`: 购买数量
- `price_per_unit`: 单价
- `total_price`: 总价

## 部署说明

### 1. 生产环境配置

1. 更新所有API密钥为生产环境密钥
2. 配置正确的域名和SSL证书
3. 设置Webhook端点为生产环境地址
4. 更新 `NEXT_PUBLIC_BASE_URL` 为生产域名

### 2. 环境变量检查清单

- [ ] Supabase URL 和密钥
- [ ] Stripe 生产密钥
- [ ] Stripe Webhook 密钥
- [ ] 正确的基础URL
- [ ] 数据库连接配置

### 3. 安全注意事项

- 所有敏感信息必须存储在环境变量中
- 不要将私钥提交到版本控制
- 使用 HTTPS 协议
- 定期更新API密钥
- 监控异常交易

## 测试

### 本地测试

使用 Stripe 测试卡号进行测试：

- **成功支付**: 4242424242424242
- **需要验证**: 4000002500003155
- **支付失败**: 4000000000009995

### Webhook 测试

使用 Stripe CLI 进行本地测试：

```bash
# 安装 Stripe CLI
stripe login

# 转发 webhook 到本地
stripe listen --forward-to localhost:3000/api/webhook
```

## 常见问题

### Q: 如何添加新商品？
A: 直接在 Supabase 数据库的 `products` 表中插入新商品记录。

### Q: 如何修改商品价格？
A: 更新 `products` 表中的 `price` 字段（以分为单位）。

### Q: 支付失败怎么办？
A: 检查 Stripe 配置和 API 密钥，查看 webhook 日志确认订单状态更新。

### Q: 如何查看订单数据？
A: 登录 Supabase Dashboard，在 Table Editor 中查看 `orders` 和 `order_items` 表。

## 扩展功能

### 计划中的功能

- [ ] 用户认证系统集成
- [ ] 商品库存管理
- [ ] 优惠券系统
- [ ] 订单历史页面
- [ ] 邮件通知系统
- [ ] 多语言支持
- [ ] 移动端应用
- [ ] 数据分析面板

### 集成建议

- **用户系统**: 与现有用户认证系统集成
- **库存管理**: 实时库存更新和预警
- **客服系统**: 集成在线客服功能
- **物流跟踪**: 虚拟商品自动发货
- **数据分析**: 销售数据分析和报表

## 技术支持

如有问题，请联系：

- **邮箱**: support@delta-game.com
- **GitHub**: [项目地址]
- **文档**: [在线文档]

## 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

---

**注意**: 本项目仅供学习和演示使用，请确保在生产环境中使用正确 的安全配置。