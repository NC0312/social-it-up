import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { email, subject } = await req.json();

        console.log('Sending bug notification email to:', email);

        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.error('Missing SMTP configuration');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        await transporter.verify();
        console.log('Transporter verified successfully');

        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: 'Update on Your Bug Report',
            html: `
                <h1>Hello,</h1>
                <p>Thank you for reporting the issue: "${subject}"</p>
                <p>We want to inform you that we have received your bug report and our development team is actively working on resolving it. We appreciate your patience and contribution to improving our service.</p>
                <p>Here's what you can expect:</p>
                <ul>
                    <li>Our team is investigating the issue you reported.</li>
                    <li>We will keep you updated on any significant progress or if we need any additional information.</li>
                    <li>Once the issue is resolved, we will notify you with the details of the fix.</li>
                </ul>
                <p>If you have any additional information or notice any changes related to this bug, please don't hesitate to reply to this email.</p>
                <p>Thank you for your patience and for helping us improve our service.</p>
                <p>Best regards,</p>
                <p>Bug Resolution Team</p>
                <img src="cid:logo" style="width: 79px; height: 70px;"/>
            `,
            attachments: [{
                filename: 'logo.png',
                path: process.cwd() + '/public/logo.png',
                cid: 'logo',
            }]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Bug notification email sent successfully:', info.messageId);

        return NextResponse.json(
            { message: 'Bug notification email sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error sending bug notification email:', error);
        return NextResponse.json(
            { error: `Bug notification email sending failed: ${error.message}` },
            { status: 500 }
        );
    }
}

