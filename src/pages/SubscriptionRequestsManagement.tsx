import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, User, Mail, Phone, Calendar, CreditCard, Clock,
  MessageCircle, AlertCircle, Filter, Search
} from 'lucide-react';
import {
  collection, getDocs, updateDoc, doc, query, where, orderBy, getDoc
} from 'firebase/firestore';
import { db } from '@/config/firebase';

interface SubscriptionRequest {
  id: string;
  doctorId: string;
  doctorEmail: string;
  planId: string;
  planName: string;
  planNameAr: string;
  planNameEn: string;
  durationType: string;
  durationLabel: string;
  durationDays: number;
  price: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: any;
}

interface DoctorProfile {
  id: string;
  nameAr?: string;
  name?: string;
  email?: string;
  phone?: string;
  specialization?: string;
  governorate?: string;
  clinicAddress?: string;
  experience?: number;
  totalPatients?: number;
  rating?: number;
}

const SubscriptionRequestsManagement = () => {
  const { t, language } = useLanguage();
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, selectedStatus, searchQuery]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'subscriptionRequestsNew'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SubscriptionRequest[];
      setRequests(requestsData);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(req => req.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.doctorEmail?.toLowerCase().includes(query) ||
        req.planNameAr?.toLowerCase().includes(query) ||
        req.planNameEn?.toLowerCase().includes(query)
      );
    }

    setFilteredRequests(filtered);
  };

  const loadDoctorProfile = async (doctorId: string) => {
    try {
      setLoadingProfile(true);
      const docRef = doc(db, 'users', doctorId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSelectedDoctor({
          id: docSnap.id,
          ...docSnap.data()
        } as DoctorProfile);
      }
    } catch (error) {
      console.error('Error loading doctor profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleApprove = async (request: SubscriptionRequest) => {
    if (!confirm(t('subscriptions.confirmApprove'))) return;

    try {
      await updateDoc(doc(db, 'subscriptionRequestsNew', request.id), {
        status: 'approved',
        approvedAt: new Date()
      });

      // Update doctor's subscription in users collection
      await updateDoc(doc(db, 'users', request.doctorId), {
        subscriptionPlan: request.planId,
        subscriptionPlanName: language === 'ar' ? request.planNameAr : request.planNameEn,
        subscriptionDuration: request.durationDays,
        subscriptionPrice: request.price,
        subscriptionStartDate: new Date(),
        subscriptionEndDate: new Date(Date.now() + request.durationDays * 24 * 60 * 60 * 1000)
      });

      alert(t('subscriptions.requestApproved'));
      loadRequests();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleReject = async (request: SubscriptionRequest) => {
    if (!confirm(t('subscriptions.confirmReject'))) return;

    try {
      await updateDoc(doc(db, 'subscriptionRequestsNew', request.id), {
        status: 'rejected',
        rejectedAt: new Date()
      });

      alert(t('subscriptions.requestRejected'));
      loadRequests();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const openWhatsApp = (phone: string) => {
    if (!phone) {
      alert(language === 'ar' ? 'رقم الهاتف غير متوفر' : 'Phone number not available');
      return;
    }
    
    // Remove any non-digit characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Add Egypt country code if not present
    const phoneWithCode = cleanPhone.startsWith('20') ? cleanPhone : '20' + cleanPhone;
    
    window.open(`https://wa.me/${phoneWithCode}`, '_blank');
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
            {t('subscriptions.manageRequests')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {language === 'ar' 
              ? 'إدارة طلبات اشتراك الأطباء في الخطط المختلفة'
              : 'Manage doctor subscription requests for different plans'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border-2 border-slate-200 dark:border-slate-700"
          >
            <div className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">
              {stats.total}
            </div>
            <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t('subscriptions.totalRequests')}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border-2 border-amber-200 dark:border-amber-700"
          >
            <div className="text-2xl md:text-3xl font-bold text-amber-600 dark:text-amber-400 mb-1">
              {stats.pending}
            </div>
            <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t('subscriptions.pendingRequests')}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border-2 border-green-200 dark:border-green-700"
          >
            <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {stats.approved}
            </div>
            <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t('subscriptions.approvedRequests')}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border-2 border-red-200 dark:border-red-700"
          >
            <div className="text-2xl md:text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              {stats.rejected}
            </div>
            <div className="text-xs md:text-sm text-slate-600 dark:text-slate-400 font-medium">
              {t('subscriptions.rejectedRequests')}
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 border-2 border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ar' ? 'بحث بالبريد أو اسم الخطة...' : 'Search by email or plan name...'}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {t(`subscriptions.${status}`)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border-2 border-slate-200 dark:border-slate-700">
            <AlertCircle size={48} className="text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              {t('subscriptions.noRequests')}
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              {t('subscriptions.noRequestsDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request, index) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                      <div className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${
                        request.status === 'pending'
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          : request.status === 'approved'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {request.status === 'pending' && <Clock size={16} />}
                        {request.status === 'approved' && <Check size={16} />}
                        {request.status === 'rejected' && <X size={16} />}
                        {t(`subscriptions.${request.status}`)}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <Calendar size={16} />
                      {request.createdAt?.toDate ? 
                        request.createdAt.toDate().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                        : language === 'ar' ? 'الآن' : 'Now'
                      }
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Doctor Info */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <User size={18} className="text-blue-600" />
                        {t('subscriptions.doctorName')}
                      </h4>
                      <div className="space-y-2 pl-6">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail size={14} className="text-slate-400" />
                          <span className="text-slate-700 dark:text-slate-300">{request.doctorEmail}</span>
                        </div>
                        <button
                          onClick={() => loadDoctorProfile(request.doctorId)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                        >
                          {t('subscriptions.viewProfile')}
                        </button>
                      </div>
                    </div>

                    {/* Plan Info */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CreditCard size={18} className="text-purple-600" />
                        {t('subscriptions.selectedPlan')}
                      </h4>
                      <div className="space-y-2 pl-6">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          {language === 'ar' ? request.planNameAr : request.planNameEn}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {request.durationLabel} • {request.durationDays} {t('subscriptions.days')}
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {request.price} {t('subscriptions.egp')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {request.status === 'pending' && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => handleApprove(request)}
                        className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={20} />
                        {t('subscriptions.approve')}
                      </button>
                      <button
                        onClick={() => handleReject(request)}
                        className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      >
                        <X size={20} />
                        {t('subscriptions.reject')}
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Doctor Profile Modal */}
        <AnimatePresence>
          {selectedDoctor && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedDoctor(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {loadingProfile ? (
                  <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">{t('common.loading')}</p>
                  </div>
                ) : (
                  <>
                    {/* Header */}
                    <div className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
                      <button
                        onClick={() => setSelectedDoctor(null)}
                        className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
                      >
                        <X size={20} />
                      </button>
                      
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                          {(selectedDoctor.nameAr || selectedDoctor.name || 'D')[0]}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold mb-1">
                            {language === 'ar' ? selectedDoctor.nameAr : selectedDoctor.name}
                          </h2>
                          <p className="text-white/80">{selectedDoctor.specialization}</p>
                        </div>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {t('subscriptions.doctorEmail')}
                          </div>
                          <div className="text-slate-900 dark:text-white font-medium">
                            {selectedDoctor.email || '-'}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {t('subscriptions.doctorPhone')}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 dark:text-white font-medium">
                              {selectedDoctor.phone || '-'}
                            </span>
                            {selectedDoctor.phone && (
                              <button
                                onClick={() => openWhatsApp(selectedDoctor.phone!)}
                                className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-all"
                                title={t('subscriptions.openWhatsApp')}
                              >
                                <MessageCircle size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {language === 'ar' ? 'المحافظة' : 'Governorate'}
                          </div>
                          <div className="text-slate-900 dark:text-white font-medium">
                            {selectedDoctor.governorate || '-'}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {language === 'ar' ? 'سنوات الخبرة' : 'Experience'}
                          </div>
                          <div className="text-slate-900 dark:text-white font-medium">
                            {selectedDoctor.experience || 0} {language === 'ar' ? 'سنة' : 'years'}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {language === 'ar' ? 'عدد المرضى' : 'Total Patients'}
                          </div>
                          <div className="text-slate-900 dark:text-white font-medium">
                            {selectedDoctor.totalPatients || 0}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {language === 'ar' ? 'التقييم' : 'Rating'}
                          </div>
                          <div className="text-slate-900 dark:text-white font-medium">
                            ⭐ {selectedDoctor.rating || 0}/5
                          </div>
                        </div>
                      </div>

                      {selectedDoctor.clinicAddress && (
                        <div>
                          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            {language === 'ar' ? 'عنوان العيادة' : 'Clinic Address'}
                          </div>
                          <div className="text-slate-900 dark:text-white font-medium">
                            {selectedDoctor.clinicAddress}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SubscriptionRequestsManagement;
