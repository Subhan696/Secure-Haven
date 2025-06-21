import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import DashboardFooter from '../components/DashboardFooter';
import ScrollToTop from '../components/ScrollToTop';

const DashboardLayout = () => {
  return (
    <div className="App dashboard-app">
      <ScrollToTop />
      <DashboardHeader />
      <main>
        <Outlet />
      </main>
      <DashboardFooter />
    </div>
  );
};

export default DashboardLayout; 