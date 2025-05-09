// src/App.jsx
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate
} from 'react-router-dom';

import Header from './components/Header'; // Public header
import Footer from './components/Footer'; // Public footer
import DashboardHeader from './components/DashboardHeader'; // Dashboard header
import DashboardFooter from './components/DashboardFooter'; // Dashboard footer
import PrivateRoute from './components/PrivateRoute';

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

// Election Management Pages
import Dashboard from './pages/Dashboard';
import CreateElection from './pages/CreateElection';
import ElectionList from './pages/ElectionList';
import ElectionDetails from './pages/ElectionDetails';
import VoterRegistration from './pages/VoterRegistration';
import Results from './pages/Results';
import CreateElectionWizard from './pages/CreateElectionWizard';
import ElectionOverview from './pages/ElectionOverview';
import ElectionSettings from './pages/ElectionSettings';
import ElectionVoters from './pages/ElectionVoters';
import ElectionBallot from './pages/ElectionBallot';
import ElectionPreview from './pages/ElectionPreview';
import ElectionLaunch from './pages/ElectionLaunch';
import AccountSettings from './pages/AccountSettings';
import VoterDashboard from './pages/VoterDashboard';
import VoterElection from './pages/VoterElection';
import VoterProfile from './pages/VoterProfile';

import './App.css';

// Layout for public pages (includes header/footer)
const PublicLayout = () => (
  <div className="App">
    <Header />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Layout for dashboard pages (custom header/footer)
const DashboardLayout = () => (
  <div className="App dashboard-app">
    <DashboardHeader />
    <main>
      <Outlet />
    </main>
    <DashboardFooter />
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
      { path: '/login', element: <Login /> },
      { path: '/signup', element: <Signup /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/reset-password', element: <ResetPassword /> },
      { path: '/reviews', element: <Reviews /> },
      { path: '/user-guide', element: <UserGuide /> }
    ]
  },
  {
    path: '/dashboard',
    element: <PrivateRoute />,
    children: [
      {
        path: '',
        element: <DashboardLayout />,
        children: [
          { path: '', element: <Dashboard /> },
          { path: 'create-election', element: <CreateElection /> },
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
          { path: 'voter-registration', element: <VoterRegistration /> },
          { path: 'results', element: <Results /> }
        ]
      }
    ]
  },
  // Voter routes
  {
    path: '/voter-dashboard',
    element: <VoterDashboard />
  },
  {
    path: '/voter-election/:electionId',
    element: <VoterElection />
  },
  {
    path: '/voter-profile',
    element: <VoterProfile />
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
