import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dns from 'dns';
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

        // 3. Check domain existence with DNS lookup
        try {
            await dnsLookup(domain);
            console.log(`Domain exists: ${domain}`);
        } catch (lookupError) {
            console.error(`Domain does not exist: ${domain}`, lookupError);
            return NextResponse.json(
                { error: 'Email domain does not exist', type: 'nonexistent_domain' },
                { status: 400 }
            );
        }

        // 4. Check MX records to ensure domain can receive email
        try {
            const mxRecords = await resolveMx(domain);
            if (!mxRecords || mxRecords.length === 0) {
                console.log(`No MX records found for domain: ${domain}`);
                return NextResponse.json(
                    { error: 'Email domain cannot receive mail', type: 'no_mx_records' },
                    { status: 400 }
                );
            }
            console.log(`Valid MX records found for domain: ${domain}`);
        } catch (mxError) {
            console.error(`Failed to resolve MX records for ${domain}:`, mxError);
            return NextResponse.json(
                { error: 'Email domain cannot receive mail', type: 'mx_lookup_failed' },
                { status: 400 }
            );
        }

        // 5. Set up SMTP verification
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.error('Missing SMTP configuration');
            return NextResponse.json(
                { error: 'Server configuration error', type: 'server_config_error' },
                { status: 500 }
            );
        }

        // 6. Create SMTP transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // 7. Verify SMTP connection
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

        // 8. Perform SMTP recipient verification (if available)
        // Note: Some SMTP servers support recipient verification without sending
        // This is an advanced feature but not all providers support it

        // 9. Use callback verification as our final step
        // Send a small test email to verify deliverability
        const testMailOptions = {
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
            }]
        };

        try {
            // Attempt to send the email
            const info = await transporter.sendMail(testMailOptions);
            console.log('Verification email sent successfully:', info.messageId);

            // If we get here, the email was accepted by the receiving mail server
            return NextResponse.json(
                { message: 'Email verified successfully', success: true },
                { status: 200 }
            );
        } catch (sendError) {
            console.error('Error sending verification email:', sendError);

            // Parse error message for specific issues
            const errorMsg = sendError.message.toLowerCase();

            // Check for specific recipient errors
            if (errorMsg.includes('invalid recipient') ||
                errorMsg.includes('no such user') ||
                errorMsg.includes('mailbox unavailable') ||
                errorMsg.includes('recipient address rejected') ||
                errorMsg.includes('user unknown') ||
                errorMsg.includes('does not exist') ||
                errorMsg.includes('invalid mailbox') ||
                errorMsg.includes('recipient not found')) {

                return NextResponse.json(
                    { error: 'This email address does not exist or cannot receive mail', type: 'invalid_recipient' },
                    { status: 400 }
                );
            }

            // Check for connection errors
            if (sendError.code === 'ECONNECTION' ||
                sendError.code === 'ETIMEDOUT' ||
                errorMsg.includes('connection') ||
                errorMsg.includes('timeout')) {

                return NextResponse.json(
                    { error: 'Connection to mail server failed, cannot verify email', type: 'connection_error' },
                    { status: 500 }
                );
            }

            // General error case
            return NextResponse.json(
                { error: 'Email verification failed - the address may not exist', type: 'send_error' },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error('Error in verification process:', error);
        return NextResponse.json(
            { error: 'Email verification process failed', type: 'general_error' },
            { status: 500 }
        );
    }
}