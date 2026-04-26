"import React from 'react';
import { Bell, Check, Clock3, X, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { useAgriBot } from '@/contexts/AgriBotContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const TYPE_META = {
    info: { icon: Info, cls: 'text-[hsl(var(--ph-alkaline))] bg-[hsl(var(--ph-alkaline)/0.10)] border-[hsl(var(--ph-alkaline)/0.35)]' },
    warning: { icon: AlertTriangle, cls: 'text-[hsl(var(--ph-acidic))] bg-[hsl(var(--ph-acidic)/0.10)] border-[hsl(var(--ph-acidic)/0.35)]' },
    success: { icon: CheckCircle2, cls: 'text-[hsl(var(--ph-optimal))] bg-[hsl(var(--ph-optimal)/0.10)] border-[hsl(var(--ph-optimal)/0.35)]' },
};

const formatRel = (t) => {
    const diff = Math.floor((Date.now() - t) / 60_000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
};

export const Notifications = () => {
    const { notifications, handleNotification, dismissAllNotifications } = useAgriBot();

    return (
        <div className=\"rounded-lg border border-border bg-card p-5\" data-testid=\"notifications-panel\">
            <div className=\"mb-4 flex items-center justify-between\">
                <div className=\"flex items-center gap-2\">
                    <Bell className=\"h-4 w-4 text-muted-foreground\" />
                    <h3 className=\"font-display text-base font-semibold\">Smart alerts</h3>
                    <span className=\"rounded-full border border-border bg-secondary px-1.5 font-mono text-[10px] text-muted-foreground\">
                        {notifications.length}
                    </span>
                </div>
                <button
                    type=\"button\"
                    onClick={dismissAllNotifications}
                    className=\"text-xs text-muted-foreground hover:text-foreground\"
                    data-testid=\"notifications-clear-all\"
                >
                    Clear all
                </button>
            </div>

            {notifications.length === 0 ? (
                <div className=\"flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border p-8 text-center\">
                    <CheckCircle2 className=\"h-7 w-7 text-[hsl(var(--ph-optimal))]\" />
                    <p className=\"font-display text-sm font-medium\">All clear</p>
                    <p className=\"text-xs text-muted-foreground\">No active alerts. AgriBot is watching.</p>
                </div>
            ) : (
                <ScrollArea className=\"h-[280px] pr-2\">
                    <ul className=\"space-y-2\">
                        {notifications.map((n) => {
                            const meta = TYPE_META[n.type] || TYPE_META.info;
                            const Icon = meta.icon;
                            return (
                                <li
                                    key={n.id}
                                    data-testid={`notification-item-${n.id}`}
                                    className={`rounded-md border p-3 ${meta.cls}`}
                                >
                                    <div className=\"flex items-start gap-2\">
                                        <Icon className=\"mt-0.5 h-4 w-4 flex-shrink-0\" />
                                        <div className=\"min-w-0 flex-1\">
                                            <p className=\"font-display text-sm font-semibold text-foreground\">{n.title}</p>
                                            <p className=\"mt-0.5 text-xs text-muted-foreground\">{n.body}</p>
                                            <p className=\"mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground\">
                                                {formatRel(n.time)}
                                            </p>
                                        </div>
                                    </div>
                                    {n.type !== 'success' && (
                                        <div className=\"mt-3 flex items-center gap-2\">
                                            <Button
                                                size=\"sm\"
                                                onClick={() => handleNotification(n.id, 'approve')}
                                                data-testid={`notification-approve-${n.id}`}
                                            >
                                                <Check className=\"mr-1 h-3.5 w-3.5\" />
                                                Approve
                                            </Button>
                                            <Button
                                                size=\"sm\"
                                                variant=\"outline\"
                                                onClick={() => handleNotification(n.id, 'delay')}
                                                data-testid={`notification-delay-${n.id}`}
                                            >
                                                <Clock3 className=\"mr-1 h-3.5 w-3.5\" />
                                                Delay
                                            </Button>
                                            <Button
                                                size=\"sm\"
                                                variant=\"ghost\"
                                                onClick={() => handleNotification(n.id, 'cancel')}
                                                data-testid={`notification-cancel-${n.id}`}
                                            >
                                                <X className=\"mr-1 h-3.5 w-3.5\" />
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </ScrollArea>
            )}
        </div>
    );
};
"