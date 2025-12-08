'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface GeneratedImage {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
  type: 'generated' | 'mock';
}

interface GeneratedImagesGalleryProps {
  onImageSelect?: (imageUrl: string) => void;
}

export default function GeneratedImagesGallery({ onImageSelect }: GeneratedImagesGalleryProps) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchImages = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/generated-images?page=${pageNum}&limit=12`);
      const data = await response.json();

      if (data.success) {
        setImages(data.images);
        setTotalPages(data.pagination.totalPages);
        setPage(data.pagination.page);
      } else {
        setError(data.error || '获取图片失败');
      }
    } catch (err) {
      setError('网络请求失败');
      console.error('获取图片失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-400">加载图片中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">暂无生成的图片</div>
        <p className="text-sm text-gray-500">使用上方工具生成第一张AI图片吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 图片统计 */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-gray-700 rounded p-3">
          <div className="text-2xl font-bold text-blue-400">{images.length}</div>
          <div className="text-xs text-gray-400">总图片数</div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <div className="text-2xl font-bold text-green-400">
            {images.filter(img => img.type === 'generated').length}
          </div>
          <div className="text-xs text-gray-400">AI生成</div>
        </div>
        <div className="bg-gray-700 rounded p-3">
          <div className="text-2xl font-bold text-yellow-400">
            {images.filter(img => img.type === 'mock').length}
          </div>
          <div className="text-xs text-gray-400">模拟图片</div>
        </div>
      </div>

      {/* 图片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.filename}
            className="relative group cursor-pointer bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-200"
            onClick={() => onImageSelect?.(image.url)}
          >
            <div className="aspect-square relative">
              <Image
                src={image.url}
                alt={image.filename}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 text-white text-center p-2">
                  <p className="text-xs">点击选择</p>
                </div>
              </div>
            </div>

            {/* 图片类型标签 */}
            <div className="absolute top-2 right-2">
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  image.type === 'generated'
                    ? 'bg-green-600 text-white'
                    : 'bg-yellow-600 text-white'
                }`}
              >
                {image.type === 'generated' ? 'AI' : 'Mock'}
              </span>
            </div>

            {/* 图片信息 */}
            <div className="p-2">
              <div className="text-xs text-gray-300 truncate" title={image.filename}>
                {image.filename}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatFileSize(image.size)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 pt-4">
          <button
            onClick={() => fetchImages(page - 1)}
            disabled={page <= 1}
            className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="text-gray-400">
            第 {page} 页，共 {totalPages} 页
          </span>
          <button
            onClick={() => fetchImages(page + 1)}
            disabled={page >= totalPages}
            className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}