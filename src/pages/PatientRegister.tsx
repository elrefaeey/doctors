import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, User, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PatientRegister = () => {
    const { language, setLanguage } = useLanguage();
    const { signUp } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate phone number
        if (!phone || phone.length < 11) {
            setError(language === 'ar' ? 'الرجاء إدخال رقم هاتف صحيح' : 'Please enter a valid phone number');
            setLoading(false);
            return;
        }

        try {
            await signUp(email, password, name, 'patient', { phone, dateOfBirth });
            navigate('/patient/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(language === 'ar' ? 'فشل إنشاء الحساب. الرجاء المحاولة مرة أخرى.' : 'Failed to create account. Please try again.');
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
                        {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed">
                        {language === 'ar' ? 'انضم إلينا وابدأ رحلة العناية بصحتك' : 'Join us and start your health journey'}
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
                        {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6">
                        {language === 'ar' ? 'سجل الآن كمريض' : 'Register as a patient'}
                    </p>

                    {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-xs sm:text-sm">{error}</div>}

                    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                                {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full ps-10 pe-4 py-2.5 sm:py-3 rounded-lg border border-input bg-background text-xs sm:text-sm outline-none focus:ring-2 focus:ring-ring"
                                    placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                                    required
                                />
                            </div>
                        </div>
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
                                    minLength={6}
                                />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {language === 'ar' ? 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                                {language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                            </label>
                            <div className="relative">
                                <svg className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full ps-10 pe-4 py-2.5 sm:py-3 rounded-lg border border-input bg-background text-xs sm:text-sm outline-none focus:ring-2 focus:ring-ring"
                                    placeholder="01xxxxxxxxx"
                                    required
                                    minLength={11}
                                    maxLength={11}
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-foreground mb-1.5">
                                {language === 'ar' ? 'تاريخ الميلاد (اختياري)' : 'Date of Birth (Optional)'}
                            </label>
                            <div className="relative">
                                <svg className="absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <input
                                    type="date"
                                    value={dateOfBirth}
                                    onChange={(e) => setDateOfBirth(e.target.value)}
                                    className="w-full ps-10 pe-4 py-2.5 sm:py-3 rounded-lg border border-input bg-background text-xs sm:text-sm outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading} 
                            className="block w-full py-2.5 sm:py-3 rounded-lg bg-primary text-primary-foreground text-center text-xs sm:text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 active:scale-95"
                        >
                            {loading 
                                ? (language === 'ar' ? 'جاري التحميل...' : 'Loading...') 
                                : (language === 'ar' ? 'إنشاء حساب' : 'Create Account')
                            }
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-5 sm:mt-6 text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {language === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
                            <Link 
                                to="/login/patient" 
                                className="text-primary font-semibold hover:underline ms-1"
                            >
                                {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PatientRegister;
