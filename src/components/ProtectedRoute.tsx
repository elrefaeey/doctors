import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/firebase';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    allowedRoles,
    requireAuth = true,
}) => {
    const { currentUser, userData, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // If authentication is required but user is not logged in
    if (requireAuth && !currentUser) {
        return <Navigate to="/role-select" state={{ from: location }} replace />;
    }

    // If specific roles are required, check if user has the right role
    if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
        // Redirect to appropriate dashboard based on user role
        const redirectPath = {
            admin: '/admin/dashboard',
            doctor: '/doctor/dashboard',
            patient: '/patient/dashboard',
        }[userData.role];

        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

// Specific role-based route components for convenience
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>
);

export const DoctorRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute allowedRoles={['doctor']}>{children}</ProtectedRoute>
);

export const PatientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute allowedRoles={['patient']}>{children}</ProtectedRoute>
);

export const DoctorOrAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <ProtectedRoute allowedRoles={['doctor', 'admin']}>{children}</ProtectedRoute>
);
