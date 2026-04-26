import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/components/agribot/ThemeProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AgriBotProvider } from '@/contexts/AgriBotContext';
import { Toaster } from '@/components/ui/sonner';
import Dashboard from '@/pages/Dashboard';

function App() {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AgriBotProvider>
                    <div className="App">
                        <BrowserRouter>
                            <Routes>
                                <Route path="/" element={<Dashboard />} />
                                <Route path="*" element={<Dashboard />} />
                            </Routes>
                        </BrowserRouter>
                        <Toaster position="bottom-right" richColors />
                    </div>
                </AgriBotProvider>
            </LanguageProvider>
        </ThemeProvider>
    );
}

export default App;

