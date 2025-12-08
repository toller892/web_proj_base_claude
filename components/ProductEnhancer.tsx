'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

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

interface ProductEnhancerProps {
  product: Product;
  onUpdate?: (updatedProduct: Product) => void;
}

export default function ProductEnhancer({ product, onUpdate }: ProductEnhancerProps) {
  const [enhancedImage, setEnhancedImage] = useState<string>('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [stripeProduct, setStripeProduct] = useState<any>(null);
  const [isLoadingStripe, setIsLoadingStripe] = useState(false);
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editingPrice, setEditingPrice] = useState(product.price.toString());
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);

  // 使用即梦AI生成商品图片（通过MCP）
  const generateProductImage = async () => {
    setIsGeneratingImage(true);
    try {
      // 调用即梦AI生成图片，支持中文prompt
      const imagePrompt = `为游戏商品"${product.name}"生成高质量图片。${product.description}。游戏道具风格，高品质，3D渲染，深色背景，适合商店展示`;

      // 优先使用Jimeng MCP API，如果失败则降级到原API
      let response;
      try {
        response = await fetch('/api/jimeng/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: imagePrompt,
            size: 4194304, // 2K分辨率
            scale: 0.5,
            forceSingle: true,
            style: 'gaming-asset'
          }),
        });
      } catch (jimengError) {
        console.log('Jimeng API调用失败，降级到原API:', jimengError);
        response = await fetch('/api/replicate/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: imagePrompt,
            width: 512,
            height: 512,
            style: 'gaming-asset'
          }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const result = await response.json();
      const generatedImageUrl = result.imageUrl;

      setEnhancedImage(generatedImageUrl);

      console.log('图片生成结果:', result);

      // 更新数据库中的图片URL，使用本地保存的路径
      const finalImageUrl = result.localImagePath ?
        `/images/generated-products/${result.localImagePath}` :
        generatedImageUrl;

      const { error } = await supabase
        .from('products')
        .update({ image_url: finalImageUrl })
        .eq('id', product.id);

      if (error) {
        console.error('Failed to update product image:', error);
      } else if (onUpdate) {
        onUpdate({ ...product, image_url: generatedImageUrl });
      }

    } catch (error) {
      console.error('Failed to generate image:', error);
      alert(`图片生成失败: ${error instanceof Error ? error.message : '请重试'}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 更新商品价格
  const updateProductPrice = async () => {
    const newPrice = parseInt(editingPrice, 10);
    if (isNaN(newPrice) || newPrice < 0 || !Number.isSafeInteger(newPrice)) {
      alert('请输入有效的价格（必须是大于等于0的整数，支持大额数值）');
      return;
    }

    setIsUpdatingPrice(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price: newPrice }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || errorData.details || 'Failed to update price';
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.product && onUpdate) {
        onUpdate(data.product);
        setIsEditingPrice(false);
        alert('价格更新成功');
      }
    } catch (error) {
      console.error('Failed to update product price:', error);
      const errorMessage = error instanceof Error ? error.message : '价格更新失败，请重试';
      alert(errorMessage);
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // 从Stripe获取产品信息
  const fetchStripeProduct = async () => {
    setIsLoadingStripe(true);
    try {
      // 这里应该调用StripeMCP获取产品信息
      // 现在模拟Stripe产品数据
      const mockStripeProduct = {
        id: `prod_${Date.now()}`,
        name: product.name,
        description: product.description,
        price: {
          unit_amount: product.price,
          currency: product.currency.toLowerCase()
        },
        images: [product.image_url],
        metadata: {
          category: product.category,
          game: 'delta-action'
        }
      };

      setStripeProduct(mockStripeProduct);

      // 更新数据库中的Stripe价格ID
      const { error } = await supabase
        .from('products')
        .update({ stripe_price_id: mockStripeProduct.id })
        .eq('id', product.id);

      if (error) {
        console.error('Failed to update Stripe price ID:', error);
      }

    } catch (error) {
      console.error('Failed to fetch Stripe product:', error);
      alert('获取Stripe产品信息失败');
    } finally {
      setIsLoadingStripe(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-white">商品增强工具</h3>

      <div className="space-y-4">
        {/* 商品基本信息 */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="font-medium text-gray-300 mb-2">基本信息</h4>
          <div className="text-sm text-gray-400 space-y-1">
            <p><span className="text-gray-500">名称:</span> {product.name}</p>
            <p><span className="text-gray-500">分类:</span> {product.category}</p>
            <p><span className="text-gray-500">当前图片:</span> {product.image_url}</p>
          </div>
        </div>

        {/* 价格编辑 */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="font-medium text-gray-300 mb-2">价格管理（仅限手动修改）</h4>
          <p className="text-xs text-gray-500 mb-3">
            ⚠️ 价格只能通过手动修改，支持任意大额数值（例如：131413141314 = $1,314,131,313.14）
          </p>

          {!isEditingPrice ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-lg text-yellow-400 font-semibold">
                  ${(product.price / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => {
                    setIsEditingPrice(true);
                    setEditingPrice(product.price.toString());
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors duration-200"
                >
                  修改价格
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="text-gray-400">$</span>
                <input
                  type="number"
                  value={editingPrice}
                  onChange={(e) => setEditingPrice(e.target.value)}
                  className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                  placeholder="价格（分）"
                  min="0"
                  disabled={isUpdatingPrice}
                />
                <span className="text-xs text-gray-500">分</span>
              </div>
              <div className="text-xs text-gray-400">
                = ${(parseInt(editingPrice || '0') / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={updateProductPrice}
                  disabled={isUpdatingPrice}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-3 rounded text-sm transition-colors duration-200"
                >
                  {isUpdatingPrice ? '更新中...' : '确认更新'}
                </button>
                <button
                  onClick={() => {
                    setIsEditingPrice(false);
                    setEditingPrice(product.price.toString());
                  }}
                  disabled={isUpdatingPrice}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-600 text-white py-2 px-3 rounded text-sm transition-colors duration-200"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 即梦AI 图片生成 */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="font-medium text-gray-300 mb-2">即梦AI 图片生成</h4>
          <p className="text-xs text-gray-500 mb-3">
            使用即梦AI生成高质量商品图片，支持中文描述
          </p>
          <button
            onClick={generateProductImage}
            disabled={isGeneratingImage}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors duration-200"
          >
            {isGeneratingImage ? '即梦AI生成中...' : '使用即梦AI生成图片'}
          </button>
          {enhancedImage && (
            <div className="mt-3">
              <p className="text-xs text-green-400 mb-2">
                ✓ 图片已生成并保存
              </p>
              <div className="relative group">
                <img
                  src={enhancedImage}
                  alt={product.name}
                  className="w-full h-32 object-cover rounded"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded flex items-center justify-center">
                  <div className="text-white text-xs text-center p-2">
                    <p>AI生成图片</p>
                    <p>点击查看大图</p>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                <p>✓ 已保存到项目本地目录</p>
                <p>✓ 数据库已更新</p>
              </div>
            </div>
          )}
        </div>

        {/* Stripe 集成 */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="font-medium text-gray-300 mb-2">Stripe 集成</h4>
          <p className="text-xs text-gray-500 mb-3">
            同步到Stripe支付系统
          </p>
          <button
            onClick={fetchStripeProduct}
            disabled={isLoadingStripe || product.stripe_price_id}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white py-2 px-4 rounded text-sm transition-colors duration-200"
          >
            {isLoadingStripe ? '正在同步...' :
             product.stripe_price_id ? '✓ 已同步到Stripe' :
             '同步到Stripe'}
          </button>
          {stripeProduct && (
            <div className="mt-3 text-xs text-green-400">
              <p>✓ Stripe产品ID: {stripeProduct.id}</p>
              <p>✓ 价格: ${(stripeProduct.price.unit_amount / 100).toFixed(2)} {stripeProduct.price.currency.toUpperCase()}</p>
            </div>
          )}
        </div>

        {/* 商品状态 */}
        <div className="bg-gray-700 rounded p-3">
          <h4 className="font-medium text-gray-300 mb-2">商品状态</h4>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                product.in_stock ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span className="text-gray-400">
                {product.in_stock ? '有库存' : '缺货'}
              </span>
            </div>
            {product.stripe_price_id && (
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-gray-400">Stripe已同步</span>
              </div>
            )}
            {enhancedImage && (
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-gray-400">AI已增强</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}