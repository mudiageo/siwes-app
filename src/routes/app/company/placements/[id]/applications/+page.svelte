<script lang="ts">
	import { page } from '$app/stores';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogHeader,
		DialogTitle,
		DialogTrigger
	} from '$lib/components/ui/dialog';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import Users from '@lucide/svelte/icons/users';
	import Search from '@lucide/svelte/icons/search';
	import Filter from '@lucide/svelte/icons/filter';
	import Download from '@lucide/svelte/icons/download';
	import Eye from '@lucide/svelte/icons/eye';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import XCircle from '@lucide/svelte/icons/x-circle';
	import Clock from '@lucide/svelte/icons/clock';
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';
	import Star from '@lucide/svelte/icons/star';
	import FileText from '@lucide/svelte/icons/file-text';
	import { getPlacement, getPlacementApplications } from '$lib/placements.remote';
	import { updateApplicationStatus } from '$lib/applications.remote';
	
	// Get placement ID from URL
	let placementId = $derived($page.params.id);
	
	// Fetch data from remote functions
	let placementQuery = $derived(getPlacement(placementId));
	let applicationsQuery = $derived(getPlacementApplications(placementId));
	
	let placement = $derived(placementQuery.data?.placement);
	let applicationsData = $derived(applicationsQuery.data?.applications || []);
	
	// Application state
	let searchQuery = $state('');
	let statusFilter = $state('all');
	let selectedApplication = $state<any>(null);
	let showDetailsDialog = $state(false);
	
	// Transform applications data
	let applications = $derived(
		applicationsData.map((item: any) => ({
			id: item.application.id,
			student: {
				name: `${item.student.firstName} ${item.student.lastName}`,
				avatar: item.student.profilePicture || '',
				university: item.student.university,
				department: item.student.department,
				level: item.student.level,
				cgpa: item.student.cgpa,
				location: item.student.location,
				email: item.student.email || '',
				phone: item.student.phoneNumber || '',
				skills: item.student.skills || [],
				resumeUrl: item.student.resumeUrl || '#'
			},
			status: item.application.status,
			appliedAt: item.application.appliedAt,
			matchScore: item.application.matchScore || 0,
			coverLetter: item.application.coverLetter || ''
		}))
	);
	
	// Filter applications
	let filteredApplications = $derived(
		applications.filter((app) => {
			const matchesSearch =
				searchQuery === '' ||
				app.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				app.student.university.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
			return matchesSearch && matchesStatus;
		})
	);
	
	// Stats
	let stats = $derived({
		total: applications.length,
		pending: applications.filter((a) => a.status === 'pending').length,
		reviewed: applications.filter((a) => a.status === 'reviewing').length,
		accepted: applications.filter((a) => a.status === 'accepted').length,
		rejected: applications.filter((a) => a.status === 'rejected').length
	});
	
	function getStatusBadge(status: string) {
		switch (status) {
			case 'pending':
				return 'secondary';
			case 'reviewing':
			case 'interview':
				return 'default';
			case 'accepted':
				return 'default';
			case 'rejected':
				return 'destructive';
			default:
				return 'secondary';
		}
	}
	
	function viewDetails(application: any) {
		selectedApplication = application;
		showDetailsDialog = true;
	}
	
	async function updateStatus(applicationId: string, newStatus: string) {
		const result = await updateApplicationStatus({ applicationId, status: newStatus });
		if (result) {
			// Refresh the applications list
			applicationsQuery = getPlacementApplications(placementId);
		}
	}
</script>

<svelte:head>
	<title>Applications - {placement?.title || 'Loading...'} - SIWES AI</title>
</svelte:head>

