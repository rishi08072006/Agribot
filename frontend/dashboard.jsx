"import React from 'react';
import { Navbar } from '@/components/agribot/Navbar';
import { CropSelector } from '@/components/agribot/CropSelector';
import { MonitoringCards } from '@/components/agribot/MonitoringCards';
import { IrrigationStatus } from '@/components/agribot/IrrigationStatus';
import { Notifications } from '@/components/agribot/Notifications';
import { ManualControl } from '@/components/agribot/ManualControl';
import { DataHistory } from '@/components/agribot/DataHistory';
import { SystemHealth } from '@/components/agribot/SystemHealth';
import { WeatherWidget } from '@/components/agribot/WeatherWidget';
import { useAgriBot } from '@/contexts/AgriBotContext';

const HeroBanner = () => {
    const { activeCrop } = useAgriBot();
    return (
        <div className=\"rise\" data-testid=\"hero-banner\">
            <div className=\"flex flex-wrap items-end justify-between gap-3\">
                <div>
                    <p className=\"text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground\">
                        Today · {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                    </p>
                    <h1 className=\"font-display text-3xl font-bold tracking-tight md:text-4xl\">
                        Good morning, Anand.
                    </h1>
                    <p className=\"mt-1 max-w-xl text-sm text-muted-foreground\">
                        Monitoring <span className=\"font-medium text-foreground\">{activeCrop.name}</span>
                        {' '}· {activeCrop.soilType.toLowerCase()} soil · target pH {activeCrop.phMin}–{activeCrop.phMax}.
                    </p>
                </div>
                <div className=\"flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[11px] text-muted-foreground\">
                    <span className=\"h-1.5 w-1.5 rounded-full bg-[hsl(var(--ph-optimal))] pulse-dot\" />
                    <span>AgriBot autopilot · engaged</span>
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    return (
        <div className=\"min-h-screen bg-background grain\">
            <Navbar />
            <main className=\"mx-auto max-w-[1480px] px-4 py-6 md:px-6 md:py-8\">
                <div className=\"space-y-6\">
                    <HeroBanner />
                    <CropSelector />
                    <MonitoringCards />
                    <div className=\"grid gap-4 lg:grid-cols-3\">
                        <div className=\"lg:col-span-2\">
                            <IrrigationStatus />
                        </div>
                        <Notifications />
                    </div>
                    <DataHistory />
                    <div className=\"grid gap-4 lg:grid-cols-3\">
                        <ManualControl />
                        <SystemHealth />
                        <WeatherWidget />
                    </div>
                    <footer className=\"pb-4 pt-6 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground\">
                        AgriBot · v1.0 · Smart irrigation companion
                    </footer>
                </div>
            </main>
        </div>
    );
}
"