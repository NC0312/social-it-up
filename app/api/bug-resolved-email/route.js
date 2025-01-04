import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req) {
    try {
        const { email, subject, timestamp, description } = await req.json();

        console.log('Sending bug resolution email to:', email);

        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.error('Missing SMTP configuration');
            return NextResponse.json(
                { error: 'Server configuration error' },
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

        await transporter.verify();
        console.log('Transporter verified successfully');

        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: 'Your Reported Bug Has Been Resolved',
            html: `
                <h1>Hello,</h1>
                <p>We are pleased to inform you that the bug you reported has been successfully resolved.</p>
                <h2>Bug Details:</h2>
                <ul>
                    <li><strong>Subject:</strong> ${subject}</li>
                    <li><strong>Reported on:</strong> ${new Date(timestamp).toLocaleString()}</li>
                    <li><strong>Description:</strong> ${description}</li>
                </ul>
                <p>Our team has worked diligently to address the issue you reported. The bug has now been fixed and the necessary changes have been implemented.</p>
                <p>We appreciate your patience and thank you for bringing this to our attention. Your feedback is invaluable in helping us improve our service.</p>
                <p>If you have any questions or if you notice any further issues related to this bug, please don't hesitate to contact us.</p>
                <p>Thank you for your continued support and for helping us enhance our product.</p>
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
        console.log('Bug resolution email sent successfully:', info.messageId);

        return NextResponse.json(
            { message: 'Bug resolution email sent successfully' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error sending bug resolution email:', error);
        return NextResponse.json(
            { error: `Bug resolution email sending failed: ${error.message}` },
            { status: 500 }
        );
    }
}