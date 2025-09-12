<!-- src/routes/app/applications/+page.svelte -->
<script lang="ts">
	import { preventDefault } from 'svelte/legacy';

	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Dialog, DialogContent, DialogHeader, DialogTitle } from '$lib/components/ui/dialog';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import ApplicationStatus from '$lib/components/applications/ApplicationStatus.svelte';
	import Search from '@lucide/svelte/icons/search';
	import Filter from '@lucide/svelte/icons/filter';
	import Eye from '@lucide/svelte/icons/eye';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Calendar from '@lucide/svelte/icons/calendar';
	import User from '@lucide/svelte/icons/user';
	import Building2 from '@lucide/svelte/icons/building-2';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import Star from '@lucide/svelte/icons/star';
	import Send from '@lucide/svelte/icons/send';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import XCircle from '@lucide/svelte/icons/x-circle';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
	
	import { getApplications, updateApplicationStatus } from '$lib/applications.remote.js';
	import { sendMessage, getApplicationMessages } from '$lib/messaging.remote.js';

	let { data } = $props();
	
	let applicationsQuery = $derived(getApplications());
	let userType = $derived(data.user?.userType || 'student');
	let searchTerm = $state('');
	let filterStatus = $state('all');
	let selectedApplication = $state(null);
	let showDetailsDialog = $state(false);
	let showMessageDialog = $state(false);
	let messages = $state([]);
	let newMessage = $state('');
	let isSending = $state(false);
	let isUpdating = $state(false);

	const statuses = [
		{ value: 'all', label: 'All Applications' },
		{ value: 'pending', label: 'Pending Review' },
		{ value: 'reviewing', label: 'Under Review' },
		{ value: 'interview', label: 'Interview Stage' },
		{ value: 'accepted', label: 'Accepted' },
		{ value: 'rejected', label: 'Rejected' }
	];

	function getFilteredApplications(apps, search, status, type) {
		if (!apps) return [];
		return apps.filter(app => {
			const matchesSearch = type === 'student' 
				? app.placement.title.toLowerCase().includes(search.toLowerCase()) ||
				  app.company.name.toLowerCase().includes(search.toLowerCase())
				: app.student.firstName.toLowerCase().includes(search.toLowerCase()) ||
				  app.student.lastName.toLowerCase().includes(search.toLowerCase()) ||
				  app.placement.title.toLowerCase().includes(search.toLowerCase());
			
			if (status === 'all') return matchesSearch;
			return matchesSearch && app.application.status === status;
		});
	}

	async function viewDetails(application) {
		selectedApplication = application;
		showDetailsDialog = true;
	}

	async function openMessaging(application) {
		selectedApplication = application;
		try {
			const result = await getApplicationMessages(application.application.id);
			messages = result.messages || [];
		} catch (error) {
			console.error('Failed to load messages:', error);
			messages = [];
		}
		showMessageDialog = true;
	}

	async function handleSendMessage() {
		if (!newMessage.trim() || !selectedApplication) return;
		
		isSending = true;
		try {
			await sendMessage(new FormData());
			// Refresh messages
			const result = await getApplicationMessages(selectedApplication.application.id);
			messages = result.messages || [];
			newMessage = '';
		} catch (error) {
			console.error('Failed to send message:', error);
		} finally {
			isSending = false;
		}
	}

	async function updateStatus(applicationId: string, newStatus: string) {
		isUpdating = true;
		try {
			await updateApplicationStatus({ applicationId, status: newStatus });
			// Update local state
			applications = applications.map(app => 
				app.application.id === applicationId 
					? { ...app, application: { ...app.application, status: newStatus } }
					: app
			);
		} catch (error) {
			console.error('Failed to update status:', error);
		} finally {
			isUpdating = false;
		}
	}

	function getStatusBadge(status: string) {
		const statusConfig = {
			pending: { variant: 'secondary', text: 'Pending', icon: AlertCircle },
			reviewing: { variant: 'default', text: 'Under Review', icon: Eye },
			interview: { variant: 'outline', text: 'Interview', icon: Calendar },
			accepted: { variant: 'default', text: 'Accepted', icon: CheckCircle },
			rejected: { variant: 'destructive', text: 'Rejected', icon: XCircle }
		};
		
		return statusConfig[status] || statusConfig.pending;
	}

	function getMatchScoreColor(score: number): string {
		if (score >= 0.9) return 'text-green-600';
		if (score >= 0.8) return 'text-blue-600';
		if (score >= 0.7) return 'text-yellow-600';
		return 'text-gray-600';
	}

	function formatMatchScore(score: number): string {
		return `${Math.round(score * 100)}%`;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
	}

	function formatDateTime(dateString: string): string {
		return new Date(dateString).toLocaleString();
	}
