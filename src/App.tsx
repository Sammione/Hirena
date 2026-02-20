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
    const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuthAndProfile = async () => {
            console.log('ProtectedRoute: Starting check...');
            try {
                // Add a timeout to getSession to prevent infinite hang
                const sessionPromise = supabase.auth.getSession();
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 5000));

                const { data: { session }, error: sessionError } = await Promise.race([sessionPromise, timeoutPromise]) as any;

                if (sessionError) throw sessionError;

                if (session?.user) {
                    console.log('ProtectedRoute: User found', session.user.id);
                    setUser(session.user);

                    const { data: profile, error: profileError } = await supabase
                        .from('profiles')
                        .select('onboarded')
                        .eq('id', session.user.id)
                        .maybeSingle(); // Better than single()

                    if (profileError) {
                        console.warn('ProtectedRoute: Profile fetch error', profileError);
                        setIsOnboarded(false);
                    } else {
                        console.log('ProtectedRoute: Profile found', profile);
                        setIsOnboarded(profile?.onboarded ?? false);
                    }
                } else {
                    console.log('ProtectedRoute: No user session');
                    setUser(null);
                    setIsOnboarded(null);
                }
            } catch (err) {
                console.error('ProtectedRoute: Error in auth check', err);
                setUser(null);
                setIsOnboarded(null);
            } finally {
                console.log('ProtectedRoute: Check finished');
                setLoading(false);
            }
        };

        checkAuthAndProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                try {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('onboarded')
                        .eq('id', session.user.id)
                        .single();
                    setIsOnboarded(profile?.onboarded ?? false);
                } catch (err) {
                    setIsOnboarded(false);
                }
            } else {
                setIsOnboarded(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) return <PageLoader />;
    if (!user) return <Navigate to="/login" replace />;

    const isAtOnboarding = window.location.pathname === '/onboarding';
    if (!isOnboarded && !isAtOnboarding) return <Navigate to="/onboarding" replace />;
    if (isOnboarded && isAtOnboarding) return <Navigate to="/dashboard" replace />;

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
