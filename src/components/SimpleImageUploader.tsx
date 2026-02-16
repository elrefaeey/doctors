import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Upload, X, Image as ImageIcon, Loader2, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SimpleImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  showPreview?: boolean;
  className?: string;
}

const SimpleImageUploader = ({
  currentImageUrl,
  onImageUploaded,
  maxSizeMB = 10,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  showPreview = true,
  className = ''
}: SimpleImageUploaderProps) => {
  const { language } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      return language === 'ar' 
        ? `الصيغة غير مدعومة. الصيغ المقبولة: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`
        : `Unsupported format. Accepted: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return language === 'ar'
        ? `حجم الملف كبير جداً. الحد الأقصى: ${maxSizeMB} ميجابايت`
        : `File too large. Max size: ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset states
    setError(null);
    setSuccess(false);

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);

      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        onImageUploaded(base64String);
        setSuccess(true);
        setUploading(false);
        
        // Hide success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000);
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };
      
      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      
      const errorMessage = language === 'ar'
        ? `⚠️ فشل قراءة الصورة: ${error.message || 'خطأ غير معروف'}`
        : `⚠️ Failed to read image: ${error.message || 'Unknown error'}`;
      
      setError(errorMessage);
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload area */}
      <div className="relative">
        {showPreview && previewUrl ? (
          // Preview with image
          <div className="relative group">
            <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={handleClick}
                  disabled={uploading}
                  className="px-4 py-2 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-all flex items-center gap-2"
                >
                  <Upload size={18} />
                  {language === 'ar' ? 'تغيير' : 'Change'}
                </button>
                <button
                  onClick={handleRemoveImage}
                  disabled={uploading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all flex items-center gap-2"
                >
                  <X size={18} />
                  {language === 'ar' ? 'حذف' : 'Remove'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Upload button
          <button
            onClick={handleClick}
            disabled={uploading}
            className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all flex flex-col items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 size={48} className="text-blue-600 animate-spin" />
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                  <ImageIcon size={32} className="text-white" />
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                    {language === 'ar' ? 'اضغط لاختيار صورة' : 'Click to select image'}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {language === 'ar' 
                      ? `${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} • حتى ${maxSizeMB} ميجابايت`
                      : `${acceptedFormats.map(f => f.split('/')[1].toUpperCase()).join(', ')} • Up to ${maxSizeMB}MB`
                    }
                  </div>
                </div>
              </>
            )}
          </button>
        )}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm"
          >
            <AlertCircle size={18} className="flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm"
          >
            <Check size={18} className="flex-shrink-0" />
            <span>
              {language === 'ar' ? 'تم اختيار الصورة بنجاح! ✨' : 'Image selected successfully! ✨'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text */}
      {!error && !success && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold">
            💾 محلي
          </span>
          <span>
            {language === 'ar'
              ? 'الصورة تُحفظ في قاعدة البيانات'
              : 'Image saved in database'}
          </span>
        </div>
      )}
    </div>
  );
};

export default SimpleImageUploader;
