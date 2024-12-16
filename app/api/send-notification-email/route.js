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

        await transporter.verify();
        console.log('Transporter verified successfully');

        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: 'Update on Your Request',
            html: `
                <h1>Hello ${firstName},</h1>
                <p>We are working on your request. Our team at Social It Up is dedicated to providing you with the best service possible.</p>
                <p>We'll keep you updated on any progress. If you have any questions, please don't hesitate to reach out.</p>
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

        const info = await transporter.sendMail(mailOptions);
        console.log('Notification email sent successfully:', info.messageId);

        return NextResponse.json(
            { message: 'Notification email sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error sending notification email:', error);
        return NextResponse.json(
            { error: `Notification email sending failed: ${error.message}` },
            { status: 500 }
        );
    }
}

