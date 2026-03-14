import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { street, city, state, zip, country } = await request.json();

    const apiKey = process.env.GOOGLE_ADDRESS_VALIDATION_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API Key 未配置' }, { status: 500 });
    }

    const body = {
      address: {
        regionCode: country === 'United States' ? 'US' : 
                   country === 'Canada' ? 'CA' : 
                   country === 'United Kingdom' ? 'GB' : 'US', // 可继续扩展
        addressLines: [street],
        locality: city,
        administrativeArea: state || undefined,
        postalCode: zip,
      },
      enableUspsCass: country === 'United States', // USPS 精确验证
    };

    const res = await fetch(
      `https://addressvalidation.googleapis.com/v1:validateAddress?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || '验证失败' }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}