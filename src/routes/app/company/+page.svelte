<script lang="ts">
	import type { PageData } from './$types';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { 
		TrendingUp, Users, FileText, Calendar, 
		Star, ArrowRight, Target, Clock, Plus, Building2
	} from '@lucide/svelte';
	import { getCompanyDashboard } from '$lib/dashboard.remote'

	let { data } = $props();
	
	let {
    user,
    company,
    stats,
    recentApplications,
    companyPlacements
  } = await getCompanyDashboard()

</script>

<svelte:head>
	<title>Company Dashboard - SIWES AI</title>
</svelte:head>

<div class="space-y-6">
	<!-- Welcome Section -->
	<div class="flex flex-col space-y-2">
		<h1 class="text-2xl font-bold text-foreground">Welcome back, {company?.name}! 👋</h1>
		<p class="text-muted-foreground">
			You have {stats?.pendingReviews || 0} applications to review and {stats?.activePlacements || 0} active placements.
		</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
					<FileText class="h-4 w-4 text-primary" />
				</div>
				<div>
					<div class="text-2xl font-bold text-foreground">{stats?.totalPlacements || 0}</div>
					<div class="text-xs text-muted-foreground">Total Placements</div>
				</div>
			</div>
		</Card>

		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-success-100 flex items-center justify-center">
					<Star class="h-4 w-4 text-success-600" />
				</div>
				<div>
					<div class="text-2xl font-bold text-foreground">{stats?.activePlacements || 0}</div>
					<div class="text-xs text-muted-foreground">Active</div>
				</div>
			</div>
		</Card>

		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-warning-100 flex items-center justify-center">
					<Users class="h-4 w-4 text-warning-600" />
				</div>
				<div>
					<div class="text-2xl font-bold text-foreground">{stats?.totalApplications || 0}</div>
					<div class="text-xs text-muted-foreground">Applications</div>
				</div>
			</div>
		</Card>

		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
					<Clock class="h-4 w-4 text-blue-600" />
				</div>
				<div>
					<div class="text-2xl font-bold text-foreground">{stats?.pendingReviews || 0}</div>
					<div class="text-xs text-muted-foreground">Pending</div>
				</div>
			</div>
		</Card>
	</div>

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Left Column -->
		<div class="lg:col-span-2 space-y-6">
			<!-- Your Placements -->
			<Card class="p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-lg font-semibold text-foreground">Your Placements</h2>
					<div class="flex space-x-2">
						<Button size="sm" href="/app/company/placements/new">
							<Plus class="h-4 w-4 mr-2" />
							New Placement
						</Button>
						<Button variant="ghost" size="sm" href="/app/company/placements">
							View All
							<ArrowRight class="h-4 w-4 ml-1" />
						</Button>
					</div>
				</div>

				<div class="space-y-4">
					{#each companyPlacements as placement}
						<div class="flex items-center justify-between p-4 border border-border rounded-lg">
							<div class="space-y-1">
								<h4 class="font-medium text-foreground">{placement.title}</h4>
								<p class="text-sm text-muted-foreground">{placement.department} • {placement.location}</p>
							</div>
							<div class="text-right">
								<Badge variant={placement.isActive ? 'default' : 'secondary'}>
									{placement.isActive ? 'Active' : 'Inactive'}
								</Badge>
								<p class="text-sm text-muted-foreground mt-1">
									{placement.filledSlots}/{placement.slots} filled
								</p>
							</div>
						</div>
					{:else}
						<div class="text-center py-8">
							<Building2 class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p class="text-muted-foreground mb-4">No placements posted yet</p>
							<Button href="/app/company/placements/new">
								<Plus class="h-4 w-4 mr-2" />
								Post Your First Placement
							</Button>
						</div>
					{/each}
				</div>
			</Card>

			<!-- Recent Applications -->
			<Card class="p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-lg font-semibold text-foreground">Recent Applications</h2>
					<Button variant="ghost" size="sm" href="/app/company/applications">
						View All
						<ArrowRight class="h-4 w-4 ml-1" />
					</Button>
				</div>

				<div class="space-y-4">
					{#each recentApplications as application}
						<div class="flex items-center justify-between p-4 border border-border rounded-lg">
							<div class="space-y-1">
								<h4 class="font-medium text-foreground">{application.placement.title}</h4>
								<p class="text-sm text-muted-foreground">
									{application.student.firstName} {application.student.lastName}
								</p>
							</div>
							<div class="text-right">
								<Badge variant="secondary">{application.application.status}</Badge>
								<p class="text-sm text-muted-foreground mt-1">
									{Math.round(application.application.matchScore * 100)}% match
								</p>
							</div>
						</div>
					{:else}
						<div class="text-center py-8">
							<FileText class="h-12 w-12 text-muted-foreground mx-auto mb-4" />
							<p class="text-muted-foreground">No applications received yet</p>
						</div>
					{/each}
				</div>
			</Card>
		</div>

		<!-- Right Column -->
		<div class="space-y-6">
			<!-- Company Profile -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold text-foreground mb-4">Company Profile</h3>
				
				<div class="space-y-4">
					<div class="flex items-center space-x-3">
						<div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
							<Building2 class="h-6 w-6 text-primary" />
						</div>
						<div>
							<h4 class="font-semibold text-foreground">{company?.name}</h4>
							<p class="text-sm text-muted-foreground">{company?.industry}</p>
						</div>
					</div>

					<div class="space-y-2 text-sm">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Location:</span>
							<span class="text-foreground">{company?.location}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Size:</span>
							<span class="text-foreground capitalize">{company?.size}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Verified:</span>
							<Badge variant={company?.isVerified ? 'default' : 'secondary'}>
								{company?.isVerified ? 'Verified' : 'Pending'}
							</Badge>
						</div>
					</div>

					<Button variant="outline" size="sm" class="w-full" href="/app/company/profile">
						Edit Profile
					</Button>
				</div>
			</Card>

			<!-- Quick Actions -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
				<div class="space-y-2">
					<Button variant="outline" class="w-full justify-start" href="/app/company/placements/new">
						<Plus class="h-4 w-4 mr-2" />
						Post New Placement
					</Button>
					<Button variant="outline" class="w-full justify-start" href="/app/company/applications">
						<FileText class="h-4 w-4 mr-2" />
						Review Applications
					</Button>
					<Button variant="outline" class="w-full justify-start" href="/app/company/analytics">
						<TrendingUp class="h-4 w-4 mr-2" />
						View Analytics
					</Button>
				</div>
			</Card>

			<!-- Performance Metrics -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold text-foreground mb-4">This Month</h3>
				
				<div class="space-y-3">
					<div class="flex justify-between items-center">
						<span class="text-sm text-muted-foreground">Applications Received</span>
						<span class="text-lg font-semibold text-foreground">{stats?.monthlyApplications || 0}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-sm text-muted-foreground">Profile Views</span>
						<span class="text-lg font-semibold text-foreground">{stats?.profileViews || 0}</span>
					</div>
					<div class="flex justify-between items-center">
						<span class="text-sm text-muted-foreground">Placements Posted</span>
						<span class="text-lg font-semibold text-foreground">{stats?.monthlyPlacements || 0}</span>
					</div>
				</div>
			</Card>
		</div>
	</div>
</div>