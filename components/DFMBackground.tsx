'use client';

import React, { useState, useEffect } from 'react';

interface DFMBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export default function DFMBackground({ children, className = '' }: DFMBackgroundProps) {
  const [deviceType, setDeviceType] = useState<'pc' | 'tablet' | 'mobile'>('pc');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const detectDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('pc');
      }
    };

    // 初始检测
    detectDeviceType();

    // 监听窗口大小变化
    const handleResize = () => {
      detectDeviceType();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getSloganImage = () => {
    switch (deviceType) {
      case 'mobile':
        return '/images/dfm-background/slogan-mobile.png';
      case 'tablet':
        return '/images/dfm-background/slogan-tablet.png';
      default:
        return '/images/dfm-background/slogan-pc.png';
    }
  };

  return (
    <div className={`relative min-h-screen w-full overflow-hidden ${className}`}>
      {/* 背景层 */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* 游戏风格背景纹理 */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${getSloganImage()})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>

        {/* 添加一些视觉效果 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
        <div className="absolute inset-0">
          {/* 网格纹理效果 */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .1) 25%, rgba(255, 255, 255, .1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .1) 75%, rgba(255, 255, 255, .1) 76%, transparent 77%, transparent),
                linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .1) 25%, rgba(255, 255, 255, .1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .1) 75%, rgba(255, 255, 255, .1) 76%, transparent 77%, transparent)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      </div>

      {/* Logo/标语覆盖层 */}
      <div className="absolute top-0 left-0 right-0 p-4 md:p-8 lg:p-12 pointer-events-none">
        <div className="relative z-10">
          <img
            src={getSloganImage()}
            alt="Delta Force Mobile"
            className={`slogan_img max-w-full h-auto transition-opacity duration-500 ${
              imageLoaded ? 'opacity-90' : 'opacity-0'
            } ${
              deviceType === 'mobile' ? 'max-h-24' :
              deviceType === 'tablet' ? 'max-h-32' :
              'max-h-48'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </div>

      {/* 内容层 */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-4 pt-20 md:pt-32 lg:pt-48">
        {/* 半透明背景容器 */}
        <div className="bg-black/60 backdrop-blur-md rounded-lg p-6 md:p-8 lg:p-12 max-w-4xl w-full border border-gray-700/50 shadow-2xl">
          {children}
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <div className="absolute bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30" />
    </div>
  );
}