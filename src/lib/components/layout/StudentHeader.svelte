<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import Bell from '@lucide/svelte/icons/bell';
	import Menu from '@lucide/svelte/icons/menu';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import { toggleMode } from "mode-watcher";
	
	interface Props {
		showMobileMenu?: boolean;
		notificationCount?: number;
	}

	let {
		showMobileMenu = $bindable(false),
		notificationCount = 0,
	}: Props = $props();

	function toggleMobileMenu() {
		showMobileMenu = !showMobileMenu;
	}
</script>

<header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
	<div class="flex items-center space-x-4">
		<!-- Mobile menu button -->
		<Button
			variant="ghost"
			size="sm"
			class="md:hidden h-8 w-8 p-0"
			onclick={toggleMobileMenu}
		>
			<Menu class="h-5 w-5" />
		</Button>

		<!-- Breadcrumbs or title can go here -->
		<div class="hidden md:block">
			<nav class="flex items-center space-x-2 text-sm text-muted-foreground">
				<span>Student Portal</span>
			</nav>
		</div>
	</div>

	<div class="flex items-center space-x-2">
		<!-- Theme toggle -->
		<Button onclick={toggleMode} variant="ghost" size="icon">
			<SunIcon
				class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 !transition-all dark:-rotate-90 dark:scale-0"
			/>
			<MoonIcon
				class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 !transition-all dark:rotate-0 dark:scale-100"
			/>
			<span class="sr-only">Toggle theme</span>
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