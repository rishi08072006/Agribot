"import React from 'react';
import { Bell, Wifi, WifiOff, Sprout, User2, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAgriBot } from '@/contexts/AgriBotContext';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const FARMER_AVATAR =
    'https://images.unsplash.com/photo-1537721664796-76f77222a5d0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDB8MHwxfHNlYXJjaHwzfHxhZ3JpY3VsdHVyZSUyMGZhcm0lMjBjcm9wcyUyMGZhcm1lciUyMHByb2ZpbGV8ZW58MHx8fHwxNzc3MTc4Njc3fDA&ixlib=rb-4.1.0&q=85';

export const Navbar = () => {
    const { online, toggleConnectivity, notifications } = useAgriBot();
    const { theme, setTheme, resolvedTheme } = useTheme();
    const isDark = (theme === 'system' ? resolvedTheme : theme) === 'dark';

    return (
        <header
            className=\"sticky top-0 z-30 h-16 border-b border-border bg-card/85 backdrop-blur supports-[backdrop-filter]:bg-card/70\"
            data-testid=\"agribot-navbar\"
        >
            <div className=\"mx-auto flex h-full max-w-[1480px] items-center justify-between px-4 md:px-6\">
                <div className=\"flex items-center gap-2.5\">
                    <div className=\"flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground\">
                        <Sprout className=\"h-5 w-5\" />
                    </div>
                    <div className=\"leading-tight\">
                        <p className=\"font-display text-lg font-bold tracking-tight\">AgriBot</p>
                        <p className=\"hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:block\">
                            Smart Irrigation Control
                        </p>
                    </div>
                </div>

                <div className=\"flex items-center gap-2 md:gap-3\">
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type=\"button\"
                                    onClick={toggleConnectivity}
                                    data-testid=\"connectivity-pill\"
                                    className={`group flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors ${
                                        online
                                            ? 'border-[hsl(var(--ph-optimal)/0.4)] bg-[hsl(var(--ph-optimal)/0.10)] text-[hsl(var(--ph-optimal))]'
                                            : 'border-destructive/40 bg-destructive/10 text-destructive'
                                    }`}
                                >
                                    {online ? <Wifi className=\"h-3.5 w-3.5\" /> : <WifiOff className=\"h-3.5 w-3.5\" />}
                                    <span className=\"hidden font-medium sm:inline\">{online ? 'Online' : 'Offline'}</span>
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            online ? 'bg-[hsl(var(--ph-optimal))] pulse-dot' : 'bg-destructive'
                                        }`}
                                    />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>Click to toggle connectivity</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant=\"ghost\"
                                size=\"icon\"
                                className=\"relative\"
                                data-testid=\"notification-bell\"
                                aria-label=\"Notifications\"
                            >
                                <Bell className=\"h-5 w-5\" />
                                {notifications.length > 0 && (
                                    <span
                                        className=\"absolute right-1.5 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[9px] font-medium text-destructive-foreground\"
                                        data-testid=\"notification-count\"
                                    >
                                        {notifications.length}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align=\"end\" className=\"w-72\">
                            <DropdownMenuLabel className=\"font-display\">Recent alerts</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {notifications.length === 0 && (
                                <div className=\"px-2 py-6 text-center text-sm text-muted-foreground\">
                                    All clear. No new alerts.
                                </div>
                            )}
                            {notifications.slice(0, 4).map((n) => (
                                <DropdownMenuItem key={n.id} className=\"flex flex-col items-start gap-0.5\">
                                    <span className=\"text-sm font-medium\">{n.title}</span>
                                    <span className=\"line-clamp-2 text-xs text-muted-foreground\">{n.body}</span>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button
                        variant=\"ghost\"
                        size=\"icon\"
                        onClick={() => setTheme(isDark ? 'light' : 'dark')}
                        data-testid=\"theme-toggle\"
                        aria-label=\"Toggle theme\"
                    >
                        {isDark ? <Sun className=\"h-5 w-5\" /> : <Moon className=\"h-5 w-5\" />}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button
                                type=\"button\"
                                className=\"flex items-center gap-2 rounded-full border border-border bg-secondary/40 p-0.5 pr-3 transition-colors hover:bg-secondary\"
                                data-testid=\"navbar-profile\"
                            >
                                <Avatar className=\"h-8 w-8\">
                                    <AvatarImage src={FARMER_AVATAR} alt=\"Farmer profile\" />
                                    <AvatarFallback className=\"bg-primary text-primary-foreground\">
                                        <User2 className=\"h-4 w-4\" />
                                    </AvatarFallback>
                                </Avatar>
                                <span className=\"hidden text-sm font-medium md:inline\">Anand R.</span>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align=\"end\" className=\"w-44\">
                            <DropdownMenuLabel>Anand Rao</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Profile settings</DropdownMenuItem>
                            <DropdownMenuItem>Devices</DropdownMenuItem>
                            <DropdownMenuItem>Sign out</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};
"