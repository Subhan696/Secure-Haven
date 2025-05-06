// src/App.jsx
import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
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

// Election Management Pages
import Dashboard from './pages/Dashboard';
import CreateElection from './pages/CreateElection';
import ElectionList from './pages/ElectionList';
import ElectionDetails from './pages/ElectionDetails';
import VoterRegistration from './pages/VoterRegistration';
import Results from './pages/Results';

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
      { path: '/signup', element: <Signup /> }
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
          { path: 'elections', element: <ElectionList /> },
          { path: 'elections/:id', element: <ElectionDetails /> },
          { path: 'voter-registration', element: <VoterRegistration /> },
          { path: 'results', element: <Results /> }
        ]
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
