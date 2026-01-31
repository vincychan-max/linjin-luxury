// app/api/subscribe/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const KLAVIYO_PRIVATE_KEY = process.env.KLAVIYO_API_KEY;
    const KLAVIYO_LIST_ID = process.env.KLAVIYO_LIST_ID;

    if (!KLAVIYO_PRIVATE_KEY || !KLAVIYO_LIST_ID) {
      console.error('Klaviyo 配置缺失');
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    const payload = {
      data: {
        type: 'profile-subscription-bulk-create-job',
        attributes: {
          profiles: {
            data: [
              {
                type: 'profile',
                attributes: {
                  email: email,
                },
              },
            ],
          },
          subscriptions: {
            email: {
              marketing: {
                consent: 'SUBSCRIBED',
              },
            },
          },
        },
        relationships: {
          list: {
            data: {
              type: 'list',
              id: KLAVIYO_LIST_ID,
            },
          },
        },
      },
    };

    const response = await fetch('https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs', {
      method: 'POST',
      headers: {
        Authorization: `Klaviyo-API-Key ${KLAVIYO_PRIVATE_KEY}`,
        revision: '2026-01-15',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errorData = await response.json();
      console.error('Klaviyo 错误:', errorData);
      return NextResponse.json({ error: '订阅失败' }, { status: 500 });
    }
  } catch (err) {
    console.error('服务器错误:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}