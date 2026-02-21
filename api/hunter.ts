import { VercelRequest, VercelResponse } from '@vercel/node';
import { runGhostHunter } from '../src/lib/ghostHunter';

export default async function handler(
    request: VercelRequest,
    response: VercelResponse
) {
    // Optional: Check for a secret key to prevent unauthorized triggers
    const authHeader = request.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    try {
        await runGhostHunter();
        return response.status(200).json({ success: true, message: 'Ghost Hunter completed the patrol.' });
    } catch (error: any) {
        return response.status(500).json({ success: false, error: error.message });
    }
}
