<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Alert from '$lib/components/ui/alert';
	import Lock from '@lucide/svelte/icons/lock';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { validatePassword, validatePasswordMatch, parseAuthError } from '$lib/utils/auth-errors';

	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let loading = $state(false);
	let error = $state('');

	// Get token from URL
	const token = $derived($page.url.searchParams.get('token') || '');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		// Validate password
		const passwordError = validatePassword(password);
		if (passwordError) {
			error = passwordError.message;
			return;
		}

		// Check if passwords match
		const matchError = validatePasswordMatch(password, confirmPassword);
		if (matchError) {
			error = matchError.message;
			return;
		}

		if (!token) {
			error = 'Invalid or expired reset link';
			return;
		}

		loading = true;

		try {
			const result = await authClient.resetPassword({
				newPassword: password,
				token
			});

			if (result.error) {
				const authError = parseAuthError(result.error);
				error = authError.message;
			} else {
				// Success - redirect to login
				goto('/auth/login?reset=success');
			}
		} catch (err) {
			error = 'An error occurred. Please try again.';
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<Card class="p-6 shadow-lg">
	<div class="space-y-6">
		<div class="text-center">
			<h2 class="text-xl font-semibold text-foreground">Set New Password</h2>
			<p class="text-sm text-muted-foreground mt-1">Enter your new password</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-4">
			{#if error}
				<Alert.Root variant="destructive">
					<Alert.Description>{error}</Alert.Description>
				</Alert.Root>
			{/if}

			{#if !token}
				<Alert.Root variant="destructive">
					<Alert.Description>
						Invalid or missing reset token. Please request a new password reset link.
					</Alert.Description>
				</Alert.Root>
			{/if}

			<div class="space-y-2">
				<Label for="password">New Password</Label>
				<div class="relative">
					<Lock class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						placeholder="Enter new password"
						class="pl-10 pr-10"
						required
						disabled={loading || !token}
						oninput={() => (error = '')}
					/>
					<button
						type="button"
						class="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
						onclick={() => (showPassword = !showPassword)}
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
						placeholder="Confirm new password"
						class="pl-10"
						required
						disabled={loading || !token}
						oninput={() => (error = '')}
					/>
				</div>
			</div>

			<Button type="submit" class="w-full" disabled={loading || !token}>
				{loading ? 'Resetting...' : 'Reset Password'}
			</Button>
		</form>

		<div class="text-center">
			<p class="text-sm text-muted-foreground">
				Remember your password?
				<a href="/auth/login" class="text-primary hover:underline font-medium">
					Sign in
				</a>
			</p>
		</div>
	</div>
</Card>
