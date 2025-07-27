import { NextRequest, NextResponse } from 'next/server';
import { RECAPTCHA_SECRET_KEY } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'ReCAPTCHA token is required' },
        { status: 400 }
      );
    }

    if (!RECAPTCHA_SECRET_KEY.value) {
      console.warn('ReCAPTCHA secret key not configured');
      return NextResponse.json({ success: true });
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${RECAPTCHA_SECRET_KEY.value}&response=${token}`,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: data.success,
      score: data.score,
      action: data.action,
      hostname: data.hostname,
      challenge_ts: data.challenge_ts,
      error_codes: data['error-codes']
    });

  } catch (error) {
    console.error('ReCAPTCHA verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Verification failed' },
      { status: 500 }
    );
  }
}
