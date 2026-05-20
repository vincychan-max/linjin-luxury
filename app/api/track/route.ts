import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. 解析前端发送的埋点数据
    const body = await req.json();
    
    // 2. 验证数据（可选）
    if (!body.event) {
      return NextResponse.json({ error: 'Event name is required' }, { status: 400 });
    }

    // 3. 在服务器控制台打印埋点数据（方便调试）
    console.log(`[Analytics Event]: ${body.event}`, {
      url: body.url,
      timestamp: new Date(body.timestamp).toISOString(),
      data: body
    });

    // 4. TODO: 这里可以集成你的业务逻辑
    // 例如：将数据写入 Supabase
    // const { data, error } = await supabase.from('analytics').insert([body]);
    
    // 5. 返回成功响应
    return NextResponse.json({ success: true, received: body.event }, { status: 200 });

  } catch (error) {
    console.error('Track API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}