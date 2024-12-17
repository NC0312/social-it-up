import { NextResponse } from 'next/server';

export async function POST(req) {
  console.log('Received reCAPTCHA verification request');
  try {
    const { recaptchaValue } = await req.json();
    console.log('Received reCAPTCHA value:', recaptchaValue);

    if (!recaptchaValue) {
      console.error('reCAPTCHA value is missing');
      return NextResponse.json({ error: 'reCAPTCHA value is required' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('RECAPTCHA_SECRET_KEY is not set in environment variables');
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }

    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaValue}`;

    console.log('Sending verification request to Google');
    const recaptchaRes = await fetch(verificationURL, { method: 'POST' });
    const recaptchaData = await recaptchaRes.json();
    console.log('Google reCAPTCHA response:', recaptchaData);

    if (recaptchaData.success) {
      console.log('reCAPTCHA verification successful');
      return NextResponse.json({ success: true });
    } else {
      console.error('reCAPTCHA verification failed:', recaptchaData['error-codes']);
      return NextResponse.json({ error: 'reCAPTCHA verification failed', details: recaptchaData['error-codes'] }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return NextResponse.json({ error: 'Failed to verify reCAPTCHA' }, { status: 500 });
  }
}

