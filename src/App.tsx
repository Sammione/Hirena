import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';

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

// Loading component
const PageLoader = () => (
    <div className="flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-brand-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

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

                    {/* App Routes */}
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/jobs" element={<JobDiscovery />} />
                        <Route path="/pathway" element={<CareerPathway />} />
                        <Route path="/cv" element={<CVManagement />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Profile />} /> {/* Placeholder */}
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

export default App;
