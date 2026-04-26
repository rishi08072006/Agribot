"import React from 'react';
import { Droplets, FlaskRound, Beaker, ShieldAlert } from 'lucide-react';
import { useAgriBot } from '@/contexts/AgriBotContext';
import { Switch } from '@/components/ui/switch';

const PUMPS = [
    { key: 'water', label: 'Water pump', desc: 'Main irrigation valve', icon: Droplets, color: 'hsl(var(--ph-alkaline))' },
    { key: 'acid', label: 'Acid pump', desc: 'Lowers pH (e.g. citric solution)', icon: FlaskRound, color: 'hsl(var(--ph-acidic))' },
    { key: 'base', label: 'Base pump', desc: 'Raises pH (e.g. lime mix)', icon: Beaker, color: 'hsl(var(--ph-optimal))' },
];

export const ManualControl = () => {
    const { pumps, togglePump } = useAgriBot();

    return (
        <div className=\"rounded-lg border border-border bg-card p-5\" data-testid=\"manual-control-panel\">
            <div className=\"mb-4 flex items-center justify-between\">
                <div>
                    <p className=\"text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground\">Manual control</p>
                    <h3 className=\"mt-1 font-display text-base font-semibold\">Demo / testing pumps</h3>
                </div>
                <span className=\"inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground\">
                    <ShieldAlert className=\"h-3 w-3\" /> override
                </span>
            </div>

            <ul className=\"divide-y divide-border\">
                {PUMPS.map((p) => {
                    const Icon = p.icon;
                    const on = pumps[p.key];
                    return (
                        <li key={p.key} className=\"flex items-center justify-between py-3 first:pt-0 last:pb-0\">
                            <div className=\"flex items-center gap-3\">
                                <div
                                    className=\"flex h-9 w-9 items-center justify-center rounded-md\"
                                    style={{
                                        background: on ? `${p.color}22` : 'hsl(var(--muted))',
                                        color: on ? p.color : 'hsl(var(--muted-foreground))',
                                    }}
                                >
                                    <Icon className=\"h-4 w-4\" />
                                </div>
                                <div>
                                    <p className=\"font-display text-sm font-medium\">{p.label}</p>
                                    <p className=\"text-xs text-muted-foreground\">{p.desc}</p>
                                </div>
                            </div>
                            <Switch
                                checked={on}
                                onCheckedChange={() => togglePump(p.key)}
                                data-testid={`pump-toggle-${p.key}`}
                                aria-label={`${p.label} toggle`}
                            />
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
"