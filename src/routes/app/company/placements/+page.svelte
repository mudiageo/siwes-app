<!-- @migration-task Error while migrating Svelte code: `{@const}` must be the immediate child of `{#snippet}`, `{#if}`, `{:else if}`, `{:else}`, `{#each}`, `{:then}`, `{:catch}`, `<svelte:fragment>`, `<svelte:boundary` or `<Component>`
https://svelte.dev/e/const_tag_invalid_placement -->
<!-- src/routes/app/company/placements/+page.svelte -->
<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';
	import { Switch } from '$lib/components/ui/switch';
	import SkillsInput from '$lib/components/forms/SkillsInput.svelte';
	import Plus from '@lucide/svelte/icons/plus';
	import Search from '@lucide/svelte/icons/search';
	import Filter from '@lucide/svelte/icons/filter';
	import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
	import Eye from '@lucide/svelte/icons/eye';
	import Edit from '@lucide/svelte/icons/edit';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Users from '@lucide/svelte/icons/users';
	import Calendar from '@lucide/svelte/icons/calendar';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import Building2 from '@lucide/svelte/icons/building-2';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import XCircle from '@lucide/svelte/icons/x-circle';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	
	import { getCompanyPlacements, createPlacement, updatePlacement, togglePlacementStatus } from '$lib/placements.remote.js';

	let { data } = $props();
	
	let placements = $state(data.placements || []);
	let searchTerm = $state('');
	let filterStatus = $state('all');
	let showCreateDialog = $state(false);
	let showEditDialog = $state(false);
	let selectedPlacement = $state(null);
	let isSaving = $state(false);
	
	// New placement form
	let newPlacement = $state({
		title: '',
		department: '',
		description: '',
		requirements: '',
		duration: 24,
		slots: 1,
		salaryRange: '',
		location: '',
		isRemote: false,
		applicationDeadline: '',
		startDate: '',
		endDate: '',
		requiredSkills: [],
		skillsToLearn: []
	});

	const departments = [
		'Software Engineering', 'Data Science', 'Cybersecurity', 'IT Support',
		'Network Administration', 'Database Management', 'Mobile Development',
		'Web Development', 'AI/Machine Learning', 'Cloud Computing'
	];

	const locations = [
		'Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Benin City',
		'Enugu', 'Jos', 'Kaduna', 'Warri', 'Calabar'
	];

	let filteredPlacements = $derived(placements.filter(placement => {
		const matchesSearch = placement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			placement.department.toLowerCase().includes(searchTerm.toLowerCase());
		
		if (filterStatus === 'all') return matchesSearch;
		if (filterStatus === 'active') return matchesSearch && placement.isActive;
		if (filterStatus === 'inactive') return matchesSearch && !placement.isActive;
		
		return matchesSearch;
	}));

	async function handleCreatePlacement() {
		isSaving = true;
		try {
			const result = await createPlacement(new FormData());
			if (result.success) {
				// Refresh placements
				const updatedData = await getCompanyPlacements();
				placements = updatedData.placements;
				showCreateDialog = false;
				resetForm();
			}
		} catch (error) {
			console.error('Failed to create placement:', error);
		} finally {
			isSaving = false;
		}
	}

	async function handleUpdatePlacement() {
		if (!selectedPlacement) return;
		
		isSaving = true;
		try {
			const result = await updatePlacement(new FormData());
			if (result.success) {
				// Refresh placements
				const updatedData = await getCompanyPlacements();
				placements = updatedData.placements;
				showEditDialog = false;
				selectedPlacement = null;
			}
		} catch (error) {
			console.error('Failed to update placement:', error);
		} finally {
			isSaving = false;
		}
	}

	async function toggleStatus(placementId: string, isActive: boolean) {
		try {
			await togglePlacementStatus({ placementId, isActive: !isActive });
			// Update local state
			placements = placements.map(p => 
				p.id === placementId ? { ...p, isActive: !isActive } : p
			);
		} catch (error) {
			console.error('Failed to toggle status:', error);
		}
	}

	function resetForm() {
		newPlacement = {
			title: '',
			department: '',
			description: '',
			requirements: '',
			duration: 24,
			slots: 1,
			salaryRange: '',
			location: '',
			isRemote: false,
			applicationDeadline: '',
			startDate: '',
			endDate: '',
			requiredSkills: [],
			skillsToLearn: []
		};
	}

	function editPlacement(placement) {
		selectedPlacement = { ...placement };
		showEditDialog = true;
	}

	function getStatusBadge(placement) {
		if (!placement.isActive) {
			return { variant: 'secondary', text: 'Inactive', icon: XCircle };
		}
		
		const deadline = new Date(placement.applicationDeadline);
		const now = new Date();
		
		if (deadline < now) {
			return { variant: 'destructive', text: 'Expired', icon: XCircle };
		}
		
		const slotsRemaining = placement.slots - placement.filledSlots;
		if (slotsRemaining === 0) {
			return { variant: 'outline', text: 'Filled', icon: CheckCircle };
		}
		
		return { variant: 'default', text: 'Active', icon: CheckCircle };
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString();
	}
