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
const GhostHunter = lazy(() => import('./pages/GhostHunter'));

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

        // Failsafe: Force loading to false after 6 seconds (better for slow mobile connections)
        const timeout = setTimeout(() => {
            if (isMounted && loading) {
                console.warn('ProtectedRoute: Auth check timed out, forcing load completion.');
                setLoading(false);
            }
        }, 6000);

        const handleAuthAction = async (session: any) => {
            if (!isMounted) return;

            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                try {
                    // Small delay to ensure DB consistency on fast redirects
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('onboarded')
                        .eq('id', currentUser.id)
                        .maybeSingle();

                    if (error) throw error;

                    if (isMounted) {
                        const onboarded = profile?.onboarded ?? false;
                        setIsOnboarded(onboarded);

                        // If we see they are onboarded, clear the temporary hint
                        if (onboarded) {
                            localStorage.removeItem('onboarding_in_progress');
                        }
                    }
                } catch (err) {
                    console.error('ProtectedRoute: Profile fetch error', err);
                    // Check local hint if DB fetch fails
                    const wasJustOnboarded = localStorage.getItem('onboarding_complete_hint') === 'true';
                    if (isMounted) setIsOnboarded(wasJustOnboarded);
                }
            } else {
                if (isMounted) {
                    setIsOnboarded(null);
                }
            }

            if (isMounted) setLoading(false);
        };

        // Suppress session check if we just logged in via window.location
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

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isAtOnboarding = window.location.pathname === '/onboarding';

    // If we're still checking, but have a user, don't redirect yet to avoid flicker
    if (isOnboarded === null) {
        return <PageLoader />;
    }

    if (isOnboarded === false && !isAtOnboarding) {
        // Double check local hint before forcing back to onboarding
        const hint = localStorage.getItem('onboarding_complete_hint');
        if (hint !== 'true') {
            return <Navigate to="/onboarding" replace />;
        }
    }

    if (isOnboarded === true && isAtOnboarding) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

const Settings = lazy(() => import('./pages/Settings'));

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
                        <Route path="/ghost-hunter" element={<GhostHunter />} />
                        <Route path="/settings" element={<Settings />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
