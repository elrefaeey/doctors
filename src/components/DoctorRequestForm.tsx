import { useState, useEffect } from 'react';
import { X, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSpecializations } from '@/services/firebaseService';
import { submitDoctorRequest } from '@/services/doctorRequestService';
import { useLanguage } from '@/contexts/LanguageContext';

interface DoctorRequestFormProps {
  onClose: () => void;
}

const EGYPTIAN_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحيرة', 'الفيوم', 'الغربية',
  'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية', 'الوادي الجديد', 'الشرقية',
  'أسيوط', 'سوهاج', 'قنا', 'أسوان', 'الأقصر', 'البحر الأحمر', 'كفر الشيخ',
  'مطروح', 'شمال سيناء', 'جنوب سيناء', 'بورسعيد', 'دمياط', 'السويس'
];

const DoctorRequestForm = ({ onClose }: DoctorRequestFormProps) => {
  const { language } = useLanguage();
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    email: '',
    specialization: '',
    bio: '',
    phone: '',
    price: '',
    governorate: '',
    address: '',
    additionalInfo: '',
  });

  useEffect(() => {
    loadSpecializations();
  }, []);

  const loadSpecializations = async () => {
    try {
      const specs = await getSpecializations();
      setSpecializations(specs);
    } catch (err) {
      console.error('Error loading specializations:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.nameAr || !formData.nameEn || !formData.email || !formData.specialization || 
          !formData.phone || !formData.governorate || !formData.bio || !formData.price || !formData.address) {
        throw new Error(language === 'ar' ? 'الرجاء ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error(language === 'ar' ? 'الرجاء إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      }

      // Validate phone (11 digits)
      if (formData.phone.length !== 11) {
        throw new Error(language === 'ar' ? 'رقم الهاتف يجب أن يكون 11 رقم' : 'Phone number must be 11 digits');
      }

      await submitDoctorRequest(formData);
      setSuccess(true);
      
      // Close form after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'حدث خطأ أثناء إرسال الطلب' : 'Error submitting request'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            {language === 'ar' ? 'تم إرسال طلبك بنجاح' : 'Request Submitted Successfully'}
          </h3>
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'طلبك قيد المراجعة من قبل الإدارة. سيتم التواصل معك قريباً.'
              : 'Your request is under review. We will contact you soon.'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl w-full my-4 sm:my-8"
      >
        <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10 rounded-t-xl sm:rounded-t-2xl">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Stethoscope size={20} className="text-primary sm:w-5 sm:h-5" />
            </div>
            <h2 className="text-base sm:text-xl font-bold text-foreground leading-tight">
              {language === 'ar' ? 'طلب انضمام كطبيب' : 'Doctor Join Request'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-muted flex items-center justify-center transition-colors flex-shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3.5 sm:gap-4">
            {/* Name in Arabic */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-foreground">
                {language === 'ar' ? 'الاسم بالعربي' : 'Name in Arabic'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nameAr"
                value={formData.nameAr}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder={language === 'ar' ? 'د. أحمد محمد' : 'Dr. Ahmed Mohamed'}
                required
              />
            </div>

            {/* Name in English */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-foreground">
                {language === 'ar' ? 'الاسم بالإنجليزي' : 'Name in English'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nameEn"
                value={formData.nameEn}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="Dr. Ahmed Mohamed"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-foreground">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email'} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="doctor@example.com"
                required
              />
            </div>

            {/* WhatsApp Phone */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-foreground">
                {language === 'ar' ? 'رقم الواتساب (11 رقم)' : 'WhatsApp Number (11 digits)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                maxLength={11}
                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="01xxxxxxxxx"
                required
              />
            </div>

            {/* Specialization */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-foreground">
                {language === 'ar' ? 'التخصص' : 'Specialization'} <span className="text-red-500">*</span>
              </label>
              <select
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                required
              >
                <option value="">{language === 'ar' ? 'اختر التخصص' : 'Select Specialization'}</option>
                {specializations.map(spec => (
                  <option key={spec.id} value={spec.key}>
                    {language === 'ar' ? spec.nameAr : spec.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Consultation Price */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-foreground">
                {language === 'ar' ? 'سعر الكشف (جنيه)' : 'Consultation Price (EGP)'} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder="200"
                required
              />
            </div>

            {/* Governorate */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-foreground">
                {language === 'ar' ? 'المحافظة' : 'Governorate'} <span className="text-red-500">*</span>
              </label>
              <select
                name="governorate"
                value={formData.governorate}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                required
              >
                <option value="">{language === 'ar' ? 'اختر المحافظة' : 'Select Governorate'}</option>
                {EGYPTIAN_GOVERNORATES.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            {/* Detailed Address */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-foreground">
                {language === 'ar' ? 'العنوان التفصيلي' : 'Detailed Address'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
                placeholder={language === 'ar' ? 'شارع، مبنى، رقم' : 'Street, Building, Number'}
                required
              />
            </div>

            {/* Brief Bio */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-foreground">
                {language === 'ar' ? 'نبذة مختصرة' : 'Brief Bio'} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
                placeholder={language === 'ar' ? 'نبذة مختصرة عن خبرتك...' : 'Brief description of your experience...'}
                required
              />
            </div>

            {/* Additional Info (Optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-semibold text-foreground">
                {language === 'ar' ? 'معلومات إضافية (اختياري)' : 'Additional Information (Optional)'}
              </label>
              <textarea
                name="additionalInfo"
                value={formData.additionalInfo}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 sm:px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none text-sm"
                placeholder={language === 'ar' ? 'أي معلومات إضافية (الشهادات، الخبرات، إلخ...)' : 'Any additional information (certificates, experience, etc...)'}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:gap-3 pt-3 sm:pt-4 sticky bottom-0 bg-card pb-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:flex-1 px-5 py-2.5 rounded-lg border border-input hover:bg-muted transition-colors font-medium text-sm"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:flex-1 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-sm shadow-lg shadow-primary/20"
            >
              {loading 
                ? (language === 'ar' ? 'جاري الإرسال...' : 'Submitting...') 
                : (language === 'ar' ? 'إرسال الطلب' : 'Submit Request')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DoctorRequestForm;
