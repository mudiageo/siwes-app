<script lang="ts">
	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Alert from '$lib/components/ui/alert';
	import Mail from '@lucide/svelte/icons/mail';
	import { authClient } from '$lib/auth-client';
	import { validateEmail, parseAuthError } from '$lib/utils/auth-errors';

	let email = $state('');
	let loading = $state(false);
	let success = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = '';
		success = false;

		// Validate email
		const emailError = validateEmail(email);
		if (emailError) {
			error = emailError.message;
			loading = false;
			return;
		}

		try {
			const result = await authClient.forgetPassword({
				email,
				redirectTo: '/auth/reset-password'
			});

			if (result.error) {
				const authError = parseAuthError(result.error);
				error = authError.message;
			} else {
				success = true;
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
			<h2 class="text-xl font-semibold text-foreground">Reset Password</h2>
			<p class="text-sm text-muted-foreground mt-1">
				Enter your email to receive a password reset link
			</p>
		</div>

		{#if success}
			<Alert.Root class="border-green-500 bg-green-50 dark:bg-green-950">
				<Alert.Description class="text-green-700 dark:text-green-300">
					Password reset link sent! Please check your email.
				</Alert.Description>
			</Alert.Root>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-4">
				{#if error}
					<Alert.Root variant="destructive">
						<Alert.Description>{error}</Alert.Description>
					</Alert.Root>
				{/if}

				<div class="space-y-2">
					<Label for="email">Email</Label>
					<div class="relative">
						<Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							id="email"
							type="email"
							bind:value={email}
							placeholder="your.email@university.edu.ng"
							class="pl-10"
							required
							disabled={loading}
							oninput={() => (error = '')}
						/>
					</div>
				</div>

				<Button type="submit" class="w-full" disabled={loading}>
					{loading ? 'Sending...' : 'Send Reset Link'}
				</Button>
			</form>
		{/if}

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
