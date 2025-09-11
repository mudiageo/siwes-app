<script lang="ts">
	import { page } from '$app/state';
	import { Badge } from '$lib/components/ui/badge';
	import { cn } from '$lib/utils';
	import Home from '@lucide/svelte/icons/home';
	import Building2 from '@lucide/svelte/icons/building-2';
	import FileText from '@lucide/svelte/icons/file-text';
	import User from '@lucide/svelte/icons/user';

	const navItems = [
		{ href: '/app/company', icon: Home, label: 'Home' },
		{ href: '/app/company/placements', icon: Building2, label: 'Placements' },
		{ href: '/app/company/applications', icon: FileText, label: 'Apps', badge: '12' },
		{ href: '/app/company/profile', icon: User, label: 'Profile' }
	];

	let currentPath = $derived(page.url.pathname);

	function isActive(href: string): boolean {
		if (href === '/app/company') {
			return currentPath === href;
		}
		return currentPath === href || currentPath.startsWith(href + '/');
	}
</script>

<nav class="mobile-nav md:hidden">
	<div class="flex h-16 items-center justify-around px-4">
		{#each navItems as item}
			<a
				href={item.href}
				class={cn(
					"relative flex flex-col items-center justify-center space-y-1 rounded-lg px-3 py-2 transition-colors duration-200",
					isActive(item.href)
						? "text-primary"
						: "text-muted-foreground hover:text-foreground"
				)}
			>
				<div class="relative">
					<item.icon class="h-5 w-5" />
					{#if item.badge}
						<Badge 
							variant="destructive" 
							class="absolute -right-2 -top-2 h-4 w-4 p-0 text-xs flex items-center justify-center"
						>
							{item.badge}
						</Badge>
					{/if}
				</div>
				<span class="text-xs font-medium">{item.label}</span>
			</a>
		{/each}
	</div>
</nav>