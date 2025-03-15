import { NextResponse } from 'next/server';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import nodemailer from 'nodemailer';

export async function GET() {
    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, where('clientStatus', '==', 'In Progress'), where('inProgressStartedAt', '!=', null));
        const snapshot = await getDocs(q);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); 

        const overdueReviews = snapshot.docs
            .map(doc => ({
                docId: doc.id,
                ...doc.data(),
                inProgressStartedAt: doc.data().inProgressStartedAt.toDate(),
            }))
            .filter(review => review.inProgressStartedAt < oneWeekAgo && review.assignedTo);

        if (overdueReviews.length === 0) {
            console.log('No overdue "In Progress" reviews found.');
            return NextResponse.json({ message: 'No overdue reviews to process.', success: true }, { status: 200 });
        }


        const adminsRef = collection(db, 'admins');
        const adminsSnapshot = await getDocs(adminsRef);
        const admins = adminsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
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
        console.log('SMTP connection verified successfully');

        const emailPromises = overdueReviews.map(async (review) => {
            const assignedAdmin = admins.find(admin => admin.id === review.assignedTo);
            if (!assignedAdmin || !assignedAdmin.email) {
                console.warn(`No valid email found for admin ${review.assignedTo} for review ${review.docId}`);
                return;
            }

            const mailOptions = {
                from: process.env.SMTP_FROM_EMAIL,
                to: assignedAdmin.email,
                subject: `Reminder: Lead "${review.company || review.email}" In Progress for Over a Week`,
                html: `
                    <h1>Hello ${assignedAdmin.firstName || 'Admin'},</h1>
                    <p>The lead "<strong>${review.company || review.email}</strong>" has been in "In Progress" status since <strong>${review.inProgressStartedAt.toLocaleString()}</strong>, which is over a week ago.</p>
                    <p>Please review and update the status in the Review Panel:</p>
                    <a href="http://localhost:3000/review-panel" style="display: inline-block; padding: 10px 20px; background-color: #36302A; color: white; text-decoration: none; border-radius: 5px;">Go to Review Panel</a>
                    <p>Lead Details:</p>
                    <ul>
                        <li>Email: ${review.email}</li>
                        <li>First Name: ${review.firstName || 'N/A'}</li>
                        <li>Brand Name: ${review.company || 'N/A'}</li>
                    </ul>
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

            const info = await transporter.sendMail(mailOptions);
            console.log(`Email sent to ${assignedAdmin.email} for review ${review.docId}: ${info.messageId}`);
        });

        await Promise.all(emailPromises);

        return NextResponse.json(
            { message: `Processed ${overdueReviews.length} overdue reviews.`, success: true },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error checking in-progress reviews:', error);
        return NextResponse.json(
            { error: 'Failed to process in-progress reviews', details: error.message },
            { status: 500 }
        );
    }
}