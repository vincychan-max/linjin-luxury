import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 这里的 phone 虽然不传给 Google，但解构出来可以防止它混入 ...rest 数据中
    const { street, city, state, zip, country } = await request.json();

    const apiKey = process.env.GOOGLE_ADDRESS_VALIDATION_API_KEY;
    if (!apiKey) {
      console.error("CRITICAL: GOOGLE_ADDRESS_VALIDATION_API_KEY is missing");
      return NextResponse.json({ error: 'System configuration error' }, { status: 500 });
    }

    // 🌟 1. 映射表保持现状，已经涵盖了你的核心出海市场
    const countryMap: Record<string, string> = {
      'United States': 'US',
      'USA': 'US',
      'Canada': 'CA',
      'United Kingdom': 'GB',
      'Singapore': 'SG',
      'Vietnam': 'VN',
      'Thailand': 'TH'
    };

    const regionCode = countryMap[country] || 'US';

    // 🌟 2. 容错处理：确保 addressLines 不为空数组
    const addressLines = street ? [street] : [];
    if (addressLines.length === 0) {
      return NextResponse.json({ error: 'Street address is required' }, { status: 400 });
    }

    const body = {
      address: {
        regionCode,
        addressLines,
        locality: city,
        administrativeArea: state || undefined,
        postalCode: zip,
      },
      enableUspsCass: regionCode === 'US',
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
      return NextResponse.json({ 
        error: data.error?.message || 'Address validation service unavailable' 
      }, { status: res.status });
    }

    // 🌟 3. 逻辑判断加固
    const verdict = data.result?.verdict;
    
    // 只有当地址完全匹配且没有“无法确认的组件”时，才视为高度可信
    // 这对于跨境物流（尤其是昂贵的奢侈品包袋发货）非常重要
    const isDeliverable = 
      verdict?.addressComplete && 
      !verdict?.hasUnconfirmedComponents && 
      verdict?.validationGranularity === 'PREMISE'; // 确保精确到房屋/门牌号

    return NextResponse.json({
      ...data,
      isDeliverable,
      // 额外返回一个标准化建议，前端可以提示：“您是指这个地址吗？”
      formattedAddress: data.result?.address?.formattedAddress || ''
    });

  } catch (error) {
    console.error('Validation API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}