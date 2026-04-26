"import React from 'react';
import { Activity, Cpu, Beaker, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAgriBot } from '@/contexts/AgriBotContext';

const StatusDot = ({ ok }) => (
    <span className={`inline-flex h-2 w-2 rounded-full ${ok ? 'bg-[hsl(var(--ph-optimal))] pulse-dot' : 'bg-destructive pulse-dot'}`} />
);

const Row = ({ icon: Icon, label, value, ok, testId }) => (
    <div className=\"flex items-center justify-between py-2.5\" data-testid={testId}>
        <div className=\"flex items-center gap-2.5\">
            <Icon className=\"h-4 w-4 text-muted-foreground\" />
            <span className=\"text-sm\">{label}</span>
        </div>
        <div className=\"flex items-center gap-2\">
            <span className=\"font-mono text-xs text-muted-foreground\">{value}</span>
            <StatusDot ok={ok} />
        </div>
    </div>
);

export const SystemHealth = () => {
    const { health } = useAgriBot();

    const solutionItem = (label, level, key) => {
        const ok = level !== 'Low';
        return (
            <div
                key={key}
                className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                    ok ? 'border-border bg-background/40' : 'border-destructive/40 bg-destructive/10'
                }`}
                data-testid={`solution-${key}`}
            >
                <div className=\"flex items-center gap-2\">
                    <Beaker className=\"h-3.5 w-3.5 text-muted-foreground\" />
                    <span className=\"text-xs font-medium\">{label}</span>
                </div>
                <span className={`font-mono text-[10px] uppercase tracking-widest ${ok ? 'text-muted-foreground' : 'text-destructive'}`}>
                    {level}
                </span>
            </div>
        );
    };

    return (
        <div className=\"rounded-lg border border-border bg-card p-5\" data-testid=\"system-health-panel\">
            <div className=\"mb-3 flex items-center justify-between\">
                <div className=\"flex items-center gap-2\">
                    <Activity className=\"h-4 w-4 text-muted-foreground\" />
                    <h3 className=\"font-display text-base font-semibold\">System health</h3>
                </div>
                <span className=\"inline-flex items-center gap-1 rounded-full border border-[hsl(var(--ph-optimal)/0.4)] bg-[hsl(var(--ph-optimal)/0.10)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--ph-optimal))]\">
                    <CheckCircle2 className=\"h-3 w-3\" /> nominal
                </span>
            </div>

            <div className=\"divide-y divide-border\">
                <Row
                    testId=\"health-sensors\"
                    icon={Cpu}
                    label=\"Soil sensors\"
                    value={`${health.sensors.online}/${health.sensors.count} online`}
                    ok={health.sensors.online === health.sensors.count}
                />
                <Row
                    testId=\"health-pumps\"
                    icon={Activity}
                    label=\"Pumps\"
                    value={`${health.pumps.online}/${health.pumps.total} ready`}
                    ok={health.pumps.online === health.pumps.total}
                />
            </div>

            <p className=\"mt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground\">
                Solution levels
            </p>
            <div className=\"mt-2 grid grid-cols-3 gap-2\">
                {solutionItem('Water', health.solutions.water, 'water')}
                {solutionItem('Acid', health.solutions.acid, 'acid')}
                {solutionItem('Base', health.solutions.base, 'base')}
            </div>

            {health.solutions.base === 'Low' && (
                <div
                    className=\"mt-3 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive\"
                    data-testid=\"solution-warning\"
                >
                    <AlertCircle className=\"mt-0.5 h-3.5 w-3.5 flex-shrink-0\" />
                    <span>Base solution running low — refill within 48h to keep pH correction available.</span>
                </div>
            )}
        </div>
    );
};
"