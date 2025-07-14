// src/App.jsx
import React, { useContext } from 'react';
import { AuthProvider } from './context/AuthContext.jsx';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
  useParams
} from 'react-router-dom';

import Header from './components/Header'; // Public header
import Footer from './components/Footer'; // Public footer
import DashboardHeader from './components/DashboardHeader'; // Dashboard header
import DashboardFooter from './components/DashboardFooter'; // Dashboard footer
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary'; // Error boundary component
import VoterRoute from './components/VoterRoute';
import { AuthContext } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Reviews from './pages/Reviews';
import UserGuide from './pages/UserGuide';
import PrivacyPolicy from './pages/PrivacyPolicy';

// Election Management Pages
import Dashboard from './pages/Dashboard';
import CreateElectionWizard from './pages/CreateElectionWizard';
import ElectionList from './pages/ElectionList';

import ElectionOverview from './pages/ElectionOverview';
import ElectionSettings from './pages/ElectionSettings';
import ElectionVoters from './pages/ElectionVoters';
import ElectionBallot from './pages/ElectionBallot';
import ElectionPreview from './pages/ElectionPreview';
import ElectionLaunch from './pages/ElectionLaunch';
import AccountSettings from './pages/AccountSettings';
import VoterDashboard from './pages/VoterDashboard';
import { useLocation } from 'react-router-dom';
import VoterElection from './pages/VoterElection';
import VoterProfile from './pages/VoterProfile';
import VoterElectionResults from './pages/VoterElectionResults';
import EmailVerification from './pages/EmailVerification';

import './App.css';

// Import the standalone ScrollToTop component
import ScrollToTop from './components/ScrollToTop';
import RoleBasedRedirect from './components/RoleBasedRedirect';

// Layout for public pages (includes header/footer)
const PublicLayout = () => (
  <div className="App">
    <ScrollToTop />
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Wrap components with ScrollToTop for individual routes
const withScrollReset = (Component) => {
  return (
    <>
      <ScrollToTop />
      <Component />
    </>
  );
};

function VoterDashboardWithKey() {
  const location = useLocation();
  const key = location.state?.force || location.key;
  return <VoterDashboard key={key} />;
}

function VoterProfileWithKey() {
  const location = useLocation();
  return <VoterProfile key={location.key} />;
}

// Redirect components for legacy routes
function VoterElectionRedirect() {
  const { electionId } = useParams();
  return <Navigate to={`/voter/election/${electionId}`} replace />;
}

function VoterElectionResultsRedirect() {
  const { electionId } = useParams();
  return <Navigate to={`/voter/election-results/${electionId}`} replace />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: withScrollReset(About) },
      { path: '/contact', element: withScrollReset(Contact) },
      { path: '/login', element: withScrollReset(Login) },
      { path: '/signup', element: withScrollReset(Signup) },
      { path: '/forgot-password', element: withScrollReset(ForgotPassword) },
      { path: '/reset-password', element: withScrollReset(ResetPassword) },
      { path: '/reviews', element: withScrollReset(Reviews) },
      { path: '/user-guide', element: withScrollReset(UserGuide) },
      { path: '/privacy-policy', element: withScrollReset(PrivacyPolicy) },
      { path: '/redirect', element: <RoleBasedRedirect /> }
    ]
  },
  {
    path: '/dashboard',
    element: <PrivateRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          { path: '', element: <Dashboard /> },
          { path: 'create-election-wizard', element: <CreateElectionWizard /> },
          { path: 'elections', element: <ElectionList /> },
          { path: 'account-settings', element: <AccountSettings /> },
          {
            path: 'elections/:id',
            children: [
              { index: true, element: <Navigate to="overview" replace /> },
              { path: 'overview', element: <ElectionOverview /> },
              { path: 'settings', element: <ElectionSettings /> },
              { path: 'ballot', element: <ElectionBallot /> },
              { path: 'voters', element: <ElectionVoters /> },
              { path: 'preview', element: <ElectionPreview /> },
              { path: 'launch', element: <ElectionLaunch /> },
            ]
          },
          
        ]
      }
    ]
  },
  // Voter routes - Protected by authentication
  {
    path: '/voter',
    element: <VoterRoute />,
    errorElement: <ErrorBoundary />,
    children: [
      { path: 'dashboard', element: <VoterDashboardWithKey /> },
      { path: 'profile', element: <VoterProfileWithKey /> },
      { path: 'election/:electionId', element: <VoterElection /> },
      { path: 'election-results/:electionId', element: <VoterElectionResults /> }
    ]
  },
  // Legacy voter routes - redirect to new protected routes
  {
    path: '/voter-dashboard',
    element: <Navigate to="/voter/dashboard" replace />
  },
  {
    path: '/voter-profile',
    element: <Navigate to="/voter/profile" replace />
  },
  {
    path: '/voter-election/:electionId',
    element: <VoterElectionRedirect />
  },
  {
    path: '/voter-election-results/:electionId',
    element: <VoterElectionResultsRedirect />
  },
  { path: '/verify-email', element: <EmailVerification /> }
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider
        router={router}
        future={{ v7_startTransition: true }}
        fallbackElement={<div>Loading...</div>}
      />
    </AuthProvider>
  );
}

export default App;
