import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
    console.warn('OpenAI API key is missing. Please add VITE_OPENAI_API_KEY to your .env file.');
}

const openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Since we are in a Vite frontend
});

export type CVAnalysis = {
    score: number;
    readinessScore: number;
    sections: {
        impact: { score: number; feedback: string };
        presentation: { score: number; feedback: string };
        keywords: { score: number; feedback: string };
    };
    strengths: string[];
    improvements: string[];
    skillGaps: string[];
};

export type CareerResource = {
    title: string;
    platform: 'YouTube' | 'Coursera' | 'Udemy' | 'Other';
    url: string;
    completed?: boolean;
};

export type CareerRoadmap = {
    milestones: {
        title: string;
        description: string;
        skillsToLearn: string[];
        estimatedDuration: string;
        resources: CareerResource[];
        completed?: boolean;
    }[];
    summary: string;
};

export const analyzeCV = async (cvText: string): Promise<CVAnalysis> => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: 'You are a senior recruiter. Analyze the CV and provide a granular JSON response with: score (0-100), readinessScore (0-100), sections (impact, presentation, keywords each with score and feedback), strengths (list), improvements (list), and skillGaps (list).'
            },
            {
                role: 'user',
                content: cvText
            }
        ],
        response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}') as CVAnalysis;
};

export const rewriteBulletPoint = async (bullet: string, targetRole?: string): Promise<string> => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: 'You are an expert resume writer. Rewrite the bullet point to be high-impact and quantified. Use strong action verbs. Keep it concise.'
            },
            {
                role: 'user',
                content: `Rewrite: "${bullet}" ${targetRole ? `for a ${targetRole} role` : ''}`
            }
        ]
    });
    return response.choices[0].message.content || bullet;
};

export const generateCoverLetter = async (cvText: string, jobInfo: string): Promise<string> => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: 'You are a career coach. Write a professional cover letter based on the CV and job info. Use [Hiring Manager] placeholders.'
            },
            {
                role: 'user',
                content: `CV: ${cvText}\n\nJob Info: ${jobInfo}`
            }
        ]
    });
    return response.choices[0].message.content || 'Failed to generate cover letter.';
};

export const matchSkillsToJob = async (cvText: string, jobDescription: string) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: 'You are an AI matching engine. Compare the CV with the job description. Provide a match percentage and a list of matching skills and missing skills in JSON format.'
            },
            {
                role: 'user',
                content: `CV Content: ${cvText}\n\nJob Description: ${jobDescription}`
            }
        ],
        response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
};

export const createCareerRoadmap = async (objective: string, currentSkills: string[]): Promise<CareerRoadmap> => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are a career development expert. Create a personalized career roadmap in JSON format. 
                For each milestone, include:
                - title: The name of the stage.
                - description: A brief overview.
                - skillsToLearn: A list of specific technologies or soft skills.
                - estimatedDuration: Time to complete (e.g. 2 weeks).
                - resources: A list of 2-3 REAL, high-quality learning resources (YouTube links, Coursera, etc.) with title, platform, and url.
                
                IMPORTANT: Provide ACTUAL valid URLs from platforms like YouTube, Coursera, Udemy, etc. matching the skills.
                Include a professional summary for the whole roadmap.`
            },
            {
                role: 'user',
                content: `Objective: ${objective}\n\nCurrent Skills: ${currentSkills.join(', ')}`
            }
        ],
        response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}') as CareerRoadmap;
};

export const answerCareerQuestion = async (question: string, cvContext?: string) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: 'You are a helpful career assistant for Hirena. Answer the user\'s career question professionally and concisely.'
            },
            {
                role: 'user',
                content: cvContext ? `Context: ${cvContext}\n\nQuestion: ${question}` : question
            }
        ]
    });

    return response.choices[0].message.content;
};

export const generateNegotiationStrategy = async (offerDetails: string, cvContext: string) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: 'You are a master salary negotiator. Analyze the job offer and user CV to provide a step-by-step negotiation strategy, including specific scripts for email and verbal negotiation. Be firm but professional.'
            },
            {
                role: 'user',
                content: `Offer Details: ${offerDetails}\n\nCandidate CV Info: ${cvContext}`
            }
        ]
    });

    return response.choices[0].message.content || 'Report generation failed.';
};

export async function parseCVToProfile(cvText: string) {
    const prompt = `
    Extract the following professional profile information from the CV text below.
    Format your response as a valid JSON object.
    
    Expected format:
    {
      "full_name": "string",
      "target_role": "string",
      "email": "string",
      "phone": "string",
      "location": "string",
      "bio": "string (a professional summary)",
      "experience": [
        {
          "title": "string",
          "company": "string",
          "duration": "string",
          "description": "string"
        }
      ],
      "skills": ["string"]
    }

    CV Text:
    ${cvText}
    `;

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

export type CareerTimelineNode = {
    period: string;           // e.g. "6 Months", "1 Year"
    title: string;            // predicted job title
    salary_min: number;       // in USD/year
    salary_max: number;
    salary_currency: string;  // e.g. "USD", "NGN"
    key_skill: string;        // the ONE skill that unlocks this level
    probability: number;      // 0-100 % likelihood if they follow the plan
};

export type CareerRiskAlert = {
    skill: string;
    risk: string;             // e.g. "demand dropping 23% by 2026"
    urgency: 'low' | 'medium' | 'high';
};

export type CareerOpportunity = {
    skill: string;
    reason: string;           // e.g. "#1 demanded skill in your industry right now"
    timeToLearn: string;      // e.g. "3 weeks"
};

export type CareerTimeline = {
    currentTitle: string;
    currentSalaryMin: number;
    currentSalaryMax: number;
    currency: string;
    summary: string;
    timeline: CareerTimelineNode[];
    riskAlerts: CareerRiskAlert[];
    opportunities: CareerOpportunity[];
    doNothingOutcome: string; // what happens if they don't act
};

export const generateCareerTimeline = async (
    currentRole: string,
    skills: string[],
    cvText?: string
): Promise<CareerTimeline> => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are an elite career intelligence AI with access to global job market data. 
                Your job is to predict a user's career future based on their current role and skills.
                Be brutally honest, data-driven, and specific. Use realistic salary ranges.
                Detect if the user is likely in Africa/Nigeria and use NGN salaries (multiply USD by 1600), otherwise use USD.
                
                Return a JSON object with this EXACT structure:
                {
                  "currentTitle": "their current role title",
                  "currentSalaryMin": number,
                  "currentSalaryMax": number,
                  "currency": "NGN or USD",
                  "summary": "2-sentence punchy summary of their career trajectory",
                  "timeline": [
                    { "period": "6 Months", "title": "predicted title", "salary_min": number, "salary_max": number, "salary_currency": "NGN", "key_skill": "the one skill to learn", "probability": 85 },
                    { "period": "1 Year", ... },
                    { "period": "3 Years", ... },
                    { "period": "5 Years", ... }
                  ],
                  "riskAlerts": [
                    { "skill": "skill name", "risk": "specific risk description", "urgency": "high" }
                  ],
                  "opportunities": [
                    { "skill": "skill name", "reason": "why it's hot right now", "timeToLearn": "2 weeks" }
                  ],
                  "doNothingOutcome": "Brutally honest 1-sentence prediction if they take no action"
                }`
            },
            {
                role: 'user',
                content: `Current Role: ${currentRole}\nSkills: ${skills.join(', ')}${cvText ? `\n\nCV Summary: ${cvText.slice(0, 800)}` : ''}`
            }
        ],
        response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}') as CareerTimeline;
};

