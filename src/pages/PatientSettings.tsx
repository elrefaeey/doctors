import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/Layout';
import BackButton from '@/components/BackButton';
import ProfilePhotoUploader from '@/components/ProfilePhotoUploader';
import { Save, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const PatientSettings = () => {
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  useEffect(() => {
    loadPatientData();
  }, [currentUser]);

  const loadPatientData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setDisplayName(data.displayName || '');
        setEmail(data.email || currentUser.email || '');
        setPhone(data.phone || '');
        setAddress(data.address || '');
        setDateOfBirth(data.dateOfBirth || '');
        setPhotoURL(data.photoURL || '');
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        name: displayName,
        displayName: displayName,
        phone,
        address,
        dateOfBirth,
        photoURL,
        updatedAt: serverTimestamp(),
      });

      alert(language === 'ar' ? 'تم حفظ التغييرات بنجاح!' : 'Changes saved successfully!');
      
      // Reload the page to refresh user data in context
      window.location.reload();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert(language === 'ar' ? 'حدث خطأ أثناء الحفظ' : 'Error saving changes');
    } finally {
      setSaving(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <BackButton variant="minimal" />

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
              {language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              {language === 'ar' ? 'إدارة معلوماتك الشخصية' : 'Manage your personal information'}
            </p>
          </div>

          {/* Profile Photo Section */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl border-2 border-blue-200 dark:border-slate-600 p-8 mb-6">
            <div className="flex flex-col items-center">
              <ProfilePhotoUploader
                currentPhotoUrl={photoURL}
                userName={displayName || email || 'Patient'}
                onPhotoUploaded={(url) => setPhotoURL(url)}
                size="xl"
                editable={true}
              />
              <div className="mt-6 text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                  {displayName || (language === 'ar' ? 'مريض' : 'Patient')}
                </h2>
                <p className="text-slate-600 dark:text-slate-400">
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <User size={24} className="text-blue-600" />
              {language === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  placeholder={language === 'ar' ? 'أحمد محمد' : 'Ahmed Mohamed'}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}
                </label>
                <div className="relative">
                  <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {language === 'ar' ? 'تاريخ الميلاد' : 'Date of Birth'}
                </label>
                <div className="relative">
                  <Calendar size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {language === 'ar' ? 'العنوان' : 'Address'}
                </label>
                <div className="relative">
                  <MapPin size={20} className="absolute left-4 top-4 text-slate-400" />
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none"
                    placeholder={language === 'ar' ? 'الشارع، المدينة، المحافظة' : 'Street, City, Governorate'}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save size={20} />
                  {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PatientSettings;
