import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Crown, Zap, Shield, Check, X, Edit2, Trash2, Plus, 
  DollarSign, Calendar, Users, Star, TrendingUp, Package
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/config/firebase';

interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr: string;
  price: number;
  duration: number; // in days
  features: string[];
  featuresAr: string[];
  color: string;
  icon: string;
  popular: boolean;
  maxDoctors?: number;
  discount?: number;
}

const SubscriptionPlans = () => {
  const { t, language } = useLanguage();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    popularPlan: '',
  });

  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    name: '',
    nameAr: '',
    price: 0,
    duration: 30,
    features: [],
    featuresAr: [],
    color: '#3b82f6',
    icon: 'package',
    popular: false,
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'subscriptionPlans'));
      const plansData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SubscriptionPlan[];
      
      setPlans(plansData);
      calculateStats(plansData);
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (plansData: SubscriptionPlan[]) => {
    const totalRevenue = plansData.reduce((sum, plan) => sum + (plan.price || 0), 0);
    const popularPlan = plansData.find(p => p.popular)?.[language === 'ar' ? 'nameAr' : 'name'] || t('adminDash.none');
    
    setStats({
      totalRevenue,
      activeSubscriptions: plansData.length,
      popularPlan,
    });
  };

  const handleSave = async () => {
    try {
      if (!formData.nameAr || !formData.price) {
        alert(t('adminDash.fillRequiredFields'));
        return;
      }

      const planData = {
        ...formData,
        updatedAt: serverTimestamp(),
      };

      if (editingPlan) {
        await updateDoc(doc(db, 'subscriptionPlans', editingPlan.id), planData);
        alert(t('adminDash.planUpdated'));
      } else {
        await addDoc(collection(db, 'subscriptionPlans'), {
          ...planData,
          createdAt: serverTimestamp(),
        });
        alert(t('adminDash.planAdded'));
      }

      setEditingPlan(null);
      setIsAddingNew(false);
      setFormData({
        name: '',
        nameAr: '',
        price: 0,
        duration: 30,
        features: [],
        featuresAr: [],
        color: '#3b82f6',
        icon: 'package',
        popular: false,
      });
      loadPlans();
    } catch (error: any) {
      alert(t('adminDash.errorOccurred') + ': ' + error.message);
    }
  };

  const handleDelete = async (planId: string) => {
    if (!confirm(t('adminDash.confirmDelete'))) return;

    try {
      await deleteDoc(doc(db, 'subscriptionPlans', planId));
      alert(t('adminDash.planDeleted'));
      loadPlans();
    } catch (error: any) {
      alert(t('adminDash.errorOccurred') + ': ' + error.message);
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData(plan);
    setIsAddingNew(false);
  };

  const getIconComponent = (iconName: string) => {
    const icons: any = {
      crown: Crown,
      zap: Zap,
      shield: Shield,
      package: Package,
      star: Star,
    };
    return icons[iconName] || Package;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('adminDash.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('adminDash.subscriptionPlans')}</h1>
          <p className="text-muted-foreground mt-1">{t('adminDash.manageSubscriptionPlans')}</p>
        </div>
        <button
          onClick={() => {
            setIsAddingNew(true);
            setEditingPlan(null);
            setFormData({
              name: '',
              nameAr: '',
              price: 0,
              duration: 30,
              features: [],
              featuresAr: [],
              color: '#3b82f6',
              icon: 'package',
              popular: false,
            });
          }}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          {t('adminDash.addNewPlan')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} className="opacity-80" />
            <TrendingUp size={24} className="opacity-60" />
          </div>
          <h3 className="text-sm font-medium opacity-90">{t('adminDash.totalExpectedRevenue')}</h3>
          <p className="text-3xl font-bold mt-2">{stats.totalRevenue} {t('adminDash.egp')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Package size={32} className="opacity-80" />
            <Users size={24} className="opacity-60" />
          </div>
          <h3 className="text-sm font-medium opacity-90">{t('adminDash.activePlansCount')}</h3>
          <p className="text-3xl font-bold mt-2">{stats.activeSubscriptions}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <Star size={32} className="opacity-80" />
            <Crown size={24} className="opacity-60" />
          </div>
          <h3 className="text-sm font-medium opacity-90">{t('adminDash.mostPopularPlan')}</h3>
          <p className="text-2xl font-bold mt-2">{stats.popularPlan}</p>
        </motion.div>
      </div>

      {/* Edit/Add Form */}
      {(editingPlan || isAddingNew) && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl border border-border p-8 shadow-xl"
        >
          <h3 className="text-xl font-bold mb-6">
            {editingPlan ? t('adminDash.editPlan') : t('adminDash.addNewPlan')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('adminDash.arabicName')} *</label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                placeholder={language === 'ar' ? 'مثال: الخطة الذهبية' : 'Example: Gold Plan'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('adminDash.englishName')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                placeholder="Gold Plan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('adminDash.priceEgp')} *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('adminDash.durationDays')}</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background"
                placeholder="30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('adminDash.color')}</label>
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full h-12 rounded-lg border border-input bg-background cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('adminDash.icon')}</label>
              <select
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-input bg-background"
              >
                <option value="package">📦 Package</option>
                <option value="crown">👑 Crown</option>
                <option value="zap">⚡ Zap</option>
                <option value="shield">🛡️ Shield</option>
                <option value="star">⭐ Star</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.popular}
                  onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                  className="w-5 h-5 rounded border-input"
                />
                <span className="text-sm font-medium">{t('adminDash.popularPlan')}</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => {
                setEditingPlan(null);
                setIsAddingNew(false);
              }}
              className="px-6 py-3 rounded-lg border border-input hover:bg-muted transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-all"
            >
              {t('common.save')}
            </button>
          </div>
        </motion.div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan, index) => {
          const IconComponent = getIconComponent(plan.icon);
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-card rounded-2xl border-2 border-border p-6 hover:shadow-xl transition-all group"
              style={{ borderColor: plan.popular ? plan.color : undefined }}
            >
              {plan.popular && (
                <div 
                  className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white text-xs font-bold"
                  style={{ backgroundColor: plan.color }}
                >
                  {t('adminDash.mostPopular')}
                </div>
              )}

              <div className="flex items-start justify-between mb-6">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${plan.color}20` }}
                >
                  <IconComponent size={28} style={{ color: plan.color }} />
                </div>
                
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(plan)}
                    className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-foreground mb-2">{language === 'ar' ? plan.nameAr : plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{language === 'ar' ? plan.name : plan.nameAr}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold" style={{ color: plan.color }}>
                  {plan.price}
                </span>
                <span className="text-muted-foreground mr-2">{t('adminDash.egp')}</span>
                <span className="text-sm text-muted-foreground">/ {plan.duration} {t('adminDash.days')}</span>
              </div>

              <div className="space-y-3">
                {(language === 'ar' ? plan.featuresAr : plan.features)?.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
                <span>📅 {plan.duration} {t('adminDash.days')}</span>
                <span>💰 {plan.price} {t('adminDash.egp')}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {plans.length === 0 && !isAddingNew && (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-bold text-foreground mb-2">{t('adminDash.noPlansYet')}</h3>
          <p className="text-muted-foreground mb-6">{t('adminDash.startAddingPlan')}</p>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-all inline-flex items-center gap-2"
          >
            <Plus size={20} />
            {t('adminDash.addNewPlan')}
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
