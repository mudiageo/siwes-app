<script lang="ts">
    import { toast } from 'svelte-sonner';
    import { Badge } from '$lib/components/ui/badge';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent } from '$lib/components/ui/card';
    import Bell from '@lucide/svelte/icons/bell';
    import CheckCircle from '@lucide/svelte/icons/check-circle';
    import FileText from '@lucide/svelte/icons/file-text';
    import Star from '@lucide/svelte/icons/star';
    import Users from '@lucide/svelte/icons/users';
    import Trash2 from '@lucide/svelte/icons/trash-2';
    import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '$lib/notifications.remote';

    const formatter = new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium', timeStyle: 'short' });

    function formatDistanceToNow(date: Date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        
        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        
        return formatter.format(date);
    }

    let notifications = $derived(await getNotifications());
    let loading = $state(false);

    let unreadCount = $derived(notifications.filter(n => !n.read).length);

    function getNotificationIcon(type: string) {
        switch (type) {
            case 'application_received':
            case 'application_status':
                return FileText;
            case 'new_match':
                return Star;
            case 'message':
                return Users;
            default:
                return Bell;
        }
    }

    function getNotificationColor(type: string) {
        switch (type) {
            case 'application_received':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            case 'application_status':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'new_match':
                return 'text-purple-600 bg-purple-50 border-purple-200';
            case 'message':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    }

    async function handleMarkAsRead(notificationId: string) {
        try {
            await markAsRead(notificationId);
            toast.success('Marked as read');
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    }

    async function handleMarkAllAsRead() {
        loading = true;
        try {
            await markAllAsRead();
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        } finally {
            loading = false;
        }
    }

    async function handleDelete(notificationId: string) {
        try {
            await deleteNotification(notificationId);
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    }

    function handleNotificationClick(notification: any) {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }

        if (notification.data?.applicationId) {
            window.location.href = '/app/student/applications';
        } else if (notification.data?.placementId) {
            window.location.href = `/app/student/placements/${notification.data.placementId}`;
        } else if (notification.data?.conversationId) {
            window.location.href = '/app/student/applications';
        }
    }
</script>

<div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
        <div>
            <h1 class="text-2xl font-bold">Notifications</h1>
            <p class="text-muted-foreground">{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}</p>
        </div>

        {#if unreadCount > 0}
            <Button variant="outline" onclick={handleMarkAllAsRead} disabled={loading}>
                <CheckCircle class="h-4 w-4 mr-2" />
                Mark All Read
            </Button>
        {/if}
    </div>

    {#if notifications.length === 0}
        <Card>
            <CardContent class="flex flex-col items-center justify-center py-12">
                <Bell class="h-12 w-12 text-muted-foreground mb-4" />
                <h3 class="text-lg font-semibold mb-2">No notifications yet</h3>
                <p class="text-muted-foreground text-center">When you receive applications, matches, or messages, they'll appear here.</p>
            </CardContent>
        </Card>
    {:else}
        <div class="space-y-2">
            {#each notifications as notification}
                {@const Icon = getNotificationIcon(notification.type)}
                <Card class={`transition-colors hover:bg-muted/50 cursor-pointer ${!notification.read ? 'border-l-4 border-l-primary' : ''}`}>
                    <CardContent class="p-4">
                        <div class="flex items-start gap-4">
                            <div class={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                                <Icon class="h-4 w-4" />
                            </div>

                            <div class="flex-1 min-w-0" onclick={() => handleNotificationClick(notification)}>
                                <div class="flex items-start justify-between gap-2">
                                    <div class="flex-1">
                                        <p class={`text-sm ${!notification.read ? 'font-semibold' : ''}`}>{notification.title}</p>
                                        <p class="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                        <div class="flex items-center gap-2 mt-2">
                                            <span class="text-xs text-muted-foreground">{formatDistanceToNow(new Date(notification.createdAt))}</span>
                                            {#if !notification.read}<Badge variant="secondary" class="text-xs">New</Badge>{/if}
                                        </div>
                                    </div>

                                    <div class="flex items-center gap-1">
                                        {#if !notification.read}
                                            <Button variant="ghost" size="sm" onclick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}>
                                                <CheckCircle class="h-4 w-4" />
                                            </Button>
                                        {/if}
                                        <Button variant="ghost" size="sm" onclick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}>
                                            <Trash2 class="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </div>
    {/if}
</div>
