import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getAllDoctors, getSpecializations } from '@/services/firebaseService';
import DoctorCard from '@/components/DoctorCard';
import Layout from '@/components/Layout';
import BackButton from '@/components/BackButton';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion } from 'framer-motion';

const DoctorSearch = () => {
  const { t, language } = useLanguage();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [specializations, setSpecializations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsData, specializationsData] = await Promise.all([
          getAllDoctors(),
          getSpecializations(),
        ]);
        setDoctors(doctorsData);
        setSpecializations(specializationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filtered = doctors.filter(d => {
    if (selectedSpec && d.specialization !== selectedSpec) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      const nameAr = (d.nameAr || '').toLowerCase();
      const nameEn = (d.displayName || d.name || '').toLowerCase();
      const spec = (d.specialization || '').toLowerCase();
      const bio = (d.bio || '').toLowerCase();
      
      // Search in Arabic name, English name, specialization, and bio
      return (
        nameAr.includes(q) ||
        nameEn.includes(q) ||
        spec.includes(q) ||
        bio.includes(q) ||
        // Also check if the name starts with the search query (for better matching)
        nameAr.startsWith(q) ||
        nameEn.startsWith(q)
      );
    }
    return true;
  });

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
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-4">
          <BackButton variant="minimal" />
        </div>
        
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{t('doctor.searchDoctors')}</h1>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center gap-3 px-4 rounded-lg border border-input bg-card">
              <Search size={18} className="text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                className="w-full py-3 bg-transparent text-sm outline-none"
              />
              {searchQuery && <button onClick={() => setSearchQuery('')}><X size={16} className="text-muted-foreground" /></button>}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-3 rounded-lg border border-input bg-card flex items-center gap-2 text-sm"
            >
              <SlidersHorizontal size={16} />
              {t('common.filter')}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside className={`${showFilters ? 'block' : 'hidden'} md:block w-full md:w-64 shrink-0`}>
            <div className="bg-card rounded-xl border border-border p-5 space-y-6 sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">{t('common.filter')}</h3>
                <button
                  onClick={() => { setSelectedSpec(''); }}
                  className="text-xs text-primary hover:underline"
                >
                  {language === 'ar' ? 'مسح الفلاتر' : 'Clear Filters'}
                </button>
              </div>

              {/* Specialization */}
              {specializations.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">{t('doctor.specialization')}</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedSpec('')}
                      className={`block w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${!selectedSpec ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                    >
                      {language === 'ar' ? 'الكل' : 'All'}
                    </button>
                    {specializations.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSpec(s.key)}
                        className={`block w-full text-start px-3 py-2 rounded-lg text-sm transition-colors ${selectedSpec === s.key ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground hover:bg-muted'}`}
                      >
                        {s.icon} {language === 'ar' ? s.nameAr : s.nameEn}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-4">
              {filtered.length} {language === 'ar' ? 'نتيجة بحث' : 'search results'}
            </p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
                {filtered.map((doc, i) => (
                  <motion.div key={doc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <DoctorCard doctor={doc} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground">
                {language === 'ar' ? 'لا توجد نتائج' : 'No results found'}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DoctorSearch;
