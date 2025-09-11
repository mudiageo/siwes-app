import type { Student, Company, Placement } from '$lib/db/schema.js';

export const sampleCompanies: Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
	{
		name: 'Shell Nigeria',
		industry: 'Oil & Gas',
		location: 'Lagos',
		size: 'enterprise',
		description: 'Leading energy company focused on upstream, downstream, and integrated gas operations in Nigeria.',
		website: 'https://shell.com.ng',
		logoUrl: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
		contactEmail: 'careers@shell.com.ng',
		contactPhone: '+234-1-2715000',
		establishedYear: 1937,
		isVerified: true
	},
	{
		name: 'Paystack',
		industry: 'Fintech',
		location: 'Lagos',
		size: 'medium',
		description: 'Modern online and offline payments for Africa. Paystack helps businesses in Africa get paid by anyone, anywhere in the world.',
		website: 'https://paystack.com',
		logoUrl: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
		contactEmail: 'careers@paystack.com',
		contactPhone: '+234-1-8889999',
		establishedYear: 2015,
		isVerified: true
	},
	{
		name: 'Andela',
		industry: 'Technology',
		location: 'Lagos',
		size: 'large',
		description: 'Andela trains software developers and connects them with top companies around the world.',
		website: 'https://andela.com',
		logoUrl: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
		contactEmail: 'careers@andela.com',
		contactPhone: '+234-1-7891234',
		establishedYear: 2014,
		isVerified: true
	},
	{
		name: 'Dangote Group',
		industry: 'Manufacturing',
		location: 'Lagos',
		size: 'enterprise',
		description: 'Africa\'s leading industrial conglomerate with operations in cement, sugar, salt, flour, and oil refining.',
		website: 'https://dangote.com',
		logoUrl: 'https://images.pexels.com/photos/3760529/pexels-photo-3760529.jpeg?auto=compress&cs=tinysrgb&w=800',
		contactEmail: 'hr@dangote.com',
		contactPhone: '+234-1-4488000',
		establishedYear: 1981,
		isVerified: true
	},
	{
		name: 'MTN Nigeria',
		industry: 'Telecommunications',
		location: 'Lagos',
		size: 'enterprise',
		description: 'Leading telecommunications company providing mobile, internet, and digital services across Nigeria.',
		website: 'https://mtnonline.com',
		logoUrl: 'https://images.pexels.com/photos/7688459/pexels-photo-7688459.jpeg?auto=compress&cs=tinysrgb&w=800',
		contactEmail: 'careers@mtn.com.ng',
		contactPhone: '+234-1-9200000',
		establishedYear: 2001,
		isVerified: true
	},
	{
		name: 'Chevron Nigeria',
		industry: 'Oil & Gas',
		location: 'Lagos',
		size: 'enterprise',
		description: 'International energy corporation with significant upstream operations in Nigeria.',
		website: 'https://chevron.com.ng',
		logoUrl: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
		contactEmail: 'careers@chevron.com.ng',
		contactPhone: '+234-1-2600520',
		establishedYear: 1913,
		isVerified: true
	}
];

