import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dns from 'dns';
import axios from 'axios';
import { promisify } from 'util';

// Promisify DNS methods
const resolveMx = promisify(dns.resolveMx);
const dnsLookup = promisify(dns.lookup);

export async function POST(req) {
    try {
        const { email, firstName } = await req.json();
        console.log('Validating email:', email);

        // 1. Basic format validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format', type: 'invalid_format' },
                { status: 400 }
            );
        }

        // 2. Extract domain
        const domain = email.split('@')[1].toLowerCase();
        console.log('Extracted domain:', domain);

        // 3. Check domain existence with DNS lookup
        try {
            const lookupResult = await dnsLookup(domain);
            console.log(`DNS lookup successful for ${domain}:`, lookupResult);
        } catch (lookupError) {
            console.error(`DNS lookup failed for ${domain}:`, lookupError);
            return NextResponse.json(
                { error: 'Email domain does not exist', type: 'nonexistent_domain' },
                { status: 400 }
            );
        }

        // 4. Check MX records
        try {
            const mxRecords = await resolveMx(domain);
            if (!mxRecords || mxRecords.length === 0) {
                console.log(`No MX records found for ${domain}`);
                return NextResponse.json(
                    { error: 'Email domain cannot receive mail', type: 'no_mx_records' },
                    { status: 400 }
                );
            }
            console.log(`MX records for ${domain}:`, mxRecords);
        } catch (mxError) {
            console.error(`MX lookup failed for ${domain}:`, mxError);
            return NextResponse.json(
                { error: 'Email domain cannot receive mail', type: 'mx_lookup_failed' },
                { status: 400 }
            );
        }

        const zeroBounceApiKey = process.env.ZEROBOUNCE_API_KEY;
        if (!zeroBounceApiKey) {
            console.error('ZeroBounce API key is required for accurate email verification');
            return NextResponse.json(
                { error: 'Server configuration error: Email verification service not configured', type: 'server_config_error' },
                { status: 500 }
            );
        }

        try {
            const response = await axios.get(
                `https://api.zerobounce.net/v2/validate?api_key=${zeroBounceApiKey}&email=${email}`
            );
            const { status, sub_status } = response.data;
            console.log(`ZeroBounce result for ${email}:`, { status, sub_status });

            if (status === 'invalid' || sub_status === 'mailbox_not_found' || sub_status === 'no_connect') {
                console.log(`Email ${email} rejected by ZeroBounce as non-existent`);
                return NextResponse.json(
                    { error: 'This email address does not exist', type: 'invalid_recipient' },
                    { status: 400 }
                );
            }

            if (status !== 'valid') {
                console.log(`Uncertain email status for ${email}: ${status}, sub_status: ${sub_status}`);
                return NextResponse.json(
                    { error: 'Email verification uncertain, please try again', type: 'uncertain_status' },
                    { status: 400 }
                );
            }

            console.log(`Email ${email} confirmed valid by ZeroBounce`);
        } catch (zeroBounceError) {
            console.error('ZeroBounce verification failed:', zeroBounceError.message);
            return NextResponse.json(
                { error: 'Email verification service unavailable', type: 'verification_service_error' },
                { status: 500 }
            );
        }

        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD || !process.env.SMTP_FROM_EMAIL) {
            console.error('Missing SMTP configuration:', {
                host: process.env.SMTP_HOST,
                user: process.env.SMTP_USER,
                from: process.env.SMTP_FROM_EMAIL,
            });
            return NextResponse.json(
                { error: 'Server configuration error', type: 'server_config_error' },
                { status: 500 }
            );
        }

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        try {
            await transporter.verify();
            console.log('SMTP connection verified successfully');
        } catch (verifyError) {
            console.error('SMTP connection verification failed:', verifyError);
            return NextResponse.json(
                { error: 'Email service unavailable', type: 'smtp_error' },
                { status: 500 }
            );
        }

        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: 'Email Verification',
            html: `
                <h1>Hello ${firstName},</h1>
                <p>Your email is verified successfully.</p>
                <p>Best regards,</p>
                <p>Team Social It Up</p>
                <img src="cid:logo" style="width: 79px; height: 70px;"/>
            `,
            attachments: [{
                filename: 'logo.png',
                path: process.cwd() + '/public/logo.png',
                cid: 'logo',
            }],
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Verification email sent successfully:', info.messageId);
            console.log('SMTP response:', info.response);

            return NextResponse.json(
                { message: 'Email verified successfully', success: true },
                { status: 200 }
            );
        } catch (sendError) {
            console.error('Error sending verification email:', sendError);
            return NextResponse.json(
                { error: 'Failed to send verification email', type: 'send_error', details: sendError.message },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in verification process:', error);
        return NextResponse.json(
            { error: 'Email verification process failed', type: 'general_error', details: error.message },
            { status: 500 }
        );
    }
}