import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import dns from 'dns';
import axios from 'axios';
import { promisify } from 'util';
import { db } from '../../lib/firebase'; // Adjust path to your Firebase config
import { collection, addDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

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

        const apiKey = "4908262b109a40a3924683e141e4e767";
        let abstractResponse;
        try {
            abstractResponse = await axios.get(
                `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${email}`
            );
            console.log(`AbstractAPI response for ${email}:`, abstractResponse.data);

            const { is_valid_format, is_smtp_valid, is_disposable_email, deliverability } = abstractResponse.data;

            if (!is_valid_format.value || is_disposable_email.value) {
                console.log(`Email ${email} rejected: invalid format or disposable`);
                return NextResponse.json(
                    { error: 'Invalid or disposable email address', type: 'invalid_email' },
                    { status: 400 }
                );
            }

            if (!is_smtp_valid.value || deliverability !== 'DELIVERABLE') {
                console.log(`Email ${email} rejected: SMTP invalid or undeliverable`);
                return NextResponse.json(
                    { error: 'Email address does not exist or is undeliverable', type: 'undeliverable' },
                    { status: 400 }
                );
            }

            console.log(`Email ${email} passed AbstractAPI validation`);
        } catch (apiError) {
            console.error('AbstractAPI request failed:', apiError.message);
            return NextResponse.json(
                { error: 'Email validation service unavailable', type: 'api_error', details: apiError.message },
                { status: 500 }
            );
        }

        // 6. Generate verification token and store in Firebase
        const token = uuidv4();
        const verificationData = {
            email,
            token,
            createdAt: new Date().toISOString(),
            used: false,
        };

        try {
            await addDoc(collection(db, 'emailVerifications'), verificationData);
            console.log(`Verification token stored for ${email}: ${token}`);
        } catch (firebaseError) {
            console.error('Failed to store verification token:', firebaseError);
            return NextResponse.json(
                { error: 'Failed to process verification', type: 'firebase_error', details: firebaseError.message },
                { status: 500 }
            );
        }

        // 7. SMTP configuration check
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

        // 8. Send verification email with link
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
                { error: 'Email service unavailable', type: 'smtp_error', details: verifyError.message },
                { status: 500 }
            );
        }

        const verificationLink = `http://localhost:3000/api/verify-token?token=${token}`; // Replace with your domain in production
        const mailOptions = {
            from: process.env.SMTP_FROM_EMAIL,
            to: email,
            subject: 'Verify Your Email - Social It Up',
            html: `
                <h1>Hello ${firstName},</h1>
                <p>Please verify your email by clicking the link below:</p>
                <a href="${verificationLink}" style="display: inline-block; padding: 10px 20px; background-color: #36302A; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>If you didn’t request this, please ignore this email.</p>
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
                { message: 'Verification email sent. Please check your inbox to confirm.', success: true },
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