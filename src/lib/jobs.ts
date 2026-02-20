const RAPID_API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;

export interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    description: string;
    posted: string;
    logo: string;
    url: string;
}

export const searchJobs = async (query: string, page: number = 1): Promise<Job[]> => {
    if (!RAPID_API_KEY || RAPID_API_KEY === 'your_rapidapi_key_here') {
        console.warn('RapidAPI key is missing. Returning empty results.');
        return [];
    }

    const response = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&page=${page}&num_pages=1`, {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': RAPID_API_KEY,
            'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
    });

    if (!response.ok) {
        throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();

    return (data.data || []).map((j: any) => ({
        id: j.job_id,
        title: j.job_title,
        company: j.employer_name,
        location: `${j.job_city ? j.job_city + ', ' : ''}${j.job_country}`,
        type: j.job_employment_type || 'Full-time',
        salary: j.job_salary_period ? `${j.job_min_salary} - ${j.job_max_salary} ${j.job_salary_currency}` : 'Competitive',
        description: j.job_description,
        posted: new Date(j.job_posted_at_datetime_utc).toLocaleDateString(),
        logo: j.employer_logo || 'https://images.unsplash.com/photo-1549921294-db104495603c?w=100&h=100&fit=crop',
        url: j.job_apply_link
    }));
};