</script>

<svelte:head>
	<title>Applications - SIWES AI</title>
</svelte:head>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Applications</h1>
			<p class="text-muted-foreground">
				{userType === 'student' 
					? 'Track your placement applications and communicate with companies'
					: 'Review and manage student applications'
				}
			</p>
		</div>
	</div>

	<!-- Search and Filters -->
	<Card class="p-4">
		<div class="flex flex-col sm:flex-row gap-4">
			<div class="flex-1 relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					bind:value={searchTerm}
					placeholder={userType === 'student' 
						? "Search by company or position..." 
						: "Search by student name or position..."
					}
					class="pl-10"
				/>
			</div>
			
			<Select bind:value={filterStatus}>
				<SelectTrigger class="w-48">
					{filterStatus ? filterStatus : "Filter by status"}
				</SelectTrigger>
				<SelectContent>
					{#each statuses as status}
						<SelectItem value={status.value}>{status.label}</SelectItem>
					{/each}
				</SelectContent>
			</Select>
		</div>
	</Card>

	<!-- Stats and Applications List -->
	{#await applicationsQuery}
		<div class="text-center py-12">
			<p class="text-muted-foreground">Loading applications...</p>
		</div>
	{:then applications}
		{@const filteredApps = getFilteredApplications(applications, searchTerm, filterStatus, userType)}
		
		<!-- Stats -->
		<div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
			{#each statuses.slice(1) as status}
				<Card class="p-4">
					<div class="text-center">
						<div class="text-2xl font-bold">
							{applications.filter(app => app.application.status === status.value).length}
						</div>
						<div class="text-xs text-muted-foreground">{status.label}</div>
					</div>
				</Card>
			{/each}
		</div>

		<!-- Applications List -->
		<div class="space-y-4">
			{#if filteredApps.length === 0}
				<div class="text-center py-12">
					<Building2 class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
					<h3 class="text-lg font-medium text-foreground">No applications found</h3>
					<p class="text-muted-foreground">
						{applications.length === 0 
							? userType === 'student'
								? "You haven't applied to any placements yet."
								: "No students have applied to your placements yet."
							: "Try adjusting your search or filters."
						}
					</p>
				</div>
			{:else}
				{#each filteredApps as app}
					{@const status = getStatusBadge(app.application.status)}
					<Card class="p-6 hover:shadow-md transition-shadow">
						<div class="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
							<!-- Application Info -->
							<div class="flex-1 space-y-3">
								<!-- Header -->
								<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
									<div>
										{#if userType === 'student'}
											<h3 class="text-xl font-semibold text-foreground">
												{app.placement.title}
											</h3>
											<p class="text-muted-foreground flex items-center">
												<Building2 class="h-4 w-4 mr-1" />
												{app.company.name}
											</p>
										{:else}
											<h3 class="text-xl font-semibold text-foreground">
												{app.student.firstName} {app.student.lastName}
											</h3>
											<p class="text-muted-foreground">
												Applied for: {app.placement.title}
											</p>
										{/if}
									</div>

									<div class="flex items-center gap-2">
									
										<Badge variant={status.variant}>
											<status.icon class="h-3 w-3 mr-1" />
											{status.text}
										</Badge>
										
										<Badge variant="outline" class={`border ${getMatchScoreColor(app.application.matchScore)}`}>
											<Star class="h-3 w-3 mr-1" />
											{formatMatchScore(app.application.matchScore)} Match
										</Badge>
									</div>
								</div>

								<!-- Details -->
								<div class="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
									{#if userType === 'student'}
										<div class="flex items-center">
											<MapPin class="h-4 w-4 mr-1" />
											{app.placement.location}
										</div>
										
										<div class="flex items-center">
											<Clock class="h-4 w-4 mr-1" />
											{app.placement.duration} weeks
										</div>
									{:else}
										<div class="flex items-center">
											<User class="h-4 w-4 mr-1" />
											{app.student.university}
										</div>
										
										<div class="flex items-center">
											<Building2 class="h-4 w-4 mr-1" />
											{app.student.department} - Level {app.student.level}
										</div>
									{/if}

									<div class="flex items-center">
										<Calendar class="h-4 w-4 mr-1" />
										Applied: {formatDate(app.application.appliedAt)}
									</div>
								</div>

								<!-- Match Score Breakdown -->
								<div class="grid grid-cols-4 gap-2 p-3 bg-muted rounded-lg text-xs">
								<div class="text-center">
									<div class="font-semibold">
										{Math.round(app.application.matchBreakdown.skillsScore * 100)}%
									</div>
									<div class="text-muted-foreground">Skills</div>
								</div>
								
								<div class="text-center">
									<div class="font-semibold">
										{Math.round(app.application.matchBreakdown.locationScore * 100)}%
									</div>
									<div class="text-muted-foreground">Location</div>
								</div>
								
								<div class="text-center">
									<div class="font-semibold">
										{Math.round(app.application.matchBreakdown.industryScore * 100)}%
									</div>
									<div class="text-muted-foreground">Industry</div>
								</div>
								
								<div class="text-center">
									<div class="font-semibold">
										{Math.round(app.application.matchBreakdown.levelScore * 100)}%
									</div>
									<div class="text-muted-foreground">Level</div>
								</div>
							</div>

							<!-- Cover Letter Preview -->
							{#if app.application.coverLetter}
								<div class="p-3 bg-muted rounded-lg">
									<p class="text-sm text-muted-foreground line-clamp-3">
										{app.application.coverLetter}
									</p>
								</div>
							{/if}
						</div>

						<!-- Actions -->
						<div class="flex flex-col gap-2 min-w-[140px]">
							<Button 
								variant="outline" 
								size="sm"
								onclick={() => viewDetails(app)}
							>
								<Eye class="h-4 w-4 mr-1" />
								View Details
							</Button>
							
							<Button 
								variant="outline" 
								size="sm"
								onclick={() => openMessaging(app)}
							>
								<MessageCircle class="h-4 w-4 mr-1" />
								Messages
							</Button>

							{#if userType === 'company' && app.application.status === 'pending'}
								<div class="flex gap-1">
									<Button 
										size="sm"
										onclick={() => updateStatus(app.application.id, 'reviewing')}
										disabled={isUpdating}
										class="flex-1"
									>
										Review
									</Button>
								</div>
							{/if}

							{#if userType === 'company' && ['pending', 'reviewing'].includes(app.application.status)}
								<div class="flex gap-1">
									<Button 
										size="sm"
										variant="default"
										onclick={() => updateStatus(app.application.id, 'interview')}
										disabled={isUpdating}
										class="flex-1"
									>
										Interview
									</Button>
								</div>
							{/if}

							{#if userType === 'company' && app.application.status === 'interview'}
								<div class="flex gap-1">
									<Button 
										size="sm"
										variant="default"
										onclick={() => updateStatus(app.application.id, 'accepted')}
										disabled={isUpdating}
										class="flex-1"
									>
										Accept
									</Button>
									<Button 
										size="sm"
										variant="destructive"
										onclick={() => updateStatus(app.application.id, 'rejected')}
										disabled={isUpdating}
										class="flex-1"
									>
										Reject
									</Button>
								</div>
							{/if}
						</div>
					</div>
				</Card>
			{/each}
		{/if}
	</div>

	<!-- Details Dialog -->
	<Dialog bind:open={showDetailsDialog}>
		<DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
			{#if selectedApplication}
				<DialogHeader>
					<DialogTitle>
						{userType === 'student' 
							? `${selectedApplication.placement.title} - ${selectedApplication.company.name}`
							: `${selectedApplication.student.firstName} ${selectedApplication.student.lastName} - ${selectedApplication.placement.title}`
						}
					</DialogTitle>
				</DialogHeader>
				
				<div class="space-y-6">
					<!-- Status Timeline -->
					<div>
						<h4 class="font-medium mb-3">Application Status</h4>
						<ApplicationStatus status={selectedApplication.application.status} />
					</div>

					<!-- Application Details -->
					<div>
						<h4 class="font-medium mb-3">Application Details</h4>
						<div class="space-y-2 text-sm">
							<div class="flex justify-between">
								<span class="text-muted-foreground">Applied Date:</span>
								<span>{formatDateTime(selectedApplication.application.appliedAt)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground">Match Score:</span>
								<span class={getMatchScoreColor(selectedApplication.application.matchScore)}>
									{formatMatchScore(selectedApplication.application.matchScore)}
								</span>
							</div>
							{#if selectedApplication.application.reviewedAt}
								<div class="flex justify-between">
									<span class="text-muted-foreground">Reviewed Date:</span>
									<span>{formatDateTime(selectedApplication.application.reviewedAt)}</span>
								</div>
							{/if}
						</div>
					</div>

					<!-- Cover Letter -->
					{#if selectedApplication.application.coverLetter}
						<div>
							<h4 class="font-medium mb-3">Cover Letter</h4>
							<div class="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
								{selectedApplication.application.coverLetter}
							</div>
						</div>
					{/if}

					{#if userType === 'student'}
						<!-- Company Details -->
						<div>
							<h4 class="font-medium mb-3">Company Information</h4>
							<div class="space-y-2 text-sm">
								<div><strong>Industry:</strong> {selectedApplication.company.industry}</div>
								<div><strong>Location:</strong> {selectedApplication.company.location}</div>
								<div><strong>Size:</strong> {selectedApplication.company.size}</div>
								{#if selectedApplication.company.website}
									<div>
										<strong>Website:</strong>
										<a href={selectedApplication.company.website} target="_blank" class="text-primary hover:underline">
											{selectedApplication.company.website}
										</a>
									</div>
								{/if}
							</div>
						</div>
					{:else}
						<!-- Student Details -->
						<div>
							<h4 class="font-medium mb-3">Student Information</h4>
							<div class="space-y-2 text-sm">
								<div><strong>University:</strong> {selectedApplication.student.university}</div>
								<div><strong>Department:</strong> {selectedApplication.student.department}</div>
								<div><strong>Level:</strong> {selectedApplication.student.level}</div>
								{#if selectedApplication.student.cgpa}
									<div><strong>CGPA:</strong> {selectedApplication.student.cgpa}</div>
								{/if}
								<div><strong>Location:</strong> {selectedApplication.student.location}</div>
								{#if selectedApplication.student.skills?.length > 0}
									<div>
										<strong>Skills:</strong>
										<div class="flex flex-wrap gap-1 mt-1">
											{#each selectedApplication.student.skills as skill}
												<Badge variant="outline" class="text-xs">{skill}</Badge>
											{/each}
										</div>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</DialogContent>
	</Dialog>

	<!-- Messaging Dialog -->
	<Dialog bind:open={showMessageDialog}>
		<DialogContent class="max-w-2xl max-h-[90vh] flex flex-col">
			{#if selectedApplication}
				<DialogHeader>
					<DialogTitle>
						Messages - {userType === 'student' 
							? `${selectedApplication.placement.title}`
							: `${selectedApplication.student.firstName} ${selectedApplication.student.lastName}`
						}
					</DialogTitle>
				</DialogHeader>
				
				<!-- Messages -->
				<div class="flex-1 space-y-4 max-h-96 overflow-y-auto p-4 border rounded-lg">
					{#if messages.length === 0}
						<div class="text-center text-muted-foreground py-8">
							<MessageCircle class="h-8 w-8 mx-auto mb-2" />
							<p>No messages yet. Start the conversation!</p>
						</div>
					{:else}
						{#each messages as message}
							<div class="flex {message.sender.id === data.user.id ? 'justify-end' : 'justify-start'}">
								<div class="max-w-[70%] {message.sender.id === data.user.id ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg p-3">
									<p class="text-sm">{message.message.content}</p>
									<p class="text-xs opacity-70 mt-1">
										{formatDateTime(message.message.sentAt)}
									</p>
								</div>
							</div>
						{/each}
					{/if}
				</div>

				<!-- Message Input -->
				<form onsubmit={preventDefault(handleSendMessage)} class="flex gap-2">
					<Textarea
						bind:value={newMessage}
						placeholder="Type your message..."
						rows="2"
						class="flex-1"
						disabled={isSending}
					/>
					<Button type="submit" disabled={isSending || !newMessage.trim()}>
						<Send class="h-4 w-4" />
					</Button>
				</form>
			{/if}
		</DialogContent>
	</Dialog>
	{:catch error}
		<div class="text-center py-12">
			<p class="text-red-500">Error loading applications: {error.message}</p>
		</div>
	{/await}
</div>
