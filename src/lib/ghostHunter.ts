import { supabase } from './supabase';
import { searchJobs } from './jobs';
import { matchSkillsToJob, generateCoverLetter } from './openai';
import { sendWhatsAppMessage } from './twilio';

export async function runGhostHunter() {
    console.log('👻 Ghost Hunter is waking up...');

    try {
        // 1. Fetch users who have WhatsApp alerts enabled
        const { data: users, error: userError } = await supabase
            .from('profiles')
            .select('id, full_name, target_role, whatsapp_number, whatsapp_alerts')
            .eq('whatsapp_alerts', true);

        if (userError) throw userError;
        if (!users || users.length === 0) {
            console.log('💤 No active hunters found. Going back to sleep.');
            return;
        }

        console.log(`🎯 Found ${users.length} hunters ready for the hunt.`);

        for (const user of users) {
            try {
                console.log(`🕵️‍♂️ Hunting for ${user.full_name} (${user.target_role})...`);

                // 2. Fetch user's latest CV for matching
                const { data: cvData } = await supabase
                    .from('cv_analyses')
                    .select('cv_text')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .single();

                if (!cvData?.cv_text) {
                    console.log(`⚠️ Skip: ${user.full_name} has no CV analyzed.`);
                    continue;
                }

                // 3. Search for fresh jobs matching their role
                const jobs = await searchJobs(user.target_role || 'Software Engineer', 1);

                // Limit to top 3 fresh jobs to save API credits
                const topJobs = jobs.slice(0, 3);

                for (const job of topJobs) {
                    // 4. Calculate Match Score with AI
                    const matchResult = await matchSkillsToJob(cvData.cv_text, job.description);

                    console.log(`📊 Analysis: ${job.title} at ${job.company} - ${matchResult.match_percentage}% Match`);

                    // 5. If High Match (>85%), take action!
                    if (matchResult.match_percentage >= 85) {
                        console.log(`🔥 BOOM! Found a high-value target for ${user.full_name}!`);

                        // 6. Pre-tailor the Cover Letter in the background
                        const tailoredLetter = await generateCoverLetter(cvData.cv_text, `Job: ${job.title} at ${job.company}. Desc: ${job.description}`);

                        // 7. Send the "Ghost Hunter" Alert via WhatsApp
                        const message = `👻 *HIRENA GHOST HUNTER ALERT!*

Hey ${user.full_name.split(' ')[0]}! While you were away, I found a *${matchResult.match_percentage}% Match* for you!

🏢 *${job.company}*
💼 *${job.title}*
📍 ${job.location}

⚡ *AI Insight:* Your skills in ${matchResult.matching_skills?.slice(0, 3).join(', ')} make you a perfect fit.

I've already drafted a tailored cover letter for you. 
👉 Click here to view and apply: ${job.url}

Good luck!`;

                        if (user.whatsapp_number) {
                            await sendWhatsAppMessage(user.whatsapp_number, message);
                            console.log(`📢 WhatsApp Alert sent to ${user.full_name}`);
                        }
                    }
                }
            } catch (err) {
                console.error(`❌ Hunter error for ${user.full_name}:`, err);
            }
        }

    } catch (error) {
        console.error('💀 Ghost Hunter system failure:', error);
    }

    console.log('👻 Ghost Hunter is finished for now. Returning to the shadows.');
}
