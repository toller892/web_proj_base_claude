'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Image from 'next/image';
import ShopBackground from '@/components/ShopBackground';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  category: string;
  in_stock: boolean;
}

interface CartItem {
  productId: string;
  quantity: number;
  product: Product;
}

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.productId === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { productId: product.id, quantity: 1, product }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!customerInfo.email || !customerInfo.name) {
      alert('请填写完整的联系信息');
      return;
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          customerEmail: customerInfo.email,
          customerName: customerInfo.name,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Checkout response:', data);
        if (data.url) {
          console.log('Redirecting to Stripe checkout:', data.url);
          window.location.href = data.url;
        } else {
          console.error('No checkout URL returned');
          alert('获取支付链接失败，请重试');
        }
      } else {
        console.error('Checkout API error:', data);
        alert(data.error || '创建订单失败');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('支付失败，请重试');
    }
  };

  if (loading) {
    return (
      <ShopBackground>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-white text-xl">加载中...</div>
        </div>
      </ShopBackground>
    );
  }

  return (
    <ShopBackground
      title={
        <h1 className="text-3xl md:text-4xl font-bold">
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            三角洲行动 - 大红商品商店
          </span>
        </h1>
      }
    >
      <div className="container mx-auto px-4 py-8">
        {/* 三角洲行动专区 */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">三角洲行动专区</h2>
                <p className="text-red-100">精选战术道具，提升战斗力</p>
              </div>
              <a
                href="/delta-force"
                className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                进入专区
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 商品列表 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  <div className="relative h-48 bg-gray-700">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">暂无图片</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      热卖
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                    <p className="text-gray-400 mb-4 text-sm">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-yellow-400">
                        ${(product.price / 100).toFixed(2)}
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                      >
                        加入购物车
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 购物车 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold mb-4">购物车</h2>

              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-8">购物车是空的</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.productId} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm">{item.product.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            删除
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="bg-gray-600 hover:bg-gray-500 text-white w-6 h-6 rounded"
                            >
                              -
                            </button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="bg-gray-600 hover:bg-gray-500 text-white w-6 h-6 rounded"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-yellow-400 font-semibold">
                            ${((item.product.price * item.quantity) / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-600 pt-4 mb-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>总计：</span>
                      <span className="text-yellow-400">
                        ${(getTotalPrice() / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                  >
                    结算
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

      {/* 结算模态框 */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-4">订单信息</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">姓名</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="请输入您的姓名"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">邮箱</label>
                <input
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="请输入您的邮箱"
                />
              </div>

              <div className="border-t border-gray-600 pt-4">
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>订单总额：</span>
                  <span className="text-yellow-400">
                    ${(getTotalPrice() / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCheckout(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors duration-200"
              >
                取消
              </button>
              <button
                onClick={handleCheckout}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors duration-200"
              >
                确认支付
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </ShopBackground>
  );
}