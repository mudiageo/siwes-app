<!-- src/routes/app/company/profile/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
	import { Badge } from '$lib/components/ui/badge';
	import Building2 from '@lucide/svelte/icons/building-2';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Phone from '@lucide/svelte/icons/phone';
	import Mail from '@lucide/svelte/icons/mail';
	import Globe from '@lucide/svelte/icons/globe';
	import Users from '@lucide/svelte/icons/users';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Award from '@lucide/svelte/icons/award';
	import Settings from '@lucide/svelte/icons/settings';
	
	import { getProfile, updateCompanyProfile } from '$lib/profile.remote.js';

	let { data } = $props();
	
	let profile = $state(data.profile);
	let user = $state(data.user);
	
	// Form state
	let isEditing = $state(false);
	let isSaving = $state(false);
	
	// Form data
	let formData = $state({
		name: profile?.name || '',
		industry: profile?.industry || '',
		location: profile?.location || '',
		size: profile?.size || 'medium',
		description: profile?.description || '',
		website: profile?.website || '',
		contactEmail: profile?.contactEmail || '',
		contactPhone: profile?.contactPhone || '',
		establishedYear: profile?.establishedYear || new Date().getFullYear()
	});

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

	async function handleSave() {
		isSaving = true;
		try {
			const result = await updateCompanyProfile(new FormData());
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
			name: profile?.name || '',
			industry: profile?.industry || '',
			location: profile?.location || '',
			size: profile?.size || 'medium',
			description: profile?.description || '',
			website: profile?.website || '',
			contactEmail: profile?.contactEmail || '',
			contactPhone: profile?.contactPhone || '',
			establishedYear: profile?.establishedYear || new Date().getFullYear()
		};
		isEditing = false;
	}
</script>

<svelte:head>
	<title>Company Profile - SIWES AI</title>
</svelte:head>

<div class="space-y-6">
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
				<Button onclick={handleSave} disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		{/if}
	</div>

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
							bind:value={formData.name}
							disabled={!isEditing}
							required
						/>
					</div>

					<div class="grid sm:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="industry">Industry</Label>
							<Select disabled={!isEditing}>
								<SelectTrigger>
									<SelectValue placeholder="Select industry" />
								</SelectTrigger>
								<SelectContent>
									{#each industries as industry}
										<SelectItem value={industry}>{industry}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>

						<div class="space-y-2">
							<Label for="location">Location</Label>
							<Select disabled={!isEditing}>
								<SelectTrigger>
									<SelectValue placeholder="Select location" />
								</SelectTrigger>
								<SelectContent>
									{#each locations as location}
										<SelectItem value={location}>{location}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>
					</div>

					<div class="grid sm:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="size">Company Size</Label>
							<Select disabled={!isEditing}>
								<SelectTrigger>
									<SelectValue placeholder="Select company size" />
								</SelectTrigger>
								<SelectContent>
									{#each companySizes as size}
										<SelectItem value={size.value}>{size.label}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
						</div>

						<div class="space-y-2">
							<Label for="establishedYear">Established Year</Label>
							<Input
								id="establishedYear"
								type="number"
								bind:value={formData.establishedYear}
								disabled={!isEditing}
								min="1800"
								max={new Date().getFullYear()}
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="description">Company Description</Label>
						<Textarea
							id="description"
							bind:value={formData.description}
							disabled={!isEditing}
							placeholder="Tell students about your company, culture, and what makes you a great place for SIWES placements..."
							rows="6"
						/>
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
							type="url"
							bind:value={formData.website}
							disabled={!isEditing}
							placeholder="https://company.com"
						/>
					</div>

					<div class="grid sm:grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="contactEmail" class="flex items-center">
								<Mail class="h-4 w-4 mr-2" />
								Contact Email
							</Label>
							<Input
								id="contactEmail"
								type="email"
								bind:value={formData.contactEmail}
								disabled={!isEditing}
								placeholder="hr@company.com"
							/>
						</div>

						<div class="space-y-2">
							<Label for="contactPhone" class="flex items-center">
								<Phone class="h-4 w-4 mr-2" />
								Contact Phone
							</Label>
							<Input
								id="contactPhone"
								type="tel"
								bind:value={formData.contactPhone}
								disabled={!isEditing}
								placeholder="+234 xxx xxx xxxx"
							/>
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
</div>
