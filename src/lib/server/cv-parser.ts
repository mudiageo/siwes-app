import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const CVDataSchema = z.object({
	skills: z.array(z.string()).describe('Technical and professional skills extracted from CV'),
	experience: z.array(z.object({
		title: z.string(),
		company: z.string(),
		duration: z.string(),
		description: z.string()
	})).describe('Work experience and internships'),
	education: z.array(z.object({
		degree: z.string(),
		institution: z.string(),
		year: z.string(),
		grade: z.string().optional()
	})).describe('Educational background'),
	projects: z.array(z.object({
		name: z.string(),
		description: z.string(),
		technologies: z.array(z.string())
	})).describe('Projects and achievements'),
	certifications: z.array(z.string()).describe('Certifications and awards'),
	summary: z.string().describe('Professional summary or objective')
});

export type CVData = z.infer<typeof CVDataSchema>;

export async function parseCVWithAI(cvText: string): Promise<CVData> {
	try {
		const { object } = await generateObject({
			model: google('gemini-1.5-flash'),
			schema: CVDataSchema,
			prompt: `
			Parse the following CV/Resume text and extract structured information. 
			Focus on technical skills, educational background, work experience, projects, and certifications.
			For Nigerian engineering students, pay attention to:
			- University names and engineering departments
			- SIWES/IT experience
			- Technical projects and coursework
			- Programming languages and tools
			- Professional certifications

			CV Text:
			${cvText}

			Extract all relevant information and structure it according to the schema.
			`,
		});

		return object;
	} catch (error) {
		console.error('CV parsing error:', error);
		// Return fallback structure
		return {
			skills: extractBasicSkills(cvText),
			experience: [],
			education: [],
			projects: [],
			certifications: [],
			summary: cvText.substring(0, 200) + '...'
		};
	}
}

function extractBasicSkills(text: string): string[] {
	const commonSkills = [
		'JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'SQL', 'Git',
		'HTML', 'CSS', 'TypeScript', 'Angular', 'Vue.js', 'Django', 'Flask',
		'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Kubernetes',
		'Machine Learning', 'Data Analysis', 'MATLAB', 'AutoCAD', 'SolidWorks',
		'Project Management', 'Agile', 'Scrum', 'Linux', 'Windows', 'Excel'
	];

	const foundSkills: string[] = [];
	const lowerText = text.toLowerCase();

	for (const skill of commonSkills) {
		if (lowerText.includes(skill.toLowerCase())) {
			foundSkills.push(skill);
		}
	}

	return foundSkills;
}

export async function generateSkillSuggestions(currentSkills: string[], department: string): Promise<string[]> {
	try {
		const { object } = await generateObject({
			model: google('gemini-1.5-flash'),
			schema: z.object({
				suggestions: z.array(z.string()).describe('Recommended skills to learn')
			}),
			prompt: `
			Based on the current skills and department, suggest 8-10 additional skills that would be valuable for a Nigerian engineering student to learn.

			Current Skills: ${currentSkills.join(', ')}
			Department: ${department}

			Consider:
			- Industry trends in Nigeria
			- Skills in demand by major Nigerian companies
			- Complementary technical skills
			- Professional development skills
			- Emerging technologies relevant to the field

			Provide practical, learnable skills that would enhance employability.
			`,
		});

		return object.suggestions;
	} catch (error) {
		console.error('Skill suggestion error:', error);
		return getDefaultSkillSuggestions(department);
	}
}

function getDefaultSkillSuggestions(department: string): string[] {
	const skillMap: { [key: string]: string[] } = {
		'Computer Science': ['Machine Learning', 'Cloud Computing', 'DevOps', 'Cybersecurity', 'Mobile Development'],
		'Software Engineering': ['System Design', 'Microservices', 'API Development', 'Testing', 'CI/CD'],
		'Electrical Engineering': ['Power Systems', 'Control Systems', 'Renewable Energy', 'IoT', 'Embedded Systems'],
		'Mechanical Engineering': ['CAD Design', 'Manufacturing', 'Robotics', 'Quality Control', 'Project Management'],
		'Civil Engineering': ['Structural Design', 'Construction Management', 'GIS', 'Environmental Engineering', 'BIM'],
		'Chemical Engineering': ['Process Design', 'Safety Engineering', 'Environmental Compliance', 'Quality Assurance', 'Data Analysis']
	};

	return skillMap[department] || ['Project Management', 'Data Analysis', 'Communication', 'Leadership', 'Problem Solving'];
}