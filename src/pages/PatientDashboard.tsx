import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentsByPatient } from '@/services/firebaseService';
import Layout from '@/components/Layout';
import BackButton from '@/components/BackButton';
import { Calendar, Clock, Bell, User, Star, MessageCircle, LogOut, Settings } from 'lucide-react';
import SubscriptionBadge from '@/components/SubscriptionBadge';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Tab = 'upcoming' | 'history' | 'notifications';

const PatientDashboard = () => {
  const { language, t } = useLanguage();
  const { currentUser, userData, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('upcoming');
  const [appointments, setAppointments] = useState<any[]>([]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error(language === 'ar' ? 'حدث خطأ أثناء تسجيل الخروج' : 'Failed to log out');
    }
  };

  useEffect(() => {
    if (currentUser?.uid) {
      getAppointmentsByPatient(currentUser.uid).then(setAppointments).catch(console.error);
    }
  }, [currentUser]);

  const upcoming = appointments.filter(a => ['pending', 'confirmed'].includes(a.status));
  const history = appointments.filter(a => ['completed', 'cancelled', 'rejected'].includes(a.status));

  const statusColor = (s: string) => s === 'confirmed' ? 'bg-secondary/20 text-secondary' : s === 'completed' ? 'bg-accent text-accent-foreground' : 'bg-destructive/10 text-destructive';

  const handleOpenChat = () => {
    navigate('/chat');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t('patientDash.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('patientDash.welcome')}, {userData?.name?.split(' ')[0] || userData?.displayName?.split(' ')[0] || currentUser?.displayName?.split(' ')[0] || (language === 'ar' ? 'مستخدم' : 'User')} 👋</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setTab('upcoming')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === 'upcoming' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
          >
            <Calendar size={16} /> {t('patientDash.upcoming')}
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${tab === 'history' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-muted'
              }`}
          >
            <Clock size={16} /> {t('patientDash.history')}
          </button>
          <button
            onClick={() => navigate('/patient/settings')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            <Settings size={16} /> {language === 'ar' ? 'الإعدادات' : 'Settings'}
          </button>
        </div>

        {/* Content */}
        {tab === 'upcoming' && (
          <div className="space-y-4">
            {upcoming.length ? upcoming.map(appt => (
              <div key={appt.id} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center text-lg font-bold text-accent-foreground shrink-0">
                  {(appt.doctorName || 'D').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-foreground">{appt.doctorName}</span>
                  </div>
                  {/* <p className="text-sm text-muted-foreground">{t(`specializations.${doc.specializationKey}`)}</p> */}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {appt.date}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {appt.time}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(appt.status)}`}>
                  {t(`patientDash.${appt.status}`) || appt.status}
                </span>
                {appt.status === 'confirmed' && (
                  <button
                    onClick={handleOpenChat}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm"
                  >
                    <MessageCircle size={16} />
                    محادثة
                  </button>
                )}
              </div>
            )) : (
              <div className="text-center py-16 text-muted-foreground">{t('patientDash.noUpcoming')}</div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-4">
            {history.map(appt => (
              <div key={appt.id} className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center text-lg font-bold text-accent-foreground shrink-0">
                  {(appt.doctorName || 'D').charAt(0)}
                </div>
                <div className="flex-1">
                  <span className="font-semibold text-foreground">{appt.doctorName}</span>
                  <p className="text-sm text-muted-foreground">{appt.date} - {appt.time}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(appt.status)}`}>
                  {t(`patientDash.${appt.status}`) || appt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PatientDashboard;
