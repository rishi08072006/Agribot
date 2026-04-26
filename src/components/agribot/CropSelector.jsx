import React, { useState } from 'react';
import { Plus, Sprout, Leaf, MapPin, Calendar } from 'lucide-react';
import { useAgriBot } from '@/contexts/AgriBotContext';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const SOIL_TYPES = ['Red', 'Black', 'Sandy', 'Loamy'];
const SOIL_TYPE_KEYS = { Red: 'soilRed', Black: 'soilBlack', Sandy: 'soilSandy', Loamy: 'soilLoamy' };

const cropIconBg = (soilType) => {
    switch (soilType) {
        case 'Black': return 'bg-[#3c3a35] text-white';
        case 'Red': return 'bg-[#a14b3c] text-white';
        case 'Sandy': return 'bg-[#d8b97e] text-[#3c2c10]';
        default: return 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))]';
    }
};

export const CropSelector = () => {
    const { crops, activeCropId, setActiveCropId, addCrop } = useAgriBot();
    const t = useTranslation();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', soilType: 'Loamy', phMin: 6.0, phMax: 7.2, area: '1.0 ha' });

    const submit = (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            toast.error(t('enterCropName'));
            return;
        }
        const phMin = +form.phMin;
        const phMax = +form.phMax;
        if (Number.isNaN(phMin) || Number.isNaN(phMax) || phMin >= phMax) {
            toast.error(t('invalidPhRange'));
            return;
        }
        const created = addCrop({
            name: form.name.trim(),
            soilType: form.soilType,
            phMin,
            phMax,
            area: form.area || '—',
            plantedOn: new Date().toISOString().slice(0, 10),
        });
        toast.success(`${t('cropCreated')}: "${created.name}"`);
        setOpen(false);
        setForm({ name: '', soilType: 'Loamy', phMin: 6.0, phMax: 7.2, area: '1.0 ha' });
    };

    return (
        <section className="rise" data-testid="crop-selector-section">
            <div className="mb-3 flex items-end justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                        {t('cropSelection')}
                    </p>
                    <h2 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                        {t('chooseField')}
                    </h2>
                </div>
                <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
                    {crops.length} {t('active')}
                </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {crops.map((c, i) => {
                    const active = c.id === activeCropId;
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setActiveCropId(c.id)}
                            data-testid={`crop-selector-${i + 1}`}
                            className={`group relative overflow-hidden rounded-lg border p-4 text-left transition-all ${
                                active
                                    ? 'border-primary bg-[hsl(var(--primary)/0.06)] shadow-sm'
                                    : 'border-border bg-card hover:-translate-y-[1px] hover:border-foreground/20'
                            }`}
                        >
                            <div className="flex items-start gap-3">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-md ${cropIconBg(c.soilType)}`}>
                                    <Leaf className="h-5 w-5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="truncate font-display text-sm font-semibold">{c.name}</p>
                                    </div>
                                    <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                                        {c.soilType} {t('soilSuffix')} · pH {c.phMin}–{c.phMax}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{c.area}</span>
                                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{c.plantedOn}</span>
                            </div>
                            {active && (
                                <span
                                    className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-primary-foreground"
                                    data-testid={`crop-active-badge-${i + 1}`}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground pulse-dot" />
                                    {t('live')}
                                </span>
                            )}
                        </button>
                    );
                })}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button
                            type="button"
                            data-testid="create-crop-button"
                            className="group flex min-h-[112px] items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-4 text-muted-foreground transition-all hover:-translate-y-[1px] hover:border-primary hover:bg-[hsl(var(--primary)/0.04)] hover:text-primary"
                        >
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-current">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <span className="font-display text-sm font-medium">{t('createNewCrop')}</span>
                            </div>
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md" data-testid="create-crop-dialog">
                        <DialogHeader>
                            <DialogTitle className="font-display text-xl">{t('addNewCrop')}</DialogTitle>
                            <DialogDescription>
                                {t('addNewCropDesc')}
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submit} className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="crop-name">{t('cropName')}</Label>
                                <Input
                                    id="crop-name"
                                    placeholder={t('cropNamePlaceholder')}
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    data-testid="create-crop-name-input"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label>{t('soilTypeLabel')}</Label>
                                <Select
                                    value={form.soilType}
                                    onValueChange={(v) => setForm({ ...form, soilType: v })}
                                >
                                    <SelectTrigger data-testid="create-crop-soil-trigger">
                                        <SelectValue placeholder={t('selectSoilType')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SOIL_TYPES.map((s) => (
                                            <SelectItem key={s} value={s} data-testid={`soil-option-${s.toLowerCase()}`}>
                                                {t(SOIL_TYPE_KEYS[s])}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="ph-min">{t('minPh')}</Label>
                                    <Input
                                        id="ph-min"
                                        type="number"
                                        step="0.1"
                                        value={form.phMin}
                                        onChange={(e) => setForm({ ...form, phMin: e.target.value })}
                                        data-testid="create-crop-ph-min"
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="ph-max">{t('maxPh')}</Label>
                                    <Input
                                        id="ph-max"
                                        type="number"
                                        step="0.1"
                                        value={form.phMax}
                                        onChange={(e) => setForm({ ...form, phMax: e.target.value })}
                                        data-testid="create-crop-ph-max"
                                    />
                                </div>
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="area">{t('area')}</Label>
                                <Input
                                    id="area"
                                    placeholder="e.g. 1.5 ha"
                                    value={form.area}
                                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                                    data-testid="create-crop-area"
                                />
                            </div>

                            <DialogFooter className="mt-2">
                                <Button type="button" variant="ghost" onClick={() => setOpen(false)} data-testid="create-crop-cancel">
                                    {t('cancel')}
                                </Button>
                                <Button type="submit" data-testid="create-crop-save">
                                    <Sprout className="mr-1.5 h-4 w-4" />
                                    {t('saveCrop')}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </section>
    );
};
