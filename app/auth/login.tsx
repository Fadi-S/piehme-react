import type {Route} from "./+types/login";
import Input from "~/components/input";
import Button from "~/components/button";
import {
    useLoginMutation,
    setUsername as setUsernameReducer,
    setToken,
    setUserId,
    setRole
} from "~/features/authentication/authenticationApiSlice";
import React, {useEffect} from "react";
import {useAppDispatch} from "~/base/hooks";
import Logo from "~/components/logo";
import { useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
    return [
        {title: "Login"},
    ];
}

// Suspicious usernames that should trigger security alert
const SUSPICIOUS_USERNAMES = ['admin', 'administrator', 'root', 'system', 'test', 'user'];
const FLAG_VALUE = "TE9HTyBIQUNLRVI=";

// Get failed attempts from sessionStorage
function getFailedAttempts(): number {
    const attempts = sessionStorage.getItem('login_failed_attempts');
    return attempts ? parseInt(attempts, 10) : 0;
}

// Set failed attempts in sessionStorage
function setFailedAttempts(count: number) {
    sessionStorage.setItem('login_failed_attempts', count.toString());
}

// Clear failed attempts
function clearFailedAttempts() {
    sessionStorage.removeItem('login_failed_attempts');
}

export default function Login() {
    const navigate = useNavigate();
    const [login, {isLoading, isSuccess, isError, error, data}] = useLoginMutation();
    const [username, setUsername] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [, setLogoClickCount] = React.useState(0);

    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

    const dispatch = useAppDispatch();

    const handleLogoClick = () => {
        setLogoClickCount(prevCount => {
            const nextCount = prevCount + 1;
            if (nextCount >= 10) {
                alert(`Oops you got me: ${FLAG_VALUE}`);
                return 0;
            }
            return nextCount;
        });
    };

    function submit(e: React.FormEvent) {
        e.preventDefault();

        // Check if username is suspicious
        const lowerUsername = username.toLowerCase().trim();
        if (SUSPICIOUS_USERNAMES.includes(lowerUsername)) {
            console.warn('🚨 Suspicious username detected:', username);
            
            // Store suspicious path for security warning
            sessionStorage.setItem('suspicious_path', `/login?username=${username}`);
            sessionStorage.setItem('suspicious_reason', `Attempted login with suspicious username: ${username}`);
            
            // Redirect to security warning
            navigate('/security-warning', { replace: true });
            return;
        }

        login({username, password});
    }

    useEffect(() => {
        if (isSuccess && data) {
            dispatch(setToken(data.jwttoken));
            dispatch(setUsernameReducer(data.username));
            dispatch(setUserId(data.userId));
            dispatch(setRole(data.role));

            setErrorMessage(null);
            
            // Clear failed attempts on successful login
            clearFailedAttempts();

            window.location.href = "/";
        }
        if(isError && error) {
            // @ts-ignore
            setErrorMessage(error.data?.message);
            
            // Increment failed attempts
            const currentAttempts = getFailedAttempts();
            const newAttempts = currentAttempts + 1;
            setFailedAttempts(newAttempts);
            
            console.warn(`Failed login attempt ${newAttempts}/3 for username: ${username}`);
            
            // Check if we've reached 3 failed attempts
            if (newAttempts >= 3) {
                console.error('🚨 Maximum failed login attempts reached!');
                
                // Store info for security warning
                sessionStorage.setItem('suspicious_path', `/login?username=${username}`);
                sessionStorage.setItem('suspicious_reason', `3 failed login attempts with username: ${username}`);
                
                // Clear attempts counter
                clearFailedAttempts();
                
                // Redirect to security warning
                navigate('/security-warning', { replace: true });
            }
        }
    }, [isSuccess, isLoading, isError]);

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <Logo className="mx-auto h-10 w-auto cursor-pointer select-none" onClick={handleLogoClick} />
                    <h2 className="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
                    <div className="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
                        <form onSubmit={submit} className="space-y-6">
                            <Input
                                id="username"
                                name="username"
                                required={true}
                                label="Username"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />

                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required={true}
                                label="Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />

                            <div>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Loading..." : "Sign In"}
                                </Button>
                            </div>

                            {errorMessage && <div className="text-red-600 text-sm/6">{errorMessage}</div>}
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}

