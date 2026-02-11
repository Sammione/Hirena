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

export type CareerRoadmap = {
    milestones: {
        title: string;
        description: string;
        skillsToLearn: string[];
        estimatedDuration: string;
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
                content: 'You are a career development expert. Create a personalized career roadmap in JSON format. Include milestones with title, description, skillsToLearn (list), and estimatedDuration. Also include a summary.'
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

export default openai;
