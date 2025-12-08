'use client';

import React from 'react';

interface ShopBackgroundProps {
  children: React.ReactNode;
  title?: React.ReactNode;
}

export default function ShopBackground({ children, title }: ShopBackgroundProps) {
  return (
    <div className="relative min-h-screen w-full">
      {/* 背景层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* 背景图片层 */}
        <div className="absolute inset-0 opacity-15">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/images/dfm-background/slogan-pc.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              filter: 'blur(1px)'
            }}
          />
        </div>

        {/* 渐变覆盖层 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50" />

        {/* 网格纹理 */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .1) 25%, rgba(255, 255, 255, .1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .1) 75%, rgba(255, 255, 255, .1) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .1) 25%, rgba(255, 255, 255, .1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .1) 75%, rgba(255, 255, 255, .1) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* 内容层 */}
      <div className="relative z-10">
        {/* 页面标题区域 */}
        {title && (
          <div className="bg-black/40 backdrop-blur-sm border-b border-gray-700/30">
            <div className="container mx-auto px-4 py-6">
              <div className="text-center">
                {title}
              </div>
            </div>
          </div>
        )}

        {/* 主要内容 */}
        <div className="relative">
          {children}
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-30" />
    </div>
  );
}