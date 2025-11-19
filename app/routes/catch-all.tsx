import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { isSuspiciousPath } from "~/base/security";

export default function CatchAll() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const currentPath = location.pathname;
        
        // Check if the current path is suspicious
        if (isSuspiciousPath(currentPath)) {
            console.warn('🚨 Suspicious path detected:', currentPath);
            
            // Store the attempted path so warning page can access it
            sessionStorage.setItem('suspicious_path', currentPath);
            
            // Redirect to warning page
            navigate('/security-warning', { replace: true });
        } else {
            // Regular 404 - redirect to home or show 404 page
            navigate('/', { replace: true });
        }
    }, [location.pathname, navigate]);

    // Show loading while redirecting
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-gray-600">Redirecting...</p>
            </div>
        </div>
    );
}
