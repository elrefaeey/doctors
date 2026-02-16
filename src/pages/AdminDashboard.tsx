import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import SubscriptionBadge from '@/components/SubscriptionBadge';
import { Link } from 'react-router-dom';
import {
  addDoctor,
  getAllDoctors,
  getSubscriptionPlans,
  getPendingRequests,
  getSpecializations,
  updateDoctorInfo,
  toggleDoctorFeaturedStatus,
  getPlatformSettings,
  updatePlatformSettings,
  getSubscriptionRequests,
  updateSubscriptionRequestStatus,
  getAllUsers,
  deleteUser,
  deleteSpecialization,
  updateSpecialization
} from '@/services/firebaseService';
import { db } from '@/config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  LayoutDashboard, Users, FileCheck, CreditCard, UserCog, BarChart3, Bell, Settings, Stethoscope, Menu, X, Check, XCircle, Plus, Star, Image as ImageIcon, Trash2, Heart, UserPlus, ShieldCheck, LogOut, Edit
} from 'lucide-react';
import DoctorRequests from './DoctorRequests';
import SubscriptionPlansNew from './SubscriptionPlansNew';
import SubscriptionRequestsManagement from './SubscriptionRequestsManagement';
import FeaturedDoctorsManagement from './FeaturedDoctorsManagement';
import { useAuth } from '@/contexts/AuthContext';

type Section = 'overview' | 'doctors' | 'featuredDoctors' | 'doctorRequests' | 'approvals' | 'subscriptions' | 'subscriptionPlans' | 'users' | 'reports' | 'notifications' | 'settings' | 'specializations';

