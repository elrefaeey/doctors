import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { User, Stethoscope, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const RoleSelection = () => {
  const { t, language } = useLanguage();

  const roles = [
    {
      key: 'patient',
      icon: User,
      path: '/login/patient',
      color: 'bg-blue-500',
      colorHover: 'hover:bg-blue-600',
      titleAr: 'مريض',
      titleEn: 'Patient',
      descAr: 'ابحث عن أفضل الأطباء واحجز موعدك بسهولة',
      descEn: 'Find the best doctors and book your appointment easily'
    },
    {
      key: 'doctor',
      icon: Stethoscope,
      path: '/login/doctor',
      color: 'bg-emerald-500',
      colorHover: 'hover:bg-emerald-600',
      titleAr: 'طبيب',
      titleEn: 'Doctor',
      descAr: 'أدر عيادتك ومواعيدك مع مرضاك بكفاءة',
      descEn: 'Manage your clinic and appointments with your patients efficiently'
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-3 md:p-4 bg-gradient-to-br from-blue-50 via-white to-emerald-50 relative">
      {/* Back to Home Button */}
      <Link
        to="/"
        className={`absolute top-4 ${language === 'ar' ? 'right-4' : 'left-4'} flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-600 hover:text-primary hover:border-primary hover:shadow-md transition-all font-medium text-sm`}
      >
        <svg className={`w-4 h-4 ${language === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {language === 'ar' ? 'الرئيسية' : 'Home'}
      </Link>

      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-12"
        >
          <Link to="/" className="inline-flex items-center gap-2 md:gap-3 mb-6 md:mb-8 group">
            <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Stethoscope size={20} className="text-white md:hidden" />
              <Stethoscope size={28} className="text-white hidden md:block" />
            </div>
            <span className="text-xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              {t('common.appName')}
            </span>
          </Link>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 md:mb-4">
            {language === 'ar' ? 'اختر طريقة الدخول' : 'Choose Login Method'}
          </h1>
          <p className="text-sm md:text-lg text-gray-600 px-4">
            {language === 'ar' ? 'سجل دخولك كمريض أو طبيب للوصول إلى حسابك' : 'Login as a patient or doctor to access your account'}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 max-w-3xl mx-auto px-2">
          {roles.map((role, i) => (
            <motion.div
              key={role.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 100 }}
            >
              <Link
                to={role.path}
                className="block group"
              >
                <div className="relative p-6 md:p-10 rounded-2xl md:rounded-3xl bg-white border-2 border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 text-center overflow-hidden active:scale-95">
                  {/* Background gradient on hover */}
                  <div className={`absolute inset-0 ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                  {/* Icon */}
                  <div className={`relative w-16 h-16 md:w-24 md:h-24 rounded-2xl md:rounded-3xl ${role.color} flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <role.icon size={28} className="text-white md:hidden" />
                    <role.icon size={40} className="text-white hidden md:block" />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 md:mb-3">
                    {language === 'ar' ? role.titleAr : role.titleEn}
                  </h3>

                  {/* Description */}
                  <p className="text-xs md:text-base text-gray-600 mb-4 md:mb-6 leading-relaxed px-2">
                    {language === 'ar' ? role.descAr : role.descEn}
                  </p>

                  {/* Button */}
                  <div className={`inline-flex items-center gap-2 px-6 md:px-8 py-2.5 md:py-3 rounded-xl ${role.color} ${role.colorHover} text-white text-sm md:text-base font-bold shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
                    <svg className={`w-4 h-4 md:w-5 md:h-5 group-hover:${language === 'ar' ? '-translate-x-1' : 'translate-x-1'} transition-transform`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={language === 'ar' ? "M15 19l-7-7 7-7" : "M9 5l7 7-7 7"} />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
