export const mockJobs = [
    {
        id: '1',
        title: 'Senior Frontend Engineer',
        company: 'TechAfrica Solutions',
        location: 'Lagos, Nigeria',
        type: 'Remote',
        salary: '$2,000 - $3,500',
        match: 95,
        description: 'We are looking for a React expert to lead our dashboard team.',
        posted: '2 days ago',
        logo: 'https://images.unsplash.com/photo-1549921294-db104495603c?w=100&h=100&fit=crop'
    },
    {
        id: '2',
        title: 'Product Designer',
        company: 'FinTok',
        location: 'Nairobi, Kenya',
        type: 'Hybrid',
        salary: '$1,500 - $2,500',
        match: 88,
        description: 'Design the next generation of fintech for Africa.',
        posted: '5 days ago',
        logo: 'https://images.unsplash.com/photo-1572044162444-ad60f128bde2?w=100&h=100&fit=crop'
    },
    {
        id: '3',
        title: 'Junior Data Analyst',
        company: 'EcoPower',
        location: 'Accra, Ghana',
        type: 'On-site',
        salary: '$800 - $1,200',
        match: 75,
        description: 'Analyze energy usage patterns across West Africa.',
        posted: '1 week ago',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop'
    }
];

export const userStats = {
    readinessScore: 78,
    jobMatches: 124,
    skillGaps: [
        { skill: 'Cloud Architecture', gap: 40 },
        { skill: 'Testing (Jest/Cypress)', gap: 60 },
        { skill: 'CI/CD Pipelines', gap: 20 }
    ],
    recommendedActions: [
        { id: 1, action: 'Complete AWS Cloud Practitioner course', type: 'Learning' },
        { id: 2, action: 'Add a case study to your portfolio', type: 'Profile' },
        { id: 3, action: 'Update your CV for remote roles', type: 'Career' }
    ]
};

export const careerRoadmap = [
    { id: 1, title: 'Frontend Foundations', status: 'Completed', duration: '4 weeks', skills: ['HTML', 'CSS', 'JS'] },
    { id: 2, title: 'Modern Frameworks (React)', status: 'In Progress', duration: '6 weeks', skills: ['React', 'Redux', 'Tailwind'] },
    { id: 3, title: 'Testing & Quality', status: 'Locked', duration: '3 weeks', skills: ['Jest', 'Cypress'] },
    { id: 4, title: 'Deployment & Scaling', status: 'Locked', duration: '4 weeks', skills: ['Docker', 'AWS', 'CI/CD'] }
];
