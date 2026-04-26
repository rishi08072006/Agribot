import { useLanguage } from '@/contexts/LanguageContext';
import { getTranslation } from '@/lib/translations';

export const useTranslation = () => {
    const { language } = useLanguage();
    
    return (key) => getTranslation(key, language);
};
