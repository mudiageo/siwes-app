<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';
	import Building2 from '@lucide/svelte/icons/building-2';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Phone from '@lucide/svelte/icons/phone';
	import Mail from '@lucide/svelte/icons/mail';
	import Globe from '@lucide/svelte/icons/globe';
	import Users from '@lucide/svelte/icons/users';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Award from '@lucide/svelte/icons/award';
	import Settings from '@lucide/svelte/icons/settings';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	
	import { getProfile, updateCompanyProfile } from '$lib/profile.remote.js';

	// Get profile data
	let profileData = $derived(await getProfile());
	let profile = $derived(profileData.profile);
	let user = $derived(profileData.user);
	
	// Extract fields from form
	const { 
		name,
		industry,
		location,
		size,
		description,
		website,
		contactEmail,
		contactPhone,
		establishedYear
	} = updateCompanyProfile.fields;
	
	// Form state
	let isEditing = $state(false);
	let isSaving = $state(false);
	let saveSuccess = $state(false);
	let saveError = $state<string | null>(null);

	// Check if form has any validation issues
	const hasErrors = $derived((updateCompanyProfile.fields.allIssues()?.length || 0) > 0);

	// Initialize form with profile data
	handleReset()

	const industries = [
		'Technology', 'Oil & Gas', 'Banking & Finance', 'Telecommunications',
		'Manufacturing', 'Construction', 'Healthcare', 'Education',
		'Agriculture', 'Media & Entertainment', 'Government', 'Consulting'
	];

	const locations = [
		'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin City',
		'Enugu', 'Jos', 'Kaduna', 'Warri', 'Calabar', 'Owerri'
	];

	const companySizes = [
		{ value: 'startup', label: 'Startup (1-10 employees)' },
		{ value: 'small', label: 'Small (11-50 employees)' },
		{ value: 'medium', label: 'Medium (51-200 employees)' },
		{ value: 'large', label: 'Large (201-1000 employees)' },
		{ value: 'enterprise', label: 'Enterprise (1000+ employees)' }
	];

	async function handleSave({ submit }) {
		isSaving = true;
		saveError = null;
		saveSuccess = false;
		
		try {
			// Validate form before submitting
			await updateCompanyProfile.validate();
			
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
		if (profile) updateCompanyProfile.fields.set(profile)
		isEditing = false;
	}
</script>

<svelte:head>
	<title>Company Profile - SIWES AI</title>
</svelte:head>

<div class="space-y-6">
	<form {...updateCompanyProfile.enhance(handleSave)}>

	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Company Profile</h1>
			<p class="text-muted-foreground">
				Manage your company information and preferences
			</p>
		</div>
		
		{#if !isEditing}
			<Button onclick={() => isEditing = true}>
				<Settings class="h-4 w-4 mr-2" />
				Edit Profile
			</Button>
		{:else}
			<div class="flex gap-2">
				<Button variant="outline" onclick={handleCancel} disabled={isSaving}>
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

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Main Profile Form -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Company Information -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-6 flex items-center">
					<Building2 class="h-5 w-5 mr-2" />
					Company Information
				</h3>

				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="name">Company Name</Label>
						<Input
							id="name"
							{...name.as('text')}
							disabled={!isEditing}
							required
							class={(name.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
						/>
						{#each name.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>

					<div class="grid sm:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="industry">Industry</Label>
							<Select {...industry.as('select')} type="single" disabled={!isEditing} required>
								<SelectTrigger class={(industry.issues()?.length || 0) > 0 ? 'border-red-500' : ''}>
									{industry.value() || "Select industry"}
								</SelectTrigger>
								<SelectContent>
									{#each industries as ind}
										<SelectItem value={ind}>{ind}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
							{#each industry.issues() || [] as issue}
								<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
									<AlertCircle class="h-3 w-3" />
									{issue.message}
								</p>
							{/each}
						</div>

						<div class="space-y-2">
							<Label for="location">Location</Label>
							<Select {...location.as('select')} type="submit" disabled={!isEditing} required>
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

					<div class="grid sm:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="size">Company Size</Label>
							<Select {...size.as('select')} type="single" disabled={!isEditing} required>
								<SelectTrigger class={(size.issues()?.length || 0) > 0 ? 'border-red-500' : ''}>
									{size.value() || "Select company size"}
								</SelectTrigger>
								<SelectContent>
									{#each companySizes as companySize}
										<SelectItem value={companySize.value}>{companySize.label}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
							{#each size.issues() || [] as issue}
								<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
									<AlertCircle class="h-3 w-3" />
									{issue.message}
								</p>
							{/each}
						</div>

						<div class="space-y-2">
							<Label for="establishedYear">Established Year</Label>
							<Input
								id="establishedYear"
								{...establishedYear.as('number')}
								disabled={!isEditing}
								min="1800"
								max={new Date().getFullYear()}
								class={(establishedYear.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
							/>
							{#each establishedYear.issues() || [] as issue}
								<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
									<AlertCircle class="h-3 w-3" />
									{issue.message}
								</p>
							{/each}
						</div>
					</div>

					<div class="space-y-2">
						<Label for="description">Company Description</Label>
						<Textarea
							id="description"
							{...description.as('text')}
							disabled={!isEditing}
							placeholder="Tell students about your company, culture, and what makes you a great place for SIWES placements..."
							rows="6"
							required
							class={(description.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
						/>
						{#each description.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>
				</div>
			</Card>

			<!-- Contact Information -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-6 flex items-center">
					<Phone class="h-5 w-5 mr-2" />
					Contact Information
				</h3>

				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="website" class="flex items-center">
							<Globe class="h-4 w-4 mr-2" />
							Company Website
						</Label>
						<Input
							id="website"
							{...website.as('url')}
							disabled={!isEditing}
							placeholder="https://company.com"
							class={(website.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
						/>
						{#each website.issues() || [] as issue}
							<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
								<AlertCircle class="h-3 w-3" />
								{issue.message}
							</p>
						{/each}
					</div>

					<div class="grid sm:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="contactEmail" class="flex items-center">
								<Mail class="h-4 w-4 mr-2" />
								Contact Email
							</Label>
							<Input
								id="contactEmail"
								{...contactEmail.as('email')}
								disabled={!isEditing}
								placeholder="hr@company.com"
								class={(contactEmail.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
							/>
							{#each contactEmail.issues() || [] as issue}
								<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
									<AlertCircle class="h-3 w-3" />
									{issue.message}
								</p>
							{/each}
						</div>

						<div class="space-y-2">
							<Label for="contactPhone" class="flex items-center">
								<Phone class="h-4 w-4 mr-2" />
								Contact Phone
							</Label>
							<Input
								id="contactPhone"
								{...contactPhone.as('tel')}
								disabled={!isEditing}
								placeholder="+234 xxx xxx xxxx"
								class={(contactPhone.issues()?.length || 0) > 0 ? 'border-red-500' : ''}
							/>
							{#each contactPhone.issues() || [] as issue}
								<p class="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
									<AlertCircle class="h-3 w-3" />
									{issue.message}
								</p>
							{/each}
						</div>
					</div>
				</div>
			</Card>
		</div>

		<!-- Sidebar -->
		<div class="space-y-6">
			<!-- Company Stats -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-4 flex items-center">
					<Award class="h-5 w-5 mr-2" />
					Company Stats
				</h3>

				<div class="space-y-4">
					<div class="flex justify-between items-center">
						<span class="text-sm text-muted-foreground">Active Placements</span>
						<span class="font-semibold">5</span>
					</div>
					
					<div class="flex justify-between items-center">
						<span class="text-sm text-muted-foreground">Total Applications</span>
						<span class="font-semibold">42</span>
					</div>
					
					<div class="flex justify-between items-center">
						<span class="text-sm text-muted-foreground">Students Hired</span>
						<span class="font-semibold">18</span>
					</div>
					
					<div class="flex justify-between items-center">
						<span class="text-sm text-muted-foreground">Profile Views</span>
						<span class="font-semibold">156</span>
					</div>
				</div>

				<div class="mt-6 pt-4 border-t">
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm text-muted-foreground">Company Rating</span>
						<div class="flex items-center">
							<span class="font-semibold mr-1">4.8</span>
							<div class="flex text-yellow-400">
								★★★★★
							</div>
						</div>
					</div>
					<p class="text-xs text-muted-foreground">Based on student feedback</p>
				</div>
			</Card>

			<!-- Verification Status -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-4 flex items-center">
					<Award class="h-5 w-5 mr-2" />
					Verification Status
				</h3>

				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span class="text-sm">Email Verified</span>
						<Badge variant="default">✓</Badge>
					</div>
					
					<div class="flex items-center justify-between">
						<span class="text-sm">Phone Verified</span>
						<Badge variant="secondary">Pending</Badge>
					</div>
					
					<div class="flex items-center justify-between">
						<span class="text-sm">Company Verified</span>
						{#if profile?.isVerified}
							<Badge variant="default">✓ Verified</Badge>
						{:else}
							<Badge variant="destructive">Pending</Badge>
						{/if}
					</div>
				</div>

				{#if !profile?.isVerified}
					<div class="mt-4 p-4 bg-blue-50 rounded-lg">
						<p class="text-sm text-blue-700 mb-2">
							Complete verification to increase trust with students
						</p>
						<Button size="sm" variant="outline">
							Submit Documents
						</Button>
					</div>
				{/if}
			</Card>

			<!-- Quick Actions -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold mb-4">Quick Actions</h3>

				<div class="space-y-2">
					<Button variant="outline" class="w-full justify-start">
						<Building2 class="h-4 w-4 mr-2" />
						Manage Placements
					</Button>
					
					<Button variant="outline" class="w-full justify-start">
						<Users class="h-4 w-4 mr-2" />
						View Applications
					</Button>
					
					<Button variant="outline" class="w-full justify-start">
						<Calendar class="h-4 w-4 mr-2" />
						Schedule Interviews
					</Button>
				</div>
			</Card>
		</div>
	</div>
	</form>
</div>
