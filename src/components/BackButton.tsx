import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface BackButtonProps {
  className?: string;
  variant?: 'default' | 'minimal' | 'floating';
}

const BackButton = ({ className = '', variant = 'default' }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const { userData } = useAuth();

  const handleBack = () => {
    // If on chat page, go to dashboard
    if (location.pathname === '/chat') {
      if (userData?.role === 'patient') {
        navigate('/patient/dashboard');
      } else if (userData?.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/');
      }
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (variant === 'floating') {
    return (
      <button
        onClick={handleBack}
        className={`fixed top-20 ${language === 'ar' ? 'right-4' : 'left-4'} z-50 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all active:scale-95 ${className}`}
        aria-label={language === 'ar' ? 'رجوع' : 'Go back'}
      >
        {language === 'ar' ? (
          <ArrowRight size={20} />
        ) : (
          <ChevronLeft size={20} />
        )}
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleBack}
        className={`inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-600 transition-colors group ${className}`}
      >
        {language === 'ar' ? (
          <>
            <span className="font-medium">{language === 'ar' ? 'رجوع' : 'Back'}</span>
            <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" />
          </>
        ) : (
          <>
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:text-blue-600 transition-all shadow-sm hover:shadow-md active:scale-95 font-medium text-sm ${className}`}
    >
      {language === 'ar' ? (
        <>
          <span>{language === 'ar' ? 'رجوع' : 'Back'}</span>
          <ArrowRight size={18} />
        </>
      ) : (
        <>
          <ChevronLeft size={18} />
          <span>Back</span>
        </>
      )}
    </button>
  );
};

export default BackButton;
