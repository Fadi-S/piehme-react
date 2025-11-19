import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { 
    isSuspiciousPath
} from '~/base/security';

export default function SecurityMonitor() {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const checkPath = () => {
            const currentPath = location.pathname;
            
            // Don't redirect if already on warning page
            if (currentPath === '/security-warning') {
                return;
            }
            
            // Check if the current path is suspicious
            if (isSuspiciousPath(currentPath)) {
                console.warn('🚨 Suspicious path detected:', currentPath);
                
                // Store the attempted path in sessionStorage so warning page can access it
                sessionStorage.setItem('suspicious_path', currentPath);
                
                // Redirect to warning page
                navigate('/security-warning', { replace: true });
            }
        };

        checkPath();
    }, [location.pathname, navigate]);

    return null; // This component doesn't render anything
}
