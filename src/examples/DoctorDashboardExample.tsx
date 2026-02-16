/**
 * Example Component: Doctor Dashboard with Firebase Integration
 * 
 * This example demonstrates how to use all Firebase services in a React component
 */

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAppointments, usePendingRequests, useNotifications } from '@/hooks/useFirebase';
import {
    updateAppointmentStatus,
    updateDoctorProfile,
} from '@/services/firebaseService';
import { sendNotificationToUser } from '@/services/notificationService';

export const DoctorDashboardExample = () => {
    const { userData, signOut } = useAuth();
    const { t } = useLanguage();
    const { appointments, loading: appointmentsLoading } = useAppointments();
    const { requests, loading: requestsLoading } = usePendingRequests();
    const { notifications, unreadCount } = useNotifications();

    const [updating, setUpdating] = useState(false);

    // Handle appointment approval
    const handleApproveAppointment = async (appointmentId: string, patientId: string) => {
        try {
            setUpdating(true);

            // Update appointment status
            await updateAppointmentStatus(appointmentId, 'approved');

            // Send notification to patient
            await sendNotificationToUser(
                patientId,
                t('notifications.appointmentStatusChanged'),
                t('appointment.approved'),
                'approval',
                appointmentId
            );

            alert(t('success.appointmentApproved'));
        } catch (error) {
            console.error('Error approving appointment:', error);
            alert(t('errors.somethingWentWrong'));
        } finally {
            setUpdating(false);
        }
    };

    // Handle profile update request
    const handleUpdateProfile = async (updates: any) => {
        try {
            setUpdating(true);

            // This creates a pending request for admin approval
            await updateDoctorProfile(userData!.uid, updates);

            alert(t('success.requestSubmitted'));
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(t('errors.somethingWentWrong'));
        } finally {
            setUpdating(false);
        }
    };

    if (appointmentsLoading || requestsLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">{t('dashboard.welcome')}, {userData?.name}</h1>
                    <p className="text-muted-foreground">{t('doctor.dashboard')}</p>
                </div>
                <div className="flex gap-4">
                    {/* Notifications Badge */}
                    <div className="relative">
                        <button className="p-2 rounded-full hover:bg-accent">
                            🔔
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                    </div>
                    <button onClick={signOut} className="btn btn-outline">
                        {t('common.logout')}
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-card p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        {t('dashboard.upcomingAppointments')}
                    </h3>
                    <p className="text-3xl font-bold mt-2">
                        {appointments.filter(a => a.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        {t('doctor.pendingRequests')}
                    </h3>
                    <p className="text-3xl font-bold mt-2">
                        {requests.filter(r => r.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-muted-foreground">
                        {t('doctor.subscriptionPlan')}
                    </h3>
                    <p className="text-3xl font-bold mt-2">
                        {userData?.subscriptionPlan || 'Silver'}
                    </p>
                </div>
            </div>

            {/* Appointments List */}
            <div className="bg-card p-6 rounded-lg shadow mb-8">
                <h2 className="text-xl font-bold mb-4">{t('dashboard.myAppointments')}</h2>
                <div className="space-y-4">
                    {appointments.map((appointment) => (
                        <div key={appointment.id} className="border p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">Patient ID: {appointment.patientId}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {appointment.date?.toLocaleDateString()} at {appointment.date?.toLocaleTimeString()}
                                    </p>
                                    <p className="text-sm mt-2">{appointment.notes}</p>
                                </div>
                                <div className="flex gap-2">
                                    {appointment.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApproveAppointment(appointment.id, appointment.patientId)}
                                                disabled={updating}
                                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                            >
                                                {t('admin.approveRequest')}
                                            </button>
                                            <button
                                                onClick={() => updateAppointmentStatus(appointment.id, 'rejected')}
                                                disabled={updating}
                                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                            >
                                                {t('admin.rejectRequest')}
                                            </button>
                                        </>
                                    )}
                                    {appointment.status !== 'pending' && (
                                        <span className={`px-3 py-1 rounded-full text-sm ${appointment.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                appointment.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {t(`appointment.${appointment.status}`)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {appointments.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            No appointments yet
                        </p>
                    )}
                </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-card p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">{t('doctor.pendingRequests')}</h2>
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div key={request.id} className="border p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium">{request.requestType}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {request.createdAt?.toLocaleDateString()}
                                    </p>
                                    <pre className="text-sm mt-2 bg-muted p-2 rounded">
                                        {JSON.stringify(request.requestedData, null, 2)}
                                    </pre>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {request.status}
                                </span>
                            </div>
                            {request.status === 'rejected' && request.rejectionReason && (
                                <p className="text-sm text-red-600 mt-2">
                                    Reason: {request.rejectionReason}
                                </p>
                            )}
                        </div>
                    ))}
                    {requests.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                            No pending requests
                        </p>
                    )}
                </div>
            </div>

            {/* Profile Update Form Example */}
            <div className="bg-card p-6 rounded-lg shadow mt-8">
                <h2 className="text-xl font-bold mb-4">{t('doctor.updateProfile')}</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        handleUpdateProfile({
                            bio: formData.get('bio'),
                            price: Number(formData.get('price')),
                        });
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('doctor.bio')}
                        </label>
                        <textarea
                            name="bio"
                            className="w-full p-2 border rounded"
                            rows={4}
                            placeholder="Update your bio..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            {t('doctor.price')}
                        </label>
                        <input
                            type="number"
                            name="price"
                            className="w-full p-2 border rounded"
                            placeholder="Consultation fee"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={updating}
                        className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
                    >
                        {updating ? t('common.loading') : t('common.submit')}
                    </button>
                    <p className="text-sm text-muted-foreground">
                        Note: Profile updates require admin approval
                    </p>
                </form>
            </div>
        </div>
    );
};

export default DoctorDashboardExample;
