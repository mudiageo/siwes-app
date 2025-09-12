<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import Target from '@lucide/svelte/icons/target';
	import Users from '@lucide/svelte/icons/users';
	import Brain from '@lucide/svelte/icons/brain';
	import Zap from '@lucide/svelte/icons/zap';
	import Shield from '@lucide/svelte/icons/shield';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import Star from '@lucide/svelte/icons/star';
	import Building2 from '@lucide/svelte/icons/building-2';
	import GraduationCap from '@lucide/svelte/icons/graduation-cap';

	const features = [
		{
			icon: Brain,
			title: 'AI-Powered Matching',
			description: 'Our advanced AI analyzes your skills, preferences, and career goals to find the perfect SIWES placement matches.'
		},
		{
			icon: Target,
			title: 'Smart Recommendations',
			description: 'Get personalized placement recommendations based on your academic background and industry interests.'
		},
		{
			icon: Zap,
			title: 'Instant Applications',
			description: 'Apply to multiple placements with one click. Our AI generates tailored cover letters for each application.'
		},
		{
			icon: Shield,
			title: 'Verified Companies',
			description: 'All companies on our platform are verified and committed to providing quality internship experiences.'
		}
	];

	const benefits = [
		'AI-powered placement matching',
		'Verified company partnerships',
		'Real-time application tracking',
		'Automated cover letter generation',
		'Skills gap analysis',
		'Career guidance and mentorship'
	];

	const stats = [
		{ number: '500+', label: 'Students Placed' },
		{ number: '200+', label: 'Partner Companies' },
		{ number: '95%', label: 'Success Rate' },
		{ number: '4.8/5', label: 'Student Rating' }
	];
</script>

