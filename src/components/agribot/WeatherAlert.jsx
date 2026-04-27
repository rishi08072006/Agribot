import React, { useMemo } from 'react';
import { CloudRain, CloudLightning, Sun, ShieldAlert, Lightbulb, Droplets, AlertTriangle } from 'lucide-react';
import { useAgriBot } from '@/contexts/AgriBotContext';
import { useTranslation } from '@/hooks/useTranslation';
import { rainPreventiveMeasures, postRainInsights } from '@/lib/agribot/mockData';

// Generate rain drops for CSS animation
const RainDrops = ({ count = 20 }) => {
    const drops = useMemo(() =>
        Array.from({ length: count }, (_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            height: `${12 + Math.random() * 18}px`,
            delay: `${Math.random() * 2}s`,
            duration: `${0.6 + Math.random() * 0.6}s`,
        })),
    [count]);

    return (
        <div className="rain-drops">
            {drops.map((d) => (
                <div
                    key={d.id}
                    className="rain-drop"
                    style={{
                        left: d.left,
                        height: d.height,
                        animationDelay: d.delay,
                        animationDuration: d.duration,
                    }}
                />
            ))}
        </div>
    );
};

export const WeatherAlert = () => {
    const { weatherPhase, isRainLocked } = useAgriBot();
    const t = useTranslation();

    if (weatherPhase === 'normal') return null;

    const isRaining = weatherPhase === 'raining' || weatherPhase === 'storm';
    const isPostRain = weatherPhase === 'post-rain';
    const isStorm = weatherPhase === 'storm';

    return (
        <div
            className={`weather-alert-enter rounded-xl border-2 relative overflow-hidden ${
                isRaining
                    ? 'border-[hsl(210,80%,50%,0.4)] bg-gradient-to-br from-[hsl(210,60%,15%)] via-[hsl(215,55%,18%)] to-[hsl(220,50%,12%)] rain-shimmer'
                    : 'border-[hsl(145,50%,40%,0.4)] bg-gradient-to-br from-[hsl(145,30%,15%)] via-[hsl(80,25%,18%)] to-[hsl(45,30%,14%)] post-rain-glow'
            }`}
            data-testid="weather-alert-banner"
        >
            {/* Rain animation overlay */}
            {isRaining && <RainDrops count={isStorm ? 35 : 20} />}

            {/* Storm lightning flash */}
            {isStorm && (
                <div className="storm-flash absolute inset-0 bg-white rounded-xl pointer-events-none" />
            )}

            <div className="relative z-10 p-5 md:p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                            isRaining
                                ? 'bg-[hsl(210,80%,50%,0.2)] text-[hsl(210,90%,70%)]'
                                : 'bg-[hsl(45,80%,50%,0.2)] text-[hsl(45,90%,70%)]'
                        }`}>
                            {isStorm ? (
                                <CloudLightning className="h-6 w-6" />
                            ) : isRaining ? (
                                <CloudRain className="h-6 w-6" />
                            ) : (
                                <Sun className="h-6 w-6" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-display text-lg font-bold text-white">
                                {isRaining
                                    ? (isStorm ? t('stormDetected') : t('rainDetected'))
                                    : t('postRainTitle')
                                }
                            </h3>
                            <p className="text-sm text-white/60 mt-0.5">
                                {isRaining
                                    ? (isStorm ? t('stormAlertDesc') : t('rainAlertDesc'))
                                    : t('postRainDesc')
                                }
                            </p>
                        </div>
                    </div>

                    {/* Live indicator */}
                    {isRaining && (
                        <div className="flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-1 flex-shrink-0">
                            <span className="h-2 w-2 rounded-full bg-red-400 pulse-dot" />
                            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-red-300">
                                {t('live')}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content — Preventive measures or Post-rain insights */}
                <div className="mt-5">
                    <div className="flex items-center gap-2 mb-3">
                        {isRaining ? (
                            <ShieldAlert className="h-4 w-4 text-amber-400" />
                        ) : (
                            <Lightbulb className="h-4 w-4 text-emerald-400" />
                        )}
                        <h4 className="font-display text-sm font-semibold text-white/90">
                            {isRaining ? t('preventiveMeasures') : t('postRainInsights')}
                        </h4>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                        {(isRaining ? rainPreventiveMeasures : postRainInsights).map((key, i) => (
                            <div
                                key={key}
                                className={`flex items-start gap-2.5 rounded-lg border p-3 ${
                                    isRaining
                                        ? 'border-[hsl(210,60%,40%,0.3)] bg-[hsl(210,60%,20%,0.4)]'
                                        : 'border-[hsl(145,40%,30%,0.3)] bg-[hsl(145,30%,18%,0.4)]'
                                }`}
                                style={{ animationDelay: `${i * 80}ms` }}
                            >
                                <div className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                                    isRaining
                                        ? 'bg-[hsl(210,80%,50%,0.3)] text-[hsl(210,90%,75%)]'
                                        : 'bg-[hsl(145,60%,40%,0.3)] text-[hsl(145,80%,70%)]'
                                }`}>
                                    {i + 1}
                                </div>
                                <p className="text-xs text-white/75 leading-relaxed">{t(key)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom status bar */}
                <div className={`mt-4 flex items-center gap-2 rounded-lg border p-2.5 text-xs ${
                    isRaining
                        ? 'border-[hsl(210,60%,40%,0.3)] bg-[hsl(210,80%,30%,0.2)]'
                        : 'border-[hsl(145,40%,35%,0.3)] bg-[hsl(145,40%,25%,0.2)]'
                }`}>
                    {isRaining ? (
                        <>
                            <Droplets className="h-3.5 w-3.5 text-[hsl(210,90%,70%)]" />
                            <span className="text-white/60">{t('irrigationPausedRain')}</span>
                            <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-white/40">
                                {isStorm ? t('stormModeActive') : t('rainModeActive')}
                            </span>
                        </>
                    ) : (
                        <>
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-400/70" />
                            <span className="text-white/60">{t('systemsResumingSoon')}</span>
                            <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-white/40">
                                {t('postRainRecovery')}
                            </span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
