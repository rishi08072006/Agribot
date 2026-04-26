import React from 'react';
import { Droplets, FlaskRound, Beaker, Power, Pause, CheckCircle2, X, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useAgriBot } from '@/contexts/AgriBotContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const PUMP_META = {
    water: { icon: Droplets, labelKey: 'waterPumpLabel', color: 'hsl(var(--ph-alkaline))' },
    acid: { icon: FlaskRound, labelKey: 'acidPumpLabel', color: 'hsl(var(--ph-acidic))' },
    base: { icon: Beaker, labelKey: 'basePumpLabel', color: 'hsl(var(--ph-optimal))' },
};

export const IrrigationStatus = () => {
    const { irrigation, startIrrigation, stopIrrigation, activeCrop, activeReading, irrigationStartReadings, lastCycleResult, dismissCycleResult } = useAgriBot();
    const t = useTranslation();

    const statusLabel = irrigation.status === 'Idle' ? t('idle') : irrigation.status === 'Watering' ? t('watering') : t('correctingPH');
    const pump = irrigation.pump ? PUMP_META[irrigation.pump] : null;
    const isActive = irrigation.status !== 'Idle';

    const statusCls = irrigation.status === 'Idle'
        ? 'bg-muted text-muted-foreground border-border'
        : irrigation.status === 'Watering'
        ? 'bg-[hsl(var(--ph-alkaline)/0.12)] text-[hsl(var(--ph-alkaline))] border-[hsl(var(--ph-alkaline)/0.4)]'
        : 'bg-[hsl(var(--ph-acidic)/0.12)] text-[hsl(var(--ph-acidic))] border-[hsl(var(--ph-acidic)/0.4)]';

    // Check if ideal values are reached (for display purposes)
    let idealReached = false;
    if (isActive && activeReading && activeCrop) {
        if (irrigation.status === 'Watering' && activeReading.moisture >= 60) {
            idealReached = true;
        } else if (irrigation.status === 'Correcting pH' && activeReading.ph >= activeCrop.phMin && activeReading.ph <= activeCrop.phMax) {
            idealReached = true;
        }
    }

    // Determine active status message
    const getActiveMessage = () => {
        if (irrigation.pump === 'water') return t('wateringActive');
        if (irrigation.pump === 'acid') return t('acidActive');
        if (irrigation.pump === 'base') return t('baseActive');
        return '';
    };

    return (
        <div
            className="rounded-lg border border-border bg-card p-5"
            data-testid="irrigation-status-panel"
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {t('irrigationStatus')}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold">{t('systemControl')}</h3>
                </div>
                <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${statusCls}`}
                    data-testid="irrigation-status-pill"
                >
                    <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-current pulse-dot' : 'bg-current opacity-50'}`} />
                    {statusLabel}
                </span>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
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
                                <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-display text-xs font-medium">{t(meta.labelKey)}</span>
                        </div>
                    );
                })}
            </div>

            <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                        {pump ? `${t(pump.labelKey)} ${t('pumpActive')}` : t('noPumpActive')}
                    </span>
                    <span className="font-mono text-muted-foreground">
                        {Math.round(irrigation.progress)}%
                    </span>
                </div>
                <div className="relative">
                    <Progress value={irrigation.progress} className="h-2" data-testid="irrigation-progress" />
                    {isActive && (
                        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
                            <div className="flow-bar h-full w-1/2" />
                        </div>
                    )}
                </div>
            </div>

            {/* ===== LIVE IRRIGATION RESULTS ===== */}
            {isActive && irrigationStartReadings && activeReading && (
                <div className="mt-5 rounded-md border border-border bg-secondary/30 p-4" data-testid="irrigation-live-results">
                    <div className="flex items-center gap-2 mb-3">
                        <Activity className="h-4 w-4 text-primary" />
                        <p className="font-display text-sm font-semibold">{t('irrigationResults')} — {t('currentCycle')}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="rounded-md border border-border bg-background/60 p-2.5">
                            <p className="text-muted-foreground mb-1">{t('pumpType')}</p>
                            <p className="font-semibold font-mono">{pump ? t(pump.labelKey) : '—'}</p>
                        </div>
                        <div className="rounded-md border border-border bg-background/60 p-2.5">
                            <p className="text-muted-foreground mb-1">{t('cycleProgress')}</p>
                            <p className="font-semibold font-mono">{Math.round(irrigation.progress)}%</p>
                        </div>

                        {(irrigation.pump === 'acid' || irrigation.pump === 'base') && (
                            <>
                                <div className="rounded-md border border-border bg-background/60 p-2.5">
                                    <p className="text-muted-foreground mb-1">{t('phBefore')}</p>
                                    <p className="font-semibold font-mono">{irrigationStartReadings.ph?.toFixed(2)}</p>
                                </div>
                                <div className="rounded-md border border-border bg-background/60 p-2.5">
                                    <div className="flex items-center gap-1 mb-1">
                                        <p className="text-muted-foreground">{t('phCurrent')}</p>
                                        {activeReading.ph < irrigationStartReadings.ph
                                            ? <TrendingDown className="h-3 w-3 text-[hsl(var(--ph-acidic))]" />
                                            : <TrendingUp className="h-3 w-3 text-[hsl(var(--ph-optimal))]" />
                                        }
                                    </div>
                                    <p className="font-semibold font-mono">{activeReading.ph.toFixed(2)}</p>
                                </div>
                            </>
                        )}

                        {irrigation.pump === 'water' && (
                            <>
                                <div className="rounded-md border border-border bg-background/60 p-2.5">
                                    <p className="text-muted-foreground mb-1">{t('moistureBefore')}</p>
                                    <p className="font-semibold font-mono">{irrigationStartReadings.moisture?.toFixed(1)}%</p>
                                </div>
                                <div className="rounded-md border border-border bg-background/60 p-2.5">
                                    <div className="flex items-center gap-1 mb-1">
                                        <p className="text-muted-foreground">{t('moistureCurrent')}</p>
                                        <TrendingUp className="h-3 w-3 text-[hsl(var(--ph-alkaline))]" />
                                    </div>
                                    <p className="font-semibold font-mono">{activeReading.moisture.toFixed(1)}%</p>
                                </div>
                            </>
                        )}
                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">{getActiveMessage()}</p>

                    {idealReached && (
                        <div className="mt-2 flex items-center gap-2 rounded-md border border-[hsl(var(--ph-optimal)/0.4)] bg-[hsl(var(--ph-optimal)/0.10)] p-2.5 text-xs text-[hsl(var(--ph-optimal))]">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium">{t('idealReached')}</span>
                        </div>
                    )}
                </div>
            )}

            {/* ===== COMPLETED CYCLE RESULT ===== */}
            {lastCycleResult && !isActive && (
                <div className="mt-5 rounded-md border border-[hsl(var(--ph-optimal)/0.4)] bg-[hsl(var(--ph-optimal)/0.08)] p-4" data-testid="irrigation-cycle-result">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-[hsl(var(--ph-optimal))]" />
                            <p className="font-display text-sm font-semibold text-[hsl(var(--ph-optimal))]">{t('cycleComplete')}</p>
                        </div>
                        <button
                            type="button"
                            onClick={dismissCycleResult}
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Dismiss"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                        {lastCycleResult.pump === 'water' ? (
                            <>
                                <div className="rounded-md border border-border bg-background/60 p-2.5">
                                    <p className="text-muted-foreground mb-1">{t('moistureBefore')}</p>
                                    <p className="font-semibold font-mono">{lastCycleResult.moisture?.toFixed(1)}%</p>
                                </div>
                                <div className="rounded-md border border-border bg-background/60 p-2.5">
                                    <p className="text-muted-foreground mb-1">{t('moistureCurrent')}</p>
                                    <p className="font-semibold font-mono">{lastCycleResult.endMoisture?.toFixed(1)}%</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="rounded-md border border-border bg-background/60 p-2.5">
                                    <p className="text-muted-foreground mb-1">{t('phBefore')}</p>
                                    <p className="font-semibold font-mono">{lastCycleResult.ph?.toFixed(2)}</p>
                                </div>
                                <div className="rounded-md border border-border bg-background/60 p-2.5">
                                    <p className="text-muted-foreground mb-1">{t('phCurrent')}</p>
                                    <p className="font-semibold font-mono">{lastCycleResult.endPh?.toFixed(2)}</p>
                                </div>
                            </>
                        )}
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                        {lastCycleResult.pump === 'water' ? t('wateringCompleteMsg') : t('phCorrectionCompleteMsg')}
                    </p>
                </div>
            )}

            <div className="mt-5 flex items-center gap-2">
                {isActive ? (
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={stopIrrigation}
                        data-testid="irrigation-stop"
                    >
                        <Pause className="mr-1.5 h-4 w-4" /> {t('stopCycle')}
                    </Button>
                ) : (
                    <>
                        <Button
                            className="flex-1"
                            onClick={() => startIrrigation('Watering', 'water')}
                            data-testid="irrigation-start-water"
                        >
                            <Power className="mr-1.5 h-4 w-4" /> {t('startWatering')}
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => startIrrigation('Correcting pH', 'acid')}
                            data-testid="irrigation-start-correction"
                        >
                            {t('startPHCorrection')}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
};
