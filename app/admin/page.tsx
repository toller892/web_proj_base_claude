'use client';

import React, { useState, useEffect } from 'react';
import ProductEnhancer from '@/components/ProductEnhancer';
import ImageUpload from '@/components/ImageUpload';
import InventoryValueEditor from '@/components/InventoryValueEditor';
import GeneratedImagesGallery from '@/components/GeneratedImagesGallery';
import PageLayout from '@/components/PageLayout';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  category: string;
  in_stock: boolean;
  stripe_price_id?: string;
  created_at: string;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [inventorySettings, setInventorySettings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'gallery'>('products');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'USD',
    category: 'weapon_skin',
    in_stock: true,
    image_url: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchInventorySettings();
  }, []);

  const fetchInventorySettings = async () => {
    try {
      const response = await fetch('/api/inventory-settings');
      const data = await response.json();
      setInventorySettings(data);
    } catch (error) {
      console.error('Failed to fetch inventory settings:', error);
    }
  };

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

  const handleAddProduct = async () => {
    try {
      console.log('🚀 Sending product data:', newProduct);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Product created:', data);
        setProducts(prev => [data.product, ...prev]);
        setShowAddForm(false);
        setNewProduct({
          name: '',
          description: '',
          price: 0,
          currency: 'USD',
          category: 'weapon_skin',
          in_stock: true,
          image_url: '',
        });
        alert('商品添加成功！');
      } else {
        const errorData = await response.json();
        console.error('❌ Add product failed:', errorData);
        alert(`添加商品失败: ${errorData.error || '未知错误'}\n${errorData.details || ''}`);
      }
    } catch (error) {
      console.error('❌ Failed to add product:', error);
      alert(`添加商品失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev =>
      prev.map(p => p.id === updatedProduct.id ? updatedProduct : p)
    );
    if (selectedProduct?.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('确定要删除这个商品吗？')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        if (selectedProduct?.id === productId) {
          setSelectedProduct(null);
        }
      } else {
        alert('删除商品失败');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('删除商品失败');
    }
  };

  const handleImageSelect = async (imageUrl: string) => {
    if (selectedProduct) {
      try {
        // 更新商品的图片URL
        const response = await fetch(`/api/products/${selectedProduct.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image_url: imageUrl }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.product) {
            // 更新本地状态
            setProducts(prevProducts =>
              prevProducts.map(product =>
                product.id === selectedProduct.id
                  ? { ...product, image_url: imageUrl }
                  : product
              )
            );
            setSelectedProduct(prev =>
              prev ? { ...prev, image_url: imageUrl } : null
            );
            alert('图片已更新到商品');
          }
        } else {
          alert('更新商品图片失败');
        }
      } catch (error) {
        console.error('更新商品图片失败:', error);
        alert('更新商品图片失败');
      }
    } else {
      alert('请先选择一个商品');
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
        title="商品管理后台"
        description="管理三角洲行动大红商品"
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
            name: '管理后台',
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            ),
          },
        ]}
      >

        {/* 标签页导航 */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('products')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                activeTab === 'products'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              📦 商品管理
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-2 px-4 rounded-md transition-colors duration-200 ${
                activeTab === 'gallery'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              🎨 AI图片库
            </button>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 商品列表 */}
            <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">商品列表</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                添加商品
              </button>
            </div>

            {showAddForm && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">添加新商品</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="商品名称"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  />
                  <input
                    type="number"
                    placeholder="价格（分，支持大额数值）"
                    value={newProduct.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === '' ? 0 : parseInt(value, 10);
                      setNewProduct(prev => ({
                        ...prev,
                        price: isNaN(numValue) || numValue < 0 || !Number.isSafeInteger(numValue) ? 0 : numValue
                      }));
                    }}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    min="0"
                    step="1"
                  />
                  <textarea
                    placeholder="商品描述"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white md:col-span-2"
                    rows={3}
                  />
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    <option value="weapon_skin">武器皮肤</option>
                    <option value="character_skin">角色皮肤</option>
                    <option value="battle_pass">战斗通行证</option>
                    <option value="currency">游戏币</option>
                  </select>
                </div>

                {/* 图片上传 */}
                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">商品图片</label>
                  <ImageUpload
                    currentImageUrl={newProduct.image_url}
                    onImageUploaded={(imageUrl) => setNewProduct(prev => ({ ...prev, image_url: imageUrl }))}
                  />
                </div>
                <div className="flex space-x-3 mt-4">
                  <button
                    onClick={handleAddProduct}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    确认添加
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors duration-200"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                    selectedProduct?.id === product.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-750'
                  }`}
                  onClick={() => setSelectedProduct(product)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* 商品图片预览 */}
                      <div className="w-16 h-16 bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{product.name}</h3>
                          <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                            {product.category}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${
                            product.in_stock ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{product.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm">
                          <span className="text-yellow-400 font-semibold">
                            ${(product.price / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                          {product.stripe_price_id && (
                            <span className="text-blue-400 text-xs">✓ Stripe</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product.id);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 商品增强工具 */}
          <div className="lg:col-span-1">
            {selectedProduct ? (
              <ProductEnhancer
                product={selectedProduct}
                onUpdate={handleUpdateProduct}
              />
            ) : (
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">选择一个商品</h3>
                <p className="text-gray-400 text-sm">
                  点击左侧商品列表中的任意商品来查看和管理增强功能
                </p>
              </div>
            )}

            {/* 库存价值管理 */}
            <InventoryValueEditor
              calculatedTotalValue={inventorySettings?.calculatedTotalValue ||
                products.filter(p => p.in_stock).reduce((sum, p) => sum + p.price, 0)}
              onValueUpdate={fetchInventorySettings}
            />

            {/* 基本统计信息 */}
            <div className="bg-gray-800 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">基本统计</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">总商品数：</span>
                  <span className="font-semibold">{products.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">有库存：</span>
                  <span className="font-semibold text-green-400">
                    {products.filter(p => p.in_stock).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">缺货：</span>
                  <span className="font-semibold text-red-400">
                    {products.filter(p => !p.in_stock).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stripe同步：</span>
                  <span className="font-semibold text-blue-400">
                    {products.filter(p => p.stripe_price_id).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">平均价格：</span>
                  <span className="font-semibold text-purple-400">
                    ${products.length > 0
                      ? (products.reduce((sum, p) => sum + p.price, 0) / products.length / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : '0.00'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === 'gallery' && (
          <div className="max-w-6xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">AI生成的图片库</h2>
                <div className="text-sm text-gray-400">
                  {selectedProduct ? (
                    <span className="text-blue-400">
                      当前选中商品：{selectedProduct.name}（点击图片可应用到该商品）
                    </span>
                  ) : (
                    <span>请先在商品管理页面选择一个商品</span>
                  )}
                </div>
              </div>

              <GeneratedImagesGallery onImageSelect={handleImageSelect} />
            </div>
          </div>
        )}
      </PageLayout>
    </div>
  );
}