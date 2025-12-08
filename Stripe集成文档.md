# Stripe 支付集成指南

## 目录
1. [简介](#简介)
2. [前期准备](#前期准备)
3. [安装 Stripe SDK](#安装-stripe-sdk)
4. [环境配置](#环境配置)
5. [集成方式](#集成方式)
   - [Checkout 集成](#checkout-集成)
   - [Payment Elements 集成](#payment-elements-集成)
   - [Payment Links 集成](#payment-links-集成)
6. [服务器端实现](#服务器端实现)
7. [客户端实现](#客户端实现)
8. [Webhook 配置](#webhook-配置)
9. [安全最佳实践](#安全最佳实践)
10. [测试](#测试)
11. [生产环境部署](#生产环境部署)
12. [常见问题](#常见问题)

## 简介

Stripe 是一个全球领先的在线支付处理平台，为开发者提供强大的 API 和工具来处理支付、订阅和其他金融操作。本文档将指导您如何在项目中集成 Stripe 支付功能。

## 前期准备

### 1. 注册 Stripe 账户
- 访问 [Stripe 官网](https://stripe.com) 注册账户
- 完成账户验证和设置
- 获取 API 密钥（测试模式和正式模式）

### 2. 选择集成方式
Stripe 提供多种集成方式：
- **Stripe Checkout**: Stripe 托管的结账页面，最快集成方式
- **Payment Elements**: 自定义结账表单，更灵活
- **Payment Links**: 通过链接收款，适合简单场景

## 安装 Stripe SDK

### Node.js
```bash
npm install stripe
```

### Python
```bash
pip install stripe
```

### Java (Maven)
```xml
<dependency>
    <groupId>com.stripe</groupId>
    <artifactId>stripe-java</artifactId>
    <version>最新版本</version>
</dependency>
```

### PHP (Composer)
```bash
composer require stripe/stripe-php
```

## 环境配置

### 环境变量设置
在项目根目录创建 `.env` 文件：

```env
# Stripe API Keys
STRIPE_PUBLISHABLE_KEY=pk_test_你的公钥
STRIPE_SECRET_KEY=sk_test_你的私钥

# Webhook 签名密钥
STRIPE_WEBHOOK_SECRET=whsec_你的webhook密钥

# 其他配置
STRIPE_API_VERSION=2024-06-20
```

### 注意事项
- **永远不要在前端代码中使用私钥**
- 使用受限制的 API 密钥代替完整的私钥
- 将敏感信息存储在环境变量中，不要提交到版本控制

## 集成方式

### Checkout 集成

#### 优点
- 集成最快
- 无需处理 PCI 合规性
- 自动适配移动端
- 支持多种支付方式

#### 服务器端实现 (Node.js)

```javascript
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.post('/create-checkout-session', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: '产品名称',
              images: ['https://example.com/product.jpg'],
            },
            unit_amount: 2000, // 20.00 USD，以分为单位
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
    });

    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 客户端实现

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://js.stripe.com/v3/"></script>
</head>
<body>
  <button id="checkout-button">立即支付</button>

  <script>
    const stripe = Stripe('pk_test_你的公钥');

    document.getElementById('checkout-button').addEventListener('click', async () => {
      try {
        const response = await fetch('/create-checkout-session', {
          method: 'POST',
        });

        const session = await response.json();

        // 重定向到 Stripe Checkout
        const result = await stripe.redirectToCheckout({
          sessionId: session.id,
        });

        if (result.error) {
          console.error(result.error.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  </script>
</body>
</html>
```

### Payment Elements 集成

#### 优点
- 完全自定义的结账体验
- 支持多种支付方式
- 更好的品牌一致性

#### 服务器端实现

```javascript
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'usd' } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

#### 客户端实现

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://js.stripe.com/v3/"></script>
  <style>
    /* 自定义样式 */
  </style>
</head>
<body>
  <form id="payment-form">
    <div id="payment-element">
      <!-- Stripe Elements 将在这里渲染 -->
    </div>
    <button id="submit">支付</button>
    <div id="error-message">
      <!-- 错误信息显示 -->
    </div>
  </form>

  <script>
    const stripe = Stripe('pk_test_你的公钥');
    const elements = stripe.elements();

    // 创建 Payment Element
    const paymentElement = elements.create('payment');
    paymentElement.mount('#payment-element');

    const form = document.getElementById('payment-form');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
        },
      });

      if (error) {
        document.getElementById('error-message').textContent = error.message;
      }
    });
  </script>
</body>
</html>
```

### Payment Links 集成

#### 适用于简单场景
- 一次性收款
- 无需开发工作量
- 适合小规模项目

#### 创建方式
1. 在 Stripe Dashboard 中手动创建
2. 通过 API 创建

```javascript
const paymentLink = await stripe.paymentLinks.create({
  line_items: [
    {
      price: 'price_1234567890',
      quantity: 1,
    },
  ],
});
```

## 服务器端实现

### 创建 Payment Intent

```javascript
app.post('/create-payment-intent', async (req, res) => {
  const { items, currency = 'usd' } = req.body;

  // 计算订单总金额
  const amount = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: {
        order_id: generateOrderId(),
        customer_id: req.user?.id,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 处理 Webhook

```javascript
const crypto = require('crypto');

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log(`Webhook 签名验证失败: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // 处理事件
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('支付成功:', paymentIntent.id);
      // 更新订单状态，发送确认邮件等
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('支付失败:', failedPayment.id);
      // 记录失败原因，通知用户等
      break;

    case 'charge.dispute.created':
      const dispute = event.data.object;
      console.log('争议创建:', dispute.id);
      // 处理支付争议
      break;

    default:
      console.log(`未处理的事件类型: ${event.type}`);
  }

  res.json({ received: true });
});
```

## 客户端实现

### React 组件示例

```jsx
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_你的公钥');

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/success`,
      },
    });

    if (error) {
      setMessage(error.message);
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <PaymentElement id="payment-element" />

      <button disabled={isLoading || !stripe || !elements} id="submit">
        <span id="button-text">
          {isLoading ? '处理中...' : '立即支付'}
        </span>
      </button>

      {message && <div id="payment-message">{message}</div>}
    </form>
  );
};

const App = () => {
  const [clientSecret, setClientSecret] = useState('');

  useEffect(() => {
    // 获取 clientSecret
    fetch('/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ id: 1, price: 2000, quantity: 1 }],
        currency: 'usd'
      }),
    })
    .then((res) => res.json())
    .then((data) => setClientSecret(data.clientSecret));
  }, []);

  return (
    clientSecret && (
      <Elements options={{ clientSecret }} stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    )
  );
};

export default App;
```

## Webhook 配置

### 设置 Webhook 端点

1. 在 Stripe Dashboard 中进入 Webhooks 设置
2. 添加新的端点 URL
3. 选择需要监听的事件类型
4. 获取签名密钥

### 本地开发工具

使用 Stripe CLI 进行本地测试：

```bash
# 安装 Stripe CLI
# 访问 https://stripe.com/docs/stripe-cli 安装

# 登录
stripe login

# 转发 Webhook 到本地
stripe listen --forward-to localhost:3000/webhook

# 获取测试 Webhook 密钥
stripe listen --print-secret
```

### 重要事件类型

- `payment_intent.succeeded`: 支付成功
- `payment_intent.payment_failed`: 支付失败
- `charge.dispute.created`: 支付争议创建
- `invoice.payment_succeeded`: 发票支付成功
- `customer.subscription.created`: 订阅创建
- `checkout.session.completed`: Checkout 会话完成

## 安全最佳实践

### 1. API 密钥安全
- 使用受限制的 API 密钥
- 定期轮换密钥
- 不要在客户端代码中暴露私钥

### 2. Webhook 签名验证
```javascript
// 必须验证每个 Webhook 请求
const event = stripe.webhooks.constructEvent(
  payload,
  sig,
  webhookSecret
);
```

### 3. PCI 合规性
- 使用 Stripe Elements 或 Checkout 避免处理敏感卡信息
- 如果需要存储卡信息，使用 Stripe 的保存功能

### 4. 错误处理
- 始终处理可能的错误情况
- 不要暴露敏感的错误信息
- 实现适当的重试机制

### 5. 防止欺诈
- 启用 Stripe Radar
- 监控异常交易模式
- 设置适当的限制

## 测试

### 测试卡号

| 场景 | 卡号 |
|------|------|
| 成功支付 | 4242424242424242 |
| 需要身份验证 | 4000002500003155 |
| 支付被拒绝 | 4000000000009995 |
| 卡余额不足 | 4000000000009998 |
| 卡已过期 | 4000000000000069 |

### 测试流程

1. 使用测试 API 密钥
2. 使用测试卡号进行支付
3. 检查 Webhook 事件是否正确触发
4. 验证业务逻辑是否正确处理各种情况

### 测试代码示例

```javascript
// 创建测试 Payment Intent
const testPaymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
  payment_method: 'pm_card_visa',
  confirm: true,
});

// 模拟失败场景
const failedPaymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
  payment_method: 'pm_card_chargeDeclined',
  confirm: true,
});
```

## 生产环境部署

### 部署前检查清单

- [ ] 切换到生产 API 密钥
- [ ] 更新 Webhook 端点 URL 为生产环境地址
- [ ] 配置生产环境的域名和 SSL 证书
- [ ] 设置适当的错误监控和日志记录
- [ ] 实现订单状态检查和一致性验证
- [ ] 配置财务对账流程

### 监控和维护

```javascript
// 实现健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    stripe_api_version: stripe.getApiField('version')
  });
});

// 错误监控
app.use((error, req, res, next) => {
  console.error('Stripe integration error:', error);

  // 发送到错误监控服务
  // errorReporting.report(error);

  res.status(500).json({
    error: 'Internal server error',
    requestId: req.id
  });
});
```

## 常见问题

### Q: 如何处理重复支付？
A: 实现 idempotency keys 来防止重复处理相同的请求。

```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'usd',
}, {
  idempotencyKey: `order-${orderId}-${Date.now()}`,
});
```

### Q: 如何实现订阅支付？
A: 使用 Stripe Billing API：

```javascript
const subscription = await stripe.subscriptions.create({
  customer: 'cus_123',
  items: [{
    price: 'price_1234567890',
  }],
});
```

### Q: 如何处理退款？
A: 使用 Refunds API：

```javascript
const refund = await stripe.refunds.create({
  payment_intent: 'pi_1234567890',
  amount: 1000, // 可选，默认全额退款
});
```

### Q: 如何保存客户的支付信息？
A: 使用 Setup Intents：

```javascript
const setupIntent = await stripe.setupIntents.create({
  customer: 'cus_123',
  payment_method_types: ['card'],
});
```

### Q: 如何处理多币种支付？
A: 在创建 Payment Intent 时指定货币：

```javascript
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000,
  currency: 'eur', // 或其他支持的货币
});
```

## 更多资源

- [Stripe 官方文档](https://stripe.com/docs)
- [API 参考](https://stripe.com/docs/api)
- [最佳实践指南](https://stripe.com/docs/best-practices)
- [安全指南](https://stripe.com/docs/security)
- [Stripe Discord 社区](https://discord.com/stripe)

## 技术支持

如果在集成过程中遇到问题，可以：

1. 查看 [Stripe 文档](https://stripe.com/docs)
2. 搜索 [Stack Overflow](https://stackoverflow.com/questions/tagged/stripe)
3. 联系 [Stripe 技术支持](https://support.stripe.com/)
4. 加入 [Stripe 社区论坛](https://community.stripe.com/)

---

**注意**: 本文档基于 Stripe API 的当前版本编写，请确保使用最新版本的 API 并参考官方文档获取最新信息。