export const samplePlacements: Omit<Placement, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>[] = [
	{
		title: 'Software Engineering Intern',
		department: 'Technology',
		description: 'Join our engineering team to work on cutting-edge fintech solutions. You\'ll contribute to our payment infrastructure and mobile applications.',
		requiredSkills: ['JavaScript', 'React', 'Node.js', 'Git'],
		skillsToLearn: ['AWS', 'TypeScript', 'Docker', 'Microservices'],
		requirements: 'Computer Science/Software Engineering student, 300-400 level, minimum 3.5 CGPA',
		duration: 24,
		slots: 5,
		filledSlots: 2,
		salaryRange: '₦80,000 - ₦120,000',
		location: 'Lagos',
		applicationDeadline: new Date('2025-03-15'),
		startDate: new Date('2025-04-01'),
		endDate: new Date('2025-09-30'),
		isActive: true,
		isRemote: false
	},
	{
		title: 'Petroleum Engineering Trainee',
		department: 'Upstream Operations',
		description: 'Hands-on experience in petroleum exploration and production. Work with experienced engineers on real projects.',
		requiredSkills: ['Engineering Fundamentals', 'Mathematics', 'Physics'],
		skillsToLearn: ['Reservoir Engineering', 'Drilling Operations', 'Production Optimization', 'HSE'],
		requirements: 'Petroleum/Chemical Engineering student, 300-500 level, minimum 3.0 CGPA',
		duration: 26,
		slots: 8,
		filledSlots: 3,
		salaryRange: '₦150,000 - ₦200,000',
		location: 'Port Harcourt',
		applicationDeadline: new Date('2025-02-28'),
		startDate: new Date('2025-03-15'),
		endDate: new Date('2025-09-15'),
		isActive: true,
		isRemote: false
	},
	{
		title: 'Data Science Intern',
		department: 'Data & Analytics',
		description: 'Work with our data science team on machine learning projects that impact millions of African users.',
		requiredSkills: ['Python', 'Statistics', 'Mathematics'],
		skillsToLearn: ['Machine Learning', 'TensorFlow', 'Data Visualization', 'Big Data'],
		requirements: 'Computer Science/Mathematics/Statistics student, 300-400 level',
		duration: 20,
		slots: 3,
		filledSlots: 1,
		salaryRange: '₦100,000 - ₦150,000',
		location: 'Lagos',
		applicationDeadline: new Date('2025-03-01'),
		startDate: new Date('2025-04-15'),
		endDate: new Date('2025-08-31'),
		isActive: true,
		isRemote: true
	},
	{
		title: 'Chemical Engineering Intern',
		department: 'Process Engineering',
		description: 'Experience in process optimization and plant operations in cement manufacturing.',
		requiredSkills: ['Chemical Engineering', 'Process Design', 'Safety Protocols'],
		skillsToLearn: ['Process Optimization', 'Quality Control', 'Environmental Compliance'],
		requirements: 'Chemical Engineering student, 400-500 level, minimum 3.2 CGPA',
		duration: 24,
		slots: 6,
		filledSlots: 2,
		salaryRange: '₦120,000 - ₦180,000',
		location: 'Kano',
		applicationDeadline: new Date('2025-03-20'),
		startDate: new Date('2025-04-10'),
		endDate: new Date('2025-10-10'),
		isActive: true,
		isRemote: false
	},
	{
		title: 'Network Engineering Trainee',
		department: 'Network Operations',
		description: 'Learn telecommunications infrastructure management and network optimization.',
		requiredSkills: ['Networking Basics', 'Computer Science Fundamentals'],
		skillsToLearn: ['5G Technology', 'Network Security', 'Fiber Optics', 'Network Monitoring'],
		requirements: 'Electrical/Computer/Telecommunications Engineering student, 300-400 level',
		duration: 22,
		slots: 10,
		filledSlots: 4,
		salaryRange: '₦90,000 - ₦130,000',
		location: 'Abuja',
		applicationDeadline: new Date('2025-04-01'),
		startDate: new Date('2025-05-01'),
		endDate: new Date('2025-10-31'),
		isActive: true,
		isRemote: false
	}
];

