import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Edit2, Trash2, X, Calendar, Palette, Save, AlertCircle, BadgeCheck, Award
} from 'lucide-react';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';
import { db } from '@/config/firebase';

type VerificationType = 'none' | 'blue' | 'gold';

interface PricingOption {
  durationDays: number;
  price: number;
}

interface SubscriptionPlan {
  id?: string;
  nameAr: string;
  nameEn: string;
  color: string;
  pricingOptions: PricingOption[]; // Array of duration/price pairs
  verificationType: VerificationType;
  createdAt?: any;
  updatedAt?: any;
}

const SubscriptionPlansNew = () => {
  const { t, language } = useLanguage();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Form state
  const [formData, setFormData] = useState<SubscriptionPlan>({
    nameAr: '',
    nameEn: '',
    color: '#3b82f6',
    pricingOptions: [{ durationDays: 30, price: 0 }],
    verificationType: 'none'
  });

  useEffect(() => {
    loadPlans();
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

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.nameAr || !formData.nameEn) {
        alert(language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
        return;
      }

      if (formData.pricingOptions.length === 0) {
        alert(language === 'ar' ? 'الرجاء إضافة خيار سعر واحد على الأقل' : 'Please add at least one pricing option');
        return;
      }

      // Validate all pricing options
      for (const option of formData.pricingOptions) {
        if (option.durationDays <= 0 || option.price < 0) {
          alert(language === 'ar' ? 'الرجاء إدخال قيم صحيحة للمدة والسعر' : 'Please enter valid duration and price values');
          return;
        }
      }

      const planData = {
        ...formData,
        updatedAt: serverTimestamp()
      };

      if (editingPlan?.id) {
        await updateDoc(doc(db, 'subscriptionPlansNew', editingPlan.id), planData);
        alert(language === 'ar' ? '✅ تم تحديث الخطة بنجاح' : '✅ Plan updated successfully');
      } else {
        await addDoc(collection(db, 'subscriptionPlansNew'), {
          ...planData,
          createdAt: serverTimestamp()
        });
        alert(language === 'ar' ? '✅ تم إنشاء الخطة بنجاح' : '✅ Plan created successfully');
      }

      resetForm();
      loadPlans();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (planId: string) => {
    const confirmMsg = language === 'ar' 
      ? 'هل أنت متأكد من حذف هذه الخطة؟' 
      : 'Are you sure you want to delete this plan?';
    
    if (!confirm(confirmMsg)) return;

    try {
      await deleteDoc(doc(db, 'subscriptionPlansNew', planId));
      alert(language === 'ar' ? '✅ تم حذف الخطة' : '✅ Plan deleted');
      loadPlans();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    // Ensure pricingOptions exists, if not create default
    setFormData({
      ...plan,
      pricingOptions: plan.pricingOptions && plan.pricingOptions.length > 0 
        ? plan.pricingOptions 
        : [{ durationDays: 30, price: 0 }]
    });
    setIsCreating(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      nameAr: '',
      nameEn: '',
      color: '#3b82f6',
      pricingOptions: [{ durationDays: 30, price: 0 }],
      verificationType: 'none'
    });
    setEditingPlan(null);
    setIsCreating(false);
  };

  const handleVerificationToggle = (type: VerificationType) => {
    // If clicking the same type, turn it off
    if (formData.verificationType === type) {
      setFormData({ ...formData, verificationType: 'none' });
    } else {
      // Otherwise, set the new type (automatically disables the other)
      setFormData({ ...formData, verificationType: type });
    }
  };

  const addPricingOption = () => {
    setFormData({
      ...formData,
      pricingOptions: [...formData.pricingOptions, { durationDays: 30, price: 0 }]
    });
  };

  const removePricingOption = (index: number) => {
    if (formData.pricingOptions.length === 1) {
      alert(language === 'ar' ? 'يجب أن يكون هناك خيار سعر واحد على الأقل' : 'At least one pricing option is required');
      return;
    }
    const newOptions = formData.pricingOptions.filter((_, i) => i !== index);
    setFormData({ ...formData, pricingOptions: newOptions });
  };

  const updatePricingOption = (index: number, field: 'durationDays' | 'price', value: number) => {
    const newOptions = [...formData.pricingOptions];
    newOptions[index][field] = value;
    setFormData({ ...formData, pricingOptions: newOptions });
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {language === 'ar' ? 'إدارة خطط الاشتراك' : 'Manage Subscription Plans'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {language === 'ar' 
              ? 'إنشاء وإدارة خطط الاشتراك للأطباء'
              : 'Create and manage subscription plans for doctors'}
          </p>
        </div>

        {/* Create Button */}
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center gap-2 active:scale-95"
        >
          {isCreating ? <X size={20} /> : <Plus size={20} />}
          {isCreating 
            ? (language === 'ar' ? 'إلغاء' : 'Cancel')
            : (language === 'ar' ? 'إنشاء خطة جديدة' : 'Create New Plan')
          }
        </button>

        {/* Create/Edit Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8"
            >
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6 md:p-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  {editingPlan 
                    ? (language === 'ar' ? 'تعديل الخطة' : 'Edit Plan')
                    : (language === 'ar' ? 'إنشاء خطة جديدة' : 'Create New Plan')
                  }
                </h2>

                <div className="space-y-6">
                  {/* Plan Names */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {language === 'ar' ? 'اسم الخطة (عربي)' : 'Plan Name (Arabic)'} *
                      </label>
                      <input
                        type="text"
                        value={formData.nameAr}
                        onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        placeholder="الخطة الذهبية"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        {language === 'ar' ? 'اسم الخطة (إنجليزي)' : 'Plan Name (English)'} *
                      </label>
                      <input
                        type="text"
                        value={formData.nameEn}
                        onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                        placeholder="Gold Plan"
                      />
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                      <Palette size={16} />
                      {language === 'ar' ? 'لون الخطة' : 'Plan Color'}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-20 h-14 rounded-xl border-2 border-slate-200 dark:border-slate-600 cursor-pointer"
                      />
                      <div
                        className="flex-1 h-14 rounded-xl border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center font-bold text-white shadow-lg"
                        style={{ backgroundColor: formData.color }}
                      >
                        {language === 'ar' ? formData.nameAr || 'معاينة' : formData.nameEn || 'Preview'}
                      </div>
                    </div>
                  </div>

                  {/* Duration & Pricing Options */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                      <Calendar size={16} />
                      {language === 'ar' ? 'خيارات المدة والسعر' : 'Duration & Pricing Options'}
                    </label>
                    
                    <div className="space-y-3">
                      {formData.pricingOptions && formData.pricingOptions.length > 0 ? (
                        formData.pricingOptions.map((option, index) => (
                          <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-2 border-slate-200 dark:border-slate-600">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Duration Selection */}
                              <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                                  {language === 'ar' ? 'المدة' : 'Duration'}
                                </label>
                                <select
                                  value={option.durationDays}
                                  onChange={(e) => updatePricingOption(index, 'durationDays', Number(e.target.value))}
                                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm"
                                >
                                  <option value={30}>{language === 'ar' ? 'شهر واحد (30 يوم)' : '1 Month (30 days)'}</option>
                                  <option value={60}>{language === 'ar' ? 'شهرين (60 يوم)' : '2 Months (60 days)'}</option>
                                  <option value={90}>{language === 'ar' ? '3 أشهر (90 يوم)' : '3 Months (90 days)'}</option>
                                  <option value={180}>{language === 'ar' ? '6 أشهر (180 يوم)' : '6 Months (180 days)'}</option>
                                  <option value={365}>{language === 'ar' ? 'سنة (365 يوم)' : '1 Year (365 days)'}</option>
                                </select>
                              </div>

                              {/* Price Input */}
                              <div>
                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                                  {language === 'ar' ? 'السعر (جنيه)' : 'Price (EGP)'}
                                </label>
                                <input
                                  type="number"
                                  value={option.price}
                                  onChange={(e) => updatePricingOption(index, 'price', Number(e.target.value))}
                                  className="w-full px-3 py-2.5 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none text-sm"
                                  placeholder="100"
                                  min="0"
                                />
                              </div>
                            </div>

                            {/* Remove Button */}
                            {formData.pricingOptions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removePricingOption(index)}
                                className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/40 transition-all flex items-center justify-center mt-6"
                              >
                                <X size={18} />
                              </button>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 text-center">
                          <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                            {language === 'ar' ? 'لا توجد خيارات أسعار' : 'No pricing options'}
                          </p>
                          <button
                            type="button"
                            onClick={addPricingOption}
                            className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-all"
                          >
                            {language === 'ar' ? 'إضافة خيار' : 'Add Option'}
                          </button>
                        </div>
                      )}

                      {/* Add Option Button */}
                      {formData.pricingOptions && formData.pricingOptions.length > 0 && (
                        <button
                          type="button"
                          onClick={addPricingOption}
                          className="w-full p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                          <Plus size={18} />
                          {language === 'ar' ? 'إضافة خيار سعر آخر' : 'Add Another Pricing Option'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Verification Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                      {language === 'ar' ? 'نوع التوثيق' : 'Verification Type'}
                    </label>
                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 space-y-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                        {language === 'ar' 
                          ? 'يمكن تفعيل نوع توثيق واحد فقط في كل مرة'
                          : 'Only one verification type can be active at a time'}
                      </p>
                      
                      {/* Blue Badge Toggle */}
                      <div
                        onClick={() => handleVerificationToggle('blue')}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.verificationType === 'blue'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-slate-200 dark:border-slate-600 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            formData.verificationType === 'blue' ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}>
                            <BadgeCheck size={24} className="text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {language === 'ar' ? 'شارة التوثيق الزرقاء' : 'Blue Verification Badge'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {language === 'ar' ? 'توثيق قياسي' : 'Standard verification'}
                            </div>
                          </div>
                        </div>
                        <div className={`w-14 h-8 rounded-full transition-all relative ${
                          formData.verificationType === 'blue' ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            formData.verificationType === 'blue' 
                              ? (language === 'ar' ? 'right-1' : 'left-7')
                              : (language === 'ar' ? 'right-7' : 'left-1')
                          }`} />
                        </div>
                      </div>

                      {/* Gold Badge Toggle */}
                      <div
                        onClick={() => handleVerificationToggle('gold')}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          formData.verificationType === 'gold'
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                            : 'border-slate-200 dark:border-slate-600 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            formData.verificationType === 'gold' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}>
                            <Award size={24} className="text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {language === 'ar' ? 'شارة التوثيق الذهبية' : 'Gold Verification Badge'}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {language === 'ar' ? 'توثيق مميز' : 'Premium verification'}
                            </div>
                          </div>
                        </div>
                        <div className={`w-14 h-8 rounded-full transition-all relative ${
                          formData.verificationType === 'gold' ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}>
                          <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                            formData.verificationType === 'gold'
                              ? (language === 'ar' ? 'right-1' : 'left-7')
                              : (language === 'ar' ? 'right-7' : 'left-1')
                          }`} />
                        </div>
                      </div>

                      {/* No Badge Option */}
                      {formData.verificationType !== 'none' && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, verificationType: 'none' })}
                          className="w-full p-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-red-300 hover:text-red-600 transition-all text-sm font-medium"
                        >
                          {language === 'ar' ? '✕ إزالة التوثيق' : '✕ Remove Verification'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-6 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Save size={18} />
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Plans List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all"
            >
              {/* Plan Header */}
              <div
                className="p-6 text-white relative overflow-hidden"
                style={{ backgroundColor: plan.color }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    {/* Verification Badge */}
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {plan.verificationType === 'blue' && <BadgeCheck size={24} />}
                      {plan.verificationType === 'gold' && <Award size={24} />}
                      {plan.verificationType === 'none' && <span className="text-2xl">📦</span>}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id!)}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-red-500 flex items-center justify-center transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-1">
                    {language === 'ar' ? plan.nameAr : plan.nameEn}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-white/90 text-sm">
                    <Calendar size={14} />
                    <span>{plan.pricingOptions?.length || 0} {language === 'ar' ? 'خيار' : 'options'}</span>
                  </div>

                  {/* Verification Type Label */}
                  {plan.verificationType !== 'none' && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                      {plan.verificationType === 'blue' && (
                        <>
                          <BadgeCheck size={12} />
                          {language === 'ar' ? 'توثيق أزرق' : 'Blue Verified'}
                        </>
                      )}
                      {plan.verificationType === 'gold' && (
                        <>
                          <Award size={12} />
                          {language === 'ar' ? 'توثيق ذهبي' : 'Gold Verified'}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Plan Details - Pricing Options */}
              <div className="p-6">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">
                    {language === 'ar' ? 'خيارات الأسعار' : 'Pricing Options'}
                  </h4>
                  {plan.pricingOptions && plan.pricingOptions.length > 0 ? (
                    plan.pricingOptions.map((option, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-slate-400" />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {getDurationLabel(option.durationDays)}
                          </span>
                        </div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                          {option.price} {language === 'ar' ? 'ج' : 'EGP'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-center">
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        {language === 'ar' ? 'لا توجد أسعار محددة' : 'No pricing set'}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Verification Badge Display */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {language === 'ar' ? 'التوثيق' : 'Verification'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {plan.verificationType === 'blue' && (
                        <>
                          <BadgeCheck size={16} className="text-blue-500" />
                          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                            {language === 'ar' ? 'أزرق' : 'Blue'}
                          </span>
                        </>
                      )}
                      {plan.verificationType === 'gold' && (
                        <>
                          <Award size={16} className="text-amber-500" />
                          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                            {language === 'ar' ? 'ذهبي' : 'Gold'}
                          </span>
                        </>
                      )}
                      {plan.verificationType === 'none' && (
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                          {language === 'ar' ? 'بدون' : 'None'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {plans.length === 0 && !isCreating && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {language === 'ar' ? 'لا توجد خطط بعد' : 'No plans yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {language === 'ar' 
                ? 'ابدأ بإنشاء أول خطة اشتراك'
                : 'Start by creating your first subscription plan'}
            </p>
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all inline-flex items-center gap-2"
            >
              <Plus size={20} />
              {language === 'ar' ? 'إنشاء خطة' : 'Create Plan'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionPlansNew;
