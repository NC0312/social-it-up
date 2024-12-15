import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        // Log the incoming request
        console.log('Received email request');

        // Parse the request body
        const { email, firstName } = await req.json();

        // Log the parsed data
        console.log('Email:', email);
        console.log('First Name:', firstName);

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
            subject: 'Thank you for your request',
            html: `
        <h1>Thank you for your request, ${firstName}!</h1>
        <p>We have received your message and will get back to you shortly.</p>
        <p>Best regards,</p>
           <img src="cid:logo" style="width: 79px; height: 70px;"/>
  `,
            attachments: [{
                filename: 'logo.png',
                path: './logo.png',
                cid: 'logo' ,
            }]
        };


        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', info.messageId);
            return NextResponse.json(
                { message: 'Confirmation email sent successfully' },
                { status: 200 }
            );
        } catch (emailError) {
            console.error('Error sending email:', emailError);
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