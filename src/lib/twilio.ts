import { supabase } from './supabase';

/**
 * Note: Sending Twilio messages directly from the frontend is insecure 
 * because it exposes your Auth Token to anyone using the site.
 * 
 * Recommended: Move this logic to a Supabase Edge Function.
 */
export async function sendWhatsAppMessage(to: string, message: string) {
    const sid = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
    const token = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
    const from = import.meta.env.VITE_TWILIO_PHONE_NUMBER;

    if (!sid || !token || !from) {
        console.error('Twilio credentials missing');
        return { error: 'Credentials missing' };
    }

    // Formatting number for WhatsApp (must have 'whatsapp:' prefix)
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to.replace(/\D/g, '')}`;
    const formattedFrom = from.startsWith('whatsapp:') ? from : `whatsapp:${from.replace(/\D/g, '')}`;

    try {
        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${sid}:${token}`)
            },
            body: new URLSearchParams({
                From: formattedFrom,
                To: formattedTo,
                Body: message
            })
        });

        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Twilio API Error');

        return { data: result };
    } catch (error: any) {
        console.error('Twilio Send Error:', error);
        return { error: error.message };
    }
}
