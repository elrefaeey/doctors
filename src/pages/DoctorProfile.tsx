import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDoctorById } from '@/services/firebaseService';
import { createGuestBooking, getBookedSlots } from '@/services/bookingService';
import { createChatRequest } from '@/services/chatService';
import { useLanguage } from '@/contexts/LanguageContext';
import SubscriptionBadge from '@/components/SubscriptionBadge';
import Layout from '@/components/Layout';
import BackButton from '@/components/BackButton';
import { Star, MapPin, Clock, Users, Award, Calendar, MessageCircle, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DoctorProfile = () => {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingNumber, setBookingNumber] = useState('');
  
  // New: Calendar view states
  const [startDayIndex, setStartDayIndex] = useState(0);
  const [allBookedSlots, setAllBookedSlots] = useState<Record<string, string[]>>({});
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Booking form fields
  const [patientName, setPatientName] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [caseDescription, setCaseDescription] = useState('');

  // Chat message state
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Generate time slots from doctor's working hours
  const generateTimeSlots = (workingHours: any, appointmentDuration: number = 30): string[] => {
    if (!workingHours) return [];

    const dayMap: any = {
      '0': 'Sunday',
      '1': 'Monday',
      '2': 'Tuesday',
      '3': 'Wednesday',
      '4': 'Thursday',
      '5': 'Friday',
      '6': 'Saturday',
    };

    const dayOfWeek = new Date(selectedDate).getDay().toString();
    const dayName = dayMap[dayOfWeek];
    
    // Check if this day is in working days
    if (!workingHours.workingDays || !workingHours.workingDays.includes(dayName)) {
      return [];
    }

    const slots: string[] = [];
    const start = workingHours.startTime || '09:00';
    const end = workingHours.endTime || '17:00';

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      slots.push(timeStr);

      currentMin += appointmentDuration;
      if (currentMin >= 60) {
        currentMin = currentMin - 60;
        currentHour++;
      }
    }

    return slots;
  };

  // Generate time slots for a specific date
  const generateTimeSlotsForDate = (schedule: any, date: string, appointmentDuration: number = 30): string[] => {
    if (!schedule) return [];

    const dayMap: any = {
      '0': 'Sunday',
      '1': 'Monday',
      '2': 'Tuesday',
      '3': 'Wednesday',
      '4': 'Thursday',
      '5': 'Friday',
      '6': 'Saturday',
    };

    const dayOfWeek = new Date(date).getDay().toString();
    const dayName = dayMap[dayOfWeek];
    
    // Check if this day is in working days
    if (!schedule.workingDays || !schedule.workingDays.includes(dayName)) {
      return [];
    }

    const slots: string[] = [];
    const start = schedule.startTime || '09:00';
    const end = schedule.endTime || '17:00';

    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;

    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
      slots.push(timeStr);

      currentMin += appointmentDuration;
      if (currentMin >= 60) {
        currentMin = currentMin - 60;
        currentHour++;
      }
    }

    return slots;
  };

  // Generate next 14 days
  const generateDays = () => {
    const days = [];
    // Get schedule from doctor data (support both 'schedule' and 'workingHours' for backward compatibility)
    const schedule = doctor?.schedule || doctor?.workingHours;
    const appointmentDuration = schedule?.appointmentDuration || doctor?.appointmentDuration || 30;
    
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayNameAr = date.toLocaleDateString('ar-EG', { weekday: 'long' });
      const dayNameEn = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      days.push({
        date: dateStr,
        dayNameAr,
        dayNameEn,
        dayNumber: date.getDate(),
        month: date.getMonth() + 1,
        slots: generateTimeSlotsForDate(schedule, dateStr, appointmentDuration)
      });
    }
    return days;
  };

  useEffect(() => {
    if (id) {
      getDoctorById(id).then(setDoctor).catch(console.error);
    }
  }, [id]);

  useEffect(() => {
    if (id && selectedDate) {
      getBookedSlots(id, selectedDate).then(setBookedSlots).catch(console.error);
    }
  }, [id, selectedDate]);

  // Auto-fill user data if logged in
  useEffect(() => {
    if (currentUser && userData && userData.role === 'patient') {
      setPatientName(userData.displayName || userData.name || '');
      setPatientMobile(userData.phone || '');
      setPatientEmail(currentUser.email || '');
    }
  }, [currentUser, userData]);

  // Fetch booked slots for all visible days
  useEffect(() => {
    if (id && doctor) {
      const days = generateDays();
      const fetchAllSlots = async () => {
        const slotsMap: Record<string, string[]> = {};
        for (const day of days) {
          try {
            const slots = await getBookedSlots(id, day.date);
            slotsMap[day.date] = slots;
          } catch (error) {
            slotsMap[day.date] = [];
          }
        }
        setAllBookedSlots(slotsMap);
      };
      fetchAllSlots();
    }
  }, [id, doctor]);

  if (!doctor) return <div className="p-8 text-center">{t('common.loading')}</div>;

  const name = doctor.displayName || doctor.name || '';
  const spec = doctor.specialization || '';
  const price = doctor.consultationPrice || doctor.price || 0;
  const waitingTime = doctor.waitingTime || '30 دقيقة';
  const appointmentDuration = doctor.appointmentDuration || 30;

  const timeSlots = generateTimeSlots(doctor.workingHours || doctor.schedule, appointmentDuration);

  const handleBookClick = () => {
    if (!selectedSlot) {
      alert('الرجاء اختيار موعد');
      return;
    }
    setShowBookingForm(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName || !patientMobile) {
      alert('الرجاء إدخال الاسم ورقم الهاتف');
      return;
    }

    setLoading(true);
    try {
      const result = await createGuestBooking(
        doctor.id,
        name,
        selectedDate,
        selectedSlot,
        patientName,
        patientMobile,
        patientEmail,
        caseDescription
      );

      setBookingNumber(result.bookingNumber);
      setBookingConfirmed(true);
      setShowBookingForm(false);

      // Reset form
      setPatientName('');
      setPatientMobile('');
      setPatientEmail('');
      setCaseDescription('');
      setSelectedSlot('');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء الحجز');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = async () => {
    // Check if user is logged in
    if (!currentUser) {
      alert(language === 'ar' ? 'الرجاء تسجيل الدخول أولاً' : 'Please login first');
      navigate('/login/patient');
      return;
    }

    // Wait for userData to load if not available yet
    if (!userData) {
      alert(language === 'ar' ? 'جاري تحميل بياناتك...' : 'Loading your data...');
      // Wait a bit and try again
      setTimeout(() => {
        if (!userData) {
          alert(language === 'ar' ? 'الرجاء تسجيل الدخول مرة أخرى' : 'Please login again');
          navigate('/login/patient');
        }
      }, 1000);
      return;
    }

    // Check if user is a patient
    if (userData.role !== 'patient') {
      alert(language === 'ar' ? 'المحادثة متاحة للمرضى فقط' : 'Chat is only available for patients');
      return;
    }

    // Check if displayName exists
    if (!userData.displayName) {
      alert(language === 'ar' 
        ? 'الرجاء تحديث اسمك في الإعدادات أولاً' 
        : 'Please update your name in settings first'
      );
      navigate('/patient/settings');
      return;
    }

    setShowMessageModal(true);
  };

  const handleSendChatRequest = async () => {
    if (!chatMessage.trim()) {
      alert(language === 'ar' ? 'الرجاء كتابة رسالة' : 'Please write a message');
      return;
    }

    // Double check user data before sending
    if (!currentUser || !userData || !userData.displayName) {
      alert(language === 'ar' ? 'حدث خطأ. الرجاء تسجيل الدخول مرة أخرى' : 'Error. Please login again');
      setShowMessageModal(false);
      navigate('/login/patient');
      return;
    }

    setSendingMessage(true);
    try {
      await createChatRequest(
        doctor.id,
        currentUser.uid,
        name,
        userData.displayName,
        chatMessage.trim()
      );

      alert(language === 'ar' 
        ? '✅ تم إرسال رسالتك بنجاح! سيتم إشعارك عند رد الطبيب.' 
        : '✅ Message sent successfully! You will be notified when the doctor replies.'
      );
      setShowMessageModal(false);
      setChatMessage('');
    } catch (error: any) {
      console.error('Error sending chat request:', error);
      
      // Show user-friendly error message
      let errorMessage = language === 'ar' ? 'حدث خطأ أثناء إرسال الرسالة' : 'Error sending message';
      
      if (error.message && error.message.includes('لا يمكنك')) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <Layout>
      <BackButton variant="floating" />
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border shadow-card p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-accent flex items-center justify-center text-3xl md:text-4xl font-bold text-accent-foreground shrink-0 overflow-hidden">
              {doctor.photoURL ? (
                <img
                  src={doctor.photoURL}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // If image fails to load, show initials
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.innerHTML = name.charAt(0);
                  }}
                />
              ) : (
                name.charAt(0)
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">{name}</h1>
                <SubscriptionBadge level={doctor.subscriptionType || 'silver'} />
              </div>
              <p className="text-muted-foreground mb-4">{spec}</p>
              <div className="flex flex-wrap gap-4 text-sm">
                {doctor.governorate && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin size={14} /> {doctor.governorate}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  {doctor.clinicAddress || 'Clinic'}
                </span>
                <span className="flex items-center gap-1.5 text-medical-gold"><Star size={14} fill="currentColor" /> {doctor.rating || 0} ({doctor.totalReviews || 0} {t('common.reviews')})</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                {[
                  { icon: Clock, label: t('profile.experience'), value: `${doctor.experience || 0}+` },
                  { icon: Users, label: t('profile.patients'), value: '100+' },
                  { icon: Star, label: t('profile.rating'), value: doctor.rating || '0' },
                  { icon: Award, label: t('profile.consultation'), value: `$${price}` },
                ].map(stat => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/50">
                    <stat.icon size={18} className="text-primary mx-auto mb-1" />
                    <div className="text-lg font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-card rounded-xl border border-border p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">عن الطبيب</h2>
              <p className="text-muted-foreground leading-relaxed">{doctor.bio || 'لا توجد معلومات متاحة.'}</p>

              {doctor.experience && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="font-semibold text-foreground mb-2">الخبرة</h3>
                  <p className="text-muted-foreground">{doctor.experience}+ سنوات من الخبرة في {spec}</p>
                </div>
              )}
            </section>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1" id="booking-section">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24 space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar size={18} className="text-primary" />
                حجز موعد
              </h3>

              {/* Doctor Info */}
              <div className="space-y-2 pb-4 border-b border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">سعر الكشف:</span>
                  <span className="font-bold text-primary">{price} جنيه</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">وقت الانتظار:</span>
                  <span className="font-medium">{waitingTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={14} />
                  <span className="text-xs">
                    {doctor.governorate && `${doctor.governorate} - `}
                    {doctor.clinicAddress || 'العيادة'}
                  </span>
                </div>
              </div>

              {/* Booking Confirmation */}
              {bookingConfirmed && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-green-700 font-semibold">
                    <Calendar size={16} />
                    <span>تم تأكيد الحجز!</span>
                  </div>
                  <p className="text-sm text-green-600">
                    تم حجز موعدك مع د. {name}
                  </p>
                  <div className="bg-white rounded p-2 mt-2">
                    <p className="text-xs text-muted-foreground">رقم الحجز:</p>
                    <p className="text-lg font-bold text-primary">{bookingNumber}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    احتفظ برقم الحجز للمراجعة
                  </p>
                  <button
                    onClick={() => setBookingConfirmed(false)}
                    className="w-full mt-2 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
                  >
                    حجز موعد آخر
                  </button>
                </div>
              )}

              {/* New Calendar-Style Booking */}
              {!bookingConfirmed && (
                <>
                  <div className="mb-6">
                    <h4 className="text-lg font-bold text-center mb-4">
                      {language === 'ar' ? 'اختـــار ميعاد الحجز' : 'Choose Appointment Time'}
                    </h4>
                    
                    {/* Days Grid - Horizontal Scroll */}
                    <div className="overflow-x-auto pb-4 -mx-4 px-4">
                      <div className="flex gap-3 min-w-max md:min-w-0 md:grid md:grid-cols-3">
                        {generateDays().map((day, index) => {
                          const visibleSlots = expandedDay === day.date ? day.slots : day.slots.slice(0, 5);
                          const hasMore = day.slots.length > 5;
                          const bookedSlotsForDay = allBookedSlots[day.date] || [];

                          return (
                            <div key={day.date} className="border border-slate-200 rounded-xl overflow-hidden bg-white min-w-[280px] md:min-w-0">
                              {/* Day Header */}
                              <div className="bg-blue-600 text-white p-3 text-center">
                                <div className="font-bold text-sm">
                                  {language === 'ar' ? day.dayNameAr : day.dayNameEn}
                                </div>
                                <div className="text-xs opacity-90">
                                  {day.dayNumber}/{day.month}
                                </div>
                              </div>

                              {/* Time Slots */}
                              <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                                {day.slots.length === 0 ? (
                                  <div className="text-center py-4 text-xs text-slate-400">
                                    {language === 'ar' ? 'لا توجد مواعيد' : 'No slots'}
                                  </div>
                                ) : (
                                  <>
                                    {visibleSlots.map(slot => {
                                      const isBooked = bookedSlotsForDay.includes(slot);
                                      const isSelected = selectedSlot === slot && selectedDate === day.date;
                                      
                                      return (
                                        <button
                                          key={slot}
                                          disabled={isBooked}
                                          onClick={() => {
                                            setSelectedSlot(slot);
                                            setSelectedDate(day.date);
                                          }}
                                          className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                                            isBooked
                                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed line-through'
                                              : isSelected
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-slate-50 hover:bg-blue-50 hover:text-blue-600'
                                          }`}
                                        >
                                          {slot}
                                        </button>
                                      );
                                    })}
                                    
                                    {/* Show More Button */}
                                    {hasMore && expandedDay !== day.date && (
                                      <button
                                        onClick={() => setExpandedDay(day.date)}
                                        className="w-full py-2 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                                      >
                                        {language === 'ar' ? 'المزيد...' : 'More...'}
                                      </button>
                                    )}
                                    {expandedDay === day.date && (
                                      <button
                                        onClick={() => setExpandedDay(null)}
                                        className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 font-semibold"
                                      >
                                        {language === 'ar' ? 'أقل' : 'Less'}
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>

                              {/* Book Button */}
                              {day.slots.length > 0 && (
                                <div className="p-3 pt-0">
                                  <button
                                    onClick={() => {
                                      if (!selectedSlot || selectedDate !== day.date) {
                                        alert(language === 'ar' ? 'الرجاء اختيار موعد' : 'Please select a time');
                                        return;
                                      }
                                      setShowBookingForm(true);
                                      // Scroll to booking form after a short delay to ensure it's rendered
                                      setTimeout(() => {
                                        const formElement = document.getElementById('booking-form');
                                        if (formElement) {
                                          formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                      }, 100);
                                    }}
                                    disabled={selectedDate !== day.date || !selectedSlot}
                                    className="w-full py-2.5 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    {language === 'ar' ? 'احجز' : 'Book'}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Booking Form Modal */}
                  {showBookingForm && (
                    <div id="booking-form" className="space-y-3 border-t border-border pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-sm">
                          {language === 'ar' ? 'بيانات الحجز' : 'Booking Details'}
                        </h4>
                        <button onClick={() => setShowBookingForm(false)} className="text-muted-foreground">
                          <X size={18} />
                        </button>
                      </div>
                      <form onSubmit={handleSubmitBooking} className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            {language === 'ar' ? 'الاسم *' : 'Name *'}
                          </label>
                          <input
                            type="text"
                            value={patientName}
                            onChange={e => setPatientName(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                            placeholder={language === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            {language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                          </label>
                          <input
                            type="tel"
                            value={patientMobile}
                            onChange={e => setPatientMobile(e.target.value)}
                            required
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                            placeholder="01xxxxxxxxx"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            {language === 'ar' ? 'البريد الإلكتروني (اختياري)' : 'Email (Optional)'}
                          </label>
                          <input
                            type="email"
                            value={patientEmail}
                            onChange={e => setPatientEmail(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                            placeholder="email@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium mb-1">
                            {language === 'ar' ? 'وصف الحالة (اختياري)' : 'Case Description (Optional)'}
                          </label>
                          <textarea
                            value={caseDescription}
                            onChange={e => setCaseDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none"
                            placeholder={language === 'ar' ? 'اكتب وصف مختصر للحالة...' : 'Brief description...'}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={loading}
                          className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {loading 
                            ? (language === 'ar' ? 'جاري الحجز...' : 'Booking...') 
                            : (language === 'ar' ? 'تأكيد الحجز' : 'Confirm Booking')
                          }
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Chat Button for Logged-in Patients */}
                  {currentUser && userData?.role === 'patient' && (
                    <button
                      onClick={handleChatClick}
                      className="w-full mt-4 py-3 rounded-lg border-2 border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle size={18} />
                      {language === 'ar' ? 'إرسال رسالة' : 'Send Message'}
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">إرسال رسالة للطبيب</h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                سيتم إرسال رسالتك إلى د. {name}. سيتم إشعارك عند الرد.
              </p>
              <textarea
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="اكتب رسالتك هنا..."
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none"
                disabled={sendingMessage}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMessageModal(false)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                disabled={sendingMessage}
              >
                إلغاء
              </button>
              <button
                onClick={handleSendChatRequest}
                disabled={sendingMessage || !chatMessage.trim()}
                className="flex-1 px-4 py-3 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {sendingMessage ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <MessageCircle size={18} />
                    إرسال
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Mobile Floating Book Button */}
      <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
        <button
          onClick={() => {
            document.getElementById('booking-section')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2"
        >
          <Calendar size={20} />
          {t('common.bookNow') || 'Book Appointment'}
        </button>
      </div>
    </Layout>
  );
};

export default DoctorProfile;
