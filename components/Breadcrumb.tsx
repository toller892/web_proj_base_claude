'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  name: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbProps {
  className?: string;
  items?: BreadcrumbItem[];
}

const pageNames: Record<string, string> = {
  '/': '首页',
  '/shop': '商店',
  '/admin': '管理后台',
  '/dashboard': '用户中心',
  '/login': '登录',
  '/signup': '注册',
  '/success': '支付成功',
};

const pageIcons: Record<string, React.ReactNode> = {
  '/': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  '/shop': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  '/admin': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  '/dashboard': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  '/login': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  ),
  '/signup': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  ),
  '/success': (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export default function Breadcrumb({ className = '', items: customItems }: BreadcrumbProps) {
  const pathname = usePathname();

  // 如果有自定义面包屑项目，使用自定义的
  if (customItems) {
    return <BreadcrumbRenderer items={customItems} className={className} />;
  }

  // 否则根据路径自动生成面包屑
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    {
      name: '首页',
      href: '/',
      icon: pageIcons['/'],
    },
  ];

  // 构建路径层级
  let currentPath = '';
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === pathSegments.length - 1;

    // 获取页面名称
    const pageName = pageNames[currentPath] || segment.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    breadcrumbs.push({
      name: pageName,
      href: isLast ? undefined : currentPath,
      icon: pageIcons[currentPath],
    });
  });

  return <BreadcrumbRenderer items={breadcrumbs} className={className} />;
}

function BreadcrumbRenderer({ items, className }: { items: BreadcrumbItem[], className: string }) {
  if (items.length <= 1) return null; // 只有首页时不显示面包屑

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-r from-gray-800/50 to-gray-900/50 backdrop-blur-sm" />

      {/* 面包屑内容 */}
      <div className="relative z-10 flex items-center space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <div key={index} className="flex items-center space-x-2">
              {index > 0 && (
                <svg
                  className="w-4 h-4 text-gray-500 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}

              {item.href ? (
                <Link
                  href={item.href}
                  className="flex items-center space-x-1 text-gray-400 hover:text-white transition-colors duration-200 group"
                >
                  {item.icon && (
                    <span className="opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                      {item.icon}
                    </span>
                  )}
                  <span className="truncate max-w-[120px] sm:max-w-none">{item.name}</span>
                </Link>
              ) : (
                <div className="flex items-center space-x-1 text-white font-medium">
                  {item.icon && <span>{item.icon}</span>}
                  <span className="truncate max-w-[120px] sm:max-w-none">{item.name}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
}