import React from 'react';
import { Cloud, CloudRain, CloudLightning, Sun, Droplets, Wind, MapPin } from 'lucide-react';
import { useAgriBot } from '@/contexts/AgriBotContext';
import { useTranslation } from '@/hooks/useTranslation';

const ICON = { sun: Sun, cloud: Cloud, rain: CloudRain };

const CONDITION_ICON = {
    'Partly Cloudy': Cloud,
    'Raining': CloudRain,
    'Storm': CloudLightning,
    'After Rain': Sun,
    'Clear': Sun,
};

export const WeatherWidget = () => {
    const { weather, weatherPhase } = useAgriBot();
    const t = useTranslation();

    const isRaining = weatherPhase === 'raining' || weatherPhase === 'storm';
    const isPostRain = weatherPhase === 'post-rain';

    const conditionKey = weather.condition === 'Raining' ? 'raining'
        : weather.condition === 'Storm' ? 'storm'
        : weather.condition === 'After Rain' ? 'afterRain'
        : weather.condition === 'Clear' ? 'clear'
        : 'partlyCloudy';

    const CondIcon = CONDITION_ICON[weather.condition] || Cloud;

    const borderClass = isRaining
        ? 'border-[hsl(210,80%,50%,0.4)] rain-locked-overlay'
        : isPostRain
        ? 'border-[hsl(145,50%,40%,0.3)]'
        : 'border-border';

    return (
        <div
            className={`relative overflow-hidden rounded-lg border bg-card p-5 transition-all ${borderClass}`}
            data-testid="weather-widget"
        >
            <div className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-2xl ${
                isRaining
                    ? 'bg-[hsl(210,80%,50%,0.25)]'
                    : isPostRain
                    ? 'bg-[hsl(45,80%,50%,0.18)]'
                    : 'bg-[hsl(var(--ph-alkaline)/0.18)]'
            }`} />
            <div className="relative flex items-start justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{t('weather')}</p>
                    <h3 className="mt-1 inline-flex items-center gap-1.5 font-display text-base font-semibold">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {weather.location}
                    </h3>
                </div>
                <div className="flex items-center gap-1.5">
                    {isRaining && (
                        <span className="flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-1.5 py-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-400 pulse-dot" />
                            <span className="font-mono text-[9px] font-bold uppercase text-red-400">{t('live')}</span>
                        </span>
                    )}
                    <CondIcon className={`h-7 w-7 ${
                        isRaining ? 'text-[hsl(210,80%,60%)]' : isPostRain ? 'text-amber-400' : 'text-[hsl(var(--ph-alkaline))]'
                    }`} />
                </div>
            </div>

            <div className="relative mt-4 flex items-end gap-4">
                <span className="font-mono text-5xl font-medium tracking-tight" data-testid="weather-temp">
                    {weather.temp}°
                </span>
                <div className="pb-1">
                    <p className={`font-display text-sm font-medium ${
                        isRaining ? 'text-[hsl(210,80%,65%)]' : isPostRain ? 'text-amber-400/90' : ''
                    }`}>
                        {t(conditionKey)}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('humidity')} {weather.humidity}% · {t('wind')} {weather.wind} {t('kmh')}</p>
                </div>
            </div>

            <div className={`relative mt-4 flex items-center gap-2 rounded-md border p-2.5 text-xs ${
                isRaining
                    ? 'border-[hsl(210,80%,50%,0.3)] bg-[hsl(210,80%,50%,0.08)]'
                    : 'border-border bg-background/50'
            }`}>
                <Droplets className={`h-3.5 w-3.5 ${isRaining ? 'text-[hsl(210,80%,60%)]' : 'text-[hsl(var(--ph-alkaline))]'}`} />
                <span className="text-muted-foreground">{t('rainChance')}</span>
                <span className={`ml-auto font-mono ${isRaining ? 'text-[hsl(210,80%,65%)] font-bold' : ''}`}>
                    {weather.rainChance}%
                </span>
            </div>

            <div className="relative mt-4 grid grid-cols-5 gap-2">
                {weather.forecast.map((d) => {
                    const I = ICON[d.icon] || Cloud;
                    return (
                        <div
                            key={d.day}
                            className="flex flex-col items-center gap-1 rounded-md border border-border bg-background/40 px-2 py-2"
                            data-testid={`weather-day-${d.day.toLowerCase()}`}
                        >
                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{d.day}</span>
                            <I className="h-4 w-4 text-foreground/80" />
                            <span className="font-mono text-xs">{d.t}°</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
