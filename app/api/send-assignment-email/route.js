import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const body = await request.json();

    const {
      recipientEmail,
      recipientName,
      assignerName,
      reviewDetails
    } = body;

    const isDev = process.env.NEXT_PUBLIC_EMAIL_FLAG === 'dev';

    if (!recipientEmail || !assignerName || !reviewDetails) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Email config:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? 'Set' : 'Not set',
      pass: process.env.SMTP_PASSWORD ? 'Set' : 'Not set',
      from: process.env.SMTP_FROM_EMAIL
    });

    // Configure transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10),
      secure: parseInt(process.env.SMTP_PORT, 10) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Create greeting based on time of day
    const currentHour = new Date().getHours();
    let greeting = 'Good morning';
    if (currentHour >= 12 && currentHour < 18) {
      greeting = 'Good afternoon';
    } else if (currentHour >= 18) {
      greeting = 'Good evening';
    }

    // Format client details
    const clientName = `${reviewDetails.firstName || ''} ${reviewDetails.lastName || ''}`.trim();
    const clientEmail = reviewDetails.email || 'Not provided';
    const clientCompany = reviewDetails.company || 'Not provided';

    // Email content
    const emailContent = {
      from: `"Client Management System" <${process.env.SMTP_FROM_EMAIL}>`,
      to: recipientEmail,
      subject: `New Review Assignment: ${clientCompany}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #2F855A; margin: 0;">New Review Assignment</h1>
            <p style="color: #718096; font-size: 16px;">You have a new client review to handle</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p style="font-size: 16px;">${greeting}, ${recipientName || 'Admin'}!</p>
            <p style="font-size: 16px;">You've been assigned a new client review by <strong>${assignerName}</strong>.</p>
          </div>
          
          <div style="background-color: #F0FFF4; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #2F855A; font-size: 18px; margin-top: 0;">Client Details</h2>
            <ul style="list-style-type: none; padding: 0;">
              <li style="padding: 8px 0; border-bottom: 1px solid #CBD5E0;">
                <strong>Name:</strong> ${clientName}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #CBD5E0;">
                <strong>Email:</strong> ${clientEmail}
              </li>
              <li style="padding: 8px 0; border-bottom: 1px solid #CBD5E0;">
                <strong>Brand:</strong> ${clientCompany}
              </li>
              <li style="padding: 8px 0;">
                <strong>Priority:</strong> 
                <span style="
                  display: inline-block;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-weight: bold;
                  background-color: ${reviewDetails.priority === 'highest' ? '#FED7D7' :
          reviewDetails.priority === 'high' ? '#FED7D7' :
            reviewDetails.priority === 'medium' ? '#FEEBC8' :
              '#C6F6D5'
        };
                  color: ${reviewDetails.priority === 'highest' ? '#9B2C2C' :
          reviewDetails.priority === 'high' ? '#C53030' :
            reviewDetails.priority === 'medium' ? '#C05621' :
              '#2F855A'
        };
                ">
                  ${reviewDetails.priority || 'low'}
                </span>
              </li>
            </ul>
          </div>
          
          <div style="margin-bottom: 30px;">
            <p style="font-size: 16px;">Please log in to the admin panel to review this client's details and follow up as needed.</p>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${isDev ? "social-it-up-test.vercel.app" : "social-it-up-admin-panel-powered-by-nc.vercel.app"}/review-panel69" 
                 style="background-color: #48BB78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Go to Review Panel
              </a>
            </div>
          </div>
          
          <div style="font-size: 14px; color: #718096; text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p>This is an automated message from your Client Management System.</p>
            <p>© ${new Date().getFullYear()} Social It Up. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Send email
    const info = await transporter.sendMail(emailContent);
    console.log('Email sent:', info.messageId);

    return NextResponse.json({
      success: true,
      message: 'Assignment email sent successfully!',
      messageId: info.messageId
    });
  } catch (error) {
    console.error('Detailed email error:', {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      stack: error.stack
    });

    return NextResponse.json({
      error: 'Failed to send email',
      details: error.message
    }, {
      status: 500
    });
  }
}

// Add this to handle OPTIONS requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}