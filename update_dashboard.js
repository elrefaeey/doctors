const fs = require('fs');

// Read the file
let content = fs.readFileSync('src/pages/DoctorDashboard.tsx', 'utf8');

// Replace earnings section
content = content.replace(
  /\{section === 'earnings' && \([\s\S]*?\)\}/m,
  `{section === 'earnings' && (
                        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
                            {/* Earnings Stats Cards - Mobile Optimized with Gradients */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {/* Total Earnings */}
                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-lg">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <DollarSign size={24} className="md:w-7 md:h-7" />
                                        </div>
                                    </div>
                                    <div className="text-4xl md:text-5xl font-black mb-2">
                                        {doctorData?.totalEarnings || 0} {language === 'ar' ? 'ج.م' : 'EGP'}
                                    </div>
                                    <div className="text-sm md:text-base text-white/90 font-medium">
                                        {t('doctorDash.earningsPage.total')}
                                    </div>
                                </div>

                                {/* This Month */}
                                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-lg">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <TrendingUp size={24} className="md:w-7 md:h-7" />
                                        </div>
                                    </div>
                                    <div className="text-4xl md:text-5xl font-black mb-2">
                                        {Math.round((doctorData?.totalEarnings || 0) * 0.3)} {language === 'ar' ? 'ج.م' : 'EGP'}
                                    </div>
                                    <div className="text-sm md:text-base text-white/90 font-medium">
                                        {t('doctorDash.earningsPage.thisMonth')}
                                    </div>
                                </div>

                                {/* Completed Sessions */}
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-lg sm:col-span-2 lg:col-span-1">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                            <CheckCircle2 size={24} className="md:w-7 md:h-7" />
                                        </div>
                                    </div>
                                    <div className="text-4xl md:text-5xl font-black mb-2">
                                        {appointments.filter(a => a.status === 'completed').length}
                                    </div>
                                    <div className="text-sm md:text-base text-white/90 font-medium">
                                        {t('doctorDash.earningsPage.completedSessions')}
                                    </div>
                                </div>
                            </div>

                            {/* Earnings Chart */}
                            <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 p-4 md:p-8 shadow-soft">
                                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-4 md:mb-8 px-2">{t('doctorDash.charts.earningsTrend')}</h3>
                                <div className="h-[250px] md:h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={earningsData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                            <Tooltip 
                                                contentStyle={{ 
                                                    borderRadius: '12px', 
                                                    border: 'none', 
                                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                                                }}
                                            />
                                            <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}`
);

// Write back
fs.writeFileSync('src/pages/DoctorDashboard.tsx', content);
console.log('Updated earnings section');
