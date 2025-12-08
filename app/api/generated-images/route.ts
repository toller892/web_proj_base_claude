import { NextRequest, NextResponse } from 'next/server';
import { readdir, stat } from 'fs/promises';
import { join } from 'path';

// 获取已生成的AI图片列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const generatedProductsDir = join(process.cwd(), 'public', 'images', 'generated-products');

    try {
      const files = await readdir(generatedProductsDir);

      // 过滤图片文件
      const imageFiles = files.filter(file => {
        const ext = file.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '');
      });

      // 获取文件信息
      const imageInfos = await Promise.all(
        imageFiles.map(async (file) => {
          const filePath = join(generatedProductsDir, file);
          const stats = await stat(filePath);

          return {
            filename: file,
            url: `/images/generated-products/${file}`,
            size: stats.size,
            createdAt: stats.birthtime.toISOString(),
            modifiedAt: stats.mtime.toISOString(),
            type: file.startsWith('mock_') ? 'mock' : 'generated'
          };
        })
      );

      // 按创建时间排序（最新的在前）
      imageInfos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // 分页
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedImages = imageInfos.slice(startIndex, endIndex);

      return NextResponse.json({
        success: true,
        images: paginatedImages,
        pagination: {
          page,
          limit,
          total: imageInfos.length,
          totalPages: Math.ceil(imageInfos.length / limit)
        },
        stats: {
          totalImages: imageInfos.length,
          generatedImages: imageInfos.filter(img => img.type === 'generated').length,
          mockImages: imageInfos.filter(img => img.type === 'mock').length
        }
      });

    } catch (dirError) {
      // 目录不存在
      return NextResponse.json({
        success: true,
        images: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0
        },
        stats: {
          totalImages: 0,
          generatedImages: 0,
          mockImages: 0
        }
      });
    }

  } catch (error) {
    console.error('获取生成图片列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch generated images',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}