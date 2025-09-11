<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import ApplicationStatus from '$lib/components/applications/ApplicationStatus.svelte';
	import Building2 from '@lucide/svelte/icons/building-2';
import MapPin from '@lucide/svelte/icons/map-pin';
import Calendar from '@lucide/svelte/icons/calendar';
import MessageSquare from '@lucide/svelte/icons/message-square';
import Eye from '@lucide/svelte/icons/eye';

	// Mock applications data
	const applications = [
		{
			id: '1',
			placement: {
				title: 'Software Engineering Intern',
				company: 'Paystack',
				location: 'Lagos',
				duration: 24,
				salaryRange: '₦80,000 - ₦120,000'
			},
			status: 'interview' as const,
			matchScore: 0.92,
			appliedDate: new Date('2025-01-08'),
			reviewedDate: new Date('2025-01-10'),
			interviewDate: new Date('2025-01-18'),
			coverLetter: 'I am excited to apply for this position...',
			hasUnreadMessages: true
		},
		{
			id: '2',
			placement: {
				title: 'Data Science Intern',
				company: 'Andela',
				location: 'Lagos',
				duration: 20,
				salaryRange: '₦100,000 - ₦150,000'
			},
			status: 'reviewing' as const,
			matchScore: 0.85,
			appliedDate: new Date('2025-01-10'),
			reviewedDate: new Date('2025-01-12'),
			interviewDate: null,
			coverLetter: 'As a passionate data science student...',
			hasUnreadMessages: false
		},
		{
			id: '3',
			placement: {
				title: 'Backend Engineer Intern',
				company: 'Flutterwave',
				location: 'Lagos',
				duration: 22,
				salaryRange: '₦85,000 - ₦125,000'
			},
			status: 'accepted' as const,
			matchScore: 0.88,
			appliedDate: new Date('2025-01-05'),
			reviewedDate: new Date('2025-01-07'),
			interviewDate: new Date('2025-01-12'),
			coverLetter: 'I am thrilled to apply for...',
			hasUnreadMessages: false
		},
		{
			id: '4',
			placement: {
				title: 'Network Engineering Trainee',
				company: 'MTN Nigeria',
				location: 'Abuja',
				duration: 22,
				salaryRange: '₦90,000 - ₦130,000'
			},
			status: 'rejected' as const,
			matchScore: 0.78,
			appliedDate: new Date('2025-01-03'),
			reviewedDate: new Date('2025-01-08'),
			interviewDate: null,
			coverLetter: 'I am interested in telecommunications...',
			hasUnreadMessages: false
		}
	];

	let activeApplications = $derived(applications.filter(app => 
		['pending', 'reviewing', 'interview'].includes(app.status)
	));
	let completedApplications = $derived(applications.filter(app => 
		['accepted', 'rejected', 'withdrawn'].includes(app.status)
	));

	function getStatusStats() {
		return {
			total: applications.length,
			pending: applications.filter(app => app.status === 'pending').length,
			reviewing: applications.filter(app => app.status === 'reviewing').length,
			interview: applications.filter(app => app.status === 'interview').length,
			accepted: applications.filter(app => app.status === 'accepted').length,
			rejected: applications.filter(app => app.status === 'rejected').length
		};
	}

	let stats = $derived(getStatusStats());
</script>

