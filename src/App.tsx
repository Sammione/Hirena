import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { supabase } from './lib/supabase';
import { useState, useEffect } from 'react';

// Lazy load pages for performance
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const JobDiscovery = lazy(() => import('./pages/JobDiscovery'));
const CareerPathway = lazy(() => import('./pages/CareerPathway'));
const CVManagement = lazy(() => import('./pages/CVManagement'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const SalaryNegotiator = lazy(() => import('./pages/SalaryNegotiator'));
const CompanyInsights = lazy(() => import('./pages/CompanyInsights'));

// Loading component
const PageLoader = () => (
    <div className="flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-brand-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null); // null means not yet determined
    const [loading, setLoading] = useState(true); // Start loading

    useEffect(() => {
        let isMounted = true;

        // Failsafe: Force loading to false after 3 seconds no matter what
        const timeout = setTimeout(() => {
            if (isMounted && loading) {
                console.warn('ProtectedRoute: Auth check timed out, forcing load completion.');
                setLoading(false);
            }
        }, 3000);

        const handleAuthAction = async (session: any) => {
            if (!isMounted) return;

            setUser(session?.user ?? null);

            if (session?.user) {
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('onboarded')
                        .eq('id', session.user.id)
                        .maybeSingle();

                    if (isMounted) {
                        setIsOnboarded(profile?.onboarded ?? false);
                    }
                } catch (err) {
                    console.error('ProtectedRoute: Profile fetch error', err);
                    if (isMounted) setIsOnboarded(false);
                }
            } else {
                if (isMounted) {
                    setIsOnboarded(null); // Reset onboarded state if no user
                }
            }

            if (isMounted) setLoading(false);
        };

        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            handleAuthAction(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            handleAuthAction(session);
        });

        return () => {
            isMounted = false;
            clearTimeout(timeout);
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return <PageLoader />;
    }

    // If not loading, and no user, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If user exists, handle onboarding redirects
    const isAtOnboarding = window.location.pathname === '/onboarding';

    if (isOnboarded === false && !isAtOnboarding) {
        // User is logged in but not onboarded, and not on the onboarding page
        return <Navigate to="/onboarding" replace />;
    }

    if (isOnboarded === true && isAtOnboarding) {
        // User is logged in and onboarded, but on the onboarding page
        return <Navigate to="/dashboard" replace />;
    }

    // If user is logged in, onboarded state is consistent with current path,
    // or isOnboarded is null (meaning profile check might still be pending or failed,
    // but we have a user and are not forcing a redirect based on onboarding status yet),
    // render children.
    return <>{children}</>;
};

function App() {
    return (
        <Router>
            <Suspense fallback={<PageLoader />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Landing />} />

                    {/* Auth Routes */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>

                    <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />

                    {/* App Routes */}
                    <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/jobs" element={<JobDiscovery />} />
                        <Route path="/pathway" element={<CareerPathway />} />
                        <Route path="/cv" element={<CVManagement />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/negotiator" element={<SalaryNegotiator />} />
                        <Route path="/company-insights" element={<CompanyInsights />} />
                        <Route path="/settings" element={<Profile />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
