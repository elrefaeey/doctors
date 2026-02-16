import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Clock, Calendar, Check, Save, Info } from 'lucide-react';
import { updateDoctorSchedule } from '@/services/firebaseService';
import { toast } from 'sonner';

interface ScheduleManagerProps {
    doctorId: string;
    initialSchedule: any;
}

const ScheduleManager = ({ doctorId, initialSchedule }: ScheduleManagerProps) => {
    const { t, language } = useLanguage();
    const [schedule, setSchedule] = useState(initialSchedule || {
        sunday: { enabled: true, start: '09:00', end: '17:00' },
        monday: { enabled: true, start: '09:00', end: '17:00' },
        tuesday: { enabled: true, start: '09:00', end: '17:00' },
        wednesday: { enabled: true, start: '09:00', end: '17:00' },
        thursday: { enabled: true, start: '09:00', end: '17:00' },
        friday: { enabled: false, start: '09:00', end: '17:00' },
        saturday: { enabled: false, start: '09:00', end: '17:00' },
    });
    const [saving, setSaving] = useState(false);

    const days = [
        { key: 'sunday', label: t('specializations.cardiology') === 'Cardiology' ? 'Sunday' : 'الأحد' },
        { key: 'monday', label: t('specializations.cardiology') === 'Cardiology' ? 'Monday' : 'الاثنين' },
        { key: 'tuesday', label: t('specializations.cardiology') === 'Cardiology' ? 'Tuesday' : 'الثلاثاء' },
        { key: 'wednesday', label: t('specializations.cardiology') === 'Cardiology' ? 'Wednesday' : 'الأربعاء' },
        { key: 'thursday', label: t('specializations.cardiology') === 'Cardiology' ? 'Thursday' : 'الخميس' },
        { key: 'friday', label: t('specializations.cardiology') === 'Cardiology' ? 'Friday' : 'الجمعة' },
        { key: 'saturday', label: t('specializations.cardiology') === 'Cardiology' ? 'Saturday' : 'السبت' },
    ];

    const handleToggle = (day: string) => {
        setSchedule({
            ...schedule,
            [day]: { ...schedule[day], enabled: !schedule[day].enabled }
        });
    };

    const handleTimeChange = (day: string, type: 'start' | 'end', value: string) => {
        setSchedule({
            ...schedule,
            [day]: { ...schedule[day], [type]: value }
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateDoctorSchedule(doctorId, schedule);
            toast.success(t('success.profileUpdated'));
        } catch (error) {
            toast.error(t('errors.somethingWentWrong'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-8">
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-accent/5 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Clock className="text-primary" size={20} />
                            {t('doctorDash.workingHours')}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">{t('doctorDash.saveSchedule')}</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {saving ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save size={18} />
                        )}
                        {t('common.save')}
                    </button>
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        {days.map((day) => {
                            const dayData = schedule[day.key];
                            return (
                                <div key={day.key} className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border transition-all ${dayData.enabled ? 'border-primary/20 bg-primary/5' : 'border-border bg-accent/10 opacity-60'}`}>
                                    <div className="flex items-center gap-4 sm:w-40 shrink-0">
                                        <button
                                            onClick={() => handleToggle(day.key)}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${dayData.enabled ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-muted text-muted-foreground'}`}
                                        >
                                            {dayData.enabled ? <Check size={20} /> : <Calendar size={18} />}
                                        </button>
                                        <span className="font-bold text-foreground">{day.label}</span>
                                    </div>

                                    {dayData.enabled ? (
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="flex-1">
                                                <input
                                                    type="time"
                                                    value={dayData.start}
                                                    onChange={(e) => handleTimeChange(day.key, 'start', e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>
                                            <span className="text-muted-foreground font-medium">-</span>
                                            <div className="flex-1">
                                                <input
                                                    type="time"
                                                    value={dayData.end}
                                                    onChange={(e) => handleTimeChange(day.key, 'end', e.target.value)}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary outline-none"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex-1 py-2 text-sm text-muted-foreground italic">
                                            {t('common.cancel')}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
                <Info className="text-blue-500 shrink-0 mt-0.5" size={20} />
                <div>
                    <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300">How this works</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 leading-relaxed">
                        Specify your working hours carefully. Patients will be able to book 30-minute slots during these periods.
                        Changes apply immediately to new bookings.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScheduleManager;
