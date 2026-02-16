import { useLanguage } from '@/contexts/LanguageContext';
import SubscriptionBadge from './SubscriptionBadge';
import { Star, MapPin, Calendar, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DoctorCardProps {
  doctor: any;
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const { language } = useLanguage();
  const name = language === 'ar' ? (doctor.nameAr || doctor.displayName) : doctor.displayName;
  const location = doctor.governorate || doctor.clinicAddress || (language === 'ar' ? 'الموقع غير محدد' : 'Location not specified');
  const spec = doctor.specialization;

  return (
    <div className="group relative bg-white rounded-2xl md:rounded-3xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:border-blue-200 flex flex-col h-full">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with Avatar */}
        <div className="relative p-4 md:p-6 pb-3 md:pb-4 flex flex-col items-center text-center bg-gradient-to-b from-slate-50/80 to-white/50 backdrop-blur-sm">
          <div className="relative mb-2 md:mb-3">
            {/* Avatar Container with Animated Ring */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-500" />
              <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-blue-100 via-blue-50 to-purple-50 flex items-center justify-center text-xl md:text-2xl font-bold text-blue-600 overflow-hidden ring-2 md:ring-4 ring-white shadow-lg group-hover:ring-blue-100 transition-all duration-300">
                {doctor.photoURL ? (
                  <img
                    src={doctor.photoURL}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const initials = name.charAt(0) + (name.split(' ').pop()?.charAt(0) || '');
                      e.currentTarget.parentElement!.innerHTML = initials;
                    }}
                  />
                ) : (
                  <>
                    {name.charAt(0)}{name.split(' ').pop()?.charAt(0)}
                  </>
                )}
              </div>
            </div>
            
            {/* Badge */}
            <div className="absolute -bottom-1 md:-bottom-2 left-1/2 -translate-x-1/2 scale-75 md:scale-90 group-hover:scale-100 transition-transform duration-300">
              <SubscriptionBadge level={doctor.subscriptionType || 'silver'} size="sm" />
            </div>
          </div>

          {/* Name & Specialization */}
          <h3 className="text-sm md:text-lg font-bold text-slate-900 mt-2 md:mt-3 mb-0.5 md:mb-1 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
            {name}
          </h3>
          <p className="text-[10px] md:text-sm text-slate-500 font-medium line-clamp-1 px-2">{spec}</p>
        </div>

        {/* Stats & Info */}
        <div className="px-3 md:px-5 py-2 md:py-3 space-y-2 md:space-y-3">
          {/* Rating & Price Row */}
          <div className="flex items-center justify-between gap-2">
            {/* Rating */}
            <div className="flex items-center gap-1 md:gap-1.5 bg-gradient-to-r from-amber-50 to-orange-50 px-2 md:px-2.5 py-1 md:py-1.5 rounded-full border border-amber-100 group-hover:border-amber-200 transition-colors">
              <Star size={12} fill="#F59E0B" className="text-amber-500 md:w-3.5 md:h-3.5" />
              <span className="font-bold text-[10px] md:text-xs text-amber-700">{doctor.rating || 0}</span>
              <span className="text-[8px] md:text-[10px] text-amber-600/70">({doctor.totalReviews || 0})</span>
            </div>
            
            {/* Price */}
            <div className="flex items-center gap-0.5 md:gap-1 bg-gradient-to-r from-blue-50 to-blue-100 px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-blue-100">
              <span className="text-sm md:text-lg font-bold text-blue-600">${doctor.consultationPrice || 0}</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 md:gap-2 text-slate-500 bg-slate-50 rounded-lg md:rounded-xl px-2 md:px-2.5 py-1.5 md:py-2 border border-slate-100 group-hover:bg-slate-100 group-hover:border-slate-200 transition-all">
            <MapPin size={12} className="flex-shrink-0 text-slate-400 md:w-3.5 md:h-3.5" />
            <span className="truncate text-[10px] md:text-xs font-medium">{location}</span>
          </div>

          {/* Experience Badge (if available) */}
          {doctor.experience && (
            <div className="flex items-center justify-center gap-1 text-[10px] md:text-xs text-emerald-600 bg-emerald-50 rounded-lg px-2 py-1 border border-emerald-100">
              <TrendingUp size={10} className="md:w-3 md:h-3" />
              <span className="font-semibold">{doctor.experience} {language === 'ar' ? 'سنة خبرة' : 'years exp'}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-3 md:px-4 pb-3 md:pb-4 mt-auto">
          <div className="grid grid-cols-2 gap-1.5 md:gap-2">
            <Link
              to={`/doctors/${doctor.id}`}
              className="flex items-center justify-center py-2 md:py-2.5 rounded-lg md:rounded-xl border-2 border-slate-200 text-[10px] md:text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 group-hover:border-blue-200 group-hover:text-blue-600"
            >
              {language === 'ar' ? 'عرض الملف' : 'View Profile'}
            </Link>
            <Link
              to={`/doctors/${doctor.id}`}
              className="flex items-center justify-center py-2 md:py-2.5 rounded-lg md:rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] md:text-xs font-bold hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-xl active:scale-95 group-hover:shadow-blue-200"
            >
              {language === 'ar' ? 'احجز الآن' : 'Book Now'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorCard;
