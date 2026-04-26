"import React from 'react';
import { Droplets, FlaskRound, Beaker, Power, Pause } from 'lucide-react';
import { useAgriBot } from '@/contexts/AgriBotContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const STATUS_TONE = {
    Idle: { label: 'Idle', cls: 'bg-muted text-muted-foreground border-border' },
    Watering: { label: 'Watering', cls: 'bg-[hsl(var(--ph-alkaline)/0.12)] text-[hsl(var(--ph-alkaline))] border-[hsl(var(--ph-alkaline)/0.4)]' },
    'Correcting pH': { label: 'Correcting pH', cls: 'bg-[hsl(var(--ph-acidic)/0.12)] text-[hsl(var(--ph-acidic))] border-[hsl(var(--ph-acidic)/0.4)]' },
};

const PUMP_META = {
    water: { icon: Droplets, label: 'Water pump', color: 'hsl(var(--ph-alkaline))' },
    acid: { icon: FlaskRound, label: 'Acid pump', color: 'hsl(var(--ph-acidic))' },
    base: { icon: Beaker, label: 'Base pump', color: 'hsl(var(--ph-optimal))' },
};

export const IrrigationStatus = () => {
    const { irrigation, startIrrigation, stopIrrigation } = useAgriBot();
    const tone = STATUS_TONE[irrigation.status];
    const pump = irrigation.pump ? PUMP_META[irrigation.pump] : null;
    const isActive = irrigation.status !== 'Idle';

    return (
        <div
            className=\"rounded-lg border border-border bg-card p-5\"
            data-testid=\"irrigation-status-panel\"
        >
            <div className=\"flex items-start justify-between gap-3\">
                <div>
                    <p className=\"text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground\">
                        Irrigation status
                    </p>
                    <h3 className=\"mt-1 font-display text-xl font-semibold\">System control</h3>
                </div>
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${tone.cls}`}
                    data-testid=\"irrigation-status-pill\"
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-current pulse-dot' : 'bg-current opacity-50'}`} />
                    {tone.label}
                </span>
            </div>

            <div className=\"mt-5 grid grid-cols-3 gap-2\">
                {Object.entries(PUMP_META).map(([key, meta]) => {
                    const active = irrigation.pump === key;
                    const Icon = meta.icon;
                    return (
                        <div
                            key={key}
                            data-testid={`pump-indicator-${key}`}
                            className={`flex flex-col items-center gap-1.5 rounded-md border p-3 transition-all ${
                                active
                                    ? 'border-foreground/20 bg-secondary/60'
                                    : 'border-border bg-background/50 opacity-60'
                            }`}
                        >
                            <div
                                className={`flex h-9 w-9 items-center justify-center rounded-full ${active ? 'pulse-dot' : ''}`}
                                style={{
                                    background: active ? `${meta.color}22` : 'hsl(var(--muted))',
                                    color: active ? meta.color : 'hsl(var(--muted-foreground))',
                                }}
                            >
                                <Icon className=\"h-4 w-4\" />
                            </div>
                            <span className=\"font-display text-xs font-medium\">{meta.label}</span>
                        </div>
                    );
                })}
            </div>

            <div className=\"mt-5\">
                <div className=\"mb-1.5 flex items-center justify-between text-xs\">
                    <span className=\"text-muted-foreground\">
                        {pump ? `${pump.label} active` : 'No pump active'}
                    </span>
                    <span className=\"font-mono text-muted-foreground\">
                        {Math.round(irrigation.progress)}%
                    </span>
                </div>
                <div className=\"relative\">
                    <Progress value={irrigation.progress} className=\"h-2\" data-testid=\"irrigation-progress\" />
                    {isActive && (
                        <div className=\"pointer-events-none absolute inset-0 overflow-hidden rounded-full\">
                            <div className=\"flow-bar h-full w-1/2\" />
                        </div>
                    )}
                </div>
            </div>

            <div className=\"mt-5 flex items-center gap-2\">
                {isActive ? (
                    <Button
                        variant=\"outline\"
                        className=\"flex-1\"
                        onClick={stopIrrigation}
                        data-testid=\"irrigation-stop\"
                    >
                        <Pause className=\"mr-1.5 h-4 w-4\" /> Stop cycle
                    </Button>
                ) : (
                    <>
                        <Button
                            className=\"flex-1\"
                            onClick={() => startIrrigation('Watering', 'water')}
                            data-testid=\"irrigation-start-water\"
                        >
                            <Power className=\"mr-1.5 h-4 w-4\" /> Start watering
                        </Button>
                        <Button
                            variant=\"outline\"
                            className=\"flex-1\"
                            onClick={() => startIrrigation('Correcting pH', 'acid')}
                            data-testid=\"irrigation-start-correction\"
                        >
                            Correct pH
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};
"