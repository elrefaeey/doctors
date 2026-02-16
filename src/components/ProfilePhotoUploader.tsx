import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import SimpleImageUploader from './SimpleImageUploader';
import { Camera, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfilePhotoUploaderProps {
  currentPhotoUrl?: string;
  userName: string;
  onPhotoUploaded: (url: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  editable?: boolean;
}

const ProfilePhotoUploader = ({
  currentPhotoUrl,
  userName,
  onPhotoUploaded,
  size = 'lg',
  editable = true
}: ProfilePhotoUploaderProps) => {
  const { language } = useLanguage();
  const [showUploader, setShowUploader] = useState(false);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Profile Photo */}
      <div className="relative group">
        <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-2xl border-4 border-white dark:border-slate-800 relative`}>
          {currentPhotoUrl ? (
            <img
              src={currentPhotoUrl}
              alt={userName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white font-bold" style={{ fontSize: `${iconSizes[size] / 2}px` }}>
              {getInitials(userName)}
            </div>
          )}
          
          {/* Edit overlay */}
          {editable && (
            <button
              onClick={() => setShowUploader(true)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Camera size={24} className="text-white" />
              </div>
            </button>
          )}
        </div>

        {/* Camera badge */}
        {editable && (
          <button
            onClick={() => setShowUploader(true)}
            className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg border-3 border-white dark:border-slate-800 hover:scale-110 transition-transform"
          >
            <Camera size={18} className="text-white" />
          </button>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploader && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploader(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full p-6 md:p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {language === 'ar' ? 'تحديث الصورة الشخصية' : 'Update Profile Photo'}
                </h3>
                <button
                  onClick={() => setShowUploader(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>

              <SimpleImageUploader
                currentImageUrl={currentPhotoUrl}
                onImageUploaded={(url) => {
                  onPhotoUploaded(url);
                  setShowUploader(false);
                }}
                maxSizeMB={5}
                showPreview={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfilePhotoUploader;
