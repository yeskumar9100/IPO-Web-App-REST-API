// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Update the import path for IPOHome

import Community from './features/Auth/Community';
import UpcomingIPO from './components/UpcomingIPO/UpcomingIPO';
import SignIn from './features/Auth/SignIn';
import SignUp from './features/Auth/SignUp';
import ForgotPassword from './features/Auth/ForgotPassword';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Set UpcomingIPO as the default landing page (main frontend) */}
        <Route path="/" element={<UpcomingIPO />} />

        {/* Other authentication routes */}
        
        <Route path="/community" element={<Community />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </BrowserRouter>
  );
}