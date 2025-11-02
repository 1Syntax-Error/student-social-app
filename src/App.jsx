import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DarkModeProvider } from './contexts/DarkModeContext';
import { queryClient } from './lib/queryClient';
import LoadingFallback from './components/common/LoadingFallback';
import ErrorBoundary from './components/common/ErrorBoundary';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Explore = lazy(() => import('./pages/Explore'));
const Profile = lazy(() => import('./pages/Profile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const StudyGroups = lazy(() => import('./pages/StudyGroups'));
const Events = lazy(() => import('./pages/Events'));
const CourseReviews = lazy(() => import('./pages/CourseReviews'));
const Resources = lazy(() => import('./pages/Resources'));
const PendingRequests = lazy(() => import('./pages/PendingRequests'));
const Friends = lazy(() => import('./pages/Friends'));
const Feeds = lazy(() => import('./pages/Feeds'));
const Feedback = lazy(() => import('./pages/Feedback'));

// Protected route component
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-background">
      <div className="animate-pulse text-primary-600">Loading...</div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <DarkModeProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-background text-text-primary dark:bg-dark-bg dark:text-dark-text-primary">
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {/* Public routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

                    {/* Protected routes */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/explore"
                      element={
                        <ProtectedRoute>
                          <Explore />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/profile/:id" element={<Profile />} />
                    <Route
                      path="/edit-profile"
                      element={
                        <ProtectedRoute>
                          <EditProfile />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/study-groups"
                      element={
                        <ProtectedRoute>
                          <StudyGroups />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/events"
                      element={
                        <ProtectedRoute>
                          <Events />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/course-reviews"
                      element={
                        <ProtectedRoute>
                          <CourseReviews />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/resources"
                      element={
                        <ProtectedRoute>
                          <Resources />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/feeds"
                      element={
                        <ProtectedRoute>
                          <Feeds />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/pending-requests"
                      element={
                        <ProtectedRoute>
                          <PendingRequests />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/friends/:userId"
                      element={
                        <ProtectedRoute>
                          <Friends />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="/feedback" element={<Feedback />} />

                    {/* Catch all - redirect to home */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Suspense>
              </div>
            </Router>
          </AuthProvider>
        </DarkModeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
