import { useLanguage } from '@/contexts/LanguageContext';
import { BadgeCheck, Award } from 'lucide-react';

type VerificationType = 'none' | 'blue' | 'gold';

interface SubscriptionBadgeProps {
  level?: string; // For backward compatibility
  verificationType?: VerificationType;
  size?: 'sm' | 'md' | 'lg';
}

const SubscriptionBadge = ({ level, verificationType, size = 'md' }: SubscriptionBadgeProps) => {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const iconSize = { sm: 12, md: 14, lg: 18 };

  // Determine verification type from either prop
  let verifyType: VerificationType = verificationType || 'none';
  
  // Backward compatibility: map old level prop to new verificationType
  if (!verificationType && level) {
    if (level === 'gold') verifyType = 'gold';
    else if (level === 'blue') verifyType = 'blue';
    else verifyType = 'none';
  }

  // Don't render anything if no verification
  if (verifyType === 'none') {
    return null;
  }

  // Blue verification badge
  if (verifyType === 'blue') {
    return (
      <span className={`inline-flex items-center rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ${sizeClasses[size]}`}>
        <BadgeCheck size={iconSize[size]} />
      </span>
    );
  }

  // Gold verification badge
  if (verifyType === 'gold') {
    return (
      <span className={`inline-flex items-center rounded-full font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ${sizeClasses[size]}`}>
        <Award size={iconSize[size]} />
      </span>
    );
  }

  return null;
};

export default SubscriptionBadge;
