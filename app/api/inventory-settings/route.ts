import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// 获取库存设置
export async function GET() {
  try {
    const supabase = await createClient();

    // 尝试获取设置，如果表不存在则使用默认值
    let settingsObject: Record<string, string> = {
      total_inventory_value: '0',
      use_manual_total_value: 'false'
    };

    try {
      const { data: settings, error } = await supabase
        .from('inventory_settings')
        .select('*')
        .in('setting_name', ['total_inventory_value', 'use_manual_total_value']);

      if (!error && settings) {
        settings.forEach(setting => {
          settingsObject[setting.setting_name] = setting.setting_value;
        });
      }
    } catch (tableError) {
      console.log('inventory_settings表不存在，使用默认设置');
    }

    // 计算自动总价值
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('price')
      .eq('in_stock', true);

    if (productsError) {
      console.error('Error fetching products:', productsError);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    const calculatedTotalValue = products?.reduce((sum, product) => {
      const price = product.price || 0;
      return sum + price;
    }, 0) || 0;

    const displayTotalValue = settingsObject.use_manual_total_value === 'true'
      ? parseInt(settingsObject.total_inventory_value) || 0
      : calculatedTotalValue;

    return NextResponse.json({
      settings: settingsObject,
      calculatedTotalValue,
      displayTotalValue
    });

  } catch (error) {
    console.error('Error in inventory settings GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 更新库存设置
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { settingName, settingValue } = await request.json();

    if (!settingName || settingValue === undefined) {
      return NextResponse.json(
        { error: 'Setting name and value are required' },
        { status: 400 }
      );
    }

    // 验证设置名称
    const allowedSettings = ['total_inventory_value', 'use_manual_total_value'];
    if (!allowedSettings.includes(settingName)) {
      return NextResponse.json(
        { error: 'Invalid setting name' },
        { status: 400 }
      );
    }

    // 验证数值设置
    if (settingName === 'total_inventory_value') {
      const numValue = parseInt(settingValue);
      if (isNaN(numValue) || numValue < 0) {
        return NextResponse.json(
          { error: 'Total inventory value must be a non-negative integer' },
          { status: 400 }
        );
      }
    }

    if (settingName === 'use_manual_total_value') {
      if (settingValue !== 'true' && settingValue !== 'false') {
        return NextResponse.json(
          { error: 'Use manual total value must be true or false' },
          { status: 400 }
        );
      }
    }

    // 更新设置
    const { data, error } = await supabase
      .from('inventory_settings')
      .upsert({
        setting_name: settingName,
        setting_value: settingValue.toString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory setting:', error);
      return NextResponse.json(
        { error: 'Failed to update inventory setting' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      setting: data
    });

  } catch (error) {
    console.error('Error in inventory settings POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}