import { NextResponse } from 'next/server';
import cron from 'node-cron';
import fetch from 'node-fetch';

const ALLOWED_PROJECT_IDS = [
    'prj_6d1MaNS5ll592fu5yTQNDFSdiXUq', 
    'prj_0bAeIxvMW2hs11SjARg1yFHqWyri '  
];

let cronStarted = false;

export async function GET() {
    if (cronStarted) {
        return NextResponse.json({ message: 'Cron already running.', success: true }, { status: 200 });
    }

    const currentProjectId = process.env.VERCEL_PROJECT_ID;
    if (ALLOWED_PROJECT_IDS.includes(currentProjectId)) {
        // Schedule cron to run once a week (every Monday at midnight UTC)
        cron.schedule('0 0 * * 1', async () => {
            const timestamp = new Date().toLocaleString();
            console.log(`Running cron job at: ${timestamp} for project ${currentProjectId}`);
            try {
                const baseUrl = `https://${process.env.VERCEL_URL}`;
                const response = await fetch(`${baseUrl}/api/check-in-progress`, { method: 'GET' });
                const data = await response.json();
                console.log('API Response:', data);
            } catch (error) {
                console.error('Cron error:', error.message);
            }
        });
        cronStarted = true;
        console.log(`Cron scheduler started for project ${currentProjectId}. Running every week...`);
        return NextResponse.json({ message: `Cron started for ${currentProjectId}`, success: true }, { status: 200 });
    } else {
        console.log(`Cron not started for project ${currentProjectId || 'unknown'}.`);
        return NextResponse.json({ message: 'Cron not started. Project ID not allowed.', success: false }, { status: 200 });
    }
}