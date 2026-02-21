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
        let initialCheckDone = false; // Flag to ensure loading is set to false only after the first event

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            if (!isMounted) return;

            console.log('onAuthStateChange event:', _event, 'session:', session?.user?.id);

            // Add a small delay to allow session persistence to settle
            // This helps prevent flickering or incorrect redirects on initial load/refresh
            await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay

            if (!isMounted) return; // Check again after delay

            setUser(session?.user ?? null);

            if (session?.user) {
                try {
                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('onboarded')
                        .eq('id', session.user.id)
                        .maybeSingle(); // Use maybeSingle as profile might not exist yet

                    if (!isMounted) return;

                    if (profileError) {
                        console.warn('ProtectedRoute: Profile fetch error on auth state change', profileError);
                        setIsOnboarded(false); // Assume not onboarded if profile fetch fails
                    } else {
                        setIsOnboarded(profile?.onboarded ?? false);
                    }
                } catch (err) {
                    console.error('ProtectedRoute: Error fetching profile on auth state change', err);
                    if (isMounted) {
                        setIsOnboarded(false); // Assume not onboarded on error
                    }
                }
            } else {
                if (isMounted) {
                    setIsOnboarded(null); // Reset onboarded state if no user
                }
            }

            // Only set loading to false after the initial auth state has been processed
            if (!initialCheckDone) {
                if (isMounted) {
                    setLoading(false);
                    initialCheckDone = true;
                    console.log('ProtectedRoute: Initial check finished, loading set to false.');
                }
            }
        });

        return () => {
            isMounted = false;
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
