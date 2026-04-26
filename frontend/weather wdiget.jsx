"import React from 'react';
import { Cloud, CloudRain, Sun, Droplets, Wind, MapPin } from 'lucide-react';
import { useAgriBot } from '@/contexts/AgriBotContext';

const ICON = { sun: Sun, cloud: Cloud, rain: CloudRain };

export const WeatherWidget = () => {
    const { weather } = useAgriBot();

    return (
        <div
            className=\"relative overflow-hidden rounded-lg border border-border bg-card p-5\"
            data-testid=\"weather-widget\"
        >
            <div className=\"pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[hsl(var(--ph-alkaline)/0.18)] blur-2xl\" />
            <div className=\"relative flex items-start justify-between\">
                <div>
                    <p className=\"text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground\">Weather</p>
                    <h3 className=\"mt-1 inline-flex items-center gap-1.5 font-display text-base font-semibold\">
                        <MapPin className=\"h-3.5 w-3.5 text-muted-foreground\" />
                        {weather.location}
                    </h3>
                </div>
                <Cloud className=\"h-7 w-7 text-[hsl(var(--ph-alkaline))]\" />
            </div>

            <div className=\"relative mt-4 flex items-end gap-4\">
                <span className=\"font-mono text-5xl font-medium tracking-tight\" data-testid=\"weather-temp\">
                    {weather.temp}°
                </span>
                <div className=\"pb-1\">
                    <p className=\"font-display text-sm font-medium\">{weather.condition}</p>
                    <p className=\"text-xs text-muted-foreground\">Humidity {weather.humidity}% · Wind {weather.wind} km/h</p>
                </div>
            </div>

            <div className=\"relative mt-4 flex items-center gap-2 rounded-md border border-border bg-background/50 p-2.5 text-xs\">
                <Droplets className=\"h-3.5 w-3.5 text-[hsl(var(--ph-alkaline))]\" />
                <span className=\"text-muted-foreground\">Rain chance today</span>
                <span className=\"ml-auto font-mono\">{weather.rainChance}%</span>
            </div>

            <div className=\"relative mt-4 grid grid-cols-5 gap-2\">
                {weather.forecast.map((d) => {
                    const I = ICON[d.icon] || Cloud;
                    return (
                        <div
                            key={d.day}
                            className=\"flex flex-col items-center gap-1 rounded-md border border-border bg-background/40 px-2 py-2\"
                            data-testid={`weather-day-${d.day.toLowerCase()}`}
                        >
                            <span className=\"font-mono text-[10px] uppercase tracking-widest text-muted-foreground\">{d.day}</span>
                            <I className=\"h-4 w-4 text-foreground/80\" />
                            <span className=\"font-mono text-xs\">{d.t}°</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
"