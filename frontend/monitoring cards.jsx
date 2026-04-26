"import React from 'react';
import { Droplets, Thermometer, FlaskConical, Info } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer, Tooltip as RTooltip } from 'recharts';
import { useAgriBot } from '@/contexts/AgriBotContext';
import { phLabel, phToneClasses, phToneBg } from '@/lib/agribot/mockData';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const ChartTooltip = ({ active, payload, suffix = '' }) => {
    if (!active || !payload || !payload.length) return null;
    return (
        <div className=\"rounded-md border border-border bg-popover px-2 py-1 font-mono text-[11px] text-popover-foreground shadow-md\">
            {payload[0].value}{suffix}
        </div>
    );
};

const MiniChart = ({ data, color, suffix }) => (
    <div className=\"-mx-4 -mb-4 mt-3 h-16\">
        <ResponsiveContainer width=\"100%\" height=\"100%\">
            <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                    <linearGradient id={`grad-${color.replace(/[^a-z0-9]/gi, '')}`} x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">
                        <stop offset=\"0%\" stopColor={color} stopOpacity={0.45} />
                        <stop offset=\"100%\" stopColor={color} stopOpacity={0.02} />
                    </linearGradient>
                </defs>
                <RTooltip content={<ChartTooltip suffix={suffix} />} cursor={{ stroke: color, strokeOpacity: 0.4 }} />
                <Area
                    type=\"monotone\"
                    dataKey=\"v\"
                    stroke={color}
                    strokeWidth={1.75}
                    fill={`url(#grad-${color.replace(/[^a-z0-9]/gi, '')})`}
                />
            </AreaChart>
        </ResponsiveContainer>
    </div>
);

const StatCard = ({ icon: Icon, label, value, unit, trend, chartData, color, suffix, extra, testId, highlightTone }) => (
    <div
        className={`relative overflow-hidden rounded-lg border bg-card p-4 transition-all hover:-translate-y-[1px] hover:shadow-sm ${
            highlightTone ? phToneBg[highlightTone] : 'border-border'
        }`}
        data-testid={testId}
    >
        <div className=\"flex items-start justify-between\">
            <div className=\"flex items-center gap-2\">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md ${
                    highlightTone ? `${phToneClasses[highlightTone]} bg-background/60` : 'bg-secondary text-foreground'
                }`}>
                    <Icon className=\"h-4 w-4\" />
                </div>
                <p className=\"text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground\">{label}</p>
            </div>
            {extra}
        </div>

        <div className=\"mt-4 flex items-baseline gap-2\">
            <span
                className={`font-mono text-3xl font-medium tracking-tight md:text-4xl ${
                    highlightTone ? phToneClasses[highlightTone] : ''
                }`}
                data-testid={`${testId}-value`}
            >
                {value}
            </span>
            {unit && <span className=\"font-mono text-sm text-muted-foreground\">{unit}</span>}
        </div>
        {trend && <p className=\"mt-1 text-xs text-muted-foreground\">{trend}</p>}

        <MiniChart data={chartData} color={color} suffix={suffix} />
    </div>
);

export const MonitoringCards = () => {
    const { activeReading, activeCrop } = useAgriBot();
    if (!activeReading) return null;
    const { ph, moisture, temperature, phHistory, moistureHistory, tempHistory } = activeReading;
    const ph_ = phLabel(ph);
    const inRange = ph >= activeCrop.phMin && ph <= activeCrop.phMax;

    const phColor = ph_.tone === 'optimal'
        ? 'hsl(var(--ph-optimal))'
        : ph_.tone === 'acidic'
        ? 'hsl(var(--ph-acidic))'
        : 'hsl(var(--ph-alkaline))';

    return (
        <section className=\"grid gap-4 md:grid-cols-2 xl:grid-cols-3\" data-testid=\"monitoring-section\">
            <StatCard
                testId=\"ph-card\"
                icon={FlaskConical}
                label=\"Soil pH\"
                value={ph.toFixed(2)}
                unit=\"pH\"
                trend={
                    <span className=\"inline-flex items-center gap-1\">
                        <span className={`h-1.5 w-1.5 rounded-full ${
                            ph_.tone === 'optimal' ? 'bg-[hsl(var(--ph-optimal))]'
                                : ph_.tone === 'acidic' ? 'bg-[hsl(var(--ph-acidic))]'
                                : 'bg-[hsl(var(--ph-alkaline))]'
                        }`} />
                        {ph_.label} · target {activeCrop.phMin}–{activeCrop.phMax} {!inRange && '· out of range'}
                    </span>
                }
                chartData={phHistory}
                color={phColor}
                suffix=\" pH\"
                highlightTone={ph_.tone}
                extra={
                    <TooltipProvider delayDuration={150}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type=\"button\"
                                    className=\"text-muted-foreground hover:text-foreground\"
                                    data-testid=\"ph-info\"
                                    aria-label=\"pH info\"
                                >
                                    <Info className=\"h-3.5 w-3.5\" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className=\"max-w-[220px]\">
                                Below 6 is acidic (red), 6–7.2 optimal (green), above 7.2 alkaline (blue).
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                }
            />
            <StatCard
                testId=\"moisture-card\"
                icon={Droplets}
                label=\"Soil Moisture\"
                value={moisture.toFixed(1)}
                unit=\"%\"
                trend={moisture < 30 ? 'Low — irrigation suggested' : moisture > 70 ? 'High — hold watering' : 'Within healthy band'}
                chartData={moistureHistory}
                color=\"hsl(var(--ph-alkaline))\"
                suffix=\" %\"
            />
            <StatCard
                testId=\"temperature-card\"
                icon={Thermometer}
                label=\"Temperature\"
                value={temperature.toFixed(1)}
                unit=\"°C\"
                trend={temperature > 32 ? 'Heat stress risk' : temperature < 12 ? 'Cold stress risk' : 'Comfortable range'}
                chartData={tempHistory}
                color=\"hsl(var(--chart-4))\"
                suffix=\" °C\"
            />
        </section>
    );
};
"