<svelte:head>
	<title>SIWES AI - Smart Industrial Work Experience Matching</title>
	<meta name="description" content="Find your perfect SIWES placement with AI-powered matching. Connect with top companies and advance your career." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
	<!-- Header -->
	<header class="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
		<div class="container mx-auto px-4 h-16 flex items-center justify-between">
			<div class="flex items-center space-x-3">
				<div class="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
					<Sparkles class="h-4 w-4 text-white" />
				</div>
				<span class="font-bold text-xl">SIWES AI</span>
			</div>
			
			<nav class="hidden md:flex items-center space-x-6">
				<a href="#features" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
				<a href="#how-it-works" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
				<a href="#companies" class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Companies</a>
			</nav>

			<div class="flex items-center space-x-3">
				<Button variant="ghost" size="sm" href="/auth/login">
					Sign In
				</Button>
				<Button size="sm" href="/auth/register">
					Get Started
				</Button>
			</div>
		</div>
	</header>

	<!-- Hero Section -->
	<section class="relative py-20 lg:py-32">
		<div class="container mx-auto px-4 text-center">
			<Badge variant="secondary" class="mb-6">
				<Sparkles class="h-3 w-3 mr-1" />
				AI-Powered SIWES Matching
			</Badge>
			
			<h1 class="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
				Find Your Perfect
				<span class="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
					SIWES Placement
				</span>
			</h1>
			
			<p class="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
				Connect with top companies, get AI-powered placement recommendations, and advance your career with our smart matching platform.
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center mb-12">
				<Button size="lg" href="/auth/register" class="text-lg px-8">
					<GraduationCap class="h-5 w-5 mr-2" />
					Find Placements
					<ArrowRight class="h-4 w-4 ml-2" />
				</Button>
				<Button size="lg" variant="outline" href="/auth/register?type=company" class="text-lg px-8">
					<Building2 class="h-5 w-5 mr-2" />
					Post Opportunities
				</Button>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
				{#each stats as stat}
					<div class="text-center">
						<div class="text-3xl font-bold text-primary">{stat.number}</div>
						<div class="text-sm text-muted-foreground">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section id="features" class="py-20 bg-accent/5">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16">
				<h2 class="text-3xl lg:text-4xl font-bold mb-4">
					Why Choose SIWES AI?
				</h2>
				<p class="text-xl text-muted-foreground max-w-2xl mx-auto">
					Our AI-powered platform makes finding and securing your ideal SIWES placement easier than ever.
				</p>
			</div>

			<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
				{#each features as feature}
					<Card class="border-0 shadow-sm hover:shadow-md transition-shadow">
						<CardHeader class="text-center pb-4">
							<div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
								<svelte:component this={feature.icon} class="h-6 w-6 text-primary" />
							</div>
							<CardTitle class="text-lg">{feature.title}</CardTitle>
						</CardHeader>
						<CardContent class="text-center">
							<CardDescription>{feature.description}</CardDescription>
						</CardContent>
					</Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section id="how-it-works" class="py-20">
		<div class="container mx-auto px-4">
			<div class="text-center mb-16">
				<h2 class="text-3xl lg:text-4xl font-bold mb-4">
					How It Works
				</h2>
				<p class="text-xl text-muted-foreground max-w-2xl mx-auto">
					Get matched with your perfect SIWES placement in three simple steps.
				</p>
			</div>

			<div class="grid lg:grid-cols-3 gap-12">
				<div class="text-center">
					<div class="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
						1
					</div>
					<h3 class="text-xl font-semibold mb-4">Create Your Profile</h3>
					<p class="text-muted-foreground">
						Complete your profile with your skills, academic background, and career preferences. Our AI analyzes this to understand your unique profile.
					</p>
				</div>

				<div class="text-center">
					<div class="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
						2
					</div>
					<h3 class="text-xl font-semibold mb-4">Get AI Matches</h3>
					<p class="text-muted-foreground">
						Our advanced AI algorithm matches you with placement opportunities that align with your skills, location preferences, and career goals.
					</p>
				</div>

				<div class="text-center">
					<div class="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center mx-auto mb-6 text-white font-bold text-xl">
						3
					</div>
					<h3 class="text-xl font-semibold mb-4">Apply & Get Hired</h3>
					<p class="text-muted-foreground">
						Apply to your matches with AI-generated cover letters. Track your applications and get hired by top companies in your field.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Benefits Section -->
	<section class="py-20 bg-accent/5">
		<div class="container mx-auto px-4">
			<div class="grid lg:grid-cols-2 gap-12 items-center">
				<div>
					<h2 class="text-3xl lg:text-4xl font-bold mb-6">
						Everything You Need for
						<span class="text-primary">SIWES Success</span>
					</h2>
					<p class="text-lg text-muted-foreground mb-8">
						Our comprehensive platform provides all the tools and support you need to find, apply for, and succeed in your SIWES placement.
					</p>
					
					<div class="grid gap-4">
						{#each benefits as benefit}
							<div class="flex items-center space-x-3">
								<CheckCircle class="h-5 w-5 text-primary flex-shrink-0" />
								<span class="text-muted-foreground">{benefit}</span>
							</div>
						{/each}
					</div>

					<Button size="lg" href="/auth/register" class="mt-8">
						Start Your Journey
						<ArrowRight class="h-4 w-4 ml-2" />
					</Button>
				</div>

				<div class="relative">
					<Card class="shadow-2xl">
						<CardHeader class="pb-4">
							<div class="flex items-center space-x-3">
								<div class="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-blue-600"></div>
								<div>
									<CardTitle class="text-lg">John Doe</CardTitle>
									<CardDescription>Computer Science Student</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent class="space-y-4">
							<div class="space-y-2">
								<div class="flex justify-between text-sm">
									<span>Profile Completion</span>
									<span class="text-primary">95%</span>
								</div>
								<div class="w-full bg-accent h-2 rounded-full">
									<div class="bg-gradient-to-r from-primary to-blue-600 h-2 rounded-full w-[95%]"></div>
								</div>
							</div>
							<div class="border rounded-lg p-3">
								<div class="flex items-center justify-between mb-2">
									<span class="font-medium text-sm">AI Match Score</span>
									<div class="flex items-center space-x-1">
										<Star class="h-4 w-4 fill-yellow-400 text-yellow-400" />
										<span class="text-sm font-medium">4.8/5</span>
									</div>
								</div>
								<p class="text-xs text-muted-foreground">
									Perfect match for Frontend Developer role at TechCorp
								</p>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-20 bg-gradient-to-r from-primary to-blue-600 text-white">
		<div class="container mx-auto px-4 text-center">
			<h2 class="text-3xl lg:text-4xl font-bold mb-4">
				Ready to Find Your Perfect Placement?
			</h2>
			<p class="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
				Join thousands of students who have successfully found their ideal SIWES placements through our AI-powered platform.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<Button size="lg" variant="secondary" href="/auth/register" class="text-lg px-8">
					<GraduationCap class="h-5 w-5 mr-2" />
					Get Started as Student
				</Button>
				<Button size="lg" variant="outline" href="/auth/register?type=company" class="text-lg px-8 border-white/20 text-white hover:bg-white/10">
					<Building2 class="h-5 w-5 mr-2" />
					Partner with Us
				</Button>
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-border bg-background py-12">
		<div class="container mx-auto px-4">
			<div class="grid md:grid-cols-4 gap-8">
				<div>
					<div class="flex items-center space-x-3 mb-4">
						<div class="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center">
							<Sparkles class="h-4 w-4 text-white" />
						</div>
						<span class="font-bold text-xl">SIWES AI</span>
					</div>
					<p class="text-muted-foreground text-sm">
						Connecting students with their perfect SIWES placements through the power of AI.
					</p>
				</div>

				<div>
					<h4 class="font-semibold mb-4">For Students</h4>
					<ul class="space-y-2 text-sm text-muted-foreground">
						<li><a href="/auth/register" class="hover:text-foreground transition-colors">Find Placements</a></li>
						<li><a href="#features" class="hover:text-foreground transition-colors">Features</a></li>
						<li><a href="#how-it-works" class="hover:text-foreground transition-colors">How It Works</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold mb-4">For Companies</h4>
					<ul class="space-y-2 text-sm text-muted-foreground">
						<li><a href="/auth/register?type=company" class="hover:text-foreground transition-colors">Post Opportunities</a></li>
						<li><a href="#companies" class="hover:text-foreground transition-colors">Partner Program</a></li>
						<li><a href="#features" class="hover:text-foreground transition-colors">Platform Benefits</a></li>
					</ul>
				</div>

				<div>
					<h4 class="font-semibold mb-4">Support</h4>
					<ul class="space-y-2 text-sm text-muted-foreground">
						<li><a href="#" class="hover:text-foreground transition-colors">Help Center</a></li>
						<li><a href="#" class="hover:text-foreground transition-colors">Contact Us</a></li>
						<li><a href="#" class="hover:text-foreground transition-colors">Privacy Policy</a></li>
					</ul>
				</div>
			</div>

			<div class="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
				<p>&copy; 2025 SIWES AI. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>