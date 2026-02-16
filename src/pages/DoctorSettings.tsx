import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorById } from '@/services/firebaseService';
import { db } from '@/config/firebase';
import { doc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import BackButton from '@/components/BackButton';
import ProfilePhotoUploader from '@/components/ProfilePhotoUploader';
import { Camera, Save, Clock, CreditCard, User, MapPin, DollarSign, Briefcase, FileText, Link as LinkIcon, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SubscriptionBadge from '@/components/SubscriptionBadge';

const DoctorSettings = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [doctor, setDoctor] = useState<any>(null);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [phone, setPhone] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [bio, setBio] = useState('');
  const [consultationPrice, setConsultationPrice] = useState('');
  const [experience, setExperience] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [governorate, setGovernorate] = useState('');
  
  // Working hours with appointment duration
  const [workingHours, setWorkingHours] = useState({
    sunday: { enabled: true, start: '09:00', end: '17:00' },
    monday: { enabled: true, start: '09:00', end: '17:00' },
    tuesday: { enabled: true, start: '09:00', end: '17:00' },
    wednesday: { enabled: true, start: '09:00', end: '17:00' },
    thursday: { enabled: true, start: '09:00', end: '17:00' },
    friday: { enabled: false, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
  });
  
  const [appointmentDuration, setAppointmentDuration] = useState('30');

  const specializations = [
    'طب الأسنان',
    'طب الأطفال',
    'الجراحة العامة',
    'طب العيون',
    'طب الأنف والأذن والحنجرة',
    'طب القلب',
    'طب الجلدية',
    'طب النساء والتوليد',
    'طب العظام',
    'الطب النفسي',
  ];

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

  const daysArabic: any = {
    sunday: 'الأحد',
    monday: 'الاثنين',
    tuesday: 'الثلاثاء',
    wednesday: 'الأربعاء',
    thursday: 'الخميس',
    friday: 'الجمعة',
    saturday: 'السبت',
  };

  useEffect(() => {
    if (currentUser) {
      fetchDoctorData();
    }
  }, [currentUser]);

  const fetchDoctorData = async () => {
    try {
      const data = await getDoctorById(currentUser!.uid);
      if (data) {
        setDoctor(data);
        setDisplayName(data.displayName || '');
        setNameAr(data.nameAr || '');
        setSpecialization(data.specialization || '');
        setPhone(data.phone || '');
        setClinicAddress(data.clinicAddress || '');
        setBio(data.bio || '');
        setConsultationPrice(data.consultationPrice?.toString() || '');
        setExperience(data.experience?.toString() || '');
        setPhotoURL(data.photoURL || '');
        setGovernorate(data.governorate || '');
        if (data.workingHours) {
          setWorkingHours(data.workingHours);
        }
        if (data.appointmentDuration) {
          setAppointmentDuration(data.appointmentDuration.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching doctor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'doctors', currentUser.uid), {
        displayName,
        nameAr,
        specialization,
        phone,
        governorate,
        clinicAddress,
        bio,
        consultationPrice: Number(consultationPrice),
        experience: Number(experience),
        photoURL,
        workingHours,
        appointmentDuration: Number(appointmentDuration),
        updatedAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName,
        photoURL,
        updatedAt: serverTimestamp(),
      });

      alert('تم حفظ التعديلات بنجاح');
      fetchDoctorData();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('حدث خطأ أثناء حفظ التعديلات');
    } finally {
      setSaving(false);
    }
  };

  const handleRequestUpgrade = async () => {
    if (!currentUser || !doctor) return;

    try {
      await addDoc(collection(db, 'subscriptionRequests'), {
        doctorId: currentUser.uid,
        doctorName: displayName,
        currentLevel: doctor.subscriptionType || 'silver',
        targetLevel: 'gold',
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      alert('تم إرسال طلب الترقية بنجاح');
    } catch (error) {
      console.error('Error requesting upgrade:', error);
      alert('حدث خطأ أثناء إرسال الطلب');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <BackButton variant="floating" />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">إعدادات الحساب</h1>
            <p className="text-sm text-muted-foreground mt-1">قم بتحديث معلومات ملفك الشخصي</p>
          </div>
          <button
            onClick={() => navigate('/doctor/dashboard')}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent"
          >
            العودة للوحة التحكم
          </button>
        </div>

        {/* Profile Photo */}
        {/* Profile Photo Section */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl border-2 border-blue-200 dark:border-slate-600 p-8 mb-6">
          <div className="flex flex-col items-center">
            <ProfilePhotoUploader
              currentPhotoUrl={photoURL}
              userName={nameAr || displayName || 'Doctor'}
              onPhotoUploaded={(url) => setPhotoURL(url)}
              size="xl"
              editable={true}
            />
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                {nameAr || displayName}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                {specialization || 'طبيب'}
              </p>
              {doctor?.subscriptionType && (
                <SubscriptionBadge level={doctor.subscriptionType} size="md" />
              )}
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <User size={20} className="text-primary" />
            المعلومات الأساسية
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">الاسم بالعربية</label>
              <input
                type="text"
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">الاسم بالإنجليزية</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">التخصص</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">اختر التخصص</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">رقم الهاتف</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">المحافظة</label>
              <select
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">اختر المحافظة</option>
                {egyptianGovernorates.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                <MapPin size={16} />
                عنوان العيادة
              </label>
              <input
                type="text"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                <DollarSign size={16} />
                سعر الكشف
              </label>
              <input
                type="number"
                value={consultationPrice}
                onChange={(e) => setConsultationPrice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                <Briefcase size={16} />
                سنوات الخبرة
              </label>
              <input
                type="number"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1 flex items-center gap-2">
                <FileText size={16} />
                نبذة عنك
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring resize-none"
                placeholder="اكتب نبذة مختصرة عن خبراتك ومؤهلاتك..."
              />
            </div>
          </div>
        </div>

        {/* Working Hours & Appointment Settings */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            مواعيد العمل
          </h2>
          
          {/* Appointment Duration */}
          <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              مدة الانتظار لكل موعد
            </label>
            <select
              value={appointmentDuration}
              onChange={(e) => setAppointmentDuration(e.target.value)}
              className="w-full md:w-64 px-4 py-2.5 rounded-lg border border-input bg-background text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="15">15 دقيقة</option>
              <option value="20">20 دقيقة</option>
              <option value="30">30 دقيقة</option>
              <option value="45">45 دقيقة</option>
              <option value="60">60 دقيقة</option>
            </select>
            <p className="text-xs text-muted-foreground mt-2">
              المدة الزمنية بين كل موعد والآخر (مثلاً: 30 دقيقة = موعد كل نصف ساعة)
            </p>
          </div>

          {/* Working Days & Hours */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar size={16} className="text-primary" />
              حدد أيام وساعات العمل
            </h3>
            {Object.keys(workingHours).map((day) => (
              <div key={day} className="flex flex-col md:flex-row md:items-center gap-3 p-4 rounded-lg bg-muted/50 border border-border">
                <div className="flex items-center gap-3 md:w-32">
                  <input
                    type="checkbox"
                    checked={workingHours[day as keyof typeof workingHours].enabled}
                    onChange={(e) => setWorkingHours({
                      ...workingHours,
                      [day]: { ...workingHours[day as keyof typeof workingHours], enabled: e.target.checked }
                    })}
                    className="w-5 h-5 rounded border-input"
                  />
                  <span className="text-sm font-medium text-foreground">{daysArabic[day]}</span>
                </div>
                
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">من</label>
                    <input
                      type="time"
                      value={workingHours[day as keyof typeof workingHours].start}
                      onChange={(e) => setWorkingHours({
                        ...workingHours,
                        [day]: { ...workingHours[day as keyof typeof workingHours], start: e.target.value }
                      })}
                      disabled={!workingHours[day as keyof typeof workingHours].enabled}
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  
                  <span className="text-sm text-muted-foreground">إلى</span>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={workingHours[day as keyof typeof workingHours].end}
                      onChange={(e) => setWorkingHours({
                        ...workingHours,
                        [day]: { ...workingHours[day as keyof typeof workingHours], end: e.target.value }
                      })}
                      disabled={!workingHours[day as keyof typeof workingHours].enabled}
                      className="px-3 py-2 rounded-lg border border-input bg-background text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
              💡 كيف يعمل النظام:
            </p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1 mr-4">
              <li>• حدد الأيام التي تعمل فيها (ضع علامة ✓)</li>
              <li>• حدد ساعات العمل لكل يوم (من - إلى)</li>
              <li>• حدد مدة الانتظار (مثلاً 30 دقيقة)</li>
              <li>• النظام سيولد المواعيد تلقائياً كل 30 دقيقة في الأوقات المحددة</li>
            </ul>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            الاشتراك الحالي
          </h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SubscriptionBadge level={doctor?.subscriptionType || 'silver'} size="lg" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {doctor?.subscriptionType === 'blue' ? 'الخطة الزرقاء' : 
                   doctor?.subscriptionType === 'gold' ? 'الخطة الذهبية' : 'الخطة الفضية'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  قم بترقية حسابك للحصول على مزايا إضافية
                </p>
              </div>
            </div>
            <button
              onClick={handleRequestUpgrade}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
            >
              طلب ترقية
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorSettings;