const AdminDashboard = () => {
  const { isAdmin, currentUser, signOut } = useAuth();
  const { language, t, setLanguage } = useLanguage();
  const [section, setSection] = useState<Section>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAddingDoctor, setIsAddingDoctor] = useState(false);
  const [isAddingSpecialization, setIsAddingSpecialization] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [editingSpecialization, setEditingSpecialization] = useState<any>(null);
  const [doctorList, setDoctorList] = useState<any[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [subscriptionRequests, setSubscriptionRequests] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [platformSettings, setPlatformSettings] = useState<any>({ heroImages: [] });
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [newDoctor, setNewDoctor] = useState({
    name: '',
    nameAr: '',
    email: '',
    password: '',
    specialization: '',
    governorate: '',
    price: '',
    clinicAddress: '',
    experience: '0',
    subscriptionType: 'silver',
    totalPatients: 0,
    rating: 0,
    totalReviews: 0
  });

  const [newSpecialization, setNewSpecialization] = useState({
    key: '',
    nameAr: '',
    nameEn: '',
    icon: '',
  });

  // Egyptian Governorates
  const egyptianGovernorates = [
    'القاهرة',
    'الجيزة',
    'الإسكندرية',
    'الدقهلية',
    'البحر الأحمر',
    'البحيرة',
    'الفيوم',
    'الغربية',
    'الإسماعيلية',
    'المنوفية',
    'المنيا',
    'القليوبية',
    'الوادي الجديد',
    'الشرقية',
    'السويس',
    'أسوان',
    'أسيوط',
    'بني سويف',
    'بورسعيد',
    'دمياط',
    'الأقصر',
    'قنا',
    'كفر الشيخ',
    'مطروح',
    'سوهاج',
    'شمال سيناء',
    'جنوب سيناء',
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctors, plans, requests, specs, subRequests, settings, users] = await Promise.all([
        getAllDoctors(),
        getSubscriptionPlans(),
        getPendingRequests(),
        getSpecializations(),
        getSubscriptionRequests(),
        getPlatformSettings(),
        getAllUsers()
      ]);
      setDoctorList(doctors);
      setSubscriptionPlans(plans);
      setPendingApprovals(requests);
      setSpecializations(specs);
      setSubscriptionRequests(subRequests);
      setUsersList(users);
      setPlatformSettings(settings || { heroImages: [] });
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
  };

  const handleSaveDoctor = async () => {
    try {
      if (!newDoctor.email || !newDoctor.password || !newDoctor.nameAr) {
        alert(t('adminDash.fillBasicFields'));
        return;
      }
      await addDoctor({
        ...newDoctor,
        subscriptionType: newDoctor.subscriptionType,
        governorate: newDoctor.governorate,
        workingHours: {},
        experience: Number(newDoctor.experience) || 0,
        totalPatients: Number(newDoctor.totalPatients) || 0,
        rating: Number(newDoctor.rating) || 0,
        totalReviews: Number(newDoctor.totalReviews) || 0,
        consultationPrice: Number(newDoctor.price) || 0,
        bio: '',
        role: 'doctor'
      });
      alert(t('adminDash.doctorAddedSuccess'));
      setIsAddingDoctor(false);
      setNewDoctor({
        name: '',
        nameAr: '',
        email: '',
        password: '',
        specialization: '',
        governorate: '',
        price: '',
        clinicAddress: '',
        experience: '0',
        subscriptionType: 'silver',
        totalPatients: 0,
        rating: 0,
        totalReviews: 0
      });
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(t('adminDash.errorOccurredTryAgain') + ': ' + (error.message || ''));
    }
  };

  const handleSpecializationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSpecialization({ ...newSpecialization, [e.target.name]: e.target.value });
  };

  const handleSaveSpecialization = async () => {
    try {
      if (!newSpecialization.key || !newSpecialization.nameAr || !newSpecialization.nameEn) {
        alert(t('adminDash.fillAllRequiredFields'));
        return;
      }

      await addDoc(collection(db, 'specializations'), {
        key: newSpecialization.key,
        nameAr: newSpecialization.nameAr,
        nameEn: newSpecialization.nameEn,
        icon: newSpecialization.icon || '🩺',
        createdAt: serverTimestamp(),
      });

      alert(t('adminDash.specializationAddedSuccess'));
      setIsAddingSpecialization(false);
      setNewSpecialization({ key: '', nameAr: '', nameEn: '', icon: '' });
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(t('adminDash.errorOccurredTryAgain') + ': ' + (error.message || ''));
    }
  };

  const handleUpdateSpecialization = async () => {
    try {
      if (!editingSpecialization) return;
      if (!editingSpecialization.key || !editingSpecialization.nameAr || !editingSpecialization.nameEn) {
        alert(t('adminDash.fillAllRequiredFields'));
        return;
      }

      await updateSpecialization(editingSpecialization.id, {
        key: editingSpecialization.key,
        nameAr: editingSpecialization.nameAr,
        nameEn: editingSpecialization.nameEn,
      });

      alert(language === 'ar' ? 'تم تحديث التخصص بنجاح' : 'Specialization updated successfully');
      setEditingSpecialization(null);
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(t('adminDash.errorOccurredTryAgain') + ': ' + (error.message || ''));
    }
  };

  const handleDeleteSpecialization = async (specId: string, specKey: string, specName: string) => {
    const confirmMessage = language === 'ar'
      ? `⚠️ هل أنت متأكد تماماً من حذف تخصص "${specName}"؟\n\nتنبيه هام جداً: سيتم حذف جميع الأطباء المسجلين بهذا التخصص وأي بيانات مرتبطة بهم بشكل نهائي.\n\nهذا الإجراء لا يمكن التراجع عنه!`
      : `⚠️ Are you sure you want to delete "${specName}" specialization?\n\nCRITICAL WARNING: All doctors registered with this specialization and their related data will be PERMANENTLY deleted.\n\nThis action cannot be undone!`;

    if (confirm(confirmMessage)) {
      // Double confirmation for safety
      const doubleConfirm = prompt(language === 'ar' ? `للتأكيد، اكتب "حذف" في المربع أدناه (بدون علامات تنصيص)` : `Type "DELETE" to confirm (no quotes)`);

      if ((language === 'ar' && doubleConfirm === 'حذف') || (language === 'en' && doubleConfirm === 'DELETE') || doubleConfirm === 'DELETE') {
        try {
          setLoading(true);
          await deleteSpecialization(specId, specKey);
          alert(language === 'ar' ? 'تم حذف التخصص وجميع البيانات المرتبطة بنجاح' : 'Specialization and all related data deleted successfully');
          fetchData();
        } catch (error: any) {
          console.error(error);
          alert(t('adminDash.errorOccurredTryAgain') + ': ' + (error.message || ''));
        } finally {
          setLoading(false);
        }
      } else {
        alert(language === 'ar' ? 'إلغاء عملية الحذف: كلمة التأكيد غير صحيحة' : 'Deletion cancelled: Incorrect confirmation text');
      }
    }
  };

  const handleEditDoctor = (doctor: any) => {
    setEditingDoctor({
      id: doctor.id,
      nameAr: doctor.nameAr || doctor.displayName || '',
      name: doctor.name || '',
      specialization: doctor.specialization || '',
      bio: doctor.bio || '',
      clinicAddress: doctor.clinicAddress || doctor.address || '',
      phone: doctor.phone || '',
      experience: doctor.experience || 0,
      totalPatients: doctor.totalPatients || 0,
      rating: doctor.rating || 0,
      consultationPrice: doctor.consultationPrice || 0,
      totalReviews: doctor.totalReviews || 0,
      governorate: doctor.governorate || '',
    });
  };

  const handleUpdateDoctor = async () => {
    try {
      if (!editingDoctor) return;

      await updateDoctorInfo(editingDoctor.id, {
        experience: editingDoctor.experience,
        totalPatients: editingDoctor.totalPatients,
        rating: editingDoctor.rating,
        consultationPrice: editingDoctor.consultationPrice,
        totalReviews: editingDoctor.totalReviews,
      });


      alert(t('adminDash.doctorInfoUpdatedSuccess'));
      setEditingDoctor(null);
      fetchData();
    } catch (error: any) {
      console.error(error);
      alert(t('adminDash.errorOccurredTryAgain') + ': ' + (error.message || ''));
    }
  };

  const handleToggleFeatured = async (doctorId: string, currentStatus: boolean) => {
    try {
      await toggleDoctorFeaturedStatus(doctorId, !currentStatus);
      setDoctorList(prev => prev.map(d => d.id === doctorId ? { ...d, isFeatured: !currentStatus } : d));
    } catch (e) {
      alert(t('adminDash.errorUpdatingFeaturedStatus'));
    }
  };

  const handleApproveSubscription = async (req: any) => {
    try {
      await updateSubscriptionRequestStatus(req.id, req.doctorId, 'approved', req.targetLevel);
      alert(t('adminDash.upgradeRequestApproved'));
      fetchData();
    } catch (e) {
      alert(t('adminDash.errorDuringApproval'));
    }
  };

  const handleRejectSubscription = async (req: any) => {
    try {
      await updateSubscriptionRequestStatus(req.id, req.doctorId, 'rejected');
      alert(t('adminDash.requestRejected'));
      fetchData();
    } catch (e) {
      alert(t('adminDash.errorDuringRejection'));
    }
  };

  const handleDeleteUser = async (userId: string, userName: string, userRole: string) => {
    const roleText = userRole === 'doctor' ? t('adminDash.doctor') : userRole === 'admin' ? t('adminDash.admin') : t('adminDash.patient');

    const confirmMessage = language === 'ar'
      ? `⚠️ ${t('adminDash.confirmDeleteUser')} ${roleText} "${userName}"?\n\n${t('adminDash.willDelete')}:\n• ${t('adminDash.account')}\n• ${t('adminDash.allRelatedData')}\n• ${t('adminDash.appointments')}\n• ${t('adminDash.chats')}\n• ${t('adminDash.notificationsData')}\n\n⚠️ ${t('adminDash.cannotUndo')}!`
      : `⚠️ ${t('adminDash.confirmDeleteUser')} ${roleText} "${userName}"?\n\n${t('adminDash.willDelete')}:\n• ${t('adminDash.account')}\n• ${t('adminDash.allRelatedData')}\n• ${t('adminDash.appointments')}\n• ${t('adminDash.chats')}\n• ${t('adminDash.notificationsData')}\n\n⚠️ ${t('adminDash.cannotUndo')}!`;

    if (!confirm(confirmMessage)) {
      return;
    }

    // Prevent deleting yourself
    if (userId === currentUser?.uid) {
      alert('❌ ' + t('adminDash.cannotDeleteOwnAccount'));
      return;
    }

    setLoading(true);
    try {
      await deleteUser(userId, userRole);
      alert(`✅ ${t('adminDash.userDeletedSuccess')}: ${roleText} "${userName}"`);
      await fetchData();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      alert('❌ ' + t('adminDash.errorDuringDeletion') + ': ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const removeHeroImage = async (imageToRemove: any) => {
    try {
      const newImages = platformSettings.heroImages.filter((img: any) => {
        const urlA = typeof img === 'string' ? img : img.url;
        const urlToRemove = typeof imageToRemove === 'string' ? imageToRemove : imageToRemove.url;
        return urlA !== urlToRemove;
      });
      await updatePlatformSettings({ ...platformSettings, heroImages: newImages });
      setPlatformSettings({ ...platformSettings, heroImages: newImages });
    } catch (e) {
      alert(t('adminDash.errorDeletingImage'));
    }
  };

  const sidebarItems: { key: Section; labelAr: string; labelEn: string; icon: any }[] = [
    { key: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', icon: LayoutDashboard },
    { key: 'doctors', labelAr: 'الأطباء', labelEn: 'Doctors', icon: Stethoscope },
    { key: 'featuredDoctors', labelAr: 'الأطباء المميزين', labelEn: 'Featured Doctors', icon: Star },
    { key: 'doctorRequests', labelAr: 'طلبات الأطباء', labelEn: 'Doctor Requests', icon: UserPlus },
    { key: 'specializations', labelAr: 'التخصصات', labelEn: 'Specializations', icon: Users },
    { key: 'approvals', labelAr: 'الموافقات', labelEn: 'Approvals', icon: FileCheck },
    { key: 'subscriptions', labelAr: 'طلبات الاشتراكات', labelEn: 'Subscription Requests', icon: CreditCard },
    { key: 'subscriptionPlans', labelAr: 'خطط الاشتراكات', labelEn: 'Subscription Plans', icon: ShieldCheck },
    { key: 'users', labelAr: 'المستخدمين', labelEn: 'Users', icon: UserCog },
    { key: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', icon: Settings },
  ];

  const overviewStats = [
    { labelAr: 'إجمالي الأطباء', labelEn: 'Total Doctors', value: doctorList.length.toString(), icon: Stethoscope },
    { labelAr: 'إجمالي المستخدمين', labelEn: 'Total Users', value: usersList.length.toString(), icon: Users },
    { labelAr: 'إجمالي المرضى', labelEn: 'Total Patients', value: usersList.filter(u => u.role === 'patient').length.toString(), icon: UserCog },
    { labelAr: 'طلبات الانضمام', labelEn: 'Join Requests', value: pendingApprovals.filter(r => r.status === 'pending').length.toString(), icon: FileCheck },
    { labelAr: 'الأطباء الأكثر اختياراً', labelEn: 'Featured Doctors', value: doctorList.filter(d => d.isFeatured).length.toString(), icon: Star },
  ];

  if (!isAdmin && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-8 bg-card rounded-2xl border border-border shadow-xl">
          <ShieldCheck size={48} className="text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">{language === 'ar' ? 'وصول مرفوض' : 'Access Denied'}</h2>
          <p className="text-muted-foreground mb-6">{language === 'ar' ? 'ليس لديك صلاحية للوصول إلى هذه الصفحة.' : 'You do not have permission to access this page.'}</p>
          <Link to="/" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-bold">{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {loading ? (
        <div className="flex items-center justify-center w-full min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{t('common.loading')}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Sidebar */}
          <aside className={`fixed inset-y-0 ${language === 'ar' ? 'right-0' : 'left-0'} z-50 w-64 bg-card border-e border-border transform transition-transform lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : (language === 'ar' ? 'translate-x-full' : '-translate-x-full')}`}>
            <div className="p-5 flex items-center justify-between border-b border-border">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Stethoscope size={16} className="text-primary-foreground" />
                </div>
                <span className="font-bold text-foreground text-sm">{language === 'ar' ? 'لوحة تحكم هيلث كونكت' : 'Health Connect Admin'}</span>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="lg:hidden"><X size={20} /></button>
            </div>
            <nav className="px-3 py-4 space-y-1 pb-20">
              {sidebarItems.map(item => (
                <button
                  key={item.key}
                  onClick={() => { setSection(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${section === item.key ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                    }`}
                >
                  <item.icon size={16} />
                  {language === 'ar' ? item.labelAr : item.labelEn}
                </button>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border bg-card">
              <button
                onClick={async () => {
                  await signOut();
                  window.location.href = '/';
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={16} />
                {language === 'ar' ? 'تسجيل خروج' : 'Logout'}
              </button>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-h-screen relative">
            {/* Mobile Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            <header className="h-14 border-b border-border bg-card flex items-center justify-between px-3 md:px-6 sticky top-0 z-30">
              <div className="flex items-center gap-2">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 hover:bg-muted rounded-lg"><Menu size={18} /></button>
                <h2 className="text-sm md:text-lg font-semibold text-foreground truncate">{language === 'ar' ? sidebarItems.find(i => i.key === section)?.labelAr : sidebarItems.find(i => i.key === section)?.labelEn}</h2>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <div className="flex items-center bg-muted rounded-lg p-0.5">
                  <button onClick={() => setLanguage('en')} className={`px-2 py-1 text-[10px] md:text-xs font-medium rounded ${language === 'en' ? 'bg-card shadow-sm' : ''}`}>EN</button>
                  <button onClick={() => setLanguage('ar')} className={`px-2 py-1 text-[10px] md:text-xs font-medium rounded ${language === 'ar' ? 'bg-card shadow-sm' : ''}`}>AR</button>
                </div>
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-primary flex items-center justify-center text-xs md:text-sm font-bold text-primary-foreground">A</div>
              </div>
            </header>

            <main className="p-3 md:p-6 lg:p-8">
              {section === 'overview' && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
                  {overviewStats.map(s => (
                    <div key={language === 'ar' ? s.labelAr : s.labelEn} className="bg-card rounded-xl md:rounded-2xl border border-border p-3 md:p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-primary/5 flex items-center justify-center mb-2 md:mb-4`}>
                        <s.icon size={16} className="text-primary md:hidden" />
                        <s.icon size={22} className="text-primary hidden md:block" />
                      </div>
                      <div className="text-xl md:text-3xl font-bold text-foreground">{s.value}</div>
                      <p className="text-[10px] md:text-sm text-muted-foreground mt-0.5 md:mt-1 font-medium leading-tight">{language === 'ar' ? s.labelAr : s.labelEn}</p>
                    </div>
                  ))}
                </div>
              )}

              {section === 'doctors' && (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <h3 className="text-lg md:text-xl font-bold">{language === 'ar' ? 'إدارة الأطباء' : 'Manage Doctors'}</h3>
                    <button
                      onClick={() => setIsAddingDoctor(!isAddingDoctor)}
                      className="w-full sm:w-auto px-4 md:px-6 py-2 md:py-2.5 bg-primary text-primary-foreground rounded-lg md:rounded-xl text-xs md:text-sm font-bold hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} className="md:hidden" />
                      <Plus size={18} className="hidden md:block" />
                      {isAddingDoctor ? (language === 'ar' ? 'إلغاء' : 'Cancel') : (language === 'ar' ? 'إضافة دكتور جديد' : 'Add New Doctor')}
                    </button>
                  </div>

                  {isAddingDoctor && (
                    <div className="bg-card rounded-xl md:rounded-2xl border border-border p-4 md:p-6 shadow-xl animate-in fade-in slide-in-from-top-4">
                      <h3 className="text-base md:text-lg font-bold mb-4 md:mb-6">{language === 'ar' ? 'بيانات الطبيب الجديد' : 'New Doctor Information'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">الاسم الإنجليزي</label>
                          <input name="name" value={newDoctor.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="Dr. John Doe" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">الاسم العربي</label>
                          <input name="nameAr" value={newDoctor.nameAr} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="د. أحمد محمد" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">البريد الإلكتروني</label>
                          <input name="email" value={newDoctor.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="doctor@example.com" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">كلمة المرور</label>
                          <input name="password" value={newDoctor.password} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="••••••••" type="password" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">التخصص</label>
                          <select
                            name="specialization"
                            value={newDoctor.specialization}
                            onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          >
                            <option value="">{language === 'ar' ? 'اختر التخصص' : 'Select Specialization'}</option>
                            {specializations.map(spec => (
                              <option key={spec.id} value={spec.key}>
                                {spec.icon} {language === 'ar' ? spec.nameAr : spec.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">المحافظة</label>
                          <select
                            name="governorate"
                            value={newDoctor.governorate}
                            onChange={(e) => setNewDoctor({ ...newDoctor, governorate: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          >
                            <option value="">{language === 'ar' ? 'اختر المحافظة' : 'Select Governorate'}</option>
                            {egyptianGovernorates.map(gov => (
                              <option key={gov} value={gov}>
                                {gov}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">سعر الكشف ($)</label>
                          <input name="price" value={newDoctor.price} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="50" type="number" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">سنوات الخبرة</label>
                          <input name="experience" value={newDoctor.experience} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="10" type="number" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">عدد المرضى</label>
                          <input name="totalPatients" value={newDoctor.totalPatients} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="500" type="number" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">التقييم (من 5)</label>
                          <input name="rating" value={newDoctor.rating} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="4.5" type="number" step="0.1" min="0" max="5" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">عدد المراجعات</label>
                          <input name="totalReviews" value={newDoctor.totalReviews} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="120" type="number" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">نوع الاشتراك</label>
                          <select
                            name="subscriptionType"
                            value={newDoctor.subscriptionType}
                            onChange={(e) => setNewDoctor({ ...newDoctor, subscriptionType: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                          >
                            <option value="silver">Silver - فضي</option>
                            <option value="gold">Gold - ذهبي</option>
                            <option value="blue">Blue - أزرق</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-muted-foreground">عنوان العيادة</label>
                          <input name="clinicAddress" value={newDoctor.clinicAddress} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 transition-all outline-none" placeholder="شارع، مدينة" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3">
                        <button onClick={() => setIsAddingDoctor(false)} className="px-6 py-3 text-muted-foreground font-bold hover:bg-muted rounded-xl transition-all">{t('common.cancel')}</button>
                        <button onClick={handleSaveDoctor} className="px-10 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">{t('adminDash.saveData')}</button>
                      </div>
                    </div>
                  )}

                  {editingDoctor && (
                    <div className="bg-card rounded-xl border border-border p-6 animate-in slide-in-from-top-4">
                      <h3 className="text-lg font-semibold mb-4">{language === 'ar' ? 'تعديل معلومات الطبيب' : 'Edit Doctor Information'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">الاسم بالعربي</label>
                          <input
                            type="text"
                            value={editingDoctor.nameAr}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, nameAr: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="د. أحمد محمد"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">الاسم بالإنجليزي</label>
                          <input
                            type="text"
                            value={editingDoctor.name}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="Dr. Ahmed Mohamed"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">التخصص</label>
                          <select
                            value={editingDoctor.specialization}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, specialization: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                          >
                            <option value="">{language === 'ar' ? 'اختر التخصص' : 'Select Specialization'}</option>
                            {specializations.map(spec => (
                              <option key={spec.id} value={spec.key}>
                                {spec.icon} {language === 'ar' ? spec.nameAr : spec.nameEn}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">رقم الهاتف</label>
                          <input
                            type="tel"
                            value={editingDoctor.phone}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, phone: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="01xxxxxxxxx"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">المحافظة</label>
                          <select
                            value={editingDoctor.governorate}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, governorate: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                          >
                            <option value="">{language === 'ar' ? 'اختر المحافظة' : 'Select Governorate'}</option>
                            {egyptianGovernorates.map(gov => (
                              <option key={gov} value={gov}>
                                {gov}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">عنوان العيادة</label>
                          <input
                            type="text"
                            value={editingDoctor.clinicAddress}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, clinicAddress: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="شارع، مبنى، رقم"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">سنوات الخبرة</label>
                          <input
                            type="number"
                            value={editingDoctor.experience}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, experience: Number(e.target.value) })}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="مثال: 10"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">عدد المرضى</label>
                          <input
                            type="number"
                            value={editingDoctor.totalPatients}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, totalPatients: Number(e.target.value) })}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="مثال: 500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">التقييم (من 5)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="5"
                            value={editingDoctor.rating}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, rating: Number(e.target.value) })}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="مثال: 4.5"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">عدد المراجعات</label>
                          <input
                            type="number"
                            value={editingDoctor.totalReviews}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, totalReviews: Number(e.target.value) })}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="مثال: 120"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1.5">سعر الكشف (جنيه)</label>
                          <input
                            type="number"
                            value={editingDoctor.consultationPrice}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, consultationPrice: Number(e.target.value) })}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background"
                            placeholder="مثال: 500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-foreground mb-1.5">نبذة مختصرة</label>
                          <textarea
                            value={editingDoctor.bio}
                            onChange={(e) => setEditingDoctor({ ...editingDoctor, bio: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 rounded-lg border border-input bg-background resize-none"
                            placeholder="نبذة عن الطبيب وخبراته..."
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingDoctor(null)} className="px-4 py-2 text-muted-foreground hover:bg-muted rounded-lg">{t('common.cancel')}</button>
                        <button onClick={handleUpdateDoctor} className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium">{t('common.save')}</button>
                      </div>
                    </div>
                  )}

                  {/* Desktop Table View */}
                  <div className="hidden md:block bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="text-start px-4 sm:px-6 py-4 font-bold text-muted-foreground">تثبيت</th>
                            <th className="text-start px-4 sm:px-6 py-4 font-bold text-muted-foreground">اسم الطبيب</th>
                            <th className="text-start px-4 sm:px-6 py-4 font-bold text-muted-foreground">الإيميل</th>
                            <th className="text-start px-4 sm:px-6 py-4 font-bold text-muted-foreground">التخصص</th>
                            <th className="text-start px-4 sm:px-6 py-4 font-bold text-muted-foreground">التقييم</th>
                            <th className="text-start px-4 sm:px-6 py-4 font-bold text-muted-foreground">الاشتراك</th>
                            <th className="text-start px-4 sm:px-6 py-4 font-bold text-muted-foreground">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {doctorList.map(doc => (
                            <tr key={doc.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-4 sm:px-6 py-4">
                                <button
                                  onClick={() => handleToggleFeatured(doc.id, doc.isFeatured || false)}
                                  className={`p-2 rounded-lg transition-all ${doc.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-muted-foreground/30 hover:text-amber-500 hover:bg-amber-50/50'}`}
                                >
                                  <Star size={18} fill={doc.isFeatured ? "currentColor" : "none"} />
                                </button>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <a 
                                  href={`/doctors/${doc.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex flex-col hover:opacity-70 transition-opacity group"
                                >
                                  <span className="font-bold text-foreground group-hover:text-primary transition-colors">{doc.nameAr}</span>
                                  <span className="text-xs text-muted-foreground">{doc.name}</span>
                                </a>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <span className="text-xs text-muted-foreground">{doc.email}</span>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <span className="px-3 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium">
                                  {doc.specialization}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 font-bold text-foreground">
                                ⭐️ {doc.rating || 0} <span className="text-xs text-muted-foreground font-normal">({doc.totalReviews || 0})</span>
                              </td>
                              <td className="px-4 sm:px-6 py-4"><SubscriptionBadge level={doc.subscriptionType || 'silver'} size="sm" /></td>
                              <td className="px-4 sm:px-6 py-4">
                                <button
                                  onClick={() => handleEditDoctor(doc)}
                                  className="px-4 py-1.5 rounded-lg border border-border hover:border-primary hover:text-primary transition-all text-xs font-bold"
                                >
                                  {language === 'ar' ? 'تعديل' : 'Edit'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Mobile Cards View */}
                  <div className="md:hidden space-y-3">
                    {doctorList.map(doc => (
                      <div key={doc.id} className="bg-card rounded-xl border border-border p-4 shadow-sm">
                        {/* Header with Star and Name */}
                        <div className="flex items-start gap-3 mb-3">
                          <button
                            onClick={() => handleToggleFeatured(doc.id, doc.isFeatured || false)}
                            className={`p-2 rounded-lg transition-all flex-shrink-0 ${doc.isFeatured ? 'text-amber-500 bg-amber-50' : 'text-muted-foreground/30 hover:text-amber-500 hover:bg-amber-50/50'}`}
                          >
                            <Star size={18} fill={doc.isFeatured ? "currentColor" : "none"} />
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <a 
                              href={`/doctors/${doc.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block hover:opacity-70 transition-opacity"
                            >
                              <h3 className="font-bold text-foreground text-base mb-0.5">{doc.nameAr}</h3>
                              <p className="text-xs text-muted-foreground">{doc.name}</p>
                            </a>
                          </div>

                          <SubscriptionBadge level={doc.subscriptionType || 'silver'} size="sm" />
                        </div>

                        {/* Email */}
                        <div className="mb-3 pb-3 border-b border-border">
                          <div className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'الإيميل' : 'Email'}</div>
                          <div className="text-sm text-foreground break-all">{doc.email}</div>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'التخصص' : 'Specialization'}</div>
                            <span className="inline-block px-2 py-1 rounded-lg bg-accent text-accent-foreground text-xs font-medium">
                              {doc.specialization}
                            </span>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">{language === 'ar' ? 'التقييم' : 'Rating'}</div>
                            <div className="font-bold text-foreground text-sm">
                              ⭐️ {doc.rating || 0} <span className="text-xs text-muted-foreground font-normal">({doc.totalReviews || 0})</span>
                            </div>
                          </div>
                        </div>

                        {/* Edit Button */}
                        <button
                          onClick={() => handleEditDoctor(doc)}
                          className="w-full py-2 rounded-lg border border-border hover:border-primary hover:text-primary transition-all text-sm font-bold"
                        >
                          {language === 'ar' ? 'تعديل' : 'Edit'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {section === 'specializations' && (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsAddingSpecialization(!isAddingSpecialization)}
                      className="px-3 md:px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs md:text-sm font-medium hover:opacity-90 flex items-center gap-2"
                    >
                      <Plus size={14} className="md:hidden" />
                      <Plus size={16} className="hidden md:block" />
                      {isAddingSpecialization ? (language === 'ar' ? 'إلغاء' : 'Cancel') : (language === 'ar' ? 'إضافة تخصص' : 'Add Specialization')}
                    </button>
                  </div>

                  {isAddingSpecialization && (
                    <div className="bg-card rounded-xl border border-border p-4 md:p-6 animate-in slide-in-from-top-4">
                      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{language === 'ar' ? 'إضافة تخصص جديد' : 'Add New Specialization'}</h3>
                      <div className="grid grid-cols-1 gap-3 md:gap-4 mb-4">
                        <input
                          name="key"
                          value={newSpecialization.key}
                          onChange={handleSpecializationInputChange}
                          className="px-3 md:px-4 py-2 rounded-lg border border-input bg-background text-sm"
                          placeholder={language === 'ar' ? 'المفتاح بالإنجليزية (مثال: cardiology)' : 'Key in English (e.g. cardiology)'}
                        />
                        <input
                          name="nameAr"
                          value={newSpecialization.nameAr}
                          onChange={handleSpecializationInputChange}
                          className="px-3 md:px-4 py-2 rounded-lg border border-input bg-background text-sm"
                          placeholder={language === 'ar' ? 'الاسم بالعربية (مثال: أمراض القلب)' : 'Name in Arabic'}
                        />
                        <input
                          name="nameEn"
                          value={newSpecialization.nameEn}
                          onChange={handleSpecializationInputChange}
                          className="px-3 md:px-4 py-2 rounded-lg border border-input bg-background text-sm"
                          placeholder={language === 'ar' ? 'الاسم بالإنجليزية (مثال: Cardiology)' : 'Name in English (e.g. Cardiology)'}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setIsAddingSpecialization(false)}
                          className="px-3 md:px-4 py-2 text-xs md:text-sm text-muted-foreground hover:bg-muted rounded-lg"
                        >
                          {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          onClick={handleSaveSpecialization}
                          className="px-4 md:px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-xs md:text-sm"
                        >
                          {language === 'ar' ? 'حفظ' : 'Save'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Edit Specialization Modal/Form */}
                  {editingSpecialization && (
                    <div className="bg-card rounded-xl border border-border p-4 md:p-6 animate-in slide-in-from-top-4 mb-4">
                      <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">{language === 'ar' ? 'تعديل التخصص' : 'Edit Specialization'}</h3>
                      <div className="grid grid-cols-1 gap-3 md:gap-4 mb-4">
                        <input
                          value={editingSpecialization.key}
                          onChange={(e) => setEditingSpecialization({ ...editingSpecialization, key: e.target.value })}
                          className="px-3 md:px-4 py-2 rounded-lg border border-input bg-background text-sm"
                          placeholder={language === 'ar' ? 'المفتاح بالإنجليزية' : 'Key'}
                        />
                        <input
                          value={editingSpecialization.nameAr}
                          onChange={(e) => setEditingSpecialization({ ...editingSpecialization, nameAr: e.target.value })}
                          className="px-3 md:px-4 py-2 rounded-lg border border-input bg-background text-sm"
                          placeholder={language === 'ar' ? 'الاسم بالعربية' : 'Name (Arabic)'}
                        />
                        <input
                          value={editingSpecialization.nameEn}
                          onChange={(e) => setEditingSpecialization({ ...editingSpecialization, nameEn: e.target.value })}
                          className="px-3 md:px-4 py-2 rounded-lg border border-input bg-background text-sm"
                          placeholder={language === 'ar' ? 'الاسم بالإنجليزية' : 'Name (English)'}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingSpecialization(null)}
                          className="px-3 md:px-4 py-2 text-xs md:text-sm text-muted-foreground hover:bg-muted rounded-lg"
                        >
                          {language === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                          onClick={handleUpdateSpecialization}
                          className="px-4 md:px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-xs md:text-sm"
                        >
                          {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-card rounded-xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs md:text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-start px-3 md:px-5 py-2 md:py-3 font-medium text-muted-foreground text-[10px] md:text-sm">{language === 'ar' ? 'المفتاح' : 'Key'}</th>
                            <th className="text-start px-3 md:px-5 py-2 md:py-3 font-medium text-muted-foreground text-[10px] md:text-sm">{language === 'ar' ? 'الاسم بالعربية' : 'Name (Arabic)'}</th>
                            <th className="text-start px-3 md:px-5 py-2 md:py-3 font-medium text-muted-foreground text-[10px] md:text-sm hidden sm:table-cell">{language === 'ar' ? 'الاسم بالإنجليزية' : 'Name (English)'}</th>
                            <th className="text-start px-3 md:px-5 py-2 md:py-3 font-medium text-muted-foreground text-[10px] md:text-sm">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {specializations.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-3 md:px-5 py-6 md:py-8 text-center text-muted-foreground text-xs md:text-sm">
                                {language === 'ar' ? 'لا توجد تخصصات. قم بإضافة تخصص جديد.' : 'No specializations. Add a new one.'}
                              </td>
                            </tr>
                          ) : (
                            specializations.map(spec => (
                              <tr key={spec.id} className="hover:bg-muted/30">
                                <td className="px-3 md:px-5 py-3 md:py-4 font-medium text-foreground text-xs md:text-sm">{spec.key}</td>
                                <td className="px-3 md:px-5 py-3 md:py-4 text-muted-foreground text-xs md:text-sm">{spec.nameAr}</td>
                                <td className="px-3 md:px-5 py-3 md:py-4 text-muted-foreground text-xs md:text-sm hidden sm:table-cell">{spec.nameEn}</td>
                                <td className="px-3 md:px-5 py-3 md:py-4">
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setEditingSpecialization(spec)}
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title={language === 'ar' ? 'تعديل' : 'Edit'}
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSpecialization(spec.id, spec.key, language === 'ar' ? spec.nameAr : spec.nameEn)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title={language === 'ar' ? 'حذف' : 'Delete'}
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {section === 'doctorRequests' && <DoctorRequests />}

              {section === 'approvals' && (
                <div className="space-y-8">
                  {/* Subscription Upgrade Requests */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <CreditCard className="text-primary" />
                      {t('adminDash.subscriptionUpgradeRequests')}
                    </h3>
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="text-start px-6 py-4 font-bold">{t('adminDash.doctorName')}</th>
                            <th className="text-start px-6 py-4 font-bold">{language === 'ar' ? 'الخطة المطلوبة' : 'Requested Plan'}</th>
                            <th className="text-start px-6 py-4 font-bold">{language === 'ar' ? 'التاريخ' : 'Date'}</th>
                            <th className="text-end px-6 py-4 font-bold">{t('adminDash.actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {subscriptionRequests.filter(r => r.status === 'pending').length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">{language === 'ar' ? 'لا توجد طلبات معلقة' : 'No pending requests'}</td></tr>
                          ) : (
                            subscriptionRequests.filter(r => r.status === 'pending').map(req => (
                              <tr key={req.id} className="hover:bg-muted/30">
                                <td className="px-6 py-4 font-bold">{req.doctorName}</td>
                                <td className="px-6 py-4">
                                  <SubscriptionBadge level={req.targetLevel} size="sm" />
                                </td>
                                <td className="px-6 py-4 text-xs text-muted-foreground font-medium">
                                  {req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : (language === 'ar' ? 'الآن' : 'Now')}
                                </td>
                                <td className="px-6 py-4 text-end">
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => handleApproveSubscription(req)}
                                      className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors shadow-sm"
                                    >
                                      <Check size={20} />
                                    </button>
                                    <button
                                      onClick={() => handleRejectSubscription(req)}
                                      className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors shadow-sm"
                                    >
                                      <X size={20} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Join Requests */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Heart className="text-primary" />
                      {t('adminDash.doctorJoinRequests')}
                    </h3>
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="text-start px-6 py-4 font-bold">{t('adminDash.doctorName')}</th>
                            <th className="text-start px-6 py-4 font-bold">{t('adminDash.requestType')}</th>
                            <th className="text-end px-6 py-4 font-bold">{t('adminDash.actions')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {pendingApprovals.map(a => (
                            <tr key={a.id} className="hover:bg-muted/30">
                              <td className="px-6 py-4 font-bold">{language === 'ar' ? a.doctorNameAr : a.doctorNameEn}</td>
                              <td className="px-6 py-4 text-muted-foreground font-medium">{language === 'ar' ? a.requestTypeAr : a.requestTypeEn}</td>
                              <td className="px-6 py-4 text-end">
                                <div className="flex justify-end gap-2 text-muted-foreground text-xs italic">{language === 'ar' ? 'يرجى التواصل مع الطبيب يدوياً' : 'Please contact doctor manually'}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {section === 'subscriptions' && <SubscriptionRequestsManagement />}

              {section === 'subscriptionPlans' && <SubscriptionPlansNew />}

              {section === 'featuredDoctors' && <FeaturedDoctorsManagement />}

              {section === 'users' && (
                <div className="space-y-4 md:space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <h3 className="text-lg md:text-xl font-bold">{language === 'ar' ? 'إدارة المستخدمين' : 'Manage Users'}</h3>
                    <div className="text-xs md:text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي المستخدمين:' : 'Total Users:'} {usersList.length}</div>
                  </div>
                  <div className="bg-card rounded-xl md:rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs md:text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="text-start px-3 md:px-6 py-3 md:py-4 font-bold text-[10px] md:text-sm">{language === 'ar' ? 'المستخدم' : 'User'}</th>
                            <th className="text-start px-3 md:px-6 py-3 md:py-4 font-bold text-[10px] md:text-sm hidden sm:table-cell">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</th>
                            <th className="text-start px-3 md:px-6 py-3 md:py-4 font-bold text-[10px] md:text-sm">{language === 'ar' ? 'الدور' : 'Role'}</th>
                            <th className="text-start px-3 md:px-6 py-3 md:py-4 font-bold text-[10px] md:text-sm hidden lg:table-cell">{language === 'ar' ? 'تاريخ الانضمام' : 'Join Date'}</th>
                            <th className="text-start px-3 md:px-6 py-3 md:py-4 font-bold text-[10px] md:text-sm">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {usersList.map((user: any) => (
                            <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <div className="flex items-center gap-2 md:gap-3">
                                  <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs md:text-base">
                                    {(user.displayName || user.name || 'U')[0].toUpperCase()}
                                  </div>
                                  <span className="font-bold text-xs md:text-sm truncate max-w-[80px] md:max-w-none">{user.displayName || user.name || (language === 'ar' ? 'مستخدم' : 'User')}</span>
                                </div>
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4 text-muted-foreground text-xs hidden sm:table-cell truncate max-w-[150px]">{user.email}</td>
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded text-[9px] md:text-[10px] font-bold uppercase ${user.role === 'admin' ? 'bg-rose-500/10 text-rose-500' : user.role === 'doctor' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                  {user.role || 'patient'}
                                </span>
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4 text-[10px] md:text-xs text-muted-foreground hidden lg:table-cell">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US') : (language === 'ar' ? 'غير معروف' : 'Unknown')}
                              </td>
                              <td className="px-3 md:px-6 py-3 md:py-4">
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.displayName || user.name || (language === 'ar' ? 'مستخدم' : 'User'), user.role || 'patient')}
                                  disabled={user.id === currentUser?.uid}
                                  className={`px-2 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-medium transition-all flex items-center gap-1 md:gap-2 ${user.id === currentUser?.uid
                                    ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                                    : 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200'
                                    }`}
                                  title={user.id === currentUser?.uid ? (language === 'ar' ? 'لا يمكنك حذف حسابك الخاص' : 'Cannot delete your own account') : (language === 'ar' ? 'حذف المستخدم' : 'Delete User')}
                                >
                                  <Trash2 size={14} className="md:hidden" />
                                  <Trash2 size={16} className="hidden md:block" />
                                  <span className="hidden md:inline">{language === 'ar' ? 'حذف' : 'Delete'}</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {section === 'settings' && (
                <div className="space-y-8 max-w-4xl">
                  <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
                      <ImageIcon className="text-primary" size={24} />
                      <div>
                        <h3 className="text-xl font-bold text-foreground">صور الخلفية (Hero Slider)</h3>
                        <p className="text-sm text-muted-foreground mt-1">هذه الصور ستظهر في الصفحة الرئيسية بشكل متحرك</p>
                      </div>
                    </div>

                    {/* Add Image by Link */}
                    <div className="mb-8 p-6 bg-muted/30 rounded-2xl border border-border">
                      <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                        <Plus size={16} />
                        إضافة صورة عن طريق رابط خارجي
                      </h4>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <input
                          id="new-hero-url"
                          type="text"
                          placeholder="ضع رابط الصورة هنا (e.g. https://example.com/image.jpg)"
                          className="flex-1 px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        />
                        <button
                          onClick={async () => {
                            const input = document.getElementById('new-hero-url') as HTMLInputElement;
                            const url = input.value.trim();
                            if (url) {
                              const currentImages = platformSettings.heroImages || [];
                              const isObjects = currentImages.length > 0 && typeof currentImages[0] === 'object';

                              let newImages;
                              if (isObjects) {
                                newImages = [...currentImages, { url, link: '' }];
                              } else {
                                // Convert existing strings to objects if needed
                                newImages = currentImages.map((img: any) => typeof img === 'string' ? { url: img, link: '' } : img);
                                newImages.push({ url, link: '' });
                              }

                              await updatePlatformSettings({ ...platformSettings, heroImages: newImages });
                              setPlatformSettings({ ...platformSettings, heroImages: newImages });
                              input.value = '';
                              alert(t('adminDash.linkAddedSuccess'));
                            }
                          }}
                          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-sm active:scale-95 transition-all text-sm"
                        >
                          {language === 'ar' ? 'إضافة' : 'Add'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {platformSettings.heroImages.map((img: any, i: number) => {
                        const imageUrl = typeof img === 'string' ? img : img.url;
                        const targetLink = typeof img === 'string' ? '' : (img.link || '');

                        return (
                          <div key={i} className="flex flex-col gap-3 group">
                            <div className="relative aspect-video bg-muted rounded-2xl overflow-hidden shadow-inner border border-border transition-all hover:scale-[1.02]">
                              <img src={imageUrl} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  onClick={() => removeHeroImage(img)}
                                  className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition-all shadow-lg active:scale-90"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-1">رابط التوجيه (Link)</label>
                              <input
                                type="text"
                                value={targetLink}
                                placeholder="e.g. /doctors or https://..."
                                onChange={async (e) => {
                                  const newLink = e.target.value;
                                  const newImages = [...platformSettings.heroImages];
                                  if (typeof newImages[i] === 'string') {
                                    newImages[i] = { url: newImages[i], link: newLink };
                                  } else {
                                    newImages[i] = { ...newImages[i], link: newLink };
                                  }
                                  setPlatformSettings({ ...platformSettings, heroImages: newImages });
                                }}
                                onBlur={async () => {
                                  await updatePlatformSettings(platformSettings);
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-xs outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-foreground mb-6">معلومات الموقع العامة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">اسم المنصة (عربي)</label>
                        <input defaultValue="هيلث كونكت" className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-muted-foreground">بريد الدعم</label>
                        <input defaultValue="support@hconnect.com" className="w-full px-4 py-3 rounded-xl border border-input bg-background outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                      </div>
                    </div>
                    <button className="px-10 py-3 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all">حفظ التغييرات</button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