{#if placementQuery.loading || applicationsQuery.loading}
	<div class="flex items-center justify-center min-h-[400px]">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
			<p class="text-muted-foreground">Loading applications...</p>
		</div>
	</div>
{:else if placementQuery.error}
	<div class="flex items-center justify-center min-h-[400px]">
		<div class="text-center text-red-600">
			<p>Error loading placement: {placementQuery.error.message}</p>
		</div>
	</div>
{:else if placement}
<div class="space-y-6">
	<!-- Header -->
	<div>
		<div class="flex items-center gap-2 text-sm text-muted-foreground mb-2">
			<a href="/app/company/placements" class="hover:text-foreground">Placements</a>
			<span>/</span>
			<span>{placement.title}</span>
			<span>/</span>
			<span class="text-foreground">Applications</span>
		</div>
		<h1 class="text-2xl font-bold text-foreground">{placement.title}</h1>
		<p class="text-muted-foreground">Manage applications for this placement</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
		<Card class="p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-muted-foreground">Total</p>
					<p class="text-2xl font-bold">{stats.total}</p>
				</div>
				<Users class="h-8 w-8 text-muted-foreground" />
			</div>
		</Card>
		
		<Card class="p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-muted-foreground">Pending</p>
					<p class="text-2xl font-bold">{stats.pending}</p>
				</div>
				<Clock class="h-8 w-8 text-yellow-500" />
			</div>
		</Card>
		
		<Card class="p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-muted-foreground">Reviewed</p>
					<p class="text-2xl font-bold">{stats.reviewed}</p>
				</div>
				<Eye class="h-8 w-8 text-blue-500" />
			</div>
		</Card>
		
		<Card class="p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-muted-foreground">Accepted</p>
					<p class="text-2xl font-bold">{stats.accepted}</p>
				</div>
				<CheckCircle class="h-8 w-8 text-green-500" />
			</div>
		</Card>
		
		<Card class="p-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm text-muted-foreground">Rejected</p>
					<p class="text-2xl font-bold">{stats.rejected}</p>
				</div>
				<XCircle class="h-8 w-8 text-red-500" />
			</div>
		</Card>
	</div>

	<!-- Filters -->
	<Card class="p-4">
		<div class="flex flex-col sm:flex-row gap-4">
			<div class="flex-1 relative">
				<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
				<Input
					bind:value={searchQuery}
					placeholder="Search by name or university..."
					class="pl-10"
				/>
			</div>
			
			<Select bind:value={statusFilter}>
				<SelectTrigger class="w-full sm:w-[200px]">
					<Filter class="h-4 w-4 mr-2" />
					{statusFilter === 'all' ? 'All Status' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="all">All Status</SelectItem>
					<SelectItem value="pending">Pending</SelectItem>
					<SelectItem value="reviewed">Reviewed</SelectItem>
					<SelectItem value="accepted">Accepted</SelectItem>
					<SelectItem value="rejected">Rejected</SelectItem>
				</SelectContent>
			</Select>
			
			<Button variant="outline">
				<Download class="h-4 w-4 mr-2" />
				Export
			</Button>
		</div>
	</Card>

	<!-- Applications Table -->
	<Card>
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Student</TableHead>
					<TableHead>University</TableHead>
					<TableHead>Level</TableHead>
					<TableHead>CGPA</TableHead>
					<TableHead>Match Score</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Applied</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filteredApplications as application}
					<TableRow>
						<TableCell>
							<div class="flex items-center gap-3">
								<Avatar>
									<AvatarImage src={application.student.avatar} alt={application.student.name} />
									<AvatarFallback>
										{application.student.name
											.split(' ')
											.map((n) => n[0])
											.join('')}
									</AvatarFallback>
								</Avatar>
								<div>
									<p class="font-medium">{application.student.name}</p>
									<p class="text-sm text-muted-foreground">{application.student.department}</p>
								</div>
							</div>
						</TableCell>
						<TableCell>{application.student.university}</TableCell>
						<TableCell>{application.student.level} Level</TableCell>
						<TableCell>{application.student.cgpa.toFixed(1)}</TableCell>
						<TableCell>
							<div class="flex items-center gap-1">
								<Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
								<span class="font-medium">{application.matchScore}%</span>
							</div>
						</TableCell>
						<TableCell>
							<Badge variant={getStatusBadge(application.status)}>
								{application.status}
							</Badge>
						</TableCell>
						<TableCell>{new Date(application.appliedAt).toLocaleDateString()}</TableCell>
						<TableCell class="text-right">
							<Button
								size="sm"
								variant="outline"
								onclick={() => viewDetails(application)}
							>
								<Eye class="h-4 w-4 mr-1" />
								View
							</Button>
						</TableCell>
					</TableRow>
				{:else}
					<TableRow>
						<TableCell colspan="8" class="text-center py-8 text-muted-foreground">
							No applications found
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</Card>
</div>

<!-- Application Details Dialog -->
<Dialog bind:open={showDetailsDialog}>
	<DialogContent class="max-w-3xl max-h-[90vh] overflow-y-auto">
		{#if selectedApplication}
			<DialogHeader>
				<DialogTitle>Application Details</DialogTitle>
				<DialogDescription>
					Review and manage this application
				</DialogDescription>
			</DialogHeader>
			
			<Tabs value="details" class="mt-4">
				<TabsList class="grid w-full grid-cols-3">
					<TabsTrigger value="details">Details</TabsTrigger>
					<TabsTrigger value="cover-letter">Cover Letter</TabsTrigger>
					<TabsTrigger value="resume">Resume</TabsTrigger>
				</TabsList>
				
				<TabsContent value="details" class="space-y-4">
					<!-- Student Info -->
					<div class="flex items-start gap-4">
						<Avatar class="h-16 w-16">
							<AvatarImage src={selectedApplication.student.avatar} />
							<AvatarFallback>
								{selectedApplication.student.name
									.split(' ')
									.map((n) => n[0])
									.join('')}
							</AvatarFallback>
						</Avatar>
						<div class="flex-1">
							<h3 class="text-lg font-semibold">{selectedApplication.student.name}</h3>
							<p class="text-sm text-muted-foreground">{selectedApplication.student.department}</p>
							<div class="flex items-center gap-2 mt-2">
								<Badge variant={getStatusBadge(selectedApplication.status)}>
									{selectedApplication.status}
								</Badge>
								<div class="flex items-center gap-1 text-sm">
									<Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
									<span class="font-medium">{selectedApplication.matchScore}% Match</span>
								</div>
							</div>
						</div>
					</div>
					
					<!-- Contact Info -->
					<Card class="p-4">
						<h4 class="font-semibold mb-3">Contact Information</h4>
						<div class="space-y-2 text-sm">
							<div class="flex items-center gap-2">
								<Mail class="h-4 w-4 text-muted-foreground" />
								<span>{selectedApplication.student.email}</span>
							</div>
							<div class="flex items-center gap-2">
								<Phone class="h-4 w-4 text-muted-foreground" />
								<span>{selectedApplication.student.phone}</span>
							</div>
							<div class="flex items-center gap-2">
								<MapPin class="h-4 w-4 text-muted-foreground" />
								<span>{selectedApplication.student.location}</span>
							</div>
						</div>
					</Card>
					
					<!-- Academic Info -->
					<Card class="p-4">
						<h4 class="font-semibold mb-3">Academic Information</h4>
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p class="text-muted-foreground">University</p>
								<p class="font-medium">{selectedApplication.student.university}</p>
							</div>
							<div>
								<p class="text-muted-foreground">Department</p>
								<p class="font-medium">{selectedApplication.student.department}</p>
							</div>
							<div>
								<p class="text-muted-foreground">Level</p>
								<p class="font-medium">{selectedApplication.student.level} Level</p>
							</div>
							<div>
								<p class="text-muted-foreground">CGPA</p>
								<p class="font-medium">{selectedApplication.student.cgpa.toFixed(2)}/5.00</p>
							</div>
						</div>
					</Card>
					
					<!-- Skills -->
					<Card class="p-4">
						<h4 class="font-semibold mb-3">Skills</h4>
						<div class="flex flex-wrap gap-2">
							{#each selectedApplication.student.skills as skill}
								<Badge variant="secondary">{skill}</Badge>
							{/each}
						</div>
					</Card>
				</TabsContent>
				
				<TabsContent value="cover-letter">
					<Card class="p-4">
						<p class="whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
					</Card>
				</TabsContent>
				
				<TabsContent value="resume">
					<Card class="p-4">
						<div class="flex items-center justify-between mb-4">
							<div class="flex items-center gap-2">
								<FileText class="h-5 w-5" />
								<span class="font-medium">Resume.pdf</span>
							</div>
							<Button size="sm" variant="outline">
								<Download class="h-4 w-4 mr-2" />
								Download
							</Button>
						</div>
						<Button class="w-full" variant="secondary">
							<Eye class="h-4 w-4 mr-2" />
							View Resume
						</Button>
					</Card>
				</TabsContent>
			</Tabs>
			
			<!-- Actions -->
			<div class="flex gap-2 mt-6">
				<Button
					class="flex-1"
					variant="default"
					onclick={() => {
						updateStatus(selectedApplication.id, 'accepted');
						showDetailsDialog = false;
					}}
					disabled={selectedApplication.status === 'accepted'}
				>
					<CheckCircle class="h-4 w-4 mr-2" />
					Accept
				</Button>
				<Button
					class="flex-1"
					variant="destructive"
					onclick={() => {
						updateStatus(selectedApplication.id, 'rejected');
						showDetailsDialog = false;
					}}
					disabled={selectedApplication.status === 'rejected'}
				>
					<XCircle class="h-4 w-4 mr-2" />
					Reject
				</Button>
			</div>
		{/if}
	</DialogContent>
</Dialog>
{/if}
