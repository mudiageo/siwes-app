<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '$lib/components/ui/select';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover';
	import {
		ChartContainer,
		ChartTooltip,
		ChartTooltipContent
	} from '$lib/components/ui/chart';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
	import TrendingDown from '@lucide/svelte/icons/trending-down';
	import Users from '@lucide/svelte/icons/users';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import Clock from '@lucide/svelte/icons/clock';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import Download from '@lucide/svelte/icons/download';
	import BarChart from '@lucide/svelte/icons/bar-chart';
	import PieChart from '@lucide/svelte/icons/pie-chart';
	import { getCompanyAnalytics } from '$lib/analytics.remote';
	
	// Date range state
	let dateRange = $state('30days');
	let customStartDate: Date | null = $state(null);
	let customEndDate: Date | null = $state(null);
	
	// Calculate date range based on selection
	let dateFilters = $derived.by(() => {
		const now = new Date();
		let startDate: Date;
		let endDate = now;
		
		switch (dateRange) {
			case '7days':
				startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
				break;
			case '30days':
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				break;
			case '3months':
				startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
				break;
			case '6months':
				startDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
				break;
			case '1year':
				startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
				break;
			case 'custom':
				startDate = customStartDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
				endDate = customEndDate || now;
				break;
			default:
				startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		}
		
		return {
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString()
		};
	});
	
	// Fetch analytics data
	let analyticsQuery = $derived(getCompanyAnalytics(dateFilters));
	let analytics = $derived(analyticsQuery.data);
	
	let stats = $derived(analytics?.stats || {
		totalPlacements: 0,
		activePlacements: 0,
		totalApplications: 0,
		acceptedApplications: 0,
		acceptanceRate: 0,
		averageApplicationsPerPlacement: 0,
		trends: {
			placements: 0,
			applications: 0,
			acceptances: 0
		}
	});
	
	let applicationsOverTime = $derived(analytics?.applicationsOverTime || []);
	let applicationsByStatus = $derived(analytics?.applicationsByStatus || []);
	let topUniversities = $derived(analytics?.topUniversities || []);
	let topDepartments = $derived(analytics?.topDepartments || []);
	let placementPerformance = $derived(analytics?.placementPerformance || []);
	
	function exportReport() {
		// Implement export functionality
		console.log('Exporting report...');
	}
	
	function getDateRangeLabel(range: string) {
		switch (range) {
			case '7days': return 'Last 7 days';
			case '30days': return 'Last 30 days';
			case '3months': return 'Last 3 months';
			case '6months': return 'Last 6 months';
			case '1year': return 'Last year';
			case 'custom': return 'Custom range';
			default: return 'Select period';
		}
	}
</script>

<svelte:head>
	<title>Analytics & Reports - SIWES AI</title>
</svelte:head>

