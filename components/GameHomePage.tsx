'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DFMBackground from './DFMBackground';

export default function GameHomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    {
      title: "🎮 游戏商店",
      description: "精选游戏道具、皮肤和战斗通行证",
      link: "/shop",
      color: "from-green-600 to-emerald-600"
    },
    {
      title: "👤 用户中心",
      description: "管理账户信息和个人设置",
      link: "/dashboard",
      color: "from-blue-600 to-cyan-600"
    },
    {
      title: "🔐 安全认证",
      description: "快速注册登录，保护账户安全",
      link: "/login",
      color: "from-purple-600 to-pink-600"
    }
  ];

  const gameStats = [
    { label: "在线玩家", value: "125.3K", icon: "👥" },
    { label: "今日新增", value: "8,426", icon: "📈" },
    { label: "商品数量", value: "2,847", icon: "🛍️" },
    { label: "好评率", value: "98.5%", icon: "⭐" }
  ];

  return (
    <DFMBackground>
      {/* 导航栏 */}
      <nav className="absolute top-0 left-0 right-0 z-30 bg-black/20 backdrop-blur-sm border-b border-gray-700/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DF</span>
              </div>
              <span className="text-white font-semibold text-lg">三角洲行动</span>
            </div>

            {/* 桌面导航 */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/shop" className="text-white/80 hover:text-white transition-colors">
                商店
              </Link>
              <Link href="/dashboard" className="text-white/80 hover:text-white transition-colors">
                用户中心
              </Link>
              <Link href="/login" className="text-white/80 hover:text-white transition-colors">
                登录
              </Link>
              <Link
                href="/signup"
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
              >
                注册
              </Link>
            </div>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white/80 hover:text-white"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <div className={`h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <div className={`h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
                <div className={`h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>
          </div>

          {/* 移动端菜单 */}
          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-3">
              <Link href="/shop" className="block text-white/80 hover:text-white transition-colors">
                商店
              </Link>
              <Link href="/dashboard" className="block text-white/80 hover:text-white transition-colors">
                用户中心
              </Link>
              <Link href="/login" className="block text-white/80 hover:text-white transition-colors">
                登录
              </Link>
              <Link
                href="/signup"
                className="block bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 text-center"
              >
                注册
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="text-center space-y-8">
        {/* 欢迎标题 */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
            <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent">
              三角洲行动
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-light">
            极致战术射击体验
          </p>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            加入全球数百万玩家，体验最真实的军事战术射击游戏
          </p>
        </div>

        {/* 游戏数据统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {gameStats.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
            >
              <div className="text-2xl md:text-3xl mb-1">{stat.icon}</div>
              <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 主要功能区 */}
        <div className="grid md:grid-cols-3 gap-6 pt-8">
          {features.map((feature, index) => (
            <Link
              key={index}
              href={feature.link}
              className="group"
            >
              <div className={`bg-gradient-to-r ${feature.color} p-6 rounded-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-white/20`}>
                <div className="text-center">
                  <div className="text-3xl mb-4">🎯</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-white/90 text-sm mb-4">{feature.description}</p>
                  <div className="flex items-center justify-center space-x-2 text-white/90">
                    <span className="text-sm">进入</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 快速开始按钮 */}
        <div className="pt-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/shop"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl"
            >
              🛒 开始购物
            </Link>
            <Link
              href="/signup"
              className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200"
            >
              ✉️ 创建账户
            </Link>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="pt-12 text-gray-400 text-sm">
          <div className="space-y-2">
            <p>🔒 安全支付 • 💎 官方正品 • 🚀 快速交付</p>
            <p>© 2024 三角洲行动. All rights reserved.</p>
          </div>
        </div>
      </div>
    </DFMBackground>
  );
}