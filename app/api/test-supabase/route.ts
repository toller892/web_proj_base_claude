import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // 测试基本连接
    console.log('Supabase client created:', typeof supabase);
    console.log('Supabase from method:', typeof supabase.from);

    // 测试简单查询
    const { data, error } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase query error:', error);
      return Response.json({
        error: 'Supabase query failed',
        details: error.message
      }, { status: 500 });
    }

    console.log('Supabase query success:', data);

    return Response.json({
      success: true,
      message: 'Supabase connection working',
      data: data
    });

  } catch (error) {
    console.error('Supabase connection error:', error);
    return Response.json({
      error: 'Supabase connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}