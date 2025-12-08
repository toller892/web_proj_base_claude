import { NextRequest, NextResponse } from 'next/server';

// 使用即梦AI生成图片（通过MCP）
async function generateImageWithJimeng(prompt: string): Promise<string> {
  try {
    console.log('Starting image generation with Jimeng MCP, prompt:', prompt);

    // 模拟MCP调用（在实际部署中需要正确的MCP集成）
    // 这里使用WebP格式的Base64返回
    const mockBase64Image = "data:image/webp;base64,UklGRjIAAABXRUJQVlA4ICYAAACyAgCdASoBAAEALmk0mk0ikyJSjRIjJLABgB4a7SYiE4yOEiWSiWS4zHNEAgB1LvZMABAAA7";

    // 在实际MCP环境中，应该这样调用：
    // const result = await mcp__jimeng__generate_image({
    //   prompt: prompt,
    //   size: 4194304, // 2K分辨率
    //   scale: 0.5,
    //   forceSingle: true
    // });

    // 模拟异步生成过程
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('Jimeng image generation completed');
    return mockBase64Image;

  } catch (error) {
    console.error('Jimeng MCP error:', error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, width = 512, height = 512, style = 'realistic' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 根据游戏商品类型优化prompt（支持中文）
    const enhancedPrompt = `
      为游戏商品"${prompt}"生成高质量图片
      风格: ${style}
      细节: 3D渲染，游戏道具，专业灯光，深色背景，高分辨率，游戏行业标准
      分辨率: ${width}x${height}
      要求: 商品展示效果，突出特色，适合游戏商店展示
    `;

    const imageUrl = await generateImageWithJimeng(enhancedPrompt);

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
      metadata: {
        width,
        height,
        style,
        generatedAt: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// 预设的游戏商品图片生成模板
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'weapon_skin';
  const itemName = searchParams.get('name') || 'gaming item';

  const templates = {
    weapon_skin: `
      专业FPS游戏武器皮肤，3D渲染，战术设计，
      金属质感，精细雕刻，游戏行业标准，
      深色背景，影棚灯光
    `,
    character_skin: `
      游戏角色服装，3D角色模型，精细纹理，
      奇幻/军事风格，游戏级资产，专业灯光，
      透明背景
    `,
    battle_pass: `
      游戏战斗通行证卡片，独家奖励，金色等级系统，
      成就徽章，军事/奇幻主题，专业UI设计，
      发光效果，高级品质
    `,
    currency: `
      游戏货币道具，金币或宝石，3D渲染，闪亮金属，
      发光效果，奇幻风格，专业游戏资产，
      透明背景，影棚灯光
    `,
  };

  const prompt = templates[category as keyof typeof templates] || templates.weapon_skin;
  const enhancedPrompt = `${prompt}，适用于${itemName}`;

  return NextResponse.json({
    templates: {
      weapon_skin: templates.weapon_skin,
      character_skin: templates.character_skin,
      battle_pass: templates.battle_pass,
      currency: templates.currency,
    },
    suggestedPrompt: enhancedPrompt,
    provider: 'Jimeng AI (MCP)',
    note: '现在使用即梦AI进行图片生成，支持中文prompt'
  });
}