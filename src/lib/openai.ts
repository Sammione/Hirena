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

export type OptimizedCV = {
    markdown: string;
    latex: string;
    summary: string;
    explanation: string;
};

export const optimizeCVForJob = async (
    cvText: string,
    jobDescription: string,
    userData?: { full_name?: string; email?: string; phone?: string; location?: string; links?: string }
): Promise<OptimizedCV> => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are a world-class Executive Resume Writer and recruitment expert. Your mission is to re-engineer the user's CV into a "high-signal" document that guarantees an interview for the specific job description provided.
                
                CONTENT STRATEGY:
                1. QUANTIFY EVERYTHING: Translate vague duties into hard achievements with numbers, percentages, or scale (e.g., "Improved speed" -> "Reduced latency by 45% using RAG optimization").
                2. REVERSE-ENGINEER THE JD: Adopt the internal language and "tribe speak" of the target company. If they ask for "Customer Obsession," ensure that phrase or its exact sentiment appears.
                3. DO NOT DELETE HISTORY: Keep all companies/roles, but aggressively rewrite the bullet points.
                4. SYNERGY SUMMARY: The Professional Summary must explain exactly how the user's unique past solves the company's specific current problems mentioned in the JD.

                LATEX TEMPLATE: You MUST follow the LaTeX structure exactly. Use the user's actual data:
                   - Name: ${userData?.full_name || '[FULL NAME]'}
                   - Phone: ${userData?.phone || '[PHONE]'}
                   - Email: ${userData?.email || '[EMAIL]'}
                   - Location: ${userData?.location || '[LOCATION]'}
                   - Links: ${userData?.links || '[PORTFOLIO/GITHUB/LINKEDIN]'}

                \\documentclass[11pt,a4paper]{article}
                \\usepackage[left=1.5cm,right=1.5cm,top=1.5cm,bottom=1.5cm]{geometry}
                \\usepackage{titlesec}
                \\usepackage{enumitem}
                \\usepackage[hidelinks]{hyperref}
                \\usepackage{xcolor}
                \\usepackage{parskip}
                \\definecolor{primary}{RGB}{0,102,153}
                \\titleformat{\\section}{\\large\\bfseries\\color{primary}}{}{0em}{}[\\titlerule]
                \\setlist[itemize]{noitemsep, topsep=0pt, leftmargin=1.2em}
                \\newcommand{\\job}[4]{\\textbf{#1} \\hfill {\\small #2} \\\\ \\textit{#3} \\hfill {\\small #4} \\\\}
                \\begin{document}
                \\begin{center}
                    {\\LARGE \\textbf{[FULL NAME]}}\\\\
                    \\vspace{4pt}
                    [PROFESSIONAL TITLES/KEYWORDS]\\\\
                    \\vspace{4pt}
                    [LOCATION] $\\cdot$ [PHONE] $\\cdot$ \\href{mailto:[EMAIL]}{[EMAIL]} \\\\
                    [PORTFOLIO/GITHUB/LINKEDIN LINKS]
                \\end{center}
                \\vspace{6pt}
                \\section*{Professional Summary}
                [Tailored Summary]
                \\section*{Core Skills}
                [Grouped Skills]
                \\section*{Professional Experience}
                [Use \\job{Title}{Dates}{Company}{Location} and itemize blocks]
                \\vspace{6pt}
                \\hrule
                \\vspace{4pt}
                {\\small \\textit{Optimized Professional Profile — Tailored for [COMPANY NAME] via Hirena AI}}
                \\end{document}

                OUTPUT FORMAT:
                Return a JSON object with:
                - "markdown": A clean, formatted markdown version.
                - "latex": The complete, compiled-ready LaTeX code following the template above.
                - "summary": A 2-sentence overview of the primary changes made.
                - "explanation": Briefly explain which JD keywords were prioritized.`
            },
            {
                role: 'user',
                content: `Original CV: ${cvText}\n\nTarget Job Description: ${jobDescription}`
            }
        ],
        response_format: { type: 'json_object' }
    });

    return JSON.parse(response.choices[0].message.content || '{}') as OptimizedCV;
};

export const generateGhostOutreach = async (
    cvText: string,
    companyName: string,
    managerName: string,
    recentNews?: string
): Promise<string> => {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: `You are a networking expert for high-end professionals. 
                Your task is to draft a "High-Signal" outreach message to a hiring manager named ${managerName}.
                
                Rules:
                1. Address the message to ${managerName}.
                2. Reference a specific recent achievement or news about the company: ${recentNews || 'General growth'}.
                3. Connect that achievement to a specific strength or achievement from the user's CV.
                4. Keep it brief (under 150 words).
                5. Use a low-friction "Ask" (e.g. 10-min sync, not "Give me a job").
                6. Use a sophisticated, peer-to-peer tone (not a desperate applicant).`
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
                content: `You are a corporate intelligence agent. Your job is to research and identify key leadership and hiring decision-makers at a specific company.
                
                Research Goals:
                1. Identify the current CEO of the company.
                2. Identify the most relevant hiring decision-maker for a professional role (e.g., VP of HR, Head of Talent, or a Director).
                
                Guidelines:
                1. For the Manager: If you cannot find a specific individual's name with high confidence, use a general but descriptive "Hiring Executive" name or "Hiring Lead". NEVER leave the name empty.
                2. For the CEO: Provide the actual name of the current CEO.
                3. IMPORTANT: Provide LinkedIn SEARCH URLs for both. This is more reliable than a direct link.
                   Format: https://www.linkedin.com/search/results/people/?keywords=[Role]%20at%20[Company]
                4. Find a piece of high-signal, realistic recent news or strategic priority.
                
                Return a JSON object:
                {
                  "ceo": { 
                    "name": "string (CEO Full Name)", 
                    "role": "CEO", 
                    "profile": "string (LinkedIn Search URL)"
                  },
                  "manager": { 
                    "name": "string (Specific name or 'Hiring Lead')", 
                    "role": "string (Exact title)", 
                    "profile": "string (LinkedIn Search URL)"
                  },
                  "news": "string (High-signal news hook)"
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