<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
		<div>
			<h1 class="text-2xl font-bold text-foreground">My Applications</h1>
			<p class="text-muted-foreground">Track and manage your placement applications</p>
		</div>
	</div>

	<!-- Stats Overview -->
	<div class="grid grid-cols-2 md:grid-cols-6 gap-4">
		<Card class="p-4 text-center">
			<div class="text-2xl font-bold text-foreground">{stats.total}</div>
			<div class="text-xs text-muted-foreground">Total</div>
		</Card>
		<Card class="p-4 text-center">
			<div class="text-2xl font-bold text-warning-600">{stats.pending}</div>
			<div class="text-xs text-muted-foreground">Pending</div>
		</Card>
		<Card class="p-4 text-center">
			<div class="text-2xl font-bold text-primary">{stats.reviewing}</div>
			<div class="text-xs text-muted-foreground">Reviewing</div>
		</Card>
		<Card class="p-4 text-center">
			<div class="text-2xl font-bold text-blue-600">{stats.interview}</div>
			<div class="text-xs text-muted-foreground">Interview</div>
		</Card>
		<Card class="p-4 text-center">
			<div class="text-2xl font-bold text-success-600">{stats.accepted}</div>
			<div class="text-xs text-muted-foreground">Accepted</div>
		</Card>
		<Card class="p-4 text-center">
			<div class="text-2xl font-bold text-error-600">{stats.rejected}</div>
			<div class="text-xs text-muted-foreground">Rejected</div>
		</Card>
	</div>

	<!-- Applications Tabs -->
	<Tabs defaultValue="active" class="space-y-6">
		<TabsList class="grid w-full grid-cols-2">
			<TabsTrigger value="active">
				Active Applications ({activeApplications.length})
			</TabsTrigger>
			<TabsTrigger value="completed">
				Completed ({completedApplications.length})
			</TabsTrigger>
		</TabsList>

		<TabsContent value="active" class="space-y-4">
			{#if activeApplications.length > 0}
				{#each activeApplications as application}
					<Card class="p-6">
						<div class="space-y-4">
							<!-- Header -->
							<div class="flex items-start justify-between">
								<div class="space-y-2">
									<div class="flex items-center space-x-2">
										<h3 class="text-lg font-semibold text-foreground">{application.placement.title}</h3>
										{#if application.hasUnreadMessages}
											<Badge variant="destructive" class="text-xs">New</Badge>
										{/if}
									</div>
									<div class="flex items-center space-x-4 text-sm text-muted-foreground">
										<div class="flex items-center space-x-1">
											<Building2 class="h-4 w-4" />
											<span>{application.placement.company}</span>
										</div>
										<div class="flex items-center space-x-1">
											<MapPin class="h-4 w-4" />
											<span>{application.placement.location}</span>
										</div>
										<div class="flex items-center space-x-1">
											<Calendar class="h-4 w-4" />
											<span>{application.placement.duration} weeks</span>
										</div>
									</div>
								</div>
								
								<div class="text-right">
									<div class="text-xl font-bold text-primary">
										{Math.round(application.matchScore * 100)}%
									</div>
									<div class="text-xs text-muted-foreground">Match Score</div>
								</div>
							</div>

							<!-- Status -->
							<ApplicationStatus 
								status={application.status}
								appliedDate={application.appliedDate}
								reviewedDate={application.reviewedDate}
								interviewDate={application.interviewDate}
							/>

							<!-- Actions -->
							<div class="flex items-center space-x-2 border-t border-border pt-4">
								<Button variant="outline" size="sm">
									<Eye class="h-4 w-4 mr-2" />
									View Details
								</Button>
								<Button variant="outline" size="sm">
									<MessageSquare class="h-4 w-4 mr-2" />
									Messages
									{#if application.hasUnreadMessages}
										<Badge variant="destructive" class="ml-2 h-4 w-4 p-0 text-xs">!</Badge>
									{/if}
								</Button>
								{#if application.status === 'pending'}
									<Button variant="ghost" size="sm" class="text-error-600 hover:text-error-700">
										Withdraw
									</Button>
								{/if}
							</div>
						</div>
					</Card>
				{/each}
			{:else}
				<Card class="p-12 text-center">
					<div class="space-y-4">
						<div class="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center">
							<FileText class="h-6 w-6 text-muted-foreground" />
						</div>
						<div class="space-y-2">
							<h3 class="text-lg font-semibold text-foreground">No active applications</h3>
							<p class="text-muted-foreground">Start applying to placements to see them here</p>
						</div>
						<Button href="/matches">Find Placements</Button>
					</div>
				</Card>
			{/if}
		</TabsContent>

		<TabsContent value="completed" class="space-y-4">
			{#if completedApplications.length > 0}
				{#each completedApplications as application}
					<Card class="p-6">
						<div class="space-y-4">
							<!-- Header -->
							<div class="flex items-start justify-between">
								<div class="space-y-2">
									<h3 class="text-lg font-semibold text-foreground">{application.placement.title}</h3>
									<div class="flex items-center space-x-4 text-sm text-muted-foreground">
										<div class="flex items-center space-x-1">
											<Building2 class="h-4 w-4" />
											<span>{application.placement.company}</span>
										</div>
										<div class="flex items-center space-x-1">
											<MapPin class="h-4 w-4" />
											<span>{application.placement.location}</span>
										</div>
									</div>
								</div>
								
								<div class="text-right">
									<div class="text-xl font-bold text-primary">
										{Math.round(application.matchScore * 100)}%
									</div>
									<div class="text-xs text-muted-foreground">Match Score</div>
								</div>
							</div>

							<!-- Status -->
							<ApplicationStatus 
								status={application.status}
								appliedDate={application.appliedDate}
								reviewedDate={application.reviewedDate}
								interviewDate={application.interviewDate}
							/>

							<!-- Actions -->
							<div class="flex items-center space-x-2 border-t border-border pt-4">
								<Button variant="outline" size="sm">
									<Eye class="h-4 w-4 mr-2" />
									View Details
								</Button>
								{#if application.status === 'accepted'}
									<Button size="sm">
										Accept Offer
									</Button>
								{/if}
							</div>
						</div>
					</Card>
				{/each}
			{:else}
				<Card class="p-12 text-center">
					<div class="space-y-4">
						<div class="h-12 w-12 rounded-full bg-muted mx-auto flex items-center justify-center">
							<FileText class="h-6 w-6 text-muted-foreground" />
						</div>
						<div class="space-y-2">
							<h3 class="text-lg font-semibold text-foreground">No completed applications</h3>
							<p class="text-muted-foreground">Applications that are accepted or rejected will appear here</p>
						</div>
					</div>
				</Card>
			{/if}
		</TabsContent>
	</Tabs>
</div>