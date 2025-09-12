<script lang="ts">
	import { login } from '../auth.remote';
	import { signIn } from 'svelte-guardian/client'

	import { Card } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import Mail from '@lucide/svelte/icons/mail';
	import Lock from '@lucide/svelte/icons/lock';

	import { goto } from '$app/navigation';
	
	let loading = $state(false);
	let showPassword = $state(false);
	let email = $state("");
	let password = $state("");

	let onsubmit = async (e) => {
		e.preventDefault()
		const result = await signIn("credentials", {
			email,
			password,
			redirect:false,
			callbackUrl: '/app'
		});

		let res = await result.json()

		let error = "An error occurred, please try again."
		if(result.error) {
			error = 'Invalid email and/or password'
		} else {

		const url = new URL(res.url)
console.log(res)
		if(url.pathname === '/app') goto(`${url.pathname}/${res}`)
		const errCode = url.searchParams.get('code')
    
    
    switch (errCode) {
		  case 'unverified_email':
				error = 'Email must be verified';
				break;
			case 'account_not_found':
			case 'user_not_found':
				error = 'No account associated with this email';
				break;
			case 'invalid_credentials':
				error = 'Invalid credentials';
				break;
		  }
		}
    
	}
</script>

<Card class="p-6 shadow-lg">
	<div class="space-y-6">
		<div class="text-center">
			<h2 class="text-xl font-semibold text-foreground">Welcome back</h2>
			<p class="text-sm text-muted-foreground mt-1">Sign in to your account</p>
		</div>

		<form {onsubmit} class="space-y-4">
		  	<input type="hidden" name="redirect" value={false} />
			<input type="hidden" name="providerId" value="credentials" />
			{#if login.result?.error}
				<div class="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
					<p class="text-sm text-destructive">{login.result.error}</p>
				</div>
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

			<div class="flex items-center justify-between text-sm">
				<label class="flex items-center space-x-2">
					<input type="checkbox" class="rounded border-border" />
					<span class="text-muted-foreground">Remember me</span>
				</label>
				<a href="/auth/forgot-password" class="text-primary hover:underline">
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


