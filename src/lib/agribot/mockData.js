// Initial mocked seed data for AgriBot dashboard
const now = Date.now();

const seedSeries = (start, vol = 0.15, n = 24) => {
    const out = [];
    let v = start;
    for (let i = n - 1; i >= 0; i--) {
        v = v + (Math.random() - 0.5) * vol;
        out.push({ t: now - i * 60_000, v: +v.toFixed(2) });
    }
    return out;
};

export const initialCrops = [
    {
        id: 'crop-1',
        name: 'Wheat — North Field',
        soilType: 'Loamy',
        phMin: 6.0,
        phMax: 7.2,
        plantedOn: '2025-11-12',
        area: '2.4 ha',
    },
    {
        id: 'crop-2',
        name: 'Tomato — Greenhouse B',
        soilType: 'Black',
        phMin: 5.8,
        phMax: 6.8,
        plantedOn: '2026-01-04',
        area: '0.6 ha',
    },
];

export const initialReadings = {
    'crop-1': {
        ph: 6.4,
        moisture: 42,
        temperature: 22.5,
        phHistory: seedSeries(6.4, 0.08),
        moistureHistory: seedSeries(42, 1.2),
        tempHistory: seedSeries(22.5, 0.4),
    },
    'crop-2': {
        ph: 5.6,
        moisture: 58,
        temperature: 26.1,
        phHistory: seedSeries(5.6, 0.1),
        moistureHistory: seedSeries(58, 1.5),
        tempHistory: seedSeries(26.1, 0.5),
    },
};

export const initialIrrigation = {
    status: 'Idle', // Idle | Watering | Correcting pH
    pump: null, // 'water' | 'acid' | 'base'
    progress: 0,
};

export const initialNotifications = [
    {
        id: 'n-1',
        type: 'info',
        titleKey: 'irrigationAboutToStart',
        bodyKey: 'irrigationScheduled',
        title: 'Irrigation about to start',
        body: 'Scheduled watering for North Field in 5 minutes.',
        time: now - 4 * 60_000,
    },
    {
        id: 'n-2',
        type: 'warning',
        titleKey: 'phImbalance',
        bodyKey: 'phImbalanceDesc',
        title: 'pH imbalance detected',
        body: 'Greenhouse B reading 5.6 (below 5.8). Acid pump on standby.',
        time: now - 12 * 60_000,
    },
    {
        id: 'n-3',
        type: 'success',
        titleKey: 'sensorCalibrationComplete',
        bodyKey: 'sensorCalibrationDesc',
        title: 'Sensor calibration complete',
        body: 'All soil sensors recalibrated successfully.',
        time: now - 60 * 60_000,
    },
];

export const initialPumps = {
    water: false,
    acid: false,
    base: false,
};

export const initialHealth = {
    sensors: { status: 'ok', count: 6, online: 6 },
    pumps: { status: 'ok', online: 3, total: 3 },
    solutions: { water: 'OK', acid: 'OK', base: 'Low' },
};

export const initialWeather = {
    location: 'Pune, MH',
    temp: 24,
    condition: 'Partly Cloudy',
    humidity: 64,
    wind: 11,
    rainChance: 35,
    forecast: [
        { day: 'Tue', t: 25, icon: 'sun' },
        { day: 'Wed', t: 23, icon: 'cloud' },
        { day: 'Thu', t: 21, icon: 'rain' },
        { day: 'Fri', t: 22, icon: 'cloud' },
        { day: 'Sat', t: 26, icon: 'sun' },
    ],
};

export const irrigationTimeline = [
    { id: 't1', time: now - 6 * 3600_000, label: 'Watering started', kind: 'water' },
    { id: 't2', time: now - 5.6 * 3600_000, label: 'Watering complete (12 L)', kind: 'water' },
    { id: 't3', time: now - 4 * 3600_000, label: 'pH correction (acid)', kind: 'acid' },
    { id: 't4', time: now - 2 * 3600_000, label: 'Sensor calibration', kind: 'system' },
    { id: 't5', time: now - 30 * 60_000, label: 'Watering scheduled', kind: 'water' },
];

export const phLabel = (ph) => {
    if (ph < 6) return { label: 'Acidic', tone: 'acidic' };
    if (ph > 7.2) return { label: 'Alkaline', tone: 'alkaline' };
    return { label: 'Optimal', tone: 'optimal' };
};

export const phToneClasses = {
    acidic: 'text-[hsl(var(--ph-acidic))]',
    optimal: 'text-[hsl(var(--ph-optimal))]',
    alkaline: 'text-[hsl(var(--ph-alkaline))]',
};

export const phToneBg = {
    acidic: 'bg-[hsl(var(--ph-acidic)/0.12)] border-[hsl(var(--ph-acidic)/0.4)]',
    optimal: 'bg-[hsl(var(--ph-optimal)/0.12)] border-[hsl(var(--ph-optimal)/0.4)]',
    alkaline: 'bg-[hsl(var(--ph-alkaline)/0.12)] border-[hsl(var(--ph-alkaline)/0.4)]',
};

