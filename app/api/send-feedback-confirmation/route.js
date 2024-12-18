import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import path from 'path';

export async function POST(req) {
    try {
        // Log the incoming request
        console.log('Received feedback confirmation request');

        // Parse the request body
        const { email } = await req.json();

        // Log the parsed data
        console.log('Email:', email);

        // Verify environment variables
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.error('Missing SMTP configuration');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Create transporter with logging
        console.log('Creating transporter with host:', process.env.SMTP_HOST);
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_PORT === '465',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });

        // Verify transporter
        await transporter.verify();
        console.log('Transporter verified successfully');

        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: 'Thank you for your feedback',
            html: `
        <h1>Thank you for your feedback!</h1>
        <p>We have received your feedback and will address it as soon as possible.</p>
        <p>We appreciate your input in helping us improve our services.</p>
        <p>Best regards,</p>
        <img src="cid:logo" style="width: 79px; height: 70px;"/>
  `,
            attachments: [{
                filename: 'logo.png',
                path: path.join(process.cwd(), 'public', 'logo.png'),
                cid: 'logo',
            }]
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Feedback confirmation email sent successfully:', info.messageId);
            return NextResponse.json(
                { message: 'Feedback confirmation email sent successfully' },
                { status: 200 }
            );
        } catch (emailError) {
            console.error('Error sending feedback confirmation email:', emailError);
            return NextResponse.json(
                { error: `Email sending failed: ${emailError.message}` },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('API route error:', error);
        return NextResponse.json(
            { error: `Server error: ${error.message}` },
            { status: 500 }
        );
    }
}

