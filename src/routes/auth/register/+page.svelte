<script lang="ts">
	import { register } from '../auth.remote';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs';
	import * as Alert from '$lib/components/ui/alert';
	import Eye from '@lucide/svelte/icons/eye';
  import EyeOff from '@lucide/svelte/icons/eye-off';
  import Mail from '@lucide/svelte/icons/mail';
  import Lock from '@lucide/svelte/icons/lock';
  import User from '@lucide/svelte/icons/user';
  import Building2 from '@lucide/svelte/icons/building-2';

	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let error = $state(register.result?.error);
	let userType: 'student' | 'company' = $state('student');

	// Student specific fields
	let firstName = $state('');
	let lastName = $state('');
	let university = $state('');

	// Company specific fields
	let companyName = $state('');
	let industry = $state('');

	const registerStudent = register.for("student")
	const registerCompany = register.for("company")
</script>

<Card class="p-6 shadow-lg">
	<div class="space-y-6">
		<div class="text-center">
			<h2 class="text-xl font-semibold text-foreground">Create Account</h2>
			<p class="text-sm text-muted-foreground mt-1">Join the SIWES AI platform</p>
		</div>

		<Tabs value={userType} onValueChange={(value) => userType = value}>
			<TabsList class="grid w-full grid-cols-2">
				<TabsTrigger value="student" class="flex items-center space-x-2">
					<User class="h-4 w-4" />
					<span>Student</span>
				</TabsTrigger>
				<TabsTrigger value="company" class="flex items-center space-x-2">
					<Building2 class="h-4 w-4" />
					<span>Company</span>
				</TabsTrigger>
			</TabsList>

			<TabsContent value="student">
				<form {...registerStudent} class="space-y-4">
				  <input type="hidden" name="userType" value={userType}/>
					<div class="grid grid-cols-2 gap-4">
					  {#if error}
						<Alert.Root variant="destructive">
							<Alert.Circle class="h-4 w-4" />
							<Alert.Description>{error}</Alert.Description>
						</Alert.Root>
					{/if}
						<div class="space-y-2">
							<Label for="firstName">First Name</Label>
							<Input
								id="firstName"
								name="firstName"
								placeholder="Ade"
								required
							/>
						</div>
						<div class="space-y-2">
							<Label for="lastName">Last Name</Label>
							<Input
								id="lastName"
								name="lastName"
								placeholder="Okoro"
								required
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="university">University</Label>
						<Input
							id="university"
					    name="university"
							placeholder="University of Lagos"
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="email">Email</Label>
						<div class="relative">
							<Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								name="email"
								placeholder="your.email@university.edu.ng"
								class="pl-10"
								required
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="password">Password</Label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								placeholder="Create a strong password"
								class="pl-10 pr-10"
								required
							/>
							<button
								type="button"
								class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								onclick={() => showPassword = !showPassword}
							>
								{#if showPassword}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword">Confirm Password</Label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							name="confirmPassword"
							class="pl-10 pr-10"
							placeholder="Confirm your password"
							required
						/>
					</div>
					</div>

					<Button type="submit" class="w-full" disabled={loading}>
						{loading ? 'Creating Account...' : 'Create Student Account'}
					</Button>
				</form>
			</TabsContent>

			<TabsContent value="company">
				<form {...registerCompany} class="space-y-4">
				  	<input type="hidden" name="userType" value={userType}/>
					<div class="space-y-2">
						<Label for="companyName">Company Name</Label>
						<Input
							id="companyName"
							bind:value={companyName}
							placeholder="Paystack Technologies"
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="industry">Industry</Label>
						<Input
							id="industry"
							bind:value={industry}
							placeholder="Fintech"
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="email">Company Email</Label>
						<div class="relative">
							<Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								bind:value={email}
								placeholder="hr@company.com"
								class="pl-10"
								required
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="password">Password</Label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								bind:value={password}
								placeholder="Create a strong password"
								class="pl-10 pr-10"
								required
							/>
							<button
								type="button"
								class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								onclick={() => showPassword = !showPassword}
							>
								{#if showPassword}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword">Confirm Password</Label>
						<Input
							id="confirmPassword"
							type="password"
							bind:value={confirmPassword}
							placeholder="Confirm your password"
							required
						/>
					</div>

					<Button type="submit" class="w-full" disabled={loading}>
						{loading ? 'Creating Account...' : 'Create Company Account'}
					</Button>
				</form>
			</TabsContent>
		</Tabs>

		<Separator />

		<div class="text-center">
			<p class="text-sm text-muted-foreground">
				Already have an account?
				<a href="/auth/login" class="text-primary hover:underline font-medium">
					Sign in
				</a>
			</p>
		</div>
	</div>
</Card>