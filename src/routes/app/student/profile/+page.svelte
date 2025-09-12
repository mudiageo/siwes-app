<!-- src/routes/app/student/profile/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger, } from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import SkillsInput from '$lib/components/forms/SkillsInput.svelte';
	import ProfileCompletion from '$lib/components/profile/ProfileCompletion.svelte';
	import User from '@lucide/svelte/icons/user';
	import School from '@lucide/svelte/icons/school';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Phone from '@lucide/svelte/icons/phone';
	import Mail from '@lucide/svelte/icons/mail';
	import Globe from '@lucide/svelte/icons/globe';
	import Github from '@lucide/svelte/icons/github';
	import Linkedin from '@lucide/svelte/icons/linkedin';
	import Upload from '@lucide/svelte/icons/upload';
	import Star from '@lucide/svelte/icons/star';
	import Award from '@lucide/svelte/icons/award';
	
	import { getProfile, updateStudentProfile, uploadResume } from '$lib/profile.remote.js';

	let { data } = $props();
	
	let profile = $state(data.profile);
	let user = $state(data.user);
	
	// Form state
	let isEditing = $state(false);
	let isSaving = $state(false);
	let isUploading = $state(false);
	
	// Form data
	let formData = $state({
		firstName: profile?.firstName || '',
		lastName: profile?.lastName || '',
		phoneNumber: profile?.phoneNumber || '',
		university: profile?.university || '',
		department: profile?.department || '',
		level: profile?.level || 300,
		cgpa: profile?.cgpa || 0,
		location: profile?.location || '',
		bio: profile?.bio || '',
		linkedinUrl: profile?.linkedinUrl || '',
		githubUrl: profile?.githubUrl || '',
		portfolioUrl: profile?.portfolioUrl || '',
		skills: profile?.skills || [],
		desiredSkills: profile?.desiredSkills || [],
		preferredLocations: profile?.preferredLocations || [],
		preferredIndustries: profile?.preferredIndustries || []
	});

	const universities = [
		'University of Lagos', 'University of Ibadan', 'Obafemi Awolowo University',
		'Ahmadu Bello University', 'University of Nigeria Nsukka', 'Lagos State University',
		'Covenant University', 'Babcock University', 'Federal University of Technology Akure',
		'Rivers State University'
	];

	const departments = [
		'Computer Science', 'Software Engineering', 'Computer Engineering',
		'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
		'Chemical Engineering', 'Information Technology', 'Cybersecurity',
		'Data Science', 'Industrial Engineering'
	];

	const locations = [
		'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin City',
		'Enugu', 'Jos', 'Kaduna', 'Warri', 'Calabar'
	];

	const industries = [
		'Technology', 'Oil & Gas', 'Banking & Finance', 'Telecommunications',
		'Manufacturing', 'Construction', 'Healthcare', 'Education',
		'Agriculture', 'Media & Entertainment'
	];

	async function handleSave() {
		isSaving = true;
		try {
			const result = await updateStudentProfile(new FormData());
			if (result.success) {
				// Refresh profile data
				const updatedData = await getProfile();
				profile = updatedData.profile;
				isEditing = false;
			}
		} catch (error) {
			console.error('Failed to update profile:', error);
		} finally {
			isSaving = false;
		}
	}

	function handleCancel() {
		// Reset form data
		formData = {
			firstName: profile?.firstName || '',
			lastName: profile?.lastName || '',
			phoneNumber: profile?.phoneNumber || '',
			university: profile?.university || '',
			department: profile?.department || '',
			level: profile?.level || 300,
			cgpa: profile?.cgpa || 0,
			location: profile?.location || '',
			bio: profile?.bio || '',
			linkedinUrl: profile?.linkedinUrl || '',
			githubUrl: profile?.githubUrl || '',
			portfolioUrl: profile?.portfolioUrl || '',
			skills: profile?.skills || [],
			desiredSkills: profile?.desiredSkills || [],
			preferredLocations: profile?.preferredLocations || [],
			preferredIndustries: profile?.preferredIndustries || []
		};
		isEditing = false;
	}

	async function handleFileUpload(event) {
		const file = event.target.files?.[0];
		if (!file) return;

		isUploading = true;
		try {
			// Here you would implement actual file upload and CV parsing
			// For demo purposes, we'll simulate it
			const mockExtractedSkills = ['JavaScript', 'Python', 'React'];
			
			await uploadResume({
				fileUrl: 'https://example.com/resume.pdf',
				extractedSkills: mockExtractedSkills
			});

			// Refresh profile
			const updatedData = await getProfile();
			profile = updatedData.profile;
			
		} catch (error) {
			console.error('Failed to upload resume:', error);
		} finally {
			isUploading = false;
		}
	}
