import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, ChevronRight, ChevronLeft, Sparkles, BadgeCheck, Award, Calendar, Clock, Zap
} from 'lucide-react';
import {
  collection, getDocs, addDoc, query, where, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import Layout from '@/components/Layout';
import BackButton from '@/components/BackButton';

type VerificationType = 'none' | 'blue' | 'gold';

interface PricingOption {
  durationDays: number;
  price: number;
}

interface SubscriptionPlan {
  id: string;
  nameAr: string;
  nameEn: string;
  color: string;
  pricingOptions: PricingOption[];
  verificationType: VerificationType;
}

const DoctorSubscriptionPlans = () => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [selectedOption, setSelectedOption] = useState<PricingOption | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);

  useEffect(() => {
    loadPlans();
    checkActiveRequest();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'subscriptionPlansNew'));
      const plansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SubscriptionPlan[];
      setPlans(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkActiveRequest = async () => {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, 'subscriptionRequestsNew'),
        where('doctorId', '==', currentUser.uid),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      setHasActiveRequest(!snapshot.empty);
    } catch (error) {
      console.error('Error checking active request:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!currentUser || !selectedPlan || !selectedOption) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'subscriptionRequestsNew'), {
        doctorId: currentUser.uid,
        doctorEmail: currentUser.email,
        planId: selectedPlan.id,
        planNameAr: selectedPlan.nameAr,
        planNameEn: selectedPlan.nameEn,
        durationDays: selectedOption.durationDays,
        price: selectedOption.price,
        verificationType: selectedPlan.verificationType,
        status: 'pending',
        createdAt: serverTimestamp()
      });

      alert(language === 'ar' ? '✅ تم إرسال طلبك بنجاح' : '✅ Request sent successfully');
      setSelectedPlan(null);
      setSelectedOption(null);
      setHasActiveRequest(true);
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getDurationLabel = (days: number) => {
    if (days === 30) return language === 'ar' ? 'شهر واحد' : '1 Month';
    if (days === 60) return language === 'ar' ? 'شهرين' : '2 Months';
    if (days === 90) return language === 'ar' ? '3 أشهر' : '3 Months';
    if (days === 180) return language === 'ar' ? '6 أشهر' : '6 Months';
    if (days === 365) return language === 'ar' ? 'سنة' : '1 Year';
    return language === 'ar' ? `${days} يوم` : `${days} Days`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <BackButton variant="minimal" />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold mb-4"
            >
              <Sparkles size={16} />
              {language === 'ar' ? 'اختر الخطة المناسبة لك' : 'Choose Your Perfect Plan'}
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4"
            >
              {language === 'ar' ? 'خطط الاشتراك' : 'Subscription Plans'}
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto"
            >
              {language === 'ar' 
                ? 'اختر الخطة التي تناسب احتياجاتك واحصل على شارة التوثيق'
                : 'Choose the plan that fits your needs and get verified'}
            </motion.p>

            {hasActiveRequest && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-xl font-semibold"
              >
                <Clock className="animate-pulse" size={20} />
                {language === 'ar' ? 'لديك طلب قيد المراجعة' : 'You have a pending request'}
              </motion.div>
            )}
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-white dark:bg-slate-800 rounded-3xl shadow-xl border-2 overflow-hidden transition-all hover:scale-105 cursor-pointer ${
                  selectedPlan?.id === plan.id
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
                onClick={() => setSelectedPlan(plan)}
              >
                {/* Plan Header */}
                <div
                  className="p-8 text-white relative overflow-hidden"
                  style={{ backgroundColor: plan.color }}
                >
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16" />
                  
                  <div className="relative z-10">
                    {/* Verification Icon */}
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                      {plan.verificationType === 'blue' && <BadgeCheck size={32} />}
                      {plan.verificationType === 'gold' && <Award size={32} />}
                      {plan.verificationType === 'none' && <span className="text-3xl">📦</span>}
                    </div>

                    <h3 className="text-2xl font-bold mb-2">
                      {language === 'ar' ? plan.nameAr : plan.nameEn}
                    </h3>
                    
                    {/* Verification Badge */}
                    {plan.verificationType !== 'none' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                        {plan.verificationType === 'blue' && (
                          <>
                            <BadgeCheck size={14} />
                            {language === 'ar' ? 'توثيق أزرق' : 'Blue Verified'}
                          </>
                        )}
                        {plan.verificationType === 'gold' && (
                          <>
                            <Award size={14} />
                            {language === 'ar' ? 'توثيق ذهبي' : 'Gold Verified'}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Preview */}
                <div className="p-6">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    {language === 'ar' ? 'يبدأ من' : 'Starting from'}
                  </div>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      {plan.pricingOptions && plan.pricingOptions.length > 0 
                        ? Math.min(...plan.pricingOptions.map(o => o.price))
                        : 0
                      }
                    </span>
                    <span className="text-lg text-slate-600 dark:text-slate-400">
                      {language === 'ar' ? 'جنيه' : 'EGP'}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPlan(plan);
                    }}
                    className="w-full py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group text-white"
                    style={{ backgroundColor: plan.color }}
                  >
                    {language === 'ar' ? 'عرض الأسعار' : 'View Pricing'}
                    {language === 'ar' ? (
                      <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    )}
                  </button>
                </div>

                {/* Selected Indicator */}
                {selectedPlan?.id === plan.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 left-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check size={20} style={{ color: plan.color }} />
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {plans.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {language === 'ar' ? 'لا توجد خطط متاحة حالياً' : 'No plans available'}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {language === 'ar' 
                  ? 'سيتم إضافة خطط الاشتراك قريباً'
                  : 'Subscription plans will be added soon'}
              </p>
            </div>
          )}

          {/* Pricing Selection Modal */}
          <AnimatePresence>
            {selectedPlan && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => {
                  setSelectedPlan(null);
                  setSelectedOption(null);
                }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div
                    className="p-8 text-white relative overflow-hidden"
                    style={{ backgroundColor: selectedPlan.color }}
                  >
                    <button
                      onClick={() => {
                        setSelectedPlan(null);
                        setSelectedOption(null);
                      }}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all z-10"
                    >
                      <X size={20} />
                    </button>

                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                      {selectedPlan.verificationType === 'blue' && <BadgeCheck size={32} />}
                      {selectedPlan.verificationType === 'gold' && <Award size={32} />}
                      {selectedPlan.verificationType === 'none' && <span className="text-3xl">📦</span>}
                    </div>

                    <h2 className="text-3xl font-bold mb-2">
                      {language === 'ar' ? selectedPlan.nameAr : selectedPlan.nameEn}
                    </h2>
                    
                    {selectedPlan.verificationType !== 'none' && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-sm font-bold">
                        {selectedPlan.verificationType === 'blue' && (
                          <>
                            <BadgeCheck size={14} />
                            {language === 'ar' ? 'توثيق أزرق' : 'Blue Verified'}
                          </>
                        )}
                        {selectedPlan.verificationType === 'gold' && (
                          <>
                            <Award size={14} />
                            {language === 'ar' ? 'توثيق ذهبي' : 'Gold Verified'}
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Pricing Options */}
                  <div className="p-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                      {language === 'ar' ? 'اختر المدة المناسبة' : 'Choose Duration'}
                    </h3>

                    <div className="space-y-4">
                      {selectedPlan.pricingOptions && selectedPlan.pricingOptions.length > 0 ? (
                        selectedPlan.pricingOptions.map((option, idx) => (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            onClick={() => setSelectedOption(option)}
                            className={`relative w-full p-6 rounded-2xl border-2 transition-all text-left ${
                              selectedOption === option
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                                : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Calendar size={24} className="text-slate-400" />
                                <div>
                                  <div className="font-bold text-lg text-slate-900 dark:text-white">
                                    {getDurationLabel(option.durationDays)}
                                  </div>
                                  <div className="text-sm text-slate-600 dark:text-slate-400">
                                    {option.durationDays} {language === 'ar' ? 'يوم' : 'days'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-bold" style={{ color: selectedPlan.color }}>
                                  {option.price}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  {language === 'ar' ? 'جنيه' : 'EGP'}
                                </div>
                              </div>
                            </div>

                            {selectedOption === option && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-4 left-4 w-6 h-6 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: selectedPlan.color }}
                              >
                                <Check size={16} className="text-white" />
                              </motion.div>
                            )}
                          </motion.button>
                        ))
                      ) : (
                        <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600">
                          <p className="text-slate-600 dark:text-slate-400">
                            {language === 'ar' ? 'لا توجد خيارات أسعار لهذه الباقة' : 'No pricing options available for this plan'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Subscribe Button */}
                    {selectedOption && (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={handleSubscribe}
                        disabled={submitting || hasActiveRequest}
                        className="w-full mt-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white"
                        style={{ 
                          backgroundColor: hasActiveRequest ? '#94a3b8' : selectedPlan.color
                        }}
                      >
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                            {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                          </>
                        ) : hasActiveRequest ? (
                          <>
                            <Clock size={20} />
                            {language === 'ar' ? 'لديك طلب قيد المراجعة' : 'Request Pending'}
                          </>
                        ) : (
                          <>
                            <Zap size={20} />
                            {language === 'ar' ? 'إرسال الطلب' : 'Send Request'}
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorSubscriptionPlans;
