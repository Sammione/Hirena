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
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
    skillGaps: string[];
    readinessScore: number;
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
                content: 'You are an expert career coach and recursive recruiter. Analyze the following CV and provide a structured JSON response containing: score (0-100), strengths (list), weaknesses (list), improvements (list), skillGaps (list compared to industry standards), and readinessScore (0-100).'
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
