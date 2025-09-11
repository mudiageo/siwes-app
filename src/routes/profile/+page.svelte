<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import SkillsInput from '$lib/components/forms/SkillsInput.svelte';
	import ProfileCompletion from '$lib/components/profile/ProfileCompletion.svelte';
	import Upload from '@lucide/svelte/icons/upload';
import Camera from '@lucide/svelte/icons/camera';
import ExternalLink from '@lucide/svelte/icons/external-link';
import Save from '@lucide/svelte/icons/save';
import User from '@lucide/svelte/icons/user';
import GraduationCap from '@lucide/svelte/icons/graduation-cap';
import MapPin from '@lucide/svelte/icons/map-pin';
import Briefcase from '@lucide/svelte/icons/briefcase';
	import { nigerianUniversities, engineeringDepartments, nigerianStates, industries } from '$lib/services/sample-data.js';

	// Mock user data - in real app this would be fetched
	const userType = 'student'; // or 'company'
	
	// Student profile data
	let firstName = $state('Adebayo');
	let lastName = $state('Ogundimu');
	let email = $state('adebayo.ogundimu@unilag.edu.ng');
	let phoneNumber = $state('+234-8012345678');
	let university = $state('University of Benin');
	let department = $state('Computer Enhineering');
	let level = $state(300);
	let cgpa = $state(3.8);
	let location = $state('Lagos');
	let bio = $state('Passionate software developer with experience in full-stack web development. Interested in fintech and machine learning applications.');
	let linkedinUrl = $state('https://linkedin.com/in/adebayo-ogundimu');
	let githubUrl = $state('https://github.com/adebayo-dev');
	let portfolioUrl = $state('https://adebayo-portfolio.vercel.app');

	let skills = $state(['JavaScript', 'React', 'Node.js', 'Python', 'Git', 'SQL']);
	let desiredSkills = $state(['Machine Learning', 'AWS', 'Docker', 'TypeScript']);
	let preferredLocations = $state(['Lagos', 'Abuja', 'Remote']);
	let preferredIndustries = $state(['Technology', 'Fintech', 'Telecommunications']);

	let saving = $state(false);

	async function saveProfile() {
		saving = true;
		
		// Simulate save
		setTimeout(() => {
			saving = false;
			// Show success message
		}, 1000);
	}

	async function uploadResume() {
		// Simulate file upload
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.pdf,.doc,.docx';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				console.log('Uploading resume:', file.name);
				// Handle resume upload
			}
		};
		input.click();
	}

	async function uploadPhoto() {
		// Simulate photo upload
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = 'image/*';
		input.onchange = (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (file) {
				console.log('Uploading photo:', file.name);
				// Handle photo upload
			}
		};
		input.click();
	}
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Profile</h1>
			<p class="text-muted-foreground">Manage your profile information and preferences</p>
		</div>
		<Button on:click={saveProfile} disabled={saving}>
			<Save class="h-4 w-4 mr-2" />
			{saving ? 'Saving...' : 'Save Changes'}
		</Button>
	</div>

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Main Profile -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Personal Information -->
			<Card class="p-6">
				<div class="flex items-center space-x-2 mb-6">
					<User class="h-5 w-5 text-primary" />
					<h2 class="text-lg font-semibold text-foreground">Personal Information</h2>
				</div>

				<div class="space-y-4">
					<!-- Profile Photo -->
					<div class="flex items-center space-x-4">
						<Avatar class="h-20 w-20">
							<AvatarImage src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150" />
							<AvatarFallback class="text-lg">{firstName[0]}{lastName[0]}</AvatarFallback>
						</Avatar>
						<div class="space-y-2">
							<Button variant="outline" size="sm" on:click={uploadPhoto}>
								<Camera class="h-4 w-4 mr-2" />
								Change Photo
							</Button>
							<p class="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="firstName">First Name</Label>
							<Input id="firstName" bind:value={firstName} />
						</div>
						<div class="space-y-2">
							<Label for="lastName">Last Name</Label>
							<Input id="lastName" bind:value={lastName} />
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="email">Email</Label>
							<Input id="email" type="email" bind:value={email} />
						</div>
						<div class="space-y-2">
							<Label for="phone">Phone Number</Label>
							<Input id="phone" bind:value={phoneNumber} />
						</div>
					</div>

					<div class="space-y-2">
						<Label for="bio">Bio</Label>
						<Textarea 
							id="bio" 
							bind:value={bio} 
							placeholder="Tell us about yourself, your interests, and career goals..."
							rows={4}
						/>
					</div>
				</div>
			</Card>

			<!-- Academic Information -->
			<Card class="p-6">
				<div class="flex items-center space-x-2 mb-6">
					<GraduationCap class="h-5 w-5 text-primary" />
					<h2 class="text-lg font-semibold text-foreground">Academic Information</h2>
				</div>

				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="university">University</Label>
						<Select bind:value={university}>
							<SelectTrigger>
								{university ?? "Select your university"}
							</SelectTrigger>
							<SelectContent>
								{#each nigerianUniversities as uni}
									<SelectItem value={uni}>{uni}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="department">Department</Label>
							<Select bind:value={department}>
								<SelectTrigger>
									{department ?? "Select department"}
								</SelectTrigger>
								<SelectContent>
									{#each engineeringDepartments as dept}
										<SelectItem value={dept}>{dept}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>
						<div class="space-y-2">
							<Label for="level">Current Level</Label>
							<Select bind:value={level}>
								<SelectTrigger>
									{level ?? "Select level"}
								</SelectTrigger>
								<SelectContent>
									<SelectItem value={100}>100 Level</SelectItem>
									<SelectItem value={200}>200 Level</SelectItem>
									<SelectItem value={300}>300 Level</SelectItem>
									<SelectItem value={400}>400 Level</SelectItem>
									<SelectItem value={500}>500 Level</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="cgpa">CGPA</Label>
							<Input
								id="cgpa"
								type="number"
								step="0.01"
								min="0"
								max="5"
								bind:value={cgpa}
								placeholder="4.50"
							/>
						</div>
						<div class="space-y-2">
							<Label for="location">Current Location</Label>
							<Select bind:value={location}>
								<SelectTrigger>
									{location ?? "Select location" }
								</SelectTrigger>
								<SelectContent>
									{#each nigerianStates as state}
										<SelectItem value={state}>{state}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			</Card>

			<!-- Skills & Preferences -->
			<Card class="p-6">
				<div class="flex items-center space-x-2 mb-6">
					<Briefcase class="h-5 w-5 text-primary" />
					<h2 class="text-lg font-semibold text-foreground">Skills & Preferences</h2>
				</div>

				<div class="space-y-6">
					<div class="space-y-2">
						<Label>Current Skills</Label>
						<SkillsInput bind:skills placeholder="Add your current skills..." />
					</div>

					<div class="space-y-2">
						<Label>Skills You Want to Learn</Label>
						<SkillsInput bind:skills={desiredSkills} placeholder="Add skills you want to learn..." />
					</div>

					<div class="space-y-2">
						<Label>Preferred Locations</Label>
						<SkillsInput 
							bind:skills={preferredLocations} 
							suggestions={nigerianStates}
							placeholder="Add preferred work locations..." 
						/>
					</div>

					<div class="space-y-2">
						<Label>Preferred Industries</Label>
						<SkillsInput 
							bind:skills={preferredIndustries} 
							suggestions={industries}
							placeholder="Add preferred industries..." 
						/>
					</div>
				</div>
			</Card>

			<!-- Documents & Links -->
			<Card class="p-6">
				<h2 class="text-lg font-semibold text-foreground mb-6">Documents & Links</h2>

				<div class="space-y-4">
					<!-- Resume Upload -->
					<div class="space-y-2">
						<Label>Resume/CV</Label>
						<div class="flex items-center space-x-2">
							<Button variant="outline" on:click={uploadResume}>
								<Upload class="h-4 w-4 mr-2" />
								Upload Resume
							</Button>
							<span class="text-sm text-muted-foreground">PDF, DOC, or DOCX (max 5MB)</span>
						</div>
						<p class="text-xs text-muted-foreground">
							Current: <span class="text-foreground">adebayo_resume_2025.pdf</span>
						</p>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div class="space-y-2">
							<Label for="linkedin">LinkedIn Profile</Label>
							<Input
								id="linkedin"
								bind:value={linkedinUrl}
								placeholder="https://linkedin.com/in/your-profile"
							/>
						</div>
						<div class="space-y-2">
							<Label for="github">GitHub Profile</Label>
							<Input
								id="github"
								bind:value={githubUrl}
								placeholder="https://github.com/your-username"
							/>
						</div>
						<div class="space-y-2">
							<Label for="portfolio">Portfolio Website</Label>
							<Input
								id="portfolio"
								bind:value={portfolioUrl}
								placeholder="https://your-portfolio.com"
							/>
						</div>
					</div>
				</div>
			</Card>
		</div>

		<!-- Right Sidebar -->
		<div class="space-y-6">
			<!-- Profile Completion -->
			<ProfileCompletion completeness={85} {userType} />

			<!-- Profile Preview -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold text-foreground mb-4">Profile Preview</h3>
				
				<div class="space-y-4">
					<div class="flex items-center space-x-3">
						<Avatar class="h-12 w-12">
							<AvatarImage src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150" />
							<AvatarFallback>{firstName[0]}{lastName[0]}</AvatarFallback>
						</Avatar>
						<div>
							<h4 class="font-semibold text-foreground">{firstName} {lastName}</h4>
							<p class="text-sm text-muted-foreground">{department}, Level {level}</p>
							<p class="text-sm text-muted-foreground">{university}</p>
						</div>
					</div>

					<div class="space-y-2">
						<div class="flex items-center space-x-2 text-sm">
							<MapPin class="h-4 w-4 text-muted-foreground" />
							<span class="text-muted-foreground">{location}</span>
						</div>
						<div class="text-sm">
							<span class="font-medium text-foreground">CGPA:</span>
							<span class="text-muted-foreground ml-1">{cgpa}/5.0</span>
						</div>
					</div>

					<div class="space-y-2">
						<Label class="text-sm">Top Skills</Label>
						<div class="flex flex-wrap gap-1">
							{#each skills.slice(0, 4) as skill}
								<Badge variant="secondary" class="text-xs">{skill}</Badge>
							{/each}
							{#if skills.length > 4}
								<Badge variant="outline" class="text-xs">+{skills.length - 4} more</Badge>
							{/if}
						</div>
					</div>

					<Button variant="outline" size="sm" class="w-full">
						<ExternalLink class="h-4 w-4 mr-2" />
						Preview Public Profile
					</Button>
				</div>
			</Card>

			<!-- Profile Tips -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold text-foreground mb-4">Profile Tips</h3>
				
				<div class="space-y-3 text-sm">
					<div class="flex items-start space-x-2">
						<div class="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
						<p class="text-muted-foreground">Add specific technical skills to get better matches</p>
					</div>
					<div class="flex items-start space-x-2">
						<div class="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
						<p class="text-muted-foreground">Upload a recent resume to increase your visibility</p>
					</div>
					<div class="flex items-start space-x-2">
						<div class="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
						<p class="text-muted-foreground">Complete all sections for 2x more placement views</p>
					</div>
					<div class="flex items-start space-x-2">
						<div class="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></div>
						<p class="text-muted-foreground">Link your LinkedIn and GitHub for credibility</p>
					</div>
				</div>
			</Card>
		</div>
	</div>
</div>