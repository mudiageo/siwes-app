<script lang="ts">
	import { login } from '../auth.remote';
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import * as Alert from '$lib/components/ui/alert';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Mail from '@lucide/svelte/icons/mail';
	import Lock from '@lucide/svelte/icons/lock';
	import { page } from '$app/state';
	import { validateEmail, validatePassword } from '$lib/utils/auth-errors';
	
	let showPassword = $state(false);
	let error = $derived(login.result?.error);
	let loading = $state(false);
	let email = $state('');
	let password = $state('');
	let localError = $state('');
	let showResetSuccess = $state(false);

	// Check for password reset success
	$effect(() => {
		if (page.url.searchParams.get('reset') === 'success') {
			showResetSuccess = true;
			// Clear the query parameter after 5 seconds
			setTimeout(() => {
				showResetSuccess = false;
			}, 5000);
		}
	});

	function validateForm(): boolean {
		localError = '';
		
		const emailError = validateEmail(email);
		if (emailError) {
			localError = emailError.message;
			return false;
		}

		const passwordError = validatePassword(password);
		if (passwordError) {
			localError = passwordError.message;
			return false;
		}

		return true;
	}

</script>

<Card class="p-6 shadow-lg">
	<div class="space-y-6">
		<div class="text-center">
			<h2 class="text-xl font-semibold text-foreground">Welcome back</h2>
			<p class="text-sm text-muted-foreground mt-1">Sign in to your account</p>
		</div>

		<form {...login.enhance(async ({ submit}) => {
			if (!validateForm()) {
				return;
			}
			loading = true;
			localError = '';
			await submit().catch(e => { localError = e ; loading = false;});
			loading = false;

		})} class="space-y-4">
			{#if showResetSuccess}
				<Alert.Root class="border-green-500 bg-green-50 dark:bg-green-950">
					<Alert.Description class="text-green-700 dark:text-green-300">
						Password reset successful! You can now sign in with your new password.
					</Alert.Description>
				</Alert.Root>
			{/if}

			{#if error || localError}
				<Alert.Root variant="destructive">
					<Alert.Description>{error || localError}</Alert.Description>
				</Alert.Root>
			{/if}
  			
			<div class="space-y-2">
				<Label for="email">Email</Label>
				<div class="relative">
					<Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="email"
						type="email"
						name="email"
						bind:value={email}
						placeholder="your.email@university.edu.ng"
						class="pl-10"
						required
						disabled={loading}
						oninput={() => localError = ''}
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
						bind:value={password}
						type={showPassword ? 'text' : 'password'}
						placeholder="Enter your password"
						class="pl-10 pr-10"
						required
						disabled={loading}
						oninput={() => localError = ''}
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
			</div>

			<div class="flex items-center justify-between text-sm">
				<label class="flex items-center space-x-2">
					<input type="checkbox" class="rounded border-border" disabled={loading} />
					<span class="text-muted-foreground">Remember me</span>
				</label>
				<a 
					href="/auth/forgot-password" 
					class={["text-primary hover:underline", { 'opacity-50 pointer-events-none': loading }]}
				>
					Forgot password?
				</a>
			</div>

			<Button type="submit" class="w-full" disabled={loading}>
				{loading ? 'Signing in...' : 'Sign In'}
			</Button>
		</form>

		<Separator />

		<div class="text-center">
			<p class="text-sm text-muted-foreground">
				Don't have an account?
				<a href="/auth/register" class="text-primary hover:underline font-medium">
					Sign up
				</a>
			</p>
		</div>
	</div>
</Card>


