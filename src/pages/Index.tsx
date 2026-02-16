import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDoctorById, getPlatformSettings } from '@/services/firebaseService';
import { getFeaturedDoctors } from '@/services/featuredDoctorsService';
import DoctorCard from '@/components/DoctorCard';
import Layout from '@/components/Layout';
import { Search, UserCheck, Calendar, ShieldCheck, Star, Award, HeartHandshake } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Index = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImages, setHeroImages] = useState<(string | { url: string; link: string })[]>([
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80', // Medical hero
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1920&q=80', // Medical team
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920&q=80', // Doctor consultation
  ]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredList, settings] = await Promise.all([
          getFeaturedDoctors(),
          getPlatformSettings(),
        ]);

        // Fetch full doctor details for each featured doctor
        const doctorsPromises = featuredList.map(featured =>
          getDoctorById(featured.doctorId)
        );
        const doctorsData = await Promise.all(doctorsPromises);

        // Filter out null values and maintain order
        setFeaturedDoctors(doctorsData.filter(doc => doc !== null));

        if (settings?.heroImages && settings.heroImages.length > 0) {
          setHeroImages(settings.heroImages);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (heroImages.length > 1) {
      const timer = setInterval(() => {
        setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [heroImages]);

  const stats = [
    { icon: HeartHandshake, title: t('home.step1Title'), desc: t('home.step1Desc'), color: 'text-rose-500', bg: 'bg-rose-50' },
    { icon: ShieldCheck, title: t('home.step2Title'), desc: t('home.step2Desc'), color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { icon: Award, title: t('home.step3Title'), desc: t('home.step3Desc'), color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?q=${encodeURIComponent(searchQuery)}`);
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
      {/* Hero Section - Optimized for Mobile */}
      <section className="relative min-h-[85vh] md:min-h-[700px] flex items-center overflow-hidden">
        {/* Background Images Slider */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHeroIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {(() => {
                const hero = heroImages[currentHeroIndex];
                const url = typeof hero === 'string' ? hero : hero.url;
                const targetLink = typeof hero === 'string' ? null : hero.link;

                const content = (
                  <div
                    className="w-full h-full bg-cover bg-center md:bg-center"
                    style={{
                      backgroundImage: `url(${url})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center center'
                    }}
                  >
                    {/* Darker gradient specifically for mobile readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/60 to-background md:bg-gradient-to-r md:from-background md:via-background/70 md:to-transparent rtl:md:bg-gradient-to-l" />
                  </div>
                );

                if (targetLink) {
                  return targetLink.startsWith('http') ? (
                    <a href={targetLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full cursor-pointer">
                      {content}
                    </a>
                  ) : (
                    <Link to={targetLink} className="block w-full h-full cursor-pointer">
                      {content}
                    </Link>
                  );
                }

                return content;
              })()}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="container mx-auto px-4 relative z-10 pt-20 md:pt-0">
          <div className="max-w-3xl text-center md:text-start mx-auto md:mx-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 md:space-y-8"
            >
              <div className="flex justify-center md:justify-start">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold backdrop-blur-md shadow-sm border border-primary/20">
                  <Star size={14} className="md:w-4 md:h-4" fill="currentColor" />
                  {t('common.appName')}
                </span>
              </div>

              {/* Mobile: Larger, bolder title */}
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-foreground leading-[1.2] md:leading-[1.1] tracking-tight">
                {t('home.heroTitle')}
              </h1>

              {/* Mobile: Reads better */}
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-xl mx-auto md:mx-0 font-medium">
                {t('home.heroSubtitle')}
              </p>

              {/* Enhanced Search Bar - Mobile Responsive */}
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row bg-card/80 backdrop-blur-xl rounded-2xl shadow-2xl p-2 md:p-3 border border-border/50 mt-8 md:mt-12 transition-all hover:bg-card/95 will-change-transform">
                <div className="flex-1 flex items-center gap-3 px-4 py-3 sm:py-0">
                  <Search size={22} className="md:w-6 md:h-6 text-primary shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('home.searchPlaceholder')}
                    className="w-full bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base md:text-lg font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-2 sm:mt-0 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-bold text-base md:text-lg hover:bg-primary/90 active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
                >
                  {t('home.searchBtn')}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Doctors Section - Mobile Optimized */}
      <section className="py-12 md:py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-3 md:px-4">
          <div className="text-center max-w-3xl mx-auto mb-8 md:mb-16">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 md:mb-6 tracking-tight">
              {t('home.featuredDoctors')}
            </h2>
            <p className="text-slate-600 text-sm md:text-lg leading-relaxed">
              {t('home.featuredDoctorsDesc')}
            </p>
          </div>

          {/* Grid: 2 columns on mobile, 3 on tablet, 4 on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {featuredDoctors.length > 0 ? (
              featuredDoctors.map((doc, index) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <DoctorCard doctor={doc} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 md:py-20 text-center text-slate-400 bg-white rounded-2xl md:rounded-3xl border-2 border-dashed border-slate-200">
                <Calendar className="mx-auto mb-4 md:mb-6 opacity-20" size={40} />
                <p className="text-sm md:text-lg font-medium">{t('home.noFeaturedDoctors')}</p>
              </div>
            )}
          </div>

          <div className="text-center mt-8 md:mt-12">
            <Link 
              to="/doctors" 
              className="inline-flex items-center justify-center px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-full bg-white border-2 border-slate-200 text-slate-900 text-sm md:text-base font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md active:scale-95"
            >
              {t('nav.findDoctors')}
            </Link>
          </div>
        </div>
      </section>

      {/* Value Propositions / How it works - Mobile Optimized */}
      <section className="py-16 md:py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">
              {t('home.howItWorks')}
            </h2>
            <div className="h-2 w-24 bg-primary rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Background decorative line - Hidden on mobile */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 z-0" />

            {stats.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 p-8 md:p-10 rounded-3xl bg-card border border-border shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center group"
              >
                <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl ${step.bg} flex items-center justify-center mx-auto mb-6 md:mb-8 transform rotate-0 group-hover:rotate-6 transition-transform duration-300`}>
                  <step.icon size={40} className={`md:w-12 md:h-12 ${step.color}`} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground mb-4">{step.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
