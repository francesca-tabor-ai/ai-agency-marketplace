import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { Home } from './pages/Home';
import { AgencyDirectory } from './pages/AgencyDirectory';
import { AgencyProfile } from './pages/agency/AgencyProfile';
import { ProjectPage } from './pages/project/ProjectPage';
import { JobDirectory } from './pages/jobs/JobDirectory';
import { PostJob } from './pages/jobs/PostJob';
import { CareerResources } from './pages/jobs/CareerResources';
import { TalentPool } from './pages/jobs/TalentPool';
import { PostProject } from './pages/PostProject';
import { Resources } from './pages/Resources';
import { Blog } from './pages/content/Blog';
import { Guides } from './pages/content/Guides';
import { Events } from './pages/Events';
import { SuccessStories } from './pages/SuccessStories';
import { Pricing } from './pages/Pricing';
import { Privacy } from './pages/legal/Privacy';
import { Terms } from './pages/legal/Terms';
import { Cookies } from './pages/legal/Cookies';
import { Security } from './pages/legal/Security';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { BusinessAccount } from './pages/account/BusinessAccount';
import { AgencyAccount } from './pages/account/AgencyAccount';
import { Projects } from './pages/account/Projects';
import { Jobs } from './pages/account/Jobs';
import { Contact } from './pages/Contact';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/agencies" element={<AgencyDirectory />} />
            <Route path="/agencies/:id" element={<AgencyProfile />} />
            <Route path="/projects/:id" element={<ProjectPage />} />
            <Route path="/jobs" element={<JobDirectory />} />
            <Route path="/jobs/post" element={<PostJob />} />
            <Route path="/jobs/resources" element={<CareerResources />} />
            <Route path="/jobs/talent" element={<TalentPool />} />
            <Route path="/post-project" element={<PostProject />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/resources/guides" element={<Guides />} />
            <Route path="/events" element={<Events />} />
            <Route path="/case-studies" element={<SuccessStories />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/security" element={<Security />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/business-account" element={<BusinessAccount />} />
            <Route path="/agency-account" element={<AgencyAccount />} />
            <Route path="/account/projects" element={<Projects />} />
            <Route path="/account/jobs" element={<Jobs />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;