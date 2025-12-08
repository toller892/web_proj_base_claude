'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUploaded: (imageUrl: string) => void;
  className?: string;
}

export default function ImageUpload({
  currentImageUrl,
  onImageUploaded,
  className = ''
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(currentImageUrl || '');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('不支持的文件格式，请选择 JPEG、PNG、WebP 或 GIF 图片');
      return;
    }

    // 检查文件大小 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('文件太大，请选择小于 5MB 的图片');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 上传文件
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onImageUploaded(result.fileUrl);
        setPreviewUrl(result.fileUrl);
      } else {
        setError(result.error || '上传失败，请重试');
        // 恢复之前的预览
        setPreviewUrl(currentImageUrl || '');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('上传失败，请检查网络连接');
      setPreviewUrl(currentImageUrl || '');
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative group">
        {previewUrl ? (
          <div className="relative aspect-video bg-gray-700 rounded-lg overflow-hidden">
            <Image
              src={previewUrl}
              alt="Product preview"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                <button
                  onClick={handleClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                  disabled={uploading}
                >
                  {uploading ? (
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={handleRemoveImage}
                  className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
                  disabled={uploading}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={handleClick}
            className="aspect-video bg-gray-700 rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-500 transition-colors duration-200 flex flex-col items-center justify-center cursor-pointer"
          >
            {uploading ? (
              <>
                <svg className="animate-spin h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-400 text-sm">上传中...</p>
              </>
            ) : (
              <>
                <svg className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-gray-400 text-sm text-center">点击上传图片</p>
                <p className="text-gray-500 text-xs">支持 JPEG、PNG、WebP、GIF (最大 5MB)</p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-900 border border-red-700 text-red-200 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}