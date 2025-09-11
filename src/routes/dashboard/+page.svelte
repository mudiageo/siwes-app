<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Progress } from '$lib/components/ui/progress';
	import ProfileCompletion from '$lib/components/profile/ProfileCompletion.svelte';
	import MatchCard from '$lib/components/match/MatchCard.svelte';
	import ApplicationStatus from '$lib/components/applications/ApplicationStatus.svelte';
	import TrendingUp from '@lucide/svelte/icons/trending-up';
import Users from '@lucide/svelte/icons/users';
import FileText from '@lucide/svelte/icons/file-text';
import Calendar from '@lucide/svelte/icons/calendar';
import Star from '@lucide/svelte/icons/star';
import ArrowRight from '@lucide/svelte/icons/arrow-right';
import Target from '@lucide/svelte/icons/target';
import Clock from '@lucide/svelte/icons/clock';
import Search from '@lucide/svelte/icons/search';
import User from '@lucide/svelte/icons/user';

	// Mock data - in real app this would be fetched
	const userType = 'student'; // or 'company'
	const stats = {
		totalMatches: 24,
		newMatches: 5,
		activeApplications: 3,
		profileViews: 47
	};

	const recentMatches = [
		{
			placement: {
				id: '1',
				title: 'Software Engineering Intern',
				department: 'Technology',
				location: 'Lagos',
				duration: 24,
				slots: 5,
				filledSlots: 2,
				salaryRange: '₦80,000 - ₦120,000',
				requiredSkills: ['JavaScript', 'React', 'Node.js'],
				skillsToLearn: ['TypeScript', 'AWS', 'Docker']
			},
			score: {
				overall: 0.92,
				breakdown: {
					skillsScore: 95,
					locationScore: 100,
					industryScore: 90,
					levelScore: 85
				}
			},
			reasons: ['Strong skills match (95%)', 'Perfect location match', 'Excellent industry alignment']
		}
	];

	const recentApplications = [
		{
			id: '1',
			placement: { title: 'Data Science Intern', company: 'Andela' },
			status: 'reviewing' as const,
			appliedDate: new Date('2025-01-10'),
			reviewedDate: new Date('2025-01-12'),
			interviewDate: null
		},
		{
			id: '2',
			placement: { title: 'Backend Engineer Intern', company: 'Paystack' },
			status: 'interview' as const,
			appliedDate: new Date('2025-01-08'),
			reviewedDate: new Date('2025-01-10'),
			interviewDate: new Date('2025-01-18')
		}
	];

	const upcomingDeadlines = [
		{ title: 'Software Engineering Intern - Paystack', deadline: new Date('2025-01-25'), daysLeft: 10 },
		{ title: 'Network Engineering Trainee - MTN', deadline: new Date('2025-02-01'), daysLeft: 17 }
	];
</script>

<div class="space-y-6">
	<!-- Welcome Section -->
	<div class="flex flex-col space-y-2">
		<h1 class="text-2xl font-bold text-foreground">Good morning, Adebayo! 👋</h1>
		<p class="text-muted-foreground">You have 5 new matches and 2 application updates.</p>
	</div>

	<!-- Stats Grid -->
	<div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
					<Target class="h-4 w-4 text-primary" />
				</div>
				<div>
					<div class="text-2xl font-bold text-foreground">{stats.totalMatches}</div>
					<div class="text-xs text-muted-foreground">Total Matches</div>
				</div>
			</div>
		</Card>

		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-success-100 flex items-center justify-center">
					<Star class="h-4 w-4 text-success-600" />
				</div>
				<div>
					<div class="text-2xl font-bold text-foreground">{stats.newMatches}</div>
					<div class="text-xs text-muted-foreground">New Matches</div>
				</div>
			</div>
		</Card>

		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-warning-100 flex items-center justify-center">
					<FileText class="h-4 w-4 text-warning-600" />
				</div>
				<div>
					<div class="text-2xl font-bold text-foreground">{stats.activeApplications}</div>
					<div class="text-xs text-muted-foreground">Active Apps</div>
				</div>
			</div>
		</Card>

		<Card class="p-4">
			<div class="flex items-center space-x-2">
				<div class="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
					<Users class="h-4 w-4 text-blue-600" />
				</div>
				<div>
					<div class="text-2xl font-bold text-foreground">{stats.profileViews}</div>
					<div class="text-xs text-muted-foreground">Profile Views</div>
				</div>
			</div>
		</Card>
	</div>

	<div class="grid lg:grid-cols-3 gap-6">
		<!-- Left Column -->
		<div class="lg:col-span-2 space-y-6">
			<!-- New Matches -->
			<Card class="p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-lg font-semibold text-foreground">New Matches</h2>
					<Button variant="ghost" size="sm" href="/matches">
						View All
						<ArrowRight class="h-4 w-4 ml-1" />
					</Button>
				</div>

				<div class="space-y-4">
					{#each recentMatches as match}
						<MatchCard {match} />
					{/each}
				</div>
			</Card>

			<!-- Recent Applications -->
			<Card class="p-6">
				<div class="flex items-center justify-between mb-6">
					<h2 class="text-lg font-semibold text-foreground">Recent Applications</h2>
					<Button variant="ghost" size="sm" href="/applications">
						View All
						<ArrowRight class="h-4 w-4 ml-1" />
					</Button>
				</div>

				<div class="space-y-4">
					{#each recentApplications as application}
						<div class="flex items-center justify-between p-4 border border-border rounded-lg">
							<div class="space-y-1">
								<h4 class="font-medium text-foreground">{application.placement.title}</h4>
								<p class="text-sm text-muted-foreground">{application.placement.company}</p>
							</div>
							<div class="w-48">
								<ApplicationStatus 
									status={application.status}
									appliedDate={application.appliedDate}
									reviewedDate={application.reviewedDate}
									interviewDate={application.interviewDate}
								/>
							</div>
						</div>
					{/each}
				</div>
			</Card>
		</div>

		<!-- Right Column -->
		<div class="space-y-6">
			<!-- Profile Completion -->
			<ProfileCompletion completeness={85} {userType} />

			<!-- Upcoming Deadlines -->
			<Card class="p-6">
				<div class="flex items-center space-x-2 mb-4">
					<Clock class="h-5 w-5 text-warning-600" />
					<h3 class="text-lg font-semibold text-foreground">Upcoming Deadlines</h3>
				</div>

				<div class="space-y-3">
					{#each upcomingDeadlines as deadline}
						<div class="flex items-center justify-between p-3 border border-border rounded-lg">
							<div class="space-y-1">
								<h4 class="text-sm font-medium text-foreground">{deadline.title}</h4>
								<p class="text-xs text-muted-foreground">
									{deadline.deadline.toLocaleDateString()}
								</p>
							</div>
							<Badge 
								variant={deadline.daysLeft <= 3 ? 'destructive' : deadline.daysLeft <= 7 ? 'secondary' : 'outline'}
								class="text-xs"
							>
								{deadline.daysLeft} days
							</Badge>
						</div>
					{/each}
				</div>
			</Card>

			<!-- Quick Actions -->
			<Card class="p-6">
				<h3 class="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
				<div class="space-y-2">
					<Button variant="outline" class="w-full justify-start">
						<Search class="h-4 w-4 mr-2" />
						Find New Matches
					</Button>
					<Button variant="outline" class="w-full justify-start">
						<FileText class="h-4 w-4 mr-2" />
						Update Resume
					</Button>
					<Button variant="outline" class="w-full justify-start">
						<User class="h-4 w-4 mr-2" />
						Edit Profile
					</Button>
				</div>
			</Card>
		</div>
	</div>
</div>