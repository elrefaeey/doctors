import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  getFeaturedDoctors, 
  addFeaturedDoctor, 
  removeFeaturedDoctor,
  moveFeaturedDoctorUp,
  moveFeaturedDoctorDown 
} from '@/services/featuredDoctorsService';
import { getAllDoctors } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';
import { Star, Plus, Trash2, ChevronUp, ChevronDown, Search } from 'lucide-react';

const FeaturedDoctorsManagement = () => {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();
  const [featuredDoctors, setFeaturedDoctors] = useState<any[]>([]);
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [featured, doctors] = await Promise.all([
        getFeaturedDoctors(),
        getAllDoctors(),
      ]);
      setFeaturedDoctors(featured);
      setAllDoctors(doctors);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeatured = async (doctor: any) => {
    try {
      await addFeaturedDoctor(
        doctor.id,
        doctor.displayName || doctor.name,
        doctor.nameAr || doctor.displayName,
        doctor.specialization,
        currentUser!.uid
      );
      await fetchData();
      setShowAddModal(false);
      alert(t('adminDash.doctorAddedToFeatured'));
    } catch (error) {
      console.error('Error adding featured doctor:', error);
      alert(t('adminDash.errorAddingDoctor'));
    }
  };

  const handleRemoveFeatured = async (doctorId: string) => {
    if (!confirm(t('adminDash.confirmRemoveFeatured'))) return;
    
    try {
      await removeFeaturedDoctor(doctorId);
      await fetchData();
      alert(t('adminDash.doctorRemovedFromFeatured'));
    } catch (error) {
      console.error('Error removing featured doctor:', error);
      alert(t('adminDash.errorRemovingDoctor'));
    }
  };

  const handleMoveUp = async (doctorId: string) => {
    try {
      await moveFeaturedDoctorUp(doctorId);
      await fetchData();
    } catch (error) {
      console.error('Error moving doctor up:', error);
    }
  };

  const handleMoveDown = async (doctorId: string) => {
    try {
      await moveFeaturedDoctorDown(doctorId);
      await fetchData();
    } catch (error) {
      console.error('Error moving doctor down:', error);
    }
  };

  const availableDoctors = allDoctors.filter(
    doc => !featuredDoctors.some(f => f.doctorId === doc.id)
  );

  const filteredAvailableDoctors = availableDoctors.filter(doc =>
    (doc.displayName || doc.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (doc.nameAr || '').includes(searchQuery) ||
    (doc.specialization || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg md:text-2xl font-bold text-foreground flex items-center gap-2">
            <Star className="text-yellow-500 w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
            <span className="text-sm md:text-2xl">{t('adminDash.featuredDoctorsTitle')}</span>
          </h2>
          <p className="text-[10px] md:text-sm text-muted-foreground mt-1">
            {t('adminDash.featuredDoctorsDesc')}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(!showAddModal)}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl bg-primary text-primary-foreground text-xs md:text-sm font-bold hover:opacity-90 active:scale-95 transition-all"
        >
          <Plus size={14} className="md:w-4 md:h-4" />
          {t('adminDash.addDoctor')}
        </button>
      </div>

      {/* Featured Doctors List */}
      <div className="bg-card rounded-xl md:rounded-2xl border border-border p-3 md:p-6 shadow-sm">
        <h3 className="text-sm md:text-lg font-semibold text-foreground mb-3 md:mb-4">
          {t('adminDash.featuredDoctorsCount')} ({featuredDoctors.length})
        </h3>
        
        {featuredDoctors.length === 0 ? (
          <div className="text-center py-8 md:py-12 text-muted-foreground">
            <Star size={32} className="mx-auto mb-3 md:mb-4 opacity-20 md:w-12 md:h-12" />
            <p className="text-xs md:text-base">{t('adminDash.noFeaturedDoctors')}</p>
            <p className="text-[10px] md:text-sm mt-1 md:mt-2">{t('adminDash.clickAddDoctor')}</p>
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3">
            {featuredDoctors.map((featured, index) => {
              const doctor = allDoctors.find(d => d.id === featured.doctorId);
              if (!doctor) return null;

              return (
                <div
                  key={featured.doctorId}
                  className="flex items-center gap-2 md:gap-4 p-2 md:p-4 rounded-lg md:rounded-xl bg-muted/50 border border-border"
                >
                  {/* Order Number */}
                  <div className="flex items-center justify-center w-8 h-8 md:w-12 md:h-12 rounded-full bg-primary text-primary-foreground font-bold text-xs md:text-lg shrink-0">
                    {index + 1}
                  </div>

                  {/* Doctor Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-foreground text-xs md:text-base truncate">
                      {language === 'ar' ? (doctor.nameAr || doctor.displayName || doctor.name) : (doctor.displayName || doctor.name)}
                    </h4>
                    <p className="text-[10px] md:text-sm text-muted-foreground truncate">
                      {doctor.specialization}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 md:gap-2 shrink-0">
                    <button
                      onClick={() => handleMoveUp(featured.doctorId)}
                      disabled={index === 0}
                      className="p-1 md:p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title={t('adminDash.moveUp')}
                    >
                      <ChevronUp size={14} className="md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveDown(featured.doctorId)}
                      disabled={index === featuredDoctors.length - 1}
                      className="p-1 md:p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title={t('adminDash.moveDown')}
                    >
                      <ChevronDown size={14} className="md:w-4 md:h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveFeatured(featured.doctorId)}
                      className="p-1 md:p-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-all"
                      title={t('adminDash.remove')}
                    >
                      <Trash2 size={14} className="md:w-4 md:h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4">
          <div className="bg-card rounded-xl md:rounded-2xl border border-border max-w-2xl w-full max-h-[85vh] md:max-h-[80vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-border">
              <h3 className="text-base md:text-xl font-bold text-foreground">{t('adminDash.addToFeatured')}</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground mt-1">
                {t('adminDash.selectDoctorToAdd')}
              </p>
            </div>

            {/* Search */}
            <div className="p-3 md:p-4 border-b border-border">
              <div className="relative">
                <Search size={14} className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-muted-foreground md:w-4 md:h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('adminDash.searchDoctor')}
                  className="w-full pr-8 md:pr-10 pl-3 md:pl-4 py-1.5 md:py-2 rounded-lg border border-input bg-background text-xs md:text-sm"
                />
              </div>
            </div>

            {/* Doctors List */}
            <div className="flex-1 overflow-y-auto p-3 md:p-4">
              {filteredAvailableDoctors.length === 0 ? (
                <div className="text-center py-8 md:py-12 text-muted-foreground">
                  <p className="text-xs md:text-base">{t('adminDash.noDoctorsAvailable')}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAvailableDoctors.map(doctor => (
                    <button
                      key={doctor.id}
                      onClick={() => handleAddFeatured(doctor)}
                      className="w-full flex items-center gap-2 md:gap-4 p-2 md:p-4 rounded-lg border border-border hover:bg-accent transition-colors text-right"
                    >
                      <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-accent flex items-center justify-center text-xs md:text-lg font-bold shrink-0">
                        {(doctor.displayName || doctor.name || '').charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground text-xs md:text-base truncate">
                          {language === 'ar' ? (doctor.nameAr || doctor.displayName || doctor.name) : (doctor.displayName || doctor.name)}
                        </h4>
                        <p className="text-[10px] md:text-sm text-muted-foreground truncate">
                          {doctor.specialization}
                        </p>
                      </div>
                      <Plus size={16} className="text-primary shrink-0 md:w-5 md:h-5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 md:p-4 border-t border-border">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchQuery('');
                }}
                className="w-full px-3 md:px-4 py-2 md:py-2.5 rounded-lg border border-border hover:bg-accent text-xs md:text-sm font-medium transition-colors"
              >
                {t('adminDash.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedDoctorsManagement;
