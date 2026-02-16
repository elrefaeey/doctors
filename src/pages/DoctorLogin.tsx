import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import DoctorRequestForm from '@/components/DoctorRequestForm';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';

const DoctorLogin = () => {
  const { language, setLanguage, t } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);

      // Wait a moment for userData to be fetched
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if user is doctor or admin
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;

        if (userRole !== 'doctor' && userRole !== 'admin') {
          // Not a doctor or admin - sign out and show error
          await firebaseSignOut(auth);
          setError(language === 'ar' ? 'هذا الحساب ليس حساب طبيب. الرجاء استخدام تسجيل دخول المرضى.' : 'This account is not a doctor account. Please use patient login.');
          setLoading(false);
          return;
        }

        // Valid doctor/admin - redirect
        if (userRole === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/doctor/dashboard');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(language === 'ar' ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Incorrect email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-gradient-to-br from-emerald-50 via-white to-blue-50 overflow-x-hidden">
      {/* Left Side - Illustration (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10" />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 max-w-md text-center"
        >
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center mx-auto mb-8 shadow-2xl">
            <Stethoscope size={64} className="text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === 'ar' ? 'مرحباً بك في هيلث كونكت' : 'Welcome to Health Connect'}
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            {language === 'ar' ? 'أدِر عيادتك ومواعيدك مع مرضاك بكفاءة وسهولة' : 'Manage your clinic and appointments with your patients efficiently'}
          </p>
        </motion.div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <Link 
              to="/" 
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-emerald-600 transition-colors group"
            >
              {language === 'ar' ? (
                <>
                  <span className="font-medium">{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
                  <ArrowRight size={16} className="group-hover:-translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  <ArrowRight size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                  <span className="font-medium">Back to Home</span>
                </>
              )}
            </Link>
          </div>

          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Link to="/role-select" className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Stethoscope size={20} className="text-white sm:hidden" />
                <Stethoscope size={24} className="text-white hidden sm:block" />
              </div>
              <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                {t('common.appName')}
              </span>
            </Link>
            <div className="flex items-center bg-gray-100 rounded-xl p-0.5 sm:p-1">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${language === 'en' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all ${language === 'ar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'}`}
              >
                AR
              </button>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-5 sm:p-8 border border-gray-100">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
              </h1>
              <p className="text-xs sm:text-base text-gray-600">
                {language === 'ar' ? 'للأطباء والإدارة' : 'For Doctors & Admins'}
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs sm:text-sm flex items-center gap-2"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail size={16} className={`absolute ${language === 'ar' ? 'right-3 sm:right-4' : 'left-3 sm:left-4'} top-1/2 -translate-y-1/2 text-gray-400 sm:w-5 sm:h-5`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full ${language === 'ar' ? 'pr-10 sm:pr-12 pl-3 sm:pl-4' : 'pl-10 sm:pl-12 pr-3 sm:pr-4'} py-3 sm:py-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 text-xs sm:text-base outline-none focus:border-emerald-500 focus:bg-white transition-all`}
                    placeholder="doctor@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-gray-900 mb-1.5 sm:mb-2">
                  {language === 'ar' ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock size={16} className={`absolute ${language === 'ar' ? 'right-3 sm:right-4' : 'left-3 sm:left-4'} top-1/2 -translate-y-1/2 text-gray-400 sm:w-5 sm:h-5`} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full ${language === 'ar' ? 'pr-10 sm:pr-12 pl-3 sm:pl-4' : 'pl-10 sm:pl-12 pr-3 sm:pr-4'} py-3 sm:py-4 rounded-xl border-2 border-gray-200 bg-gray-50 text-gray-900 text-xs sm:text-base outline-none focus:border-emerald-500 focus:bg-white transition-all`}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <label className="flex items-center gap-1.5 sm:gap-2 text-gray-600 cursor-pointer">
                  <input type="checkbox" className="w-3 h-3 sm:w-4 sm:h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                  <span>{language === 'ar' ? 'تذكرني' : 'Remember me'}</span>
                </label>
                <a href="#" className="text-emerald-600 font-semibold hover:underline">
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 sm:py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold text-sm sm:text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </span>
                ) : (
                  language === 'ar' ? 'تسجيل الدخول' : 'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-gray-200">
              <p className="text-center text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                {language === 'ar' ? 'طبيب جديد؟ انضم إلى منصتنا' : 'New doctor? Join our platform'}
              </p>
              <button
                type="button"
                onClick={() => setShowRequestForm(true)}
                className="w-full py-3 sm:py-4 rounded-xl border-2 border-emerald-500 text-emerald-600 text-xs sm:text-base font-bold hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                {language === 'ar' ? 'طلب انضمام كطبيب' : 'Request to Join as Doctor'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {showRequestForm && <DoctorRequestForm onClose={() => setShowRequestForm(false)} />}
    </div>
  );
};

export default DoctorLogin;
