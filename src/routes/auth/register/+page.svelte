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

	import { validatePassword, validatePasswordMatch } from '$lib/utils/auth-errors';	
	const registerStudent = register.for("student")
	const registerCompany = register.for("company")
	let showPassword = $state(false);

	let error = $derived(registerStudent.result?.error || registerCompany.result?.error);
	let loading = $state(false);
	let userType: 'student' | 'company' = $state('student');
	let password = $state('');
	let confirmPassword = $state('');
	let localError = $state('');

	function validateForm(formType: 'student' | 'company'): boolean {
		localError = '';

		const passwordError = validatePassword(password);
		if (passwordError) {
			localError = passwordError.message;
			return false;
		}

		const matchError = validatePasswordMatch(password, confirmPassword);
		if (matchError) {
			localError = matchError.message;
			return false;
		}

		return true;
	}

	$effect(() => {
		console.log(registerStudent.result);
		if (registerStudent.result?.success || registerCompany.result?.success) {
			goto(`/app/${userType}`);
		}
		loading = false;
	});
</script>

<Card class="p-6 shadow-lg">
	<div class="space-y-6">
		<div class="text-center">
			<h2 class="text-xl font-semibold text-foreground">Create Account</h2>
			<p class="text-sm text-muted-foreground mt-1">Join the SIWES AI platform</p>
		</div>

		<Tabs value={userType} onValueChange={(value) => userType = value as 'student' | 'company'}>
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
				{#if error || localError}
					<Alert.Root variant="destructive" class="mb-4">
						<Alert.Description>{localError || error}</Alert.Description>
					</Alert.Root>
				{/if}

				<form 
					{...registerStudent.enhance(async ({ submit }) => {
						if (password !== confirmPassword) {
							localError = 'Passwords do not match';
							return;
						}
						localError = '';
						if (!validateForm(userType)) {
							return;
						}
						
						loading = true;

						await submit().catch( error => { localError = error; loading = false;})
					})}
					
					class="space-y-4"
				>
					<input type="hidden" name="userType" value="student" />
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-2">
							<Label for="firstName">First Name</Label>
							<Input
								id="firstName"
								name="firstName"
								placeholder="Ade"
								required
								disabled={loading}
								oninput={() => (localError = '')}
							/>
						</div>
						<div class="space-y-2">
							<Label for="lastName">Last Name</Label>
							<Input
								id="lastName"
								name="lastName"
								placeholder="Okoro"
								required
								disabled={loading}
								oninput={() => (localError = '')}
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
							disabled={loading}
							oninput={() => (localError = '')}
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
								disabled={loading}
								oninput={() => (localError = '')}
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
								disabled={loading}
								oninput={() => (localError = '')}
							/>
							<button
								type="button"
								class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								onclick={() => showPassword = !showPassword}
								disabled={loading}
							>
								{#if showPassword}
								<EyeOff class="h-4 w-4" />
								{:else}
								<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
						<p class="text-xs text-muted-foreground">
							Must be at least 8 characters with uppercase, lowercase, and number
						</p>
					</div>
					
					<div class="space-y-2">
						<Label for="confirmPassword">Confirm Password</Label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="confirmPassword"
								type={showPassword ? 'text' : 'password'}
								bind:value={confirmPassword}
								class="pl-10"
								placeholder="Confirm your password"
								required
								disabled={loading}
								oninput={() => (localError = '')}
							/>
						</div>
					</div>

					<Button type="submit" class="w-full" disabled={loading}>
						{loading ? 'Creating Account...' : 'Create Student Account'}
					</Button>
				</form>
			</TabsContent>
			<TabsContent value="company">
				<form 
					{...registerCompany.enhance(async ( { submit }) => {
						if (password !== confirmPassword) {
							localError = 'Passwords do not match';
							return;
						}
						localError = '';
						if (!validateForm(userType)) {
							return;
						}
						loading = true;
						
					 await submit().catch( error => { localError = error; loading = false})

					})} class="space-y-4">
					<input type="hidden" name="userType" value="company" />
					{#if error || localError}
						<Alert.Root variant="destructive">
							<Alert.Description>{error || localError}</Alert.Description>
						</Alert.Root>
					{/if}
					<div class="space-y-2">
						<Label for="companyName">Company Name</Label>
						<Input
							id="companyName"
							name="companyName"
							placeholder="Paystack Technologies"
							required
							disabled={loading}
							oninput={() => (localError = '')}
						/>
					</div>

					<div class="space-y-2">
						<Label for="industry">Industry</Label>
						<Input
							id="industry"
							name="industry"
							placeholder="Fintech"
							required
							disabled={loading}
							oninput={() => (localError = '')}
						/>
					</div>

					<div class="space-y-2">
						<Label for="email">Company Email</Label>
						<div class="relative">
							<Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="email"
								type="email"
								name="email"
								placeholder="hr@company.com"
								class="pl-10"
								required
								disabled={loading}
								oninput={() => (localError = '')}
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
								disabled={loading}
								oninput={() => (localError = '')}
							/>
							<button
								type="button"
								class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
								onclick={() => showPassword = !showPassword}
								disabled={loading}
							>
								{#if showPassword}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
						<p class="text-xs text-muted-foreground">
							Must be at least 8 characters with uppercase, lowercase, and number
						</p>
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword">Confirm Password</Label>
						<div class="relative">
							<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								id="confirmPassword"
								type={showPassword ? 'text' : 'password'}
								bind:value={confirmPassword}
								class="pl-10"
								placeholder="Confirm your password"
								required
								disabled={loading}
								oninput={() => (localError = '')}
							/>
						</div>
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