export const sampleStudents: Omit<Student, 'id' | 'userId' | 'createdAt' | 'updatedAt'>[] = [
	{
		firstName: 'Adebayo',
		lastName: 'Ogundimu',
		phoneNumber: '+234-8012345678',
		university: 'University of Lagos',
		department: 'Computer Science',
		level: 300,
		cgpa: 3.8,
		skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'SQL'],
		desiredSkills: ['Machine Learning', 'AWS', 'Docker', 'TypeScript'],
		location: 'Lagos',
		preferredLocations: ['Lagos', 'Abuja', 'Remote'],
		preferredIndustries: ['Technology', 'Fintech', 'Telecommunications'],
		bio: 'Passionate software developer with experience in full-stack web development. Interested in fintech and machine learning.',
		linkedinUrl: 'https://linkedin.com/in/adebayo-ogundimu',
		githubUrl: 'https://github.com/adebayo-dev',
		profileCompleteness: 85,
		isActive: true
	},
	{
		firstName: 'Fatima',
		lastName: 'Abdullah',
		phoneNumber: '+234-8098765432',
		university: 'Ahmadu Bello University',
		department: 'Petroleum Engineering',
		level: 400,
		cgpa: 3.9,
		skills: ['Engineering Design', 'MATLAB', 'AutoCAD', 'Process Simulation'],
		desiredSkills: ['Reservoir Engineering', 'Drilling Technology', 'Production Optimization'],
		location: 'Kaduna',
		preferredLocations: ['Lagos', 'Port Harcourt', 'Kaduna'],
		preferredIndustries: ['Oil & Gas', 'Energy', 'Manufacturing'],
		bio: 'Petroleum engineering student with strong analytical skills and passion for energy sector innovation.',
		linkedinUrl: 'https://linkedin.com/in/fatima-abdullah',
		profileCompleteness: 90,
		isActive: true
	},
	{
		firstName: 'Chinedu',
		lastName: 'Okwu',
		phoneNumber: '+234-8187654321',
		university: 'University of Nigeria, Nsukka',
		department: 'Electrical Engineering',
		level: 300,
		cgpa: 3.6,
		skills: ['Circuit Design', 'Electronics', 'Power Systems', 'C++'],
		desiredSkills: ['Renewable Energy', 'Control Systems', 'Embedded Systems'],
		location: 'Enugu',
		preferredLocations: ['Lagos', 'Abuja', 'Port Harcourt'],
		preferredIndustries: ['Telecommunications', 'Power', 'Manufacturing'],
		bio: 'Electrical engineering student passionate about power systems and renewable energy technologies.',
		linkedinUrl: 'https://linkedin.com/in/chinedu-okwu',
		profileCompleteness: 75,
		isActive: true
	}
];

export const nigerianUniversities = [
	'University of Lagos',
	'University of Ibadan',
	'Ahmadu Bello University',
	'University of Nigeria, Nsukka',
	'Obafemi Awolowo University',
	'University of Benin',
	'Federal University of Technology, Akure',
	'Federal University of Technology, Owerri',
	'Covenant University',
	'Babcock University',
	'American University of Nigeria',
	'Landmark University'
];

export const engineeringDepartments = [
	'Computer Science',
	'Software Engineering',
	'Electrical Engineering',
	'Mechanical Engineering',
	'Civil Engineering',
	'Chemical Engineering',
	'Petroleum Engineering',
	'Industrial Engineering',
	'Aerospace Engineering',
	'Materials Engineering',
	'Environmental Engineering',
	'Biomedical Engineering'
];

export const nigerianStates = [
	'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
	'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo',
	'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos',
	'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
	'Sokoto', 'Taraba', 'Yobe', 'Zamfara', 'FCT Abuja'
];

export const industries = [
	'Oil & Gas',
	'Technology',
	'Fintech',
	'Banking',
	'Telecommunications',
	'Manufacturing',
	'Construction',
	'Healthcare',
	'Agriculture',
	'Mining',
	'Power & Energy',
	'Aviation',
	'Automotive',
	'Consulting'
];

export const commonSkills = [
	'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'TypeScript', 'SQL', 'Git',
	'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Express.js', 'Vue.js',
	'Angular', 'Django', 'Flask', 'Spring Boot', 'Machine Learning', 'Data Analysis',
	'MATLAB', 'AutoCAD', 'SolidWorks', 'Circuit Design', 'Power Systems', 'Process Design',
	'Project Management', 'Quality Control', 'Safety Protocols', 'Process Optimization',
	'Environmental Compliance', 'Reservoir Engineering', 'Drilling Operations'
];