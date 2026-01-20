<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger, } from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
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
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	
	import { getProfile, updateStudentProfile, uploadResume } from '$lib/profile.remote.js';

	// Get profile data
	let profileData = $derived(await getProfile());
	let profile = $derived(profileData.profile);
	let user = $derived(profileData.user);
	
	// Extract fields from form for easier access
	const { 
		firstName, 
		lastName, 
		phoneNumber, 
		university, 
		department, 
		level, 
		cgpa, 
		location, 
		bio, 
		linkedinUrl, 
		githubUrl, 
		portfolioUrl, 
		skills, 
		desiredSkills, 
		preferredLocations, 
		preferredIndustries 
	} = updateStudentProfile.fields;
	
	// Form state
	let isEditing = $state(false);
	let isSaving = $state(false);
	let isUploading = $state(false);
	let saveSuccess = $state(false);
	let saveError = $state<string | null>(null);

	// Check if form has any validation issues
	const hasErrors = $derived((updateStudentProfile.fields.allIssues()?.length || 0) > 0);

	// Initialize form with profile data
	handleReset()

	const universities = [
		'University of Lagos', 'University of Benin', 'University of Ibadan', 'Obafemi Awolowo University',
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

	async function handleSave({ submit }) {
		isSaving = true;
		saveError = null;
		saveSuccess = false;
		
		try {
			// Validate form before submitting
			await updateStudentProfile.validate();
			
			// Check if there are validation errors
			if (hasErrors) {
				saveError = 'Please fix the validation errors before saving.';
				isSaving = false;
				return;
			}
			
			await submit().updates(getProfile());
			isEditing = false;
			saveSuccess = true;
			// Auto-hide success message after 3 seconds
			setTimeout(() => {
				saveSuccess = false;
			}, 3000);
		} catch (error) {
			console.error('Failed to update profile:', error);
			saveError = error instanceof Error ? error.message : 'Failed to update profile. Please try again.';
		} finally {
			isSaving = false;
		}
	}

	function handleReset() {
		// Reset form data to profile values
		if (profile)	updateStudentProfile.fields.set(profile)
		isEditing = false;
	}

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		isUploading = true;
		try {
			// Here you would implement actual file upload and CV parsing
			// For demo purposes, we'll simulate it
			const mockExtractedSkills = ['JavaScript', 'Python', 'React'];
			
			await uploadResume({
				fileUrl: 'https://example.com/resume.pdf',
				extractedSkills: mockExtractedSkills
			}).updates(getProfile());
			
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
	<form {...updateStudentProfile.enhance(handleSave)} >
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
				<Button variant="outline" onclick={handleReset} disabled={isSaving}>
					Cancel
				</Button>
				<Button type="submit" disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		{/if}
	</div>

	<!-- Success/Error Messages -->
	{#if saveSuccess}
		<Alert class="border-green-500 bg-green-50 dark:bg-green-950">
			<CheckCircle2 class="h-4 w-4 text-green-600 dark:text-green-400" />
			<AlertDescription class="text-green-800 dark:text-green-200">
				Profile updated successfully!
			</AlertDescription>
		</Alert>
	{/if}

	{#if saveError}
		<Alert variant="destructive">
			<AlertCircle class="h-4 w-4" />
			<AlertDescription>
				{saveError}
			</AlertDescription>
		</Alert>
	{/if}

	{#if hasErrors && isEditing}
		<Alert variant="destructive">
			<AlertCircle class="h-4 w-4" />
			<AlertDescription>
				Please fix the errors below before saving.
			</AlertDescription>
		</Alert>
	{/if}

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
							{...firstName.as('text')}
							disabled={!isEditing}
							required
							class={(firstName.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
						/>
						{#each firstName.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>

					<div class="space-y-2">
						<Label for="lastName">Last Name</Label>
						<Input
							id="lastName"
							{...lastName.as('text')}
							disabled={!isEditing}
							required
							class={(lastName.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
						/>
						{#each lastName.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>

					<div class="space-y-2">
						<Label for="phoneNumber">Phone Number</Label>
						<Input
							id="phoneNumber"
							{...phoneNumber.as('tel')}
							disabled={!isEditing}
							placeholder="+234 xxx xxx xxxx"
							class={(phoneNumber.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
						/>
						{#each phoneNumber.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>

					<div class="space-y-2">
						<Label for="location">Current Location</Label>
						<Select {...location.as('select')} disabled={!isEditing}>
							<SelectTrigger class={(location.issues()?.length || 0) > 0 ? 'border-red-500' : ''}>
								{location.value() || "Select location"}
							</SelectTrigger>
							<SelectContent>
								{#each locations as loc}
									<SelectItem value={loc}>{loc}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						{#each location.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>
				</div>

				<div class="space-y-2 mt-4">
					<Label for="bio">Bio</Label>
					<Textarea
						id="bio"
						{...bio.as('text')}
						disabled={!isEditing}
						placeholder="Tell us about yourself..."
						rows="4"
						class={(bio.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
					/>
					{#each bio.issues() || [] as issue}
						<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
							<AlertCircle class="h-3 w-3" />
							{issue.message}
						</p>
					{/each}
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
						<Select {...university.as('select')} disabled={!isEditing} required>
							<SelectTrigger class={(university.issues()?.length || 0) > 0 ? 'border-red-500' : ''}>
								{university.value() || "Select university"}
							</SelectTrigger>
							<SelectContent>
								{#each universities as uni}
									<SelectItem value={uni}>{uni}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						{#each university.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>

					<div class="space-y-2">
						<Label for="department">Department</Label>
						<Select {...department.as('select')} disabled={!isEditing} required>
							<SelectTrigger class={(department.issues()?.length || 0) > 0 ? 'border-red-500' : ''}>
								{department.value() || "Select department"}
							</SelectTrigger>
							<SelectContent>
								{#each departments as dept}
									<SelectItem value={dept}>{dept}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
						{#each department.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>

					<div class="space-y-2">
						<Label for="level">Level</Label>
						<Select {...level.as('select')} disabled={!isEditing}>
							<SelectTrigger class={(level.issues()?.length || 0) > 0 ? 'border-red-500' : ''}>
								{level.value() || "Select level"}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="200">200 Level</SelectItem>
								<SelectItem value="300">300 Level</SelectItem>
								<SelectItem value="400">400 Level</SelectItem>
								<SelectItem value="500">500 Level</SelectItem>
							</SelectContent>
						</Select>
						{#each level.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>

					<div class="space-y-2">
						<Label for="cgpa">CGPA</Label>
						<Input
							id="cgpa"
							{...cgpa.as('number')}
							step="0.01"
							min="0"
							max="5.0"
							disabled={!isEditing}
							placeholder="4.50"
							class={(cgpa.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
						/>
						{#each cgpa.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
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
							field={skills}
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
							field={desiredSkills}
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
							field={preferredLocations}
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
							field={preferredIndustries}
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
							{...linkedinUrl.as('url')}
							disabled={!isEditing}
							placeholder="https://linkedin.com/in/your-profile"
							class={(linkedinUrl.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
						/>
						{#each linkedinUrl.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>

					<div class="space-y-2">
						<Label for="githubUrl" class="flex items-center">
							<Github class="h-4 w-4 mr-2" />
							GitHub URL
						</Label>
						<Input
							id="githubUrl"
							{...githubUrl.as('url')}
							disabled={!isEditing}
							placeholder="https://github.com/your-username"
							class={(githubUrl.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
						/>
						{#each githubUrl.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>

					<div class="space-y-2">
						<Label for="portfolioUrl" class="flex items-center">
							<Globe class="h-4 w-4 mr-2" />
							Portfolio URL
						</Label>
						<Input
							id="portfolioUrl"
							{...portfolioUrl.as('url')}
							disabled={!isEditing}
							placeholder="https://your-portfolio.com"
							class={(portfolioUrl.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
						/>
						{#each portfolioUrl.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
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
							<span>{(skills.value() || []).length}</span>
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
	</form>
</div>
