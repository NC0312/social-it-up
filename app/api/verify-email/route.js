import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { email, firstName } = await req.json();

        console.log('Sending notification email to:', email);

        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.error('Missing SMTP configuration');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay

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
            console.log('Transporter verified successfully');
        } catch (verifyError) {
            console.error('Transporter verification failed:', verifyError);
            return NextResponse.json(
                { error: 'Email service unavailable', type: 'server_error' },
                { status: 500 }
            );
        }

        // Validate email format first
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format', type: 'invalid_email' },
                { status: 400 }
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
            }]
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Notification email sent successfully:', info.messageId);

            return NextResponse.json(
                { message: 'Notification email sent successfully' },
                { status: 200 }
            );
        } catch (sendError) {
            console.error('Error sending email:', sendError);

            // Check if this is due to an invalid recipient
            if (sendError.message.includes('Invalid recipient') ||
                sendError.message.includes('no such user') ||
                sendError.message.includes('mailbox unavailable')) {
                return NextResponse.json(
                    { error: 'The email address appears to be invalid or non-existent', type: 'invalid_recipient' },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { error: `Email sending failed: ${sendError.message}`, type: 'send_error' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error in verification process:', error);
        return NextResponse.json(
            { error: `Verification process failed: ${error.message}`, type: 'general_error' },
            { status: 500 }
        );
    }
}