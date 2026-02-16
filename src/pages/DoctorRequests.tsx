import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDoctorRequests, approveDoctorRequest, rejectDoctorRequest, deleteDoctorRequest, DoctorRequest } from '@/services/doctorRequestService';
import { Check, X, Phone, MapPin, Stethoscope, DollarSign, FileText, Clock, Copy, MessageCircle, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorRequests = () => {
  const { language, t } = useLanguage();
  const [requests, setRequests] = useState<DoctorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DoctorRequest | null>(null);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDoctorRequests();
      setRequests(data);
    } catch (error: any) {
      console.error('Error loading requests:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: DoctorRequest) => {
    if (!confirm(language === 'ar' ? `هل أنت متأكد من الموافقة على طلب الطبيب ${request.name}؟` : `Are you sure you want to approve Dr. ${request.name}'s request?`)) {
      return;
    }

    setProcessing(true);
    try {
      await approveDoctorRequest(request.id, request);

      const updatedRequests = await getDoctorRequests();
      setRequests(updatedRequests);

      const updatedRequest = updatedRequests.find(r => r.id === request.id);
      if (updatedRequest) {
        setSelectedRequest(updatedRequest);
        alert(language === 'ar' 
          ? `✅ تم إنشاء حساب الطبيب بنجاح!\n\n📧 البريد: ${updatedRequest.generatedEmail}\n🔑 كلمة المرور: ${updatedRequest.generatedPassword}\n📱 الهاتف: ${request.phone}\n\n⚠️ قم بنسخ البيانات وإرسالها للطبيب`
          : `✅ Doctor account created successfully!\n\n📧 Email: ${updatedRequest.generatedEmail}\n🔑 Password: ${updatedRequest.generatedPassword}\n📱 Phone: ${request.phone}\n\n⚠️ Copy and send credentials to doctor`
        );
      }
    } catch (error: any) {
      alert(language === 'ar' ? 'حدث خطأ: ' + (error.message || 'حاول مرة أخرى') : 'Error: ' + (error.message || 'Try again'));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (requestId: string) => {
    const reason = prompt(language === 'ar' ? 'سبب الرفض (اختياري):' : 'Rejection reason (optional):');

    setProcessing(true);
    try {
      await rejectDoctorRequest(requestId, reason || '');
      alert(language === 'ar' ? 'تم رفض الطلب' : 'Request rejected');
      await loadRequests();
      setSelectedRequest(null);
    } catch (error: any) {
      alert(language === 'ar' ? 'حدث خطأ: ' + (error.message || 'حاول مرة أخرى') : 'Error: ' + (error.message || 'Try again'));
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (requestId: string, doctorName: string) => {
    if (!confirm(language === 'ar' 
      ? `⚠️ هل أنت متأكد من حذف طلب الطبيب "${doctorName}" نهائياً؟`
      : `⚠️ Are you sure you want to permanently delete Dr. "${doctorName}"'s request?`
    )) {
      return;
    }

    setProcessing(true);
    try {
      await deleteDoctorRequest(requestId);
      alert(language === 'ar' ? 'تم حذف الطلب بنجاح' : 'Request deleted successfully');
      await loadRequests();
      setSelectedRequest(null);
    } catch (error: any) {
      alert(language === 'ar' ? 'حدث خطأ أثناء الحذف: ' + (error.message || 'حاول مرة أخرى') : 'Error deleting: ' + (error.message || 'Try again'));
    } finally {
      setProcessing(false);
    }
  };

  const handleSendWhatsApp = (request: DoctorRequest) => {
    if (!request.generatedPassword) {
      alert(language === 'ar' 
        ? '⚠️ كلمة المرور غير متوفرة. يرجى تحديث الصفحة والمحاولة مرة أخرى.'
        : '⚠️ Password not available. Please refresh the page and try again.'
      );
      return;
    }

    let phoneNumber = request.phone.replace(/\D/g, '');
    if (!phoneNumber.startsWith('20') && phoneNumber.startsWith('0')) {
      phoneNumber = '20' + phoneNumber.substring(1);
    } else if (!phoneNumber.startsWith('20')) {
      phoneNumber = '20' + phoneNumber;
    }

    const message = language === 'ar'
      ? `مرحباً دكتور/ة ${request.name} 👋\n\nتم الموافقة على طلب انضمامك لمنصة هيلث كونكت! 🎉\n\n🔐 بيانات الدخول:\n━━━━━━━━━━━━━━━\n📧 البريد الإلكتروني:\n${request.generatedEmail}\n\n🔑 كلمة المرور:\n${request.generatedPassword}\n━━━━━━━━━━━━━━━\n\n📱 خطوات تسجيل الدخول:\n1️⃣ افتح الموقع\n2️⃣ اضغط على "تسجيل دخول الأطباء"\n3️⃣ أدخل البريد وكلمة المرور\n4️⃣ غيّر كلمة المرور فوراً من الإعدادات\n\n⚠️ مهم جداً:\n• احفظ البيانات في مكان آمن\n• غيّر كلمة المرور بعد أول دخول\n• لا تشارك بياناتك مع أحد\n\nللدعم والاستفسارات، نحن في خدمتك دائماً 💙\n\nمع تحيات فريق هيلث كونكت`
      : `Hello Dr. ${request.name} 👋\n\nYour request to join Health Connect has been approved! 🎉\n\n🔐 Login Credentials:\n━━━━━━━━━━━━━━━\n📧 Email:\n${request.generatedEmail}\n\n🔑 Password:\n${request.generatedPassword}\n━━━━━━━━━━━━━━━\n\n📱 Login Steps:\n1️⃣ Open the website\n2️⃣ Click "Doctor Login"\n3️⃣ Enter email and password\n4️⃣ Change password immediately from settings\n\n⚠️ Important:\n• Save credentials securely\n• Change password after first login\n• Don't share your credentials\n\nFor support, we're always here to help 💙\n\nBest regards,\nHealth Connect Team`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      approved: 'bg-green-100 text-green-700 border-green-200',
      rejected: 'bg-red-100 text-red-700 border-red-200',
    };

    const labels = {
      pending: t('adminDash.pending'),
      approved: t('adminDash.approved'),
      rejected: t('adminDash.rejected'),
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const filteredRequests = requests.filter(req =>
    filter === 'all' ? true : req.status === filter
  );

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
            <X size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-red-900 mb-2">{language === 'ar' ? 'خطأ في الصلاحيات' : 'Permission Error'}</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <h2 className="text-lg md:text-2xl font-bold text-foreground">{t('adminDash.doctorRequestsTitle')}</h2>
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg text-[10px] md:text-sm font-medium transition-colors ${filter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
            >
              {t(`adminDash.${status}`)}
              <span className="mr-1 md:mr-2 bg-background/20 px-1.5 md:px-2 py-0.5 rounded-full text-[9px] md:text-xs">
                {status === 'all' ? requests.length : requests.filter(r => r.status === status).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-card rounded-xl md:rounded-2xl border border-border p-8 md:p-12 text-center text-muted-foreground">
          <Stethoscope size={32} className="mx-auto opacity-20 mb-3 md:mb-4 md:w-12 md:h-12" />
          <p className="text-xs md:text-base">{t('adminDash.noRequests')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-5">
          {filteredRequests.map(request => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl md:rounded-2xl border border-border p-4 md:p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3 md:mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-lg font-bold text-foreground truncate">{request.name}</h3>
                  <p className="text-[10px] md:text-sm text-muted-foreground flex items-center gap-1 mt-0.5 md:mt-1">
                    <Stethoscope size={12} className="md:w-3.5 md:h-3.5 shrink-0" />
                    <span className="truncate">{request.specialization}</span>
                  </p>
                </div>
                {getStatusBadge(request.status)}
              </div>

              <div className="space-y-1.5 md:space-y-2 mb-3 md:mb-4">
                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-muted-foreground">
                  <Phone size={12} className="md:w-3.5 md:h-3.5 shrink-0" />
                  <span className="truncate">{request.phone}</span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-muted-foreground">
                  <MapPin size={12} className="md:w-3.5 md:h-3.5 shrink-0" />
                  <span className="truncate">{request.governorate}</span>
                </div>
                {request.price && (
                  <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-muted-foreground">
                    <DollarSign size={12} className="md:w-3.5 md:h-3.5 shrink-0" />
                    <span>{request.price} جنيه</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-muted-foreground">
                  <Clock size={12} className="md:w-3.5 md:h-3.5 shrink-0" />
                  <span>{new Date(request.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>

              {request.bio && (
                <p className="text-[10px] md:text-xs text-muted-foreground mb-3 md:mb-4 line-clamp-2 bg-muted/30 p-1.5 md:p-2 rounded-lg">
                  {request.bio}
                </p>
              )}

              <div className="flex gap-1.5 md:gap-2 items-center">
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="flex-1 px-2 md:px-4 py-1.5 md:py-2 rounded-lg border border-input hover:bg-muted transition-colors text-[10px] md:text-xs font-bold"
                >
                  {t('adminDash.viewDetails')}
                </button>

                {request.status === 'pending' && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleApprove(request)}
                      disabled={processing}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      title={t('adminDash.approve')}
                    >
                      <Check size={14} className="md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processing}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
                      title={t('adminDash.reject')}
                    >
                      <X size={14} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                )}

                {request.status === 'approved' && request.generatedEmail && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        const text = `${language === 'ar' ? 'بيانات دخول الطبيب' : 'Doctor login credentials'} ${request.name}:\n\n${language === 'ar' ? 'البريد' : 'Email'}: ${request.generatedEmail}\n${language === 'ar' ? 'كلمة المرور' : 'Password'}: ${request.generatedPassword}\n${language === 'ar' ? 'الهاتف' : 'Phone'}: ${request.phone}`;
                        navigator.clipboard.writeText(text);
                        alert(language === 'ar' ? 'تم نسخ البيانات!' : 'Data copied!');
                      }}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      title={t('adminDash.copyData')}
                    >
                      <Copy size={14} className="md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => handleSendWhatsApp(request)}
                      className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                      title={t('adminDash.sendWhatsApp')}
                    >
                      <MessageCircle size={14} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(request.id, request.name)}
                  disabled={processing}
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all border border-red-200"
                  title={t('adminDash.deleteForever')}
                >
                  <Trash2 size={14} className="md:w-4 md:h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border"
            >
              <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
                <h3 className="text-xl font-bold">{language === 'ar' ? 'تفاصيل الطلب' : 'Request Details'}</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-3xl font-bold mb-2">{selectedRequest.name}</h4>
                    <div className="flex items-center gap-2 text-muted-foreground text-lg">
                      <Stethoscope size={20} />
                      <span>{selectedRequest.specialization}</span>
                    </div>
                  </div>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-2xl">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('adminDash.phone')}</label>
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <Phone size={18} className="text-primary" />
                      <span>{selectedRequest.phone}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('adminDash.governorate')}</label>
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <MapPin size={18} className="text-primary" />
                      <span>{selectedRequest.governorate}</span>
                    </div>
                  </div>

                  {selectedRequest.price && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('adminDash.consultationPrice')}</label>
                      <div className="flex items-center gap-2 font-bold text-lg">
                        <DollarSign size={18} className="text-emerald-500" />
                        <span>{selectedRequest.price} {language === 'ar' ? 'جنيه' : 'EGP'}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t('adminDash.requestDate')}</label>
                    <div className="flex items-center gap-2 font-bold">
                      <Clock size={18} className="text-primary" />
                      <span>{new Date(selectedRequest.createdAt).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedRequest.address && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">{t('adminDash.detailedAddress')}</label>
                      <p className="text-foreground bg-muted/50 p-4 rounded-xl border border-border">{selectedRequest.address}</p>
                    </div>
                  )}

                  {selectedRequest.bio && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">{t('adminDash.shortBio')}</label>
                      <p className="text-foreground bg-muted/50 p-4 rounded-xl border border-border whitespace-pre-wrap">{selectedRequest.bio}</p>
                    </div>
                  )}

                  {selectedRequest.additionalInfo && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground">{t('adminDash.additionalInfo')}</label>
                      <p className="text-foreground bg-muted/50 p-4 rounded-xl border border-border whitespace-pre-wrap">{selectedRequest.additionalInfo}</p>
                    </div>
                  )}
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-3 pt-6 border-t border-border">
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      disabled={processing}
                      className="flex-1 px-6 py-4 rounded-2xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-600 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 border border-rose-200"
                    >
                      <X size={20} />
                      {t('adminDash.rejectRequest')}
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest)}
                      disabled={processing}
                      className="flex-[2] px-6 py-4 rounded-2xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <Check size={20} />
                      {processing ? t('adminDash.creating') : t('adminDash.approveAndCreate')}
                    </button>
                  </div>
                )}

                {selectedRequest.generatedEmail && (
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Check size={24} />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-emerald-900">{t('adminDash.accountCreated')}</p>
                        <p className="text-emerald-700 text-sm">{t('adminDash.loginDataReady')}</p>
                      </div>
                    </div>

                    <div className="bg-white/60 rounded-2xl p-6 space-y-4 border border-emerald-100">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">{t('adminDash.emailAddress')}</span>
                        <span className="text-lg font-mono font-bold text-gray-900 break-all">{selectedRequest.generatedEmail}</span>
                      </div>

                      <div className="flex flex-col gap-1 border-t border-emerald-100 pt-4">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest">{t('adminDash.password')}</span>
                        <span className="text-2xl font-mono font-bold text-gray-900 tracking-wider break-all">{selectedRequest.generatedPassword}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          const text = `${language === 'ar' ? 'بيانات دخول الطبيب' : 'Doctor login credentials'} ${selectedRequest.name}:\n\n📧 ${language === 'ar' ? 'البريد' : 'Email'}:\n${selectedRequest.generatedEmail}\n\n🔑 ${language === 'ar' ? 'كلمة المرور' : 'Password'}:\n${selectedRequest.generatedPassword}\n\n📱 ${language === 'ar' ? 'الهاتف' : 'Phone'}:\n${selectedRequest.phone}`;
                          navigator.clipboard.writeText(text);
                          alert(language === 'ar' ? '✅ تم نسخ البيانات بنجاح!' : '✅ Data copied successfully!');
                        }}
                        className="px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                      >
                        <Copy size={20} />
                        {t('adminDash.copyData')}
                      </button>

                      <button
                        onClick={() => handleSendWhatsApp(selectedRequest)}
                        className="px-6 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                      >
                        <MessageCircle size={20} />
                        {t('adminDash.sendWhatsApp')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-border">
                  <button
                    onClick={() => handleDelete(selectedRequest.id, selectedRequest.name)}
                    disabled={processing}
                    className="w-full px-6 py-4 rounded-2xl bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white transition-all disabled:opacity-50 border border-red-200 flex items-center justify-center gap-2"
                  >
                    <Trash2 size={20} />
                    {t('adminDash.deleteRequestPermanently')}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DoctorRequests;