{#if analyticsQuery.loading}
	<div class="flex items-center justify-center min-h-[400px]">
		<div class="text-center">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
			<p class="text-muted-foreground">Loading analytics...</p>
		</div>
	</div>
{:else if analyticsQuery.error}
	<div class="flex items-center justify-center min-h-[400px]">
		<div class="text-center text-red-600">
			<p>Error loading analytics: {analyticsQuery.error.message}</p>
		</div>
	</div>
{:else}
<div class="space-y-6">
	<!-- Header -->
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold text-foreground">Analytics & Reports</h1>
			<p class="text-muted-foreground">Track placement and application performance</p>
		</div>
		
		<div class="flex flex-col sm:flex-row gap-2">
			<Select bind:value={dateRange}>
				<SelectTrigger class="w-full sm:w-[180px]">
					<CalendarIcon class="h-4 w-4 mr-2" />
					{getDateRangeLabel(dateRange)}
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="7days">Last 7 days</SelectItem>
					<SelectItem value="30days">Last 30 days</SelectItem>
					<SelectItem value="3months">Last 3 months</SelectItem>
					<SelectItem value="6months">Last 6 months</SelectItem>
					<SelectItem value="1year">Last year</SelectItem>
					<SelectItem value="custom">Custom range</SelectItem>
				</SelectContent>
			</Select>
			
			<Button variant="outline" onclick={exportReport}>
				<Download class="h-4 w-4 mr-2" />
				Export Report
			</Button>
		</div>
	</div>

	<!-- Key Metrics -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<Card class="p-6">
			<div class="flex items-center justify-between mb-2">
				<p class="text-sm text-muted-foreground">Total Placements</p>
				<Briefcase class="h-4 w-4 text-muted-foreground" />
			</div>
			<p class="text-3xl font-bold">{stats.totalPlacements}</p>
			<div class="flex items-center gap-1 mt-2">
				{#if stats.trends.placements > 0}
					<TrendingUp class="h-4 w-4 text-green-500" />
					<span class="text-sm text-green-500">+{stats.trends.placements}%</span>
				{:else}
					<TrendingDown class="h-4 w-4 text-red-500" />
					<span class="text-sm text-red-500">{stats.trends.placements}%</span>
				{/if}
				<span class="text-sm text-muted-foreground">vs last period</span>
			</div>
		</Card>
		
		<Card class="p-6">
			<div class="flex items-center justify-between mb-2">
				<p class="text-sm text-muted-foreground">Total Applications</p>
				<Users class="h-4 w-4 text-muted-foreground" />
			</div>
			<p class="text-3xl font-bold">{stats.totalApplications}</p>
			<div class="flex items-center gap-1 mt-2">
				{#if stats.trends.applications > 0}
					<TrendingUp class="h-4 w-4 text-green-500" />
					<span class="text-sm text-green-500">+{stats.trends.applications}%</span>
				{:else}
					<TrendingDown class="h-4 w-4 text-red-500" />
					<span class="text-sm text-red-500">{stats.trends.applications}%</span>
				{/if}
				<span class="text-sm text-muted-foreground">vs last period</span>
			</div>
		</Card>
		
		<Card class="p-6">
			<div class="flex items-center justify-between mb-2">
				<p class="text-sm text-muted-foreground">Acceptance Rate</p>
				<CheckCircle class="h-4 w-4 text-muted-foreground" />
			</div>
			<p class="text-3xl font-bold">{stats.acceptanceRate.toFixed(1)}%</p>
			<div class="flex items-center gap-1 mt-2">
				{#if stats.trends.acceptances > 0}
					<TrendingUp class="h-4 w-4 text-green-500" />
					<span class="text-sm text-green-500">+{stats.trends.acceptances}%</span>
				{:else}
					<TrendingDown class="h-4 w-4 text-red-500" />
					<span class="text-sm text-red-500">{stats.trends.acceptances}%</span>
				{/if}
				<span class="text-sm text-muted-foreground">vs last period</span>
			</div>
		</Card>
		
		<Card class="p-6">
			<div class="flex items-center justify-between mb-2">
				<p class="text-sm text-muted-foreground">Avg Applications/Placement</p>
				<BarChart class="h-4 w-4 text-muted-foreground" />
			</div>
			<p class="text-3xl font-bold">{stats.averageApplicationsPerPlacement.toFixed(1)}</p>
			<p class="text-sm text-muted-foreground mt-2">Per placement position</p>
		</Card>
	</div>

	<!-- Charts Row 1 -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Applications Over Time -->
		<Card class="p-6">
			<div class="flex items-center justify-between mb-6">
				<div>
					<h3 class="text-lg font-semibold">Applications Over Time</h3>
					<p class="text-sm text-muted-foreground">Applications and acceptances trend</p>
				</div>
			</div>
			
			<div class="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
				<div class="text-center text-muted-foreground">
					<BarChart class="h-12 w-12 mx-auto mb-2 opacity-50" />
					<p class="text-sm">Line chart showing applications and acceptances over time</p>
					<p class="text-xs mt-1">(Integrate with Chart.js or similar library)</p>
				</div>
			</div>
			
			<div class="flex items-center justify-center gap-6 mt-4">
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded-full bg-blue-500"></div>
					<span class="text-sm">Applications</span>
				</div>
				<div class="flex items-center gap-2">
					<div class="h-3 w-3 rounded-full bg-green-500"></div>
					<span class="text-sm">Acceptances</span>
				</div>
			</div>
		</Card>
		
		<!-- Applications by Status -->
		<Card class="p-6">
			<div class="flex items-center justify-between mb-6">
				<div>
					<h3 class="text-lg font-semibold">Applications by Status</h3>
					<p class="text-sm text-muted-foreground">Distribution of application statuses</p>
				</div>
			</div>
			
			<div class="h-[300px] flex items-center justify-center border-2 border-dashed rounded-lg">
				<div class="text-center text-muted-foreground">
					<PieChart class="h-12 w-12 mx-auto mb-2 opacity-50" />
					<p class="text-sm">Pie chart showing status distribution</p>
					<p class="text-xs mt-1">(Integrate with Chart.js or similar library)</p>
				</div>
			</div>
			
			<div class="grid grid-cols-2 gap-4 mt-4">
				{#each applicationsByStatus as status}
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<div class="h-3 w-3 rounded-full" style="background-color: {status.color}"></div>
							<span class="text-sm">{status.status}</span>
						</div>
						<span class="text-sm font-medium">{status.count}</span>
					</div>
				{/each}
			</div>
		</Card>
	</div>

	<!-- Top Universities -->
	<Card class="p-6">
		<div class="flex items-center justify-between mb-6">
			<div>
				<h3 class="text-lg font-semibold">Top Universities</h3>
				<p class="text-sm text-muted-foreground">Universities with most applications</p>
			</div>
		</div>
		
		<div class="space-y-4">
			{#each topUniversities as university, index}
				<div class="flex items-center gap-4">
					<div class="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
						{index + 1}
					</div>
					<div class="flex-1">
						<p class="font-medium">{university.name}</p>
						<div class="flex items-center gap-4 mt-1">
							<div class="flex-1">
								<div class="h-2 bg-muted rounded-full overflow-hidden">
									<div
										class="h-full bg-primary"
										style="width: {topUniversities[0] && topUniversities[0].applications > 0 ? (university.applications / topUniversities[0].applications) * 100 : 0}%"
									></div>
								</div>
							</div>
							<div class="flex items-center gap-4 text-sm text-muted-foreground">
								<span>{university.applications} applications</span>
								<span class="text-green-600">{university.acceptances} accepted</span>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<p class="text-center text-muted-foreground py-8">No data available</p>
			{/each}
		</div>
	</Card>

	<!-- Charts Row 2 -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Top Departments -->
		<Card class="p-6">
			<div class="flex items-center justify-between mb-6">
				<div>
					<h3 class="text-lg font-semibold">Top Departments</h3>
					<p class="text-sm text-muted-foreground">Most common applicant departments</p>
				</div>
			</div>
			
			<div class="space-y-4">
				{#each topDepartments as dept}
					<div>
						<div class="flex items-center justify-between mb-1">
							<span class="text-sm font-medium">{dept.name}</span>
							<span class="text-sm text-muted-foreground">{dept.applications} ({dept.percentage}%)</span>
						</div>
						<div class="h-2 bg-muted rounded-full overflow-hidden">
							<div
								class="h-full bg-primary"
								style="width: {dept.percentage}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</Card>
		
		<!-- Placement Performance -->
		<Card class="p-6">
			<div class="flex items-center justify-between mb-6">
				<div>
					<h3 class="text-lg font-semibold">Placement Performance</h3>
					<p class="text-sm text-muted-foreground">Performance metrics by placement</p>
				</div>
			</div>
			
			<div class="space-y-4">
				{#each placementPerformance as placement}
					<div class="border rounded-lg p-3">
						<p class="font-medium text-sm mb-2">{placement.title}</p>
						<div class="grid grid-cols-3 gap-2 text-xs">
							<div>
								<p class="text-muted-foreground">Applications</p>
								<p class="font-semibold">{placement.applications}</p>
							</div>
							<div>
								<p class="text-muted-foreground">Accepted</p>
								<p class="font-semibold text-green-600">{placement.accepted}</p>
							</div>
							<div>
								<p class="text-muted-foreground">Rate</p>
								<p class="font-semibold">{placement.acceptanceRate.toFixed(1)}%</p>
							</div>
						</div>
						<div class="mt-2 pt-2 border-t">
							<div class="flex items-center justify-between text-xs">
								<span class="text-muted-foreground">Avg Match Score</span>
								<span class="font-semibold">{placement.avgMatchScore.toFixed(1)}%</span>
							</div>
						</div>
					</div>
				{:else}
					<p class="text-center text-muted-foreground py-8">No placement data available</p>
				{/each}
			</div>
		</Card>
	</div>
</div>
{/if}