export const getCompanyInsights = async (companyName: string) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are a corporate intelligence analyst. Provide a deep dive into the specified company.
                Include:
                1. Culture & Values: What they care about.
                2. Recent News/Trends: What's happening with them lately.
                3. Interview Prep: Top 5 common interview questions and how to answer them specifically for this company.
                4. Inside Tip: A secret "X-factor" to mention in the interview to impress them.
                Format as valid Markdown.`
            },
            {
                role: 'user',
                content: `Provide a deep dive for the company: ${companyName}`
            }
        ]
    });

    return response.choices[0].message.content || 'Failed to fetch company insights.';
};

export const optimizeCVForJob = async (cvText: string, jobDescription: string): Promise<string> => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are a master resume optimizer. Your task is to rewrite the user's CV to perfectly align with the provided job description.
                1. Identify the key skills and requirements in the job description.
                2. Rephrase experience bullet points to highlight matching achievements.
                3. Ensure keywords from the JD are naturally woven into the skills and summary sections.
                4. Maintain a professional, high-impact tone.
                5. Return the full optimized CV in a clean Markdown format that is ready to be converted to PDF.
                
                Structure to follow:
                # FULL NAME
                [Professional Summary re-written for the JD]
                
                ## Experience
                [Modified bullet points]
                
                ## Skills
                [Grouped relevant skills for this specific JD]`
            },
            {
                role: 'user',
                content: `Original CV: ${cvText}\n\nTarget Job Description: ${jobDescription}`
            }
        ]
    });

    return response.choices[0].message.content || 'Failed to optimize CV.';
};

export const generateGhostOutreach = async (
    cvText: string,
    companyName: string,
    recentNews?: string
): Promise<string> => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are a networking expert for high-end professionals. 
                Your task is to draft a "High-Signal" outreach message to a hiring manager.
                
                Rules:
                1. Reference a specific recent achievement or news about the company (provided by the user).
                2. Connect that achievement to a specific strength or achievement from the user's CV.
                3. Keep it brief (under 150 words).
                4. Use a low-friction "Ask" (e.g. 10-min sync, not "Give me a job").
                5. Use a sophisticated, peer-to-peer tone (not a desperate applicant).`
            },
            {
                role: 'user',
                content: `Candidate CV: ${cvText}\n\nCompany: ${companyName}\nRecent News: ${recentNews || 'General growth and innovation.'}`
            }
        ]
    });

    return response.choices[0].message.content || 'Failed to generate outreach message.';
};

export const fetchCompanyIntelligence = async (companyName: string) => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are a corporate intelligence agent. Given a company name, provide:
                1. A likely name and role of a hiring manager (e.g. Director of Engineering, Head of Talent).
                2. A piece of realistic, high-signal recent news about the company (funding, product launch, expansion).
                3. A professional LinkedIn-style profile URL placeholder.
                
                Return a JSON object:
                {
                  "manager": { "name": "string", "role": "string", "profile": "string" },
                  "news": "string"
                }`
            },
            {
                role: 'user',
                content: `Research company: ${companyName}`
            }
        ],
        response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
};

export default openai;
