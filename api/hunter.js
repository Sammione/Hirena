export default async function handler(request, response) {
    // Protect with a secret key to prevent unauthorized triggers
    const authHeader = request.headers['authorization'];
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return response.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const { createClient } = await import('@supabase/supabase-js');

        const supabase = createClient(
            process.env.VITE_SUPABASE_URL,
            process.env.VITE_SUPABASE_ANON_KEY
        );

        // Fetch users with WhatsApp alerts ON and a target role set
        const { data: users, error } = await supabase
            .from('profiles')
            .select('id, full_name, target_role, whatsapp_number, whatsapp_alerts')
            .eq('whatsapp_alerts', true)
            .not('whatsapp_number', 'is', null)
            .not('target_role', 'is', null);

        if (error) throw error;

        const hunted = [];

        for (const user of (users || [])) {
            try {
                // Fetch user's latest CV
                const { data: cvData } = await supabase
                    .from('cv_analyses')
                    .select('cv_text')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (!cvData?.cv_text) continue;

                // Search for jobs via RapidAPI JSearch
                const jobRes = await fetch(
                    `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(user.target_role)}&page=1&num_pages=1`,
                    {
                        headers: {
                            'X-RapidAPI-Key': process.env.VITE_RAPIDAPI_KEY,
                            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
                        },
                    }
                );
                const jobJson = await jobRes.json();
                const jobs = (jobJson.data || []).slice(0, 3);

                for (const job of jobs) {
                    const jobTitle = job.job_title || '';
                    const jobCompany = job.employer_name || '';
                    const jobDesc = (job.job_description || '').slice(0, 1000);
                    const jobUrl = job.job_apply_link || job.job_google_link || '#';
                    const jobLocation = job.job_city || job.job_country || 'Remote';

                    // Simple keyword match score (no extra OpenAI call to save cost)
                    const cvLower = cvData.cv_text.toLowerCase();
                    const descWords = jobDesc.toLowerCase().split(/\W+/).filter(w => w.length > 4);
                    const matches = descWords.filter(w => cvLower.includes(w));
                    const score = Math.min(100, Math.round((matches.length / Math.max(descWords.length, 1)) * 200));

                    if (score >= 60) {
                        // Send WhatsApp via Twilio
                        const accountSid = process.env.VITE_TWILIO_ACCOUNT_SID;
                        const authToken = process.env.VITE_TWILIO_AUTH_TOKEN;
                        const from = `whatsapp:${process.env.VITE_TWILIO_PHONE_NUMBER}`;
                        const to = `whatsapp:${user.whatsapp_number}`;

                        const message = `👻 *HIRENA GHOST HUNTER ALERT!*\n\nHey ${user.full_name?.split(' ')[0] || 'there'}! I found a *${score}% match* for you!\n\n🏢 *${jobCompany}*\n💼 *${jobTitle}*\n📍 ${jobLocation}\n\n⚡ Act fast — high-match roles fill quickly!\n\n👉 Apply now: ${jobUrl}`;

                        await fetch(
                            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                            {
                                method: 'POST',
                                headers: {
                                    'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
                                    'Content-Type': 'application/x-www-form-urlencoded',
                                },
                                body: new URLSearchParams({ From: from, To: to, Body: message }).toString(),
                            }
                        );

                        hunted.push({ user: user.full_name, job: jobTitle, score });
                    }
                }
            } catch (userErr) {
                console.error(`Ghost Hunter error for ${user.full_name}:`, userErr);
            }
        }

        return response.status(200).json({ success: true, hunted });
    } catch (error) {
        return response.status(500).json({ success: false, error: error.message });
    }
}
