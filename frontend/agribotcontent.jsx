"import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
    initialCrops,
    initialReadings,
    initialIrrigation,
    initialNotifications,
    initialPumps,
    initialHealth,
    initialWeather,
} from '@/lib/agribot/mockData';

const AgriBotContext = createContext(null);

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export const AgriBotProvider = ({ children }) => {
    const [crops, setCrops] = useState(initialCrops);
    const [activeCropId, setActiveCropId] = useState(initialCrops[0].id);
    const [readings, setReadings] = useState(initialReadings);
    const [irrigation, setIrrigation] = useState(initialIrrigation);
    const [notifications, setNotifications] = useState(initialNotifications);
    const [pumps, setPumps] = useState(initialPumps);
    const [health, setHealth] = useState(initialHealth);
    const [online, setOnline] = useState(true);
    const [weather] = useState(initialWeather);

    const tickRef = useRef(0);

    // Real-time tick — updates sensors and progresses irrigation
    useEffect(() => {
        const id = setInterval(() => {
            tickRef.current += 1;
            setReadings((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((cid) => {
                    const r = next[cid];
                    const phDelta = (Math.random() - 0.5) * 0.06;
                    const moistDelta = (Math.random() - 0.5) * 0.8;
                    const tempDelta = (Math.random() - 0.5) * 0.25;
                    const newPh = +clamp(r.ph + phDelta, 4.5, 8.5).toFixed(2);
                    const newMoist = +clamp(r.moisture + moistDelta, 5, 95).toFixed(1);
                    const newTemp = +clamp(r.temperature + tempDelta, 5, 40).toFixed(1);
                    const t = Date.now();
                    next[cid] = {
                        ph: newPh,
                        moisture: newMoist,
                        temperature: newTemp,
                        phHistory: [...r.phHistory.slice(-23), { t, v: newPh }],
                        moistureHistory: [...r.moistureHistory.slice(-23), { t, v: newMoist }],
                        tempHistory: [...r.tempHistory.slice(-23), { t, v: newTemp }],
                    };
                });
                return next;
            });

            setIrrigation((prev) => {
                if (prev.status === 'Idle') return prev;
                const inc = 6 + Math.random() * 4;
                const next = clamp(prev.progress + inc, 0, 100);
                if (next >= 100) {
                    setNotifications((n) => [
                        {
                            id: `n-${Date.now()}`,
                            type: 'success',
                            title: prev.status === 'Watering' ? 'Watering complete' : 'pH correction complete',
                            body: prev.status === 'Watering'
                                ? 'Cycle finished. Soil moisture restored.'
                                : 'Soil pH within optimal band again.',
                            time: Date.now(),
                        },
                        ...n,
                    ].slice(0, 12));
                    return { status: 'Idle', pump: null, progress: 0 };
                }
                return { ...prev, progress: next };
            });
        }, 3000);
        return () => clearInterval(id);
    }, []);

    const addCrop = useCallback((crop) => {
        const id = `crop-${Date.now()}`;
        const newCrop = { id, ...crop };
        setCrops((c) => [...c, newCrop]);
        setReadings((r) => ({
            ...r,
            [id]: {
                ph: +(((crop.phMin + crop.phMax) / 2)).toFixed(2),
                moisture: 45,
                temperature: 23,
                phHistory: Array.from({ length: 24 }, (_, i) => ({
                    t: Date.now() - (23 - i) * 60_000,
                    v: +(((crop.phMin + crop.phMax) / 2) + (Math.random() - 0.5) * 0.1).toFixed(2),
                })),
                moistureHistory: Array.from({ length: 24 }, (_, i) => ({
                    t: Date.now() - (23 - i) * 60_000,
                    v: 45 + (Math.random() - 0.5) * 4,
                })),
                tempHistory: Array.from({ length: 24 }, (_, i) => ({
                    t: Date.now() - (23 - i) * 60_000,
                    v: 23 + (Math.random() - 0.5) * 2,
                })),
            },
        }));
        setActiveCropId(id);
        return newCrop;
    }, []);

    const startIrrigation = useCallback((mode = 'Watering', pump = 'water') => {
        setIrrigation({ status: mode, pump, progress: 4 });
        setPumps((p) => ({ ...p, [pump]: true }));
    }, []);

    const stopIrrigation = useCallback(() => {
        setIrrigation({ status: 'Idle', pump: null, progress: 0 });
        setPumps({ water: false, acid: false, base: false });
    }, []);

    const togglePump = useCallback((key) => {
        setPumps((p) => {
            const next = { ...p, [key]: !p[key] };
            const anyOn = next.water || next.acid || next.base;
            if (anyOn) {
                const active = next.water ? 'water' : next.acid ? 'acid' : 'base';
                const status = active === 'water' ? 'Watering' : 'Correcting pH';
                setIrrigation({ status, pump: active, progress: 8 });
            } else {
                setIrrigation({ status: 'Idle', pump: null, progress: 0 });
            }
            return next;
        });
    }, []);

    const handleNotification = useCallback((id, action) => {
        setNotifications((list) => list.filter((n) => n.id !== id));
        if (action === 'approve') {
            startIrrigation('Watering', 'water');
        }
    }, [startIrrigation]);

    const dismissAllNotifications = useCallback(() => setNotifications([]), []);

    const toggleConnectivity = useCallback(() => setOnline((v) => !v), []);

    const activeCrop = useMemo(
        () => crops.find((c) => c.id === activeCropId) || crops[0],
        [crops, activeCropId]
    );
    const activeReading = readings[activeCrop?.id];

    const value = {
        crops, activeCrop, activeCropId, setActiveCropId, addCrop,
        readings, activeReading,
        irrigation, startIrrigation, stopIrrigation,
        notifications, handleNotification, dismissAllNotifications,
        pumps, togglePump,
        health, setHealth,
        weather,
        online, toggleConnectivity,
    };

    return <AgriBotContext.Provider value={value}>{children}</AgriBotContext.Provider>;
};

export const useAgriBot = () => {
    const ctx = useContext(AgriBotContext);
    if (!ctx) throw new Error('useAgriBot must be used inside AgriBotProvider');
    return ctx;
};
"