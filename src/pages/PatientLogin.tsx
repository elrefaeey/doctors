import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, User, Mail, Lock, ArrowRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '@/config/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';

const PatientLogin = () => {
  const { language, setLanguage } = useLanguage();
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(email, password);

      // Wait a moment for userData to be fetched
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if user is patient
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser!.uid));
      if (userDoc.exists()) {
        const userRole = userDoc.data().role;

        if (userRole !== 'patient') {
          // Not a patient - sign out and show error
          await firebaseSignOut(auth);
          setError('هذا الحساب ليس حساب مريض. الرجاء استخدام تسجيل دخول الأطباء.');
          setLoading(false);
          return;
        }

        // Valid patient - redirect to dashboard
        navigate('/patient/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col lg:flex-row overflow-x-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Left side - branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-md text-center">
          <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
            <User size={48} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {language === 'ar' ? 'تسجيل دخول المريض' : 'Patient Login'}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {language === 'ar' ? 'احجز مواعيدك وتابع صحتك من مكان واحد' : 'Book appointments and track your health from one place'}
          </p>
        </motion.div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-12 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-card rounded-2xl shadow-elevated p-5 sm:p-8"
        >
          {/* Back to Home Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors mb-4 sm:mb-6 group"
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

          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Link to="/role-select" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Stethoscope size={16} className="text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground text-sm sm:text-base">
                {language === 'ar' ? 'هيلث كونكت' : 'Health Connect'}
              </span>
            </Link>
            <div className="flex items-center bg-muted rounded-lg p-0.5">
              <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-xs font-medium rounded ${language === 'en' ? 'bg-card shadow-sm' : ''}`}>EN</button>
              <button onClick={() => setLanguage('ar')} className={`px-2 py-1 text-xs font-medium rounded ${language === 'ar' ? 'bg-card shadow-sm' : ''}`}>AR</button>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">
            {language === 'ar' ? 'تسجيل دخول المريض' : 'Patient Login'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6">
            {language === 'ar' ? 'مرحباً بك في هيلث كونكت' : 'Welcome to Health Connect'}
          </p>

          {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-xs sm:text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full ps-10 pe-4 py-2.5 sm:py-3 rounded-lg border border-input bg-background text-xs sm:text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="patient@example.com"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full ps-10 pe-4 py-2.5 sm:py-3 rounded-lg border border-input bg-background text-xs sm:text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center gap-2 text-muted-foreground">
                <input type="checkbox" className="rounded border-input" />
                {language === 'ar' ? 'تذكرني' : 'Remember me'}
              </label>
              <a href="#" className="text-primary hover:underline">
                {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
              </a>
            </div>

            <button type="submit" disabled={loading} className="block w-full py-2.5 sm:py-3 rounded-lg bg-primary text-primary-foreground text-center text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-95">
              {loading ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') : (language === 'ar' ? 'تسجيل الدخول' : 'Sign In')}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              {language === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}
              <Link 
                to="/register/patient" 
                className="text-primary font-semibold hover:underline ms-1"
              >
                {language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PatientLogin;
