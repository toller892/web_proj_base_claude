import React from 'react';
import Breadcrumb from './Breadcrumb';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: string;
  showBreadcrumb?: boolean;
  breadcrumbItems?: Array<{
    name: string;
    href?: string;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export default function PageLayout({
  children,
  title,
  description,
  showBreadcrumb = true,
  breadcrumbItems,
  className = '',
}: PageLayoutProps) {
  return (
    <div className={`container mx-auto px-4 py-6 ${className}`}>
      {/* 页面头部 */}
      {(title || description || showBreadcrumb) && (
        <div className="mb-6">
          {/* 面包屑导航 */}
          {showBreadcrumb && (
            <div className="relative mb-4">
              <Breadcrumb items={breadcrumbItems} />
            </div>
          )}

          {/* 页面标题和描述 */}
          {title && (
            <div className="mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {title}
              </h1>
              {description && (
                <p className="text-gray-400 mt-2 text-sm sm:text-base">
                  {description}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 页面内容 */}
      {children}
    </div>
  );
}