</script>

<svelte:head>
	<title>My Profile - SIWES AI</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-foreground">My Profile</h1>
			<p class="text-muted-foreground">
				Manage your personal information and preferences
			</p>
		</div>
		
		{#if !isEditing}
			<Button onclick={() => isEditing = true}>
				<User class="h-4 w-4 mr-2" />
				Edit Profile
			</Button>
		{:else}
			<div class="flex gap-2">
				<Button variant="outline" onclick={handleCancel} disabled={isSaving}>
					Cancel
				</Button>
				<Button onclick={handleSave} disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		{/if}
	</div>

	<!-- Profile Completion -->
	{#if profile?.profileCompleteness < 80}
		<ProfileCompletion completeness={profile?.profileCompleteness || 0} />
	{/if}

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Main Profile Form -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Personal Information -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-6 flex items-center">
					<User class="h-5 w-5 mr-2" />
					Personal Information
				</h3>

				<div class="grid sm:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="firstName">First Name</Label>
						<Input
							id="firstName"
							bind:value={formData.firstName}
							disabled={!isEditing}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="lastName">Last Name</Label>
						<Input
							id="lastName"
							bind:value={formData.lastName}
							disabled={!isEditing}
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="phoneNumber">Phone Number</Label>
						<Input
							id="phoneNumber"
							type="tel"
							bind:value={formData.phoneNumber}
							disabled={!isEditing}
							placeholder="+234 xxx xxx xxxx"
						/>
					</div>

					<div class="space-y-2">
						<Label for="location">Current Location</Label>
						<Select bind:value={formData.location} disabled={!isEditing}>
							<SelectTrigger>
								{formData.location || "Select location"}
							</SelectTrigger>
							<SelectContent>
								{#each locations as location}
									<SelectItem value={location}>{location}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div class="space-y-2 mt-4">
					<Label for="bio">Bio</Label>
					<Textarea
						id="bio"
						bind:value={formData.bio}
						disabled={!isEditing}
						placeholder="Tell us about yourself..."
						rows="4"
					/>
				</div>
			</Card>

			<!-- Academic Information -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-6 flex items-center">
					<School class="h-5 w-5 mr-2" />
					Academic Information
				</h3>

				<div class="grid sm:grid-cols-2 gap-4">
					<div class="space-y-2">
						<Label for="university">University</Label>
						<Select bind:value={formData.university} disabled={!isEditing}>
							<SelectTrigger>
								{formData.university || "Select university"}
							</SelectTrigger>
							<SelectContent>
								{#each universities as university}
									<SelectItem value={university}>{university}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>

					<div class="space-y-2">
						<Label for="department">Department</Label>
						<Select bind:value={formData.department} disabled={!isEditing}>
							<SelectTrigger>
								{formData.department || "Select department"}
							</SelectTrigger>
							<SelectContent>
								{#each departments as department}
									<SelectItem value={department}>{department}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</div>

					<div class="space-y-2">
						<Label for="level">Level</Label>
						<Select bind:value={formData.level} disabled={!isEditing}>
							<SelectTrigger>
								{formData.level || "Select level"}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="200">200 Level</SelectItem>
								<SelectItem value="300">300 Level</SelectItem>
								<SelectItem value="400">400 Level</SelectItem>
								<SelectItem value="500">500 Level</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div class="space-y-2">
						<Label for="cgpa">CGPA</Label>
						<Input
							id="cgpa"
							type="number"
							step="0.01"
							min="0"
							max="5.0"
							bind:value={formData.cgpa}
							disabled={!isEditing}
							placeholder="4.50"
						/>
					</div>
				</div>
			</Card>

			<!-- Skills -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-6 flex items-center">
					<Star class="h-5 w-5 mr-2" />
					Skills & Interests
				</h3>

				<div class="space-y-6">
					<div>
						<Label class="text-base font-medium">Current Skills</Label>
						<p class="text-sm text-muted-foreground mb-4">
							Skills you already have
						</p>
						<SkillsInput
							bind:value={formData.skills}
							disabled={!isEditing}
							placeholder="Add your skills..."
						/>
					</div>

					<div>
						<Label class="text-base font-medium">Skills to Learn</Label>
						<p class="text-sm text-muted-foreground mb-4">
							Skills you want to develop during your placement
						</p>
						<SkillsInput
							bind:value={formData.desiredSkills}
							disabled={!isEditing}
							placeholder="Skills you want to learn..."
						/>
					</div>
				</div>
			</Card>

			<!-- Preferences -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-6 flex items-center">
					<MapPin class="h-5 w-5 mr-2" />
					Placement Preferences
				</h3>

				<div class="space-y-6">
					<div>
						<Label class="text-base font-medium">Preferred Locations</Label>
						<p class="text-sm text-muted-foreground mb-4">
							Where would you like to do your placement?
						</p>
						<SkillsInput
							bind:value={formData.preferredLocations}
							disabled={!isEditing}
							placeholder="Add preferred locations..."
							suggestions={locations}
						/>
					</div>

					<div>
						<Label class="text-base font-medium">Preferred Industries</Label>
						<p class="text-sm text-muted-foreground mb-4">
							Which industries interest you?
						</p>
						<SkillsInput
							bind:value={formData.preferredIndustries}
							disabled={!isEditing}
							placeholder="Add preferred industries..."
							suggestions={industries}
						/>
					</div>
				</div>
			</Card>

			<!-- Links -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-6 flex items-center">
					<Globe class="h-5 w-5 mr-2" />
					Professional Links
				</h3>

				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="linkedinUrl" class="flex items-center">
							<Linkedin class="h-4 w-4 mr-2" />
							LinkedIn URL
						</Label>
						<Input
							id="linkedinUrl"
							type="url"
							bind:value={formData.linkedinUrl}
							disabled={!isEditing}
							placeholder="https://linkedin.com/in/your-profile"
						/>
					</div>

					<div class="space-y-2">
						<Label for="githubUrl" class="flex items-center">
							<Github class="h-4 w-4 mr-2" />
							GitHub URL
						</Label>
						<Input
							id="githubUrl"
							type="url"
							bind:value={formData.githubUrl}
							disabled={!isEditing}
							placeholder="https://github.com/your-username"
						/>
					</div>

					<div class="space-y-2">
						<Label for="portfolioUrl" class="flex items-center">
							<Globe class="h-4 w-4 mr-2" />
							Portfolio URL
						</Label>
						<Input
							id="portfolioUrl"
							type="url"
							bind:value={formData.portfolioUrl}
							disabled={!isEditing}
							placeholder="https://your-portfolio.com"
						/>
					</div>
				</div>
			</Card>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Resume Upload -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-4 flex items-center">
					<Upload class="h-5 w-5 mr-2" />
					Resume/CV
				</h3>

				{#if profile?.resumeUrl}
					<div class="space-y-4">
						<div class="flex items-center justify-between p-3 bg-muted rounded-lg">
							<span class="text-sm">resume.pdf</span>
							<Button size="sm" variant="outline">
								View
							</Button>
						</div>
						
						<Button 
							class="w-full" 
							variant="outline"
							disabled={isUploading}
						>
							<input
								type="file"
								accept=".pdf,.doc,.docx"
								onchange={handleFileUpload}
								class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							{isUploading ? 'Uploading...' : 'Update Resume'}
						</Button>
					</div>
				{:else}
					<div class="text-center py-8">
						<Upload class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
						<p class="text-sm text-muted-foreground mb-4">
							Upload your resume to get better matches
						</p>
						<Button class="relative" disabled={isUploading}>
							<input
								type="file"
								accept=".pdf,.doc,.docx"
								onchange={handleFileUpload}
								class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							/>
							{isUploading ? 'Uploading...' : 'Upload Resume'}
						</Button>
					</div>
				{/if}

				<p class="text-xs text-muted-foreground mt-4">
					Supported formats: PDF, DOC, DOCX (Max 5MB)
				</p>
			</Card>

			<!-- Quick Stats -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-4 flex items-center">
					<Award class="h-5 w-5 mr-2" />
					Profile Stats
				</h3>

				<div class="space-y-4">
					<div>
						<div class="flex justify-between text-sm mb-2">
							<span>Profile Completeness</span>
							<span>{Math.round(profile?.profileCompleteness || 0)}%</span>
						</div>
						<Progress value={profile?.profileCompleteness || 0} class="h-2" />
					</div>

					<div class="pt-4 border-t space-y-2">
						<div class="flex justify-between text-sm">
							<span>Skills Added</span>
							<span>{formData.skills.length}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span>Profile Views</span>
							<span>{Math.floor(Math.random() * 50) + 20}</span>
						</div>
						<div class="flex justify-between text-sm">
							<span>Match Score Avg</span>
							<span>85%</span>
						</div>
					</div>
				</div>
			</Card>
		</div>
	</div>
</div>
