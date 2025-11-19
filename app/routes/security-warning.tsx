import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { getClientIP, getSecurityAlertPayload, sendSecurityEmail, trackSuspiciousAttempt } from "~/base/security";

export default function SecurityWarning() {
    const navigate = useNavigate();
    const [ipAddress, setIpAddress] = useState<string>("...");
    const [countdown, setCountdown] = useState<number>(10);
    const [attemptedPath, setAttemptedPath] = useState<string>("/unknown");
    const [suspiciousReason, setSuspiciousReason] = useState<string | null>(null);

    useEffect(() => {
        // Get the attempted path and reason from sessionStorage
        const suspiciousPath = sessionStorage.getItem('suspicious_path') || '/unknown';
        const reason = sessionStorage.getItem('suspicious_reason');
        
        setAttemptedPath(suspiciousPath);
        setSuspiciousReason(reason);
        
        // Get and display IP address
        const fetchIP = async () => {
            const ip = await getClientIP();
            setIpAddress(ip);

            // Track the attempt
            const isRepeatedAttack = trackSuspiciousAttempt(suspiciousPath);
            
            // Send security alert email
            try {
                const alertPayload = await getSecurityAlertPayload(suspiciousPath);
                const emailSent = await sendSecurityEmail(alertPayload);
                
                if (emailSent && isRepeatedAttack) {
                    console.error('🚨 MULTIPLE SUSPICIOUS ATTEMPTS DETECTED!');
                }
            } catch (error) {
                console.error("Failed to send security alert:", error);
            }
        };

        fetchIP();

        // Countdown timer
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-gray-900 flex items-center justify-center px-4">
            <div className="max-w-2xl w-full">
                <div className="bg-black/40 backdrop-blur-sm border-2 border-red-500 rounded-lg shadow-2xl p-8 text-center">
                    {/* Warning Icon */}
                    <div className="mb-6">
                        <div className="mx-auto w-24 h-24 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                            <svg
                                className="w-16 h-16 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Main Message */}
                    <h1 className="text-4xl md:text-5xl font-bold text-red-500 mb-4 animate-pulse">
                        ⚠️ STOP RIGHT THERE! ⚠️
                    </h1>

                    <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6">
                        Unauthorized Access Detected
                    </h2>

                    {/* Warning Message */}
                    <div className="bg-red-950/50 border border-red-700 rounded-lg p-6 mb-6">
                        <p className="text-xl text-red-200 mb-4">
                            Nice try, but we've captured your information:
                        </p>

                        <div className="space-y-3 text-left">
                            <div className="flex items-center justify-between bg-black/30 px-4 py-3 rounded">
                                <span className="text-gray-400">Your IP Address:</span>
                                <span className="text-red-400 font-mono font-bold text-lg">
                                    {ipAddress}
                                </span>
                            </div>
                            <div className="flex items-center justify-between bg-black/30 px-4 py-3 rounded">
                                <span className="text-gray-400">Attempted Path:</span>
                                <span className="text-red-400 font-mono font-bold">
                                    {attemptedPath}
                                </span>
                            </div>
                            {suspiciousReason && (
                                <div className="bg-black/30 px-4 py-3 rounded">
                                    <span className="text-gray-400 block mb-2">Reason:</span>
                                    <span className="text-red-400 font-bold">
                                        {suspiciousReason}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between bg-black/30 px-4 py-3 rounded">
                                <span className="text-gray-400">Status:</span>
                                <span className="text-red-400 font-bold">LOGGED & REPORTED</span>
                            </div>
                        </div>
                    </div>

                    {/* Additional Warning */}
                    <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 mb-6">
                        <p className="text-yellow-200 text-sm">
                            ⚡ Your activity has been logged and the administrator has been notified.
                            <br />
                            Attempting to access unauthorized resources is illegal and may result in prosecution.
                        </p>
                    </div>

                    {/* Countdown */}
                    <div className="mb-4">
                        <p className="text-white text-lg">
                            Redirecting to home page in{" "}
                            <span className="text-red-400 font-bold text-2xl">{countdown}</span>{" "}
                            seconds...
                        </p>
                    </div>

                    {/* Button */}
                    <button
                        onClick={() => navigate("/")}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 transform hover:scale-105"
                    >
                        Take Me Home Now
                    </button>

                    {/* Footer Message */}
                    <p className="mt-6 text-gray-400 text-sm">
                        If you believe this is an error, please contact the administrator.
                    </p>
                </div>
            </div>
        </div>
    );
}
