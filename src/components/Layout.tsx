import { ReactNode, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Stethoscope, Search, User as UserIcon, Lock, ShieldCheck, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const Layout = ({ children }: { children: ReactNode }) => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { currentUser, userData, signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: language === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully',
        description: language === 'ar' ? 'تم تسجيل خروجك من الحساب' : 'You have been logged out',
      });
      navigate('/');
      setMobileMenuOpen(false);
    } catch (error) {
      toast({
        title: language === 'ar' ? 'خطأ' : 'Error',
        description: language === 'ar' ? 'حدث خطأ أثناء تسجيل الخروج' : 'Failed to log out',
        variant: 'destructive',
      });
    }
  };

  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/doctors', label: t('nav.findDoctors') },
  ];

  if (currentUser && userData) {
    const dashboardPath = {
      admin: '/admin/dashboard',
      doctor: '/doctor/dashboard',
      patient: '/patient/dashboard',
    }[userData.role];

    navLinks.push({ to: dashboardPath, label: t('nav.dashboard') });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Modern Compact Header - Mobile Optimized */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-3 md:px-4 h-14 md:h-16 flex items-center justify-between">
          {/* Logo - Compact on Mobile */}
          <Link to="/" className="flex items-center gap-1.5 md:gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
              <Stethoscope size={16} className="text-white md:w-5 md:h-5" />
            </div>
            <span className="text-base md:text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">{t('common.appName')}</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${isActive(link.to) ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions - Compact */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Language Switcher - Smaller on Mobile */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${language === 'en' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage('ar')}
                className={`px-2 md:px-3 py-1 md:py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${language === 'ar' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                  }`}
              >
                AR
              </button>
            </div>

            {!currentUser ? (
              <Link
                to="/role-select"
                className="hidden md:inline-flex items-center px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-sm font-medium hover:shadow-lg transition-all"
              >
                {t('nav.login')}
              </Link>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold">
                  <UserIcon size={12} />
                  <span className="max-w-[100px] truncate">{userData?.name || currentUser.email}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors"
                >
                  <LogOut size={14} />
                  {language === 'ar' ? 'خروج' : 'Logout'}
                </button>
              </div>
            )}

            {/* Mobile menu - Hidden, using bottom nav instead */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 pb-acc-nav md:pb-0">{children}</main>

      {/* Modern Compact Footer - Hidden on Mobile */}
      <footer className="bg-gradient-to-b from-slate-50 to-white border-t border-slate-100 mb-16 md:mb-0 hidden md:block">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-md">
                  <Stethoscope size={14} className="text-white" />
                </div>
                <span className="text-base font-bold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">{t('common.appName')}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{t('footer.aboutText')}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-3 text-sm">{t('footer.quickLinks')}</h4>
              <div className="space-y-1.5">
                <Link to="/" className="block text-xs text-slate-600 hover:text-blue-600 transition-colors">{t('nav.home')}</Link>
                <Link to="/doctors" className="block text-xs text-slate-600 hover:text-blue-600 transition-colors">{t('nav.findDoctors')}</Link>
                <Link to="/role-select" className="block text-xs text-slate-600 hover:text-blue-600 transition-colors">{t('nav.login')}</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-3 text-sm">{t('footer.support')}</h4>
              <div className="space-y-1.5">
                <a href="#" className="block text-xs text-slate-600 hover:text-blue-600 transition-colors">{t('footer.privacy')}</a>
                <a href="#" className="block text-xs text-slate-600 hover:text-blue-600 transition-colors">{t('footer.terms')}</a>
                <a href="#" className="block text-xs text-slate-600 hover:text-blue-600 transition-colors">{t('footer.contact')}</a>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 rounded-xl border border-blue-200/50 shadow-sm">
              <h4 className="font-bold text-blue-700 mb-1.5 flex items-center gap-1.5 text-sm">
                <ShieldCheck size={16} />
                {t('footer.areYouDoctor')}
              </h4>
              <p className="text-[10px] text-slate-600 mb-3 leading-relaxed">
                {t('footer.joinAsDoctor')}
              </p>
              <Link to="/login/doctor" className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] font-bold hover:shadow-lg transition-all">
                {t('footer.joinNow')}
              </Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>{t('footer.copyright')} {t('footer.rights')}</span>
            <Link to="/login/admin" className="opacity-20 hover:opacity-100 transition-opacity p-1.5">
              <Lock size={10} />
            </Link>
          </div>
        </div>
      </footer>

      {/* Modern Mobile Bottom Navigation - Sleek & Compact */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe">
        <div className={`flex items-center ${currentUser ? 'justify-around' : 'justify-evenly'} h-14 px-1`}>
          <Link
            to="/"
            className={`flex flex-col items-center justify-center ${currentUser ? 'flex-1' : 'flex-1'} h-full gap-0.5 transition-all ${isActive('/') ? 'text-blue-600' : 'text-slate-400'
              }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive('/') ? 'bg-blue-50' : ''}`}>
              <Stethoscope size={18} strokeWidth={isActive('/') ? 2.5 : 2} />
            </div>
            <span className="text-[9px] font-bold">{language === 'ar' ? 'الرئيسية' : 'Home'}</span>
          </Link>

          <Link
            to="/doctors"
            className={`flex flex-col items-center justify-center ${currentUser ? 'flex-1' : 'flex-1'} h-full gap-0.5 transition-all ${isActive('/doctors') ? 'text-blue-600' : 'text-slate-400'
              }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive('/doctors') ? 'bg-blue-50' : ''}`}>
              <Search size={18} strokeWidth={isActive('/doctors') ? 2.5 : 2} />
            </div>
            <span className="text-[9px] font-bold">{language === 'ar' ? 'ابحث عن طبيب' : 'Find Doctor'}</span>
          </Link>

          {currentUser && userData?.role === 'patient' && (
            <Link
              to="/chat"
              className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all ${isActive('/chat') ? 'text-blue-600' : 'text-slate-400'
                }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive('/chat') ? 'bg-blue-50' : ''}`}>
                <svg 
                  width="18" 
                  height="18" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth={isActive('/chat') ? 2.5 : 2}
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <span className="text-[9px] font-bold">{language === 'ar' ? 'المحادثات' : 'Chats'}</span>
            </Link>
          )}

          {currentUser ? (
            <>
              <Link
                to={userData?.role === 'doctor' ? '/doctor/dashboard' : userData?.role === 'patient' ? '/patient/dashboard' : '/admin/dashboard'}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-all ${location.pathname.includes('dashboard') ? 'text-blue-600' : 'text-slate-400'
                  }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${location.pathname.includes('dashboard') ? 'bg-blue-50' : ''}`}>
                  <LayoutDashboard size={18} strokeWidth={location.pathname.includes('dashboard') ? 2.5 : 2} />
                </div>
                <span className="text-[9px] font-bold">{language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
              </Link>

              <button
                onClick={() => setMobileMenuOpen(true)}
                className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-slate-400 transition-all active:scale-95"
              >
                <div className="p-1.5">
                  <Menu size={18} />
                </div>
                <span className="text-[9px] font-bold">{language === 'ar' ? 'المزيد' : 'More'}</span>
              </button>
            </>
          ) : (
            <Link
              to="/role-select"
              className={`flex flex-col items-center justify-center ${currentUser ? 'flex-1' : 'flex-1'} h-full gap-0.5 transition-all ${isActive('/role-select') ? 'text-blue-600' : 'text-slate-400'
                }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive('/role-select') ? 'bg-blue-50' : ''}`}>
                <UserIcon size={18} strokeWidth={isActive('/role-select') ? 2.5 : 2} />
              </div>
              <span className="text-[9px] font-bold">{language === 'ar' ? 'تسجيل دخول' : 'Login'}</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Sleek Mobile More Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl border-t border-slate-100 z-50 pb-safe shadow-2xl"
            >
              <div className="flex items-center justify-between p-3 border-b border-slate-100">
                <span className="font-bold text-sm text-slate-900">{t('common.menu') || 'Menu'}</span>
                <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 bg-slate-100 rounded-lg text-slate-600">
                  <X size={16} />
                </button>
              </div>
              <div className="p-3 space-y-3 max-h-[70vh] overflow-y-auto">
                {/* Language Switcher */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                  <div className="text-xs font-bold text-slate-700">{t('common.language') || 'Language'}</div>
                  <div className="flex bg-white rounded-lg p-0.5 shadow-sm border border-slate-200">
                    <button
                      onClick={() => setLanguage('en')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-blue-600 text-white' : 'text-slate-500'
                        }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setLanguage('ar')}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${language === 'ar' ? 'bg-blue-600 text-white' : 'text-slate-500'
                        }`}
                    >
                      العربية
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/" onClick={() => setMobileMenuOpen(false)} className="bg-slate-50 p-3 rounded-xl flex flex-col items-center gap-1.5 text-center active:scale-95 transition-transform">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><Stethoscope size={18} /></div>
                    <span className="text-[10px] font-bold text-slate-700">{t('nav.home')}</span>
                  </Link>
                  <Link to="/doctors" onClick={() => setMobileMenuOpen(false)} className="bg-slate-50 p-3 rounded-xl flex flex-col items-center gap-1.5 text-center active:scale-95 transition-transform">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"><Search size={18} /></div>
                    <span className="text-[10px] font-bold text-slate-700">{t('nav.findDoctors')}</span>
                  </Link>
                  {!currentUser ? (
                    <Link to="/role-select" onClick={() => setMobileMenuOpen(false)} className="bg-slate-50 p-3 rounded-xl flex flex-col items-center gap-1.5 text-center active:scale-95 transition-transform">
                      <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"><UserIcon size={18} /></div>
                      <span className="text-[10px] font-bold text-slate-700">{t('nav.login')}</span>
                    </Link>
                  ) : (
                    <>
                      <Link to={userData?.role === 'doctor' ? '/doctor/dashboard' : userData?.role === 'patient' ? '/patient/dashboard' : '/admin/dashboard'} onClick={() => setMobileMenuOpen(false)} className="bg-slate-50 p-3 rounded-xl flex flex-col items-center gap-1.5 text-center active:scale-95 transition-transform">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><LayoutDashboard size={18} /></div>
                        <span className="text-[10px] font-bold text-slate-700">{t('nav.dashboard')}</span>
                      </Link>
                      <button onClick={handleLogout} className="bg-red-50 p-3 rounded-xl flex flex-col items-center gap-1.5 text-center active:scale-95 transition-transform">
                        <div className="w-9 h-9 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><LogOut size={18} /></div>
                        <span className="text-[10px] font-bold text-red-600">{language === 'ar' ? 'خروج' : 'Logout'}</span>
                      </button>
                    </>
                  )}
                </div>

                {/* User Info if logged in */}
                {currentUser && (
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 p-3 rounded-xl border border-blue-200/50">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        {userData?.name?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-blue-900 truncate">{userData?.name || currentUser.email}</p>
                        <p className="text-[10px] text-blue-600 font-medium">{userData?.role === 'doctor' ? (language === 'ar' ? 'طبيب' : 'Doctor') : userData?.role === 'patient' ? (language === 'ar' ? 'مريض' : 'Patient') : (language === 'ar' ? 'مسؤول' : 'Admin')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
