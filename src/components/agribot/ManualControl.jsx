import React from 'react';
import { Droplets, FlaskRound, Beaker, ShieldAlert, CloudRain } from 'lucide-react';
import { useAgriBot } from '@/contexts/AgriBotContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Switch } from '@/components/ui/switch';

export const ManualControl = () => {
    const { pumps, togglePump, isRainLocked } = useAgriBot();
    const t = useTranslation();

    const PUMPS = [
        { key: 'water', labelKey: 'waterPump', descKey: 'waterPumpDesc', icon: Droplets, color: 'hsl(var(--ph-alkaline))' },
        { key: 'acid', labelKey: 'acidPump', descKey: 'acidPumpDesc', icon: FlaskRound, color: 'hsl(var(--ph-acidic))' },
        { key: 'base', labelKey: 'basePump', descKey: 'basePumpDesc', icon: Beaker, color: 'hsl(var(--ph-optimal))' },
    ];

    return (
        <div className={`rounded-lg border bg-card p-5 transition-all ${
            isRainLocked ? 'border-[hsl(210,80%,50%,0.3)] rain-locked-overlay' : 'border-border'
        }`} data-testid="manual-control-panel">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{t('manualControl')}</p>
                    <h3 className="mt-1 font-display text-base font-semibold">{t('demoTestingPumps')}</h3>
                </div>
                {isRainLocked ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[hsl(210,80%,50%,0.4)] bg-[hsl(210,80%,50%,0.1)] px-2 py-0.5 font-mono text-[10px] text-[hsl(210,80%,60%)]">
                        <CloudRain className="h-3 w-3" /> {t('allPumpsLockedRain')}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                        <ShieldAlert className="h-3 w-3" /> {t('override')}
                    </span>
                )}
            </div>

            <ul className="divide-y divide-border">
                {PUMPS.map((p) => {
                    const Icon = p.icon;
                    const on = pumps[p.key];
                    return (
                        <li key={p.key} className={`flex items-center justify-between py-3 first:pt-0 last:pb-0 ${
                            isRainLocked ? 'opacity-50' : ''
                        }`}>
                            <div className="flex items-center gap-3">
                                <div
                                    className="flex h-9 w-9 items-center justify-center rounded-md"
                                    style={{
                                        background: on ? `${p.color}22` : 'hsl(var(--muted))',
                                        color: on ? p.color : 'hsl(var(--muted-foreground))',
                                    }}
                                >
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-display text-sm font-medium">{t(p.labelKey)}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isRainLocked ? t('irrigationPausedRain') : t(p.descKey)}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                checked={on}
                                onCheckedChange={() => togglePump(p.key)}
                                disabled={isRainLocked}
                                data-testid={`pump-toggle-${p.key}`}
                                aria-label={`${t(p.labelKey)} toggle`}
                            />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
