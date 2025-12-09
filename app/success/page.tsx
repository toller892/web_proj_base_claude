'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import PageLayout from '@/components/PageLayout';

function SuccessContent() {
  const [loading, setLoading] = useState(true);
  const [orderInfo, setOrderInfo] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      setOrderInfo({
        sessionId,
        message: '支付成功！感谢您的购买。'
      });
    }
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[600px]">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-green-400">支付成功！</h1>
          <p className="text-gray-300 mb-6">
            恭喜您成功购买了三角洲行动大红商品！商品将自动添加到您的游戏账户中。
          </p>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">订单详情</h2>
          <div className="space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-400">订单状态：</span>
              <span className="text-green-400 font-semibold">已完成</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">交易ID：</span>
              <span className="text-sm">{orderInfo?.sessionId?.slice(0, 20)}...</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">预计到账：</span>
              <span>5-10分钟内</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => router.push('/shop')}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            继续购物
          </button>
          <button
            onClick={() => window.location.href = 'https://delta-game.com'}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            返回游戏
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold mb-2 text-yellow-400">温馨提示</h3>
          <ul className="text-xs text-gray-400 space-y-1 text-left">
            <li>• 商品道具将自动发放到您的游戏账户</li>
            <li>• 如遇问题，请联系客服邮箱：support@delta-game.com</li>
            <li>• 购买记录可在游戏内"我的购买"中查看</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <PageLayout
        title="支付成功"
        description="您的购买已成功完成"
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
            name: '支付成功',
            icon: (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ]}
      >
        <Suspense fallback={<div className="text-center py-20">加载中...</div>}>
          <SuccessContent />
        </Suspense>
      </PageLayout>
    </div>
  );
}
