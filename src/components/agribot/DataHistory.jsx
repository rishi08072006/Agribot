import React from 'react';
import { Clock, Droplets, FlaskRound, Beaker, Settings } from 'lucide-react';
import { useAgriBot } from '@/contexts/AgriBotContext';
import { useTranslation } from '@/hooks/useTranslation';
import { irrigationTimeline } from '@/lib/agribot/mockData';

const KIND_META = {
    water: { icon: Droplets, color: 'text-[hsl(var(--ph-alkaline))]', bg: 'bg-[hsl(var(--ph-alkaline)/0.10)]' },
    acid: { icon: FlaskRound, color: 'text-[hsl(var(--ph-acidic))]', bg: 'bg-[hsl(var(--ph-acidic)/0.10)]' },
    system: { icon: Settings, color: 'text-muted-foreground', bg: 'bg-secondary' },
};

const TIMELINE_LABEL_KEYS = {
    't1': 'wateringStarted',
    't2': 'wateringCompleteTimeline',
    't3': 'phCorrectionAcid',
    't4': 'sensorCalibration',
    't5': 'wateringScheduled',
};

export const DataHistory = () => {
    const { activeCrop } = useAgriBot();
    const t = useTranslation();

    const formatTime = (time) => {
        const diff = Date.now() - time;
        const hours = Math.floor(diff / 3600_000);
        const mins = Math.floor((diff % 3600_000) / 60_000);
        if (hours > 0) return `${hours}${t('hAgo').replace('h', 'గం').length > 2 ? '' : 'h'} ${mins}m ${t('hAgo').includes('క్రితం') ? '' : 'ago'}`.trim();
        return `${mins}${t('mAgo')}`;
    };

    const formatTimeDisplay = (time) => {
        const diff = Date.now() - time;
        const hours = Math.floor(diff / 3600_000);
        const mins = Math.floor((diff % 3600_000) / 60_000);
        if (hours > 0) return `${hours}${t('hAgo')} ${mins}${t('mAgo')}`;
        return `${mins}${t('mAgo')}`;
    };

    return (
        <div className="rounded-lg border border-border bg-card p-5" data-testid="data-history-panel">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{t('historyLabel')}</p>
                    <h3 className="mt-1 font-display text-base font-semibold">{t('irrigationTimeline')}</h3>
                </div>
                <span className="font-mono text-xs text-muted-foreground">{activeCrop.name}</span>
            </div>

            <div className="space-y-3">
                {irrigationTimeline.map((item, i) => {
                    const meta = KIND_META[item.kind] || KIND_META.system;
                    const Icon = meta.icon;
                    const isLast = i === irrigationTimeline.length - 1;
                    const labelKey = TIMELINE_LABEL_KEYS[item.id];
                    return (
                        <div key={item.id} className="flex items-start gap-3">
                            <div className="flex flex-col items-center">
                                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${meta.bg}`}>
                                    <Icon className={`h-4 w-4 ${meta.color}`} />
                                </div>
                                {!isLast && <div className="mt-1 h-full w-px bg-border" />}
                            </div>
                            <div className="flex-1 pb-3">
                                <p className="text-sm font-medium">{labelKey ? t(labelKey) : item.label}</p>
                                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{formatTimeDisplay(item.time)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
