import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
    const [irrigationStartReadings, setIrrigationStartReadings] = useState(null);
    const [lastCycleResult, setLastCycleResult] = useState(null);
    const [notifications, setNotifications] = useState(
        initialNotifications.map((n) =>
            n.type !== 'success'
                ? {
                      ...n,
                      autoApproveAt:
                          Date.now() +
                          (25 + Math.floor(Math.random() * 10)) * 60 * 1000 +
                          Math.floor(Math.random() * 60) * 1000,
                  }
                : n
        )
    );
    const [pumps, setPumps] = useState(initialPumps);
    const [health, setHealth] = useState(initialHealth);
    const [online, setOnline] = useState(true);
    const [weather, setWeather] = useState(initialWeather);

    // ===== WEATHER PHASE STATE MACHINE =====
    // Phases: 'normal' | 'raining' | 'storm' | 'post-rain'
    const [weatherPhase, setWeatherPhase] = useState('normal');
    const weatherTimerRef = useRef(null);
    const phaseTransitionRef = useRef(null);

    const isRainLocked = weatherPhase === 'raining' || weatherPhase === 'storm';

    const tickRef = useRef(0);

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

    // Force-stop all irrigation and pumps (used when rain starts)
    const forceStopAll = useCallback(() => {
        setIrrigation((prev) => {
            if (prev.status !== 'Idle') {
                setReadings((currentReadings) => {
                    const reading = currentReadings[activeCropId];
                    if (reading && irrigationStartReadings) {
                        setLastCycleResult({
                            ...irrigationStartReadings,
                            endPh: reading.ph,
                            endMoisture: reading.moisture,
                            endTime: Date.now(),
                            stoppedManually: false,
                            stoppedByRain: true,
                        });
                    }
                    return currentReadings;
                });
            }
            return { status: 'Idle', pump: null, progress: 0 };
        });
        setPumps({ water: false, acid: false, base: false });
        setIrrigationStartReadings(null);
    }, [activeCropId, irrigationStartReadings]);

    const startIrrigation = useCallback((mode = 'Watering', pump = 'water') => {
        // Block irrigation during rain/storm
        if (isRainLocked) return;

        setIrrigation({ status: mode, pump, progress: 4 });
        setPumps((p) => ({ ...p, [pump]: true }));
        setReadings((r) => {
            const activeCropReading = r[activeCropId];
            if (activeCropReading) {
                setIrrigationStartReadings({
                    ph: activeCropReading.ph,
                    moisture: activeCropReading.moisture,
                    temperature: activeCropReading.temperature,
                    startTime: Date.now(),
                    mode,
                    pump,
                });
            }
            return r;
        });
        setLastCycleResult(null);
    }, [activeCropId, isRainLocked]);

    const stopIrrigation = useCallback(() => {
        setReadings((r) => {
            const activeCropReading = r[activeCropId];
            if (activeCropReading && irrigationStartReadings) {
                setLastCycleResult({
                    ...irrigationStartReadings,
                    endPh: activeCropReading.ph,
                    endMoisture: activeCropReading.moisture,
                    endTime: Date.now(),
                    stoppedManually: true,
                });
            }
            return r;
        });
        setIrrigation({ status: 'Idle', pump: null, progress: 0 });
        setPumps({ water: false, acid: false, base: false });
        setIrrigationStartReadings(null);
    }, [activeCropId, irrigationStartReadings]);

    const dismissCycleResult = useCallback(() => {
        setLastCycleResult(null);
    }, []);

    const togglePump = useCallback((key) => {
        // Block pump toggle during rain/storm
        if (isRainLocked) return;

        setPumps((p) => {
            const next = { ...p, [key]: !p[key] };
            const anyOn = next.water || next.acid || next.base;
            if (anyOn) {
                const active = next.water ? 'water' : next.acid ? 'acid' : 'base';
                const status = active === 'water' ? 'Watering' : 'Correcting pH';
                setIrrigation({ status, pump: active, progress: 8 });
                setReadings((r) => {
                    const activeCropReading = r[activeCropId];
                    if (activeCropReading) {
                        setIrrigationStartReadings({
                            ph: activeCropReading.ph,
                            moisture: activeCropReading.moisture,
                            temperature: activeCropReading.temperature,
                            startTime: Date.now(),
                            mode: status,
                            pump: active,
                        });
                    }
                    return r;
                });
                setLastCycleResult(null);
            } else {
                setIrrigation({ status: 'Idle', pump: null, progress: 0 });
                setIrrigationStartReadings(null);
            }
            return next;
        });
    }, [activeCropId, isRainLocked]);

    const handleNotification = useCallback((id, action) => {
        setNotifications((list) => list.filter((n) => n.id !== id));
        if (action === 'approve') {
            startIrrigation('Watering', 'water');
        }
    }, [startIrrigation]);

    const dismissAllNotifications = useCallback(() => setNotifications([]), []);

    const toggleConnectivity = useCallback(() => setOnline((v) => !v), []);

    // ===== WEATHER PHASE CYCLING =====
    // Simulates: normal → rain → post-rain → normal (repeating)
    useEffect(() => {
        const timers = [];
        const schedule = (fn, delay) => {
            const id = setTimeout(fn, delay);
            timers.push(id);
            return id;
        };

        // Start the cycle: after 45s, trigger rain
        schedule(() => {
            setWeatherPhase('raining');
            schedule(() => setWeatherPhase('post-rain'), 40_000);
            schedule(() => {
                setWeatherPhase('normal');
                // Second cycle
                schedule(() => {
                    setWeatherPhase('raining');
                    schedule(() => setWeatherPhase('post-rain'), 40_000);
                    schedule(() => setWeatherPhase('normal'), 90_000);
                }, 60_000);
            }, 90_000);
        }, 45_000);

        return () => timers.forEach((id) => clearTimeout(id));
    }, []);

    // React to weather phase changes
    useEffect(() => {
        if (weatherPhase === 'raining' || weatherPhase === 'storm') {
            forceStopAll();

            setWeather((w) => ({
                ...w,
                condition: weatherPhase === 'storm' ? 'Storm' : 'Raining',
                rainChance: 95,
                temp: w.temp - 3,
                humidity: Math.min(95, w.humidity + 20),
                wind: weatherPhase === 'storm' ? 35 : w.wind + 5,
            }));

            setNotifications((n) => {
                const exists = n.some((notif) => notif.titleKey === 'rainDetected' || notif.titleKey === 'stormDetected');
                if (!exists) {
                    return [
                        {
                            id: `n-rain-${Date.now()}`,
                            type: 'warning',
                            titleKey: weatherPhase === 'storm' ? 'stormDetected' : 'rainDetected',
                            bodyKey: weatherPhase === 'storm' ? 'stormAlertDesc' : 'rainAlertDesc',
                            title: weatherPhase === 'storm' ? 'Storm Detected' : 'Rain Detected',
                            body: weatherPhase === 'storm'
                                ? 'A storm has been detected. All systems paused.'
                                : 'Rainfall detected. Irrigation stopped automatically.',
                            time: Date.now(),
                        },
                        ...n,
                    ].slice(0, 12);
                }
                return n;
            });
        } else if (weatherPhase === 'post-rain') {
            setWeather((w) => ({
                ...w,
                condition: 'After Rain',
                rainChance: 15,
                temp: w.temp + 2,
                humidity: Math.max(50, w.humidity - 10),
                wind: Math.max(5, w.wind - 8),
            }));

            setReadings((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((cid) => {
                    const r = next[cid];
                    const newMoist = +clamp(r.moisture + 15 + Math.random() * 10, 5, 95).toFixed(1);
                    next[cid] = { ...r, moisture: newMoist };
                });
                return next;
            });

            setNotifications((n) => {
                const exists = n.some((notif) => notif.titleKey === 'postRainTitle');
                if (!exists) {
                    return [
                        {
                            id: `n-postrain-${Date.now()}`,
                            type: 'info',
                            titleKey: 'postRainTitle',
                            bodyKey: 'postRainDesc',
                            title: 'Rain Ended — Recovery Insights',
                            body: 'The rain has stopped. Check fields for waterlogging.',
                            time: Date.now(),
                        },
                        ...n.filter((notif) => notif.titleKey !== 'rainDetected' && notif.titleKey !== 'stormDetected'),
                    ].slice(0, 12);
                }
                return n;
            });
        } else if (weatherPhase === 'normal') {
            setWeather((w) => ({
                ...w,
                condition: 'Partly Cloudy',
                rainChance: 35,
                temp: initialWeather.temp,
                humidity: initialWeather.humidity,
                wind: initialWeather.wind,
            }));

            setNotifications((n) =>
                n.filter((notif) =>
                    notif.titleKey !== 'rainDetected' &&
                    notif.titleKey !== 'stormDetected' &&
                    notif.titleKey !== 'postRainTitle'
                )
            );
        }
    }, [weatherPhase, forceStopAll]);

    // Real-time tick
    useEffect(() => {
        const id = setInterval(() => {
            tickRef.current += 1;

            setReadings((prev) => {
                const next = { ...prev };
                Object.keys(next).forEach((cid) => {
                    const r = next[cid];
                    let phDelta = (Math.random() - 0.5) * 0.06;
                    let moistDelta = (Math.random() - 0.5) * 0.8;
                    const tempDelta = (Math.random() - 0.5) * 0.25;

                    if (cid === activeCropId) {
                        setIrrigation((irr) => {
                            if (irr.status === 'Watering' && irr.pump === 'water') {
                                moistDelta += 1.5 + Math.random() * 1.0;
                            } else if (irr.status === 'Correcting pH' && irr.pump === 'acid') {
                                phDelta -= 0.08 + Math.random() * 0.04;
                            } else if (irr.status === 'Correcting pH' && irr.pump === 'base') {
                                phDelta += 0.08 + Math.random() * 0.04;
                            }
                            return irr;
                        });
                    }

                    // During rain, moisture increases naturally
                    if (weatherPhase === 'raining' || weatherPhase === 'storm') {
                        moistDelta += 0.8 + Math.random() * 0.5;
                    }

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

            // Skip all irrigation logic during rain lock
            if (isRainLocked) return;

            // Check if ideal values are reached — auto-stop irrigation
            setIrrigation((prev) => {
                if (prev.status === 'Idle') return prev;

                setReadings((currentReadings) => {
                    const reading = currentReadings[activeCropId];
                    if (!reading) return currentReadings;

                    setCrops((currentCrops) => {
                        const crop = currentCrops.find((c) => c.id === activeCropId);
                        if (!crop) return currentCrops;

                        let shouldStop = false;

                        if (prev.status === 'Watering' && prev.pump === 'water') {
                            if (reading.moisture >= 60) shouldStop = true;
                        } else if (prev.status === 'Correcting pH') {
                            if (reading.ph >= crop.phMin && reading.ph <= crop.phMax) shouldStop = true;
                        }

                        if (shouldStop) {
                            setLastCycleResult({
                                ...irrigationStartReadings,
                                endPh: reading.ph,
                                endMoisture: reading.moisture,
                                endTime: Date.now(),
                                stoppedManually: false,
                                idealReached: true,
                                mode: prev.status,
                                pump: prev.pump,
                            });

                            setNotifications((n) => [
                                {
                                    id: `n-${Date.now()}`,
                                    type: 'success',
                                    titleKey: prev.status === 'Watering' ? 'wateringComplete' : 'phCorrectionComplete',
                                    bodyKey: prev.status === 'Watering' ? 'wateringCompleteDesc' : 'phCorrectionCompleteDesc',
                                    title: prev.status === 'Watering' ? 'Watering complete' : 'pH correction complete',
                                    body: prev.status === 'Watering'
                                        ? 'Cycle finished. Soil moisture restored.'
                                        : 'Soil pH within optimal band again.',
                                    time: Date.now(),
                                },
                                ...n,
                            ].slice(0, 12));

                            setIrrigation({ status: 'Idle', pump: null, progress: 0 });
                            setPumps({ water: false, acid: false, base: false });
                            setIrrigationStartReadings(null);
                        }
                        return currentCrops;
                    });
                    return currentReadings;
                });

                return prev;
            });

            // Progress irrigation if active
            setIrrigation((prev) => {
                if (prev.status === 'Idle') return prev;
                const inc = 2 + Math.random() * 2;
                const next = clamp(prev.progress + inc, 0, 100);
                if (next >= 100) {
                    setReadings((currentReadings) => {
                        const reading = currentReadings[activeCropId];
                        if (reading) {
                            setLastCycleResult({
                                ...irrigationStartReadings,
                                endPh: reading.ph,
                                endMoisture: reading.moisture,
                                endTime: Date.now(),
                                stoppedManually: false,
                                idealReached: false,
                                mode: prev.status,
                                pump: prev.pump,
                            });
                        }
                        return currentReadings;
                    });

                    setNotifications((n) => [
                        {
                            id: `n-${Date.now()}`,
                            type: 'success',
                            titleKey: prev.status === 'Watering' ? 'wateringComplete' : 'phCorrectionComplete',
                            bodyKey: prev.status === 'Watering' ? 'wateringCompleteDesc' : 'phCorrectionCompleteDesc',
                            title: prev.status === 'Watering' ? 'Watering complete' : 'pH correction complete',
                            body: prev.status === 'Watering'
                                ? 'Cycle finished. Soil moisture restored.'
                                : 'Soil pH within optimal band again.',
                            time: Date.now(),
                        },
                        ...n,
                    ].slice(0, 12));
                    setIrrigationStartReadings(null);
                    setPumps({ water: false, acid: false, base: false });
                    return { status: 'Idle', pump: null, progress: 0 };
                }
                return { ...prev, progress: next };
            });

            // Auto-approve notifications whose timer expired
            setNotifications((prev) => {
                const now = Date.now();
                let changed = false;
                const next = prev.filter((n) => {
                    if (n.type === 'success' || !n.autoApproveAt) return true;
                    if (now >= n.autoApproveAt) {
                        changed = true;
                        if (typeof startIrrigation === 'function') startIrrigation('Watering', 'water');
                        return false;
                    }
                    return true;
                });
                return changed ? next : prev;
            });

            // Auto pH correction
            setCrops((prevCrops) => {
                setReadings((prevReadings) => {
                    setIrrigation((prevIrrigation) => {
                        if (prevIrrigation.status !== 'Idle') return prevIrrigation;

                        const activeCrop = prevCrops.find((c) => c.id === activeCropId);
                        if (!activeCrop || !prevReadings[activeCropId]) return prevIrrigation;

                        const phReading = prevReadings[activeCropId].ph;
                        const moistureReading = prevReadings[activeCropId].moisture;
                        const { phMin, phMax } = activeCrop;

                        if (phReading > phMax) {
                            setIrrigationStartReadings({
                                ph: phReading, moisture: moistureReading,
                                temperature: prevReadings[activeCropId].temperature,
                                startTime: Date.now(), mode: 'Correcting pH', pump: 'acid',
                            });
                            setLastCycleResult(null);
                            setNotifications((n) => {
                                const exists = n.some((notif) => notif.body && notif.body.includes('pH is high'));
                                if (!exists) {
                                    return [{ id: `n-${Date.now()}`, type: 'warning', titleKey: 'highPhDetected',
                                        title: 'High pH detected', body: `pH is ${phReading} (above ${phMax}). Starting acid correction.`,
                                        time: Date.now(), autoApproveAt: Date.now() + 30 * 60 * 1000 }, ...n].slice(0, 12);
                                }
                                return n;
                            });
                            setPumps((p) => ({ ...p, acid: true }));
                            return { status: 'Correcting pH', pump: 'acid', progress: 4 };
                        }

                        if (phReading < phMin) {
                            setIrrigationStartReadings({
                                ph: phReading, moisture: moistureReading,
                                temperature: prevReadings[activeCropId].temperature,
                                startTime: Date.now(), mode: 'Correcting pH', pump: 'base',
                            });
                            setLastCycleResult(null);
                            setNotifications((n) => {
                                const exists = n.some((notif) => notif.body && notif.body.includes('pH is low'));
                                if (!exists) {
                                    return [{ id: `n-${Date.now()}`, type: 'warning', titleKey: 'lowPhDetected',
                                        title: 'Low pH detected', body: `pH is ${phReading} (below ${phMin}). Starting base correction.`,
                                        time: Date.now(), autoApproveAt: Date.now() + 30 * 60 * 1000 }, ...n].slice(0, 12);
                                }
                                return n;
                            });
                            setPumps((p) => ({ ...p, base: true }));
                            return { status: 'Correcting pH', pump: 'base', progress: 4 };
                        }

                        if (moistureReading < 30) {
                            setIrrigationStartReadings({
                                ph: phReading, moisture: moistureReading,
                                temperature: prevReadings[activeCropId].temperature,
                                startTime: Date.now(), mode: 'Watering', pump: 'water',
                            });
                            setLastCycleResult(null);
                            setNotifications((n) => {
                                const exists = n.some((notif) => notif.body && notif.body.includes('moisture low'));
                                if (!exists) {
                                    return [{ id: `n-${Date.now()}`, type: 'warning', titleKey: 'irrigationAboutToStart',
                                        title: 'Low moisture detected', body: `Soil moisture is ${moistureReading}% — starting water pump.`,
                                        time: Date.now(), autoApproveAt: Date.now() + 30 * 60 * 1000 }, ...n].slice(0, 12);
                                }
                                return n;
                            });
                            setPumps((p) => ({ ...p, water: true }));
                            return { status: 'Watering', pump: 'water', progress: 4 };
                        }

                        return prevIrrigation;
                    });
                    return prevReadings;
                });
                return prevCrops;
            });
        }, 1000);
        return () => clearInterval(id);
    }, [startIrrigation, activeCropId, irrigationStartReadings, isRainLocked, weatherPhase]);

    const activeCrop = useMemo(
        () => crops.find((c) => c.id === activeCropId) || crops[0],
        [crops, activeCropId]
    );
    const activeReading = readings[activeCrop?.id];

    const value = {
        crops, activeCrop, activeCropId, setActiveCropId, addCrop,
        readings, activeReading,
        irrigation, startIrrigation, stopIrrigation,
        irrigationStartReadings, lastCycleResult, dismissCycleResult,
        notifications, handleNotification, dismissAllNotifications,
        pumps, togglePump,
        health, setHealth,
        weather, weatherPhase, isRainLocked,
        online, toggleConnectivity,
    };

    return <AgriBotContext.Provider value={value}>{children}</AgriBotContext.Provider>;
};

export const useAgriBot = () => {
    const ctx = useContext(AgriBotContext);
    if (!ctx) throw new Error('useAgriBot must be used inside AgriBotProvider');
    return ctx;
};
