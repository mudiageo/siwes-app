<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import Home from '@lucide/svelte/icons/home';
	import Building2 from '@lucide/svelte/icons/building-2';
	import FileText from '@lucide/svelte/icons/file-text';
	import User from '@lucide/svelte/icons/user';
	import Settings from '@lucide/svelte/icons/settings';
	import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
	import Bell from '@lucide/svelte/icons/bell';
	import LogOut from '@lucide/svelte/icons/log-out';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	
	let { collapsed = $bindable(false) } = $props();

	const navItems = [
		{ href: '/app/company', icon: Home, label: 'Dashboard' },
		{ href: '/app/company/placements', icon: Building2, label: 'Placements' },
		{ href: '/app/company/applications', icon: FileText, label: 'Applications', badge: '12' },
		{ href: '/app/company/analytics', icon: BarChart3, label: 'Analytics' },
		{ href: '/app/company/profile', icon: User, label: 'Profile' },
		{ href: '/app/company/settings', icon: Settings, label: 'Settings' }
	];

	let currentPath = $derived(page.url.pathname);

	function isActive(href: string): boolean {
		if (href === '/app/company') {
			return currentPath === href;
		}
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<aside class={cn(
	"desktop-sidebar transition-all duration-300 ease-in-out",
	collapsed ? "w-16" : "w-64"
)}>
	<div class="flex h-full flex-col">
		<!-- Header -->
		<div class="flex h-16 items-center justify-between px-4 border-b border-border">
			{#if !collapsed}
				<div class="flex items-center space-x-2">
					<div class="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-blue-600"></div>
					<span class="font-semibold text-foreground">SIWES AI</span>
				</div>
			{/if}
			
			<Button
				variant="ghost"
				size="sm"
				class="h-8 w-8 p-0"
				onclick={() => collapsed = !collapsed}
			>
				{#if collapsed}
					<ChevronRight class="h-4 w-4" />
				{:else}
					<ChevronLeft class="h-4 w-4" />
				{/if}
			</Button>
		</div>

		<!-- Navigation -->
		<nav class="flex-1 space-y-1 p-2">
			{#each navItems as item}
				<a
					href={item.href}
					class={cn(
						"flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
						isActive(item.href)
							? "bg-primary text-primary-foreground"
							: "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
					)}
				>
					<item.icon class="h-5 w-5 flex-shrink-0" />
					{#if !collapsed}
						<span class="ml-3">{item.label}</span>
						{#if item.badge}
							<Badge variant="secondary" class="ml-auto text-xs">
								{item.badge}
							</Badge>
						{/if}
					{/if}
				</a>
			{/each}
		</nav>

	<!-- Footer -->
	<div class="border-t border-border p-2">
		<Button
			variant="ghost"
			href="/app/company/notifications"
			class={cn(
				"w-full justify-start text-muted-foreground hover:text-foreground",
				collapsed ? "px-3" : "px-3"
			)}
		>
			<Bell class="h-5 w-5 flex-shrink-0" />
			{#if !collapsed}
				<span class="ml-3">Notifications</span>
			{/if}
		</Button>			<Button
				variant="ghost"
				class={cn(
					"w-full justify-start text-muted-foreground hover:text-destructive",
					collapsed ? "px-3" : "px-3"
				)}
			>
				<LogOut class="h-5 w-5 flex-shrink-0" />
				{#if !collapsed}
					<span class="ml-3">Sign Out</span>
				{/if}
			</Button>
		</div>
	</div>
</aside>