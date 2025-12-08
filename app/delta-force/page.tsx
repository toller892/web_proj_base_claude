'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';

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

export default function DeltaForceShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
  });

  useEffect(() => {
    fetchDeltaForceProducts();
  }, []);

  const fetchDeltaForceProducts = async () => {
    try {
      const response = await fetch('/api/products?category=delta-force');
      const data = await response.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch delta force products:', error);
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
      const response = await fetch('/api/checkout-demo', {
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
        alert(`订单创建成功！\n订单号: ${data.orderId}\n总金额: ¥${(data.totalAmount / 100).toFixed(data.currency === 'CNY' ? 2 : 0)}\n\n这是演示版本，实际支付需要配置Stripe。`);
        setShowCheckout(false);
        setCart([]);
        setCustomerInfo({ email: '', name: '' });
      } else {
        alert(`创建订单失败: ${data.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('订单创建失败，请重试');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <PageLayout
        title={
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            三角洲行动道具商店
          </span>
        }
        description="精选战术道具，提升战斗力"
        breadcrumbItems={[
          {
            name: '首页',
            href: '/',
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            ),
          },
          {
            name: '三角洲行动',
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
          },
        ]}
      >
        {/* 英雄区域 */}
        <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-lg p-8 mb-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">三角洲行动道具商店</h1>
            <p className="text-xl mb-6">装备精英道具，制霸战场</p>
            <div className="flex justify-center space-x-4">
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm">精选道具</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">100%</div>
                <div className="text-sm">官方认证</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-3">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-sm">即时发货</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 商品列表 */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className="relative h-48 bg-gradient-to-br from-red-900 to-orange-900">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center">
                          <svg className="w-16 h-16 mx-auto mb-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          <span className="text-red-300">战术道具</span>
                        </div>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold">
                      热卖
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 text-red-400">{product.name}</h3>
                    <p className="text-gray-400 mb-4 text-sm">{product.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-2xl font-bold text-yellow-400">
                        ¥{(product.price / 100).toFixed(2)}
                      </div>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-2 rounded-lg font-semibold transition-all duration-200"
                    >
                      加入购物车
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-24 h-24 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-400 text-lg">暂无三角洲行动道具</p>
                <Link href="/shop" className="inline-block mt-4 bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded-lg transition-colors">
                  浏览其他商品
                </Link>
              </div>
            )}
          </div>

          {/* 购物车 */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
              <h2 className="text-2xl font-bold mb-4 text-red-400">购物车</h2>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-gray-400">购物车是空的</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.productId} className="bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-sm text-red-300">{item.product.name}</h4>
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
                            ¥{((item.product.price * item.quantity) / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-600 pt-4 mb-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>总计：</span>
                      <span className="text-yellow-400">
                        ¥{(getTotalPrice() / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all duration-200"
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
              <h3 className="text-2xl font-bold mb-4 text-red-400">订单信息</h3>

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
                      ¥{(getTotalPrice() / 100).toFixed(2)}
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
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2 rounded-lg transition-all duration-200"
                >
                  确认支付
                </button>
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </div>
  );
}