</script>

<svelte:head>
	<title>Manage Placements - SIWES AI</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Manage Placements</h1>
			<p class="text-muted-foreground">
				Create and manage your SIWES placement opportunities
			</p>
		</div>
		
		<Dialog bind:open={showCreateDialog}>
			<DialogTrigger asChild>
				<Button>
					<Plus class="h-4 w-4 mr-2" />
					Create Placement
				</Button>
			</DialogTrigger>
			<DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Create New Placement</DialogTitle>
					<DialogDescription>
						Add a new SIWES placement opportunity for students
					</DialogDescription>
				</DialogHeader>
				
				<form on:submit|preventDefault={handleCreatePlacement} class="space-y-6">
					<!-- Basic Information -->
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="title">Position Title</Label>
							<Input
								id="title"
								bind:value={newPlacement.title}
								placeholder="e.g. Software Development Intern"
								required
							/>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="department">Department</Label>
								<Select bind:value={newPlacement.department}>
									<SelectTrigger>
										<SelectValue placeholder="Select department" />
									</SelectTrigger>
									<SelectContent>
										{#each departments as dept}
											<SelectItem value={dept}>{dept}</SelectItem>
										{/each}
									</SelectContent>
								</Select>
							</div>

							<div class="space-y-2">
								<Label for="location">Location</Label>
								<Select bind:value={newPlacement.location}>
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

						<div class="flex items-center space-x-2">
							<Switch bind:checked={newPlacement.isRemote} />
							<Label>Remote work available</Label>
						</div>
					</div>

					<!-- Description and Requirements -->
					<div class="space-y-4">
						<div class="space-y-2">
							<Label for="description">Job Description</Label>
							<Textarea
								id="description"
								bind:value={newPlacement.description}
								placeholder="Describe the role, responsibilities, and what the student will learn..."
								rows="4"
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="requirements">Requirements</Label>
							<Textarea
								id="requirements"
								bind:value={newPlacement.requirements}
								placeholder="Education level, academic requirements, any prerequisites..."
								rows="3"
								required
							/>
						</div>
					</div>

					<!-- Skills -->
					<div class="space-y-4">
						<div class="space-y-2">
							<Label>Required Skills</Label>
							<SkillsInput
								bind:value={newPlacement.requiredSkills}
								placeholder="Add required skills..."
							/>
						</div>

						<div class="space-y-2">
							<Label>Skills Students Will Learn</Label>
							<SkillsInput
								bind:value={newPlacement.skillsToLearn}
								placeholder="Add skills students will learn..."
							/>
						</div>
					</div>

					<!-- Details -->
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="duration">Duration (weeks)</Label>
							<Input
								id="duration"
								type="number"
								bind:value={newPlacement.duration}
								min="12"
								max="52"
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="slots">Available Slots</Label>
							<Input
								id="slots"
								type="number"
								bind:value={newPlacement.slots}
								min="1"
								required
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="salaryRange">Salary/Stipend (optional)</Label>
						<Input
							id="salaryRange"
							bind:value={newPlacement.salaryRange}
							placeholder="e.g. ₦50,000 - ₦80,000/month"
						/>
					</div>

					<!-- Dates -->
					<div class="grid grid-cols-3 gap-4">
						<div class="space-y-2">
							<Label for="applicationDeadline">Application Deadline</Label>
							<Input
								id="applicationDeadline"
								type="date"
								bind:value={newPlacement.applicationDeadline}
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="startDate">Start Date</Label>
							<Input
								id="startDate"
								type="date"
								bind:value={newPlacement.startDate}
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="endDate">End Date</Label>
							<Input
								id="endDate"
								type="date"
								bind:value={newPlacement.endDate}
								required
							/>
						</div>
					</div>

					<div class="flex justify-end gap-2">
						<Button type="button" variant="outline" onclick={() => showCreateDialog = false}>
							Cancel
						</Button>
						<Button type="submit" disabled={isSaving}>
							{isSaving ? 'Creating...' : 'Create Placement'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	</div>

	<!-- Search and Filters -->
	<Card class="p-4">
		<div class="flex flex-col sm:flex-row gap-4">
			<div class="flex-1 relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					bind:value={searchTerm}
					placeholder="Search placements..."
					class="pl-10"
				/>
			</div>
			
			<Select bind:value={filterStatus}>
				<SelectTrigger class="w-40">
					<SelectValue placeholder="Filter by status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Placements</SelectItem>
					<SelectItem value="active">Active Only</SelectItem>
					<SelectItem value="inactive">Inactive Only</SelectItem>
				</SelectContent>
			</Select>
		</div>
	</Card>

	<!-- Stats -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
					<Building2 class="h-4 w-4 text-blue-600" />
				</div>
				<div>
					<div class="text-2xl font-bold">
						{placements.length}
					</div>
					<div class="text-xs text-muted-foreground">Total Placements</div>
				</div>
			</div>
		</Card>

		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
					<CheckCircle class="h-4 w-4 text-green-600" />
				</div>
				<div>
					<div class="text-2xl font-bold">
						{placements.filter(p => p.isActive).length}
					</div>
					<div class="text-xs text-muted-foreground">Active</div>
				</div>
			</div>
		</Card>

		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
					<Users class="h-4 w-4 text-yellow-600" />
				</div>
				<div>
					<div class="text-2xl font-bold">
						{placements.reduce((sum, p) => sum + (p.filledSlots || 0), 0)}
					</div>
					<div class="text-xs text-muted-foreground">Students Placed</div>
				</div>
			</div>
		</Card>

		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center">
					<AlertCircle class="h-4 w-4 text-purple-600" />
				</div>
				<div>
					<div class="text-2xl font-bold">
						{placements.reduce((sum, p) => sum + (p.slots - (p.filledSlots || 0)), 0)}
					</div>
					<div class="text-xs text-muted-foreground">Open Slots</div>
				</div>
			</div>
		</Card>
	</div>

	<!-- Placements List -->
	<div class="space-y-4">
		{#if filteredPlacements.length === 0}
			<div class="text-center py-12">
				<Building2 class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
				<h3 class="text-lg font-medium text-foreground">No placements found</h3>
				<p class="text-muted-foreground">
					{placements.length === 0 
						? "Create your first placement to get started."
						: "Try adjusting your search or filters."
					}
				</p>
				{#if placements.length === 0}
					<Button class="mt-4" onclick={() => showCreateDialog = true}>
						<Plus class="h-4 w-4 mr-2" />
						Create Your First Placement
					</Button>
				{/if}
			</div>
		{:else}
			{#each filteredPlacements as placement}
				<Card class="p-6 hover:shadow-md transition-shadow">
					<div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
						<!-- Placement Info -->
						<div class="flex-1 space-y-3">
							<!-- Header -->
							<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
								<div>
									<h3 class="text-xl font-semibold text-foreground">
										{placement.title}
									</h3>
									<p class="text-muted-foreground">
										{placement.department}
									</p>
								</div>

								{@const status = getStatusBadge(placement)}
								<Badge variant={status.variant} class="w-fit">
									<svelte:component this={status.icon} class="h-3 w-3 mr-1" />
									{status.text}
								</Badge>
							</div>

							<!-- Details -->
							<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
								<div class="flex items-center">
									<MapPin class="h-4 w-4 mr-1" />
									{placement.location}
									{#if placement.isRemote}
										<Badge variant="outline" class="ml-2 text-xs">Remote</Badge>
									{/if}
								</div>
								
								<div class="flex items-center">
									<Clock class="h-4 w-4 mr-1" />
									{placement.duration} weeks
								</div>

								<div class="flex items-center">
									<Users class="h-4 w-4 mr-1" />
									{placement.filledSlots || 0}/{placement.slots} filled
								</div>

								<div class="flex items-center">
									<Calendar class="h-4 w-4 mr-1" />
									Deadline: {formatDate(placement.applicationDeadline)}
								</div>
							</div>

							<!-- Skills -->
							{#if placement.requiredSkills?.length > 0}
								<div class="flex flex-wrap gap-1">
									{#each placement.requiredSkills.slice(0, 5) as skill}
										<Badge variant="outline" class="text-xs">
											{skill}
										</Badge>
									{/each}
									{#if placement.requiredSkills.length > 5}
										<Badge variant="outline" class="text-xs">
											+{placement.requiredSkills.length - 5} more
										</Badge>
									{/if}
								</div>
							{/if}

							<!-- Description Preview -->
							<p class="text-sm text-muted-foreground line-clamp-2">
								{placement.description}
							</p>
						</div>

						<!-- Actions -->
						<div class="flex flex-col gap-2 min-w-[140px]">
							<Button 
								variant="outline" 
								size="sm"
								href="/app/company/placements/{placement.id}/applications"
							>
								<Eye class="h-4 w-4 mr-1" />
								View Applications
							</Button>
							
							<Button 
								variant="outline" 
								size="sm"
								onclick={() => editPlacement(placement)}
							>
								<Edit class="h-4 w-4 mr-1" />
								Edit
							</Button>

							<Button 
								variant="outline" 
								size="sm"
								onclick={() => toggleStatus(placement.id, placement.isActive)}
							>
								{placement.isActive ? 'Deactivate' : 'Activate'}
							</Button>
						</div>
					</div>
				</Card>
			{/each}
		{/if}
	</div>
</div>
