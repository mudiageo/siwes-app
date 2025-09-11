<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Bell, Menu, Sun, Moon } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	
	export let showMobileMenu = false;
	export let isDarkMode = false;
	export let notificationCount = 0;

	const dispatch = createEventDispatcher();

	function toggleMobileMenu() {
		showMobileMenu = !showMobileMenu;
		dispatch('toggle-mobile-menu', { open: showMobileMenu });
	}

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		dispatch('toggle-theme', { dark: isDarkMode });
	}
</script>

<header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
	<div class="flex items-center space-x-4">
		<!-- Mobile menu button -->
		<Button
			variant="ghost"
			size="sm"
			class="md:hidden h-8 w-8 p-0"
			on:click={toggleMobileMenu}
		>
			<Menu class="h-5 w-5" />
		</Button>

		<!-- Breadcrumbs or title can go here -->
		<div class="hidden md:block">
			<nav class="flex items-center space-x-2 text-sm text-muted-foreground">
				<span>Company Portal</span>
			</nav>
		</div>
	</div>

	<div class="flex items-center space-x-2">
		<!-- Theme toggle -->
		<Button
			variant="ghost"
			size="sm"
			class="h-8 w-8 p-0"
			on:click={toggleTheme}
		>
			{#if isDarkMode}
				<Sun class="h-4 w-4" />
			{:else}
				<Moon class="h-4 w-4" />
			{/if}
		</Button>

		<!-- Notifications -->
		<Button variant="ghost" size="sm" class="relative h-8 w-8 p-0">
			<Bell class="h-4 w-4" />
			{#if notificationCount > 0}
				<Badge 
					variant="destructive" 
					class="absolute -right-1 -top-1 h-4 w-4 p-0 text-xs flex items-center justify-center"
				>
					{notificationCount > 9 ? '9+' : notificationCount}
				</Badge>
			{/if}
		</Button>
	</div>
</header>