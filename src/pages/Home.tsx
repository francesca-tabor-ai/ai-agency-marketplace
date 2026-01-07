import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Users, Workflow, Award, CheckCircle } from 'lucide-react';

export function Home() {
  const [isVisible, setIsVisible] = React.useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <header className="relative min-h-screen flex items-center">
        {/* New York Background */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://4kwallpapers.com/images/wallpapers/new-york-city-skyline-panorama-sunset-skyscrapers-6144x2781-4645.jpg"
            alt="New York Skyline"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/70 via-brand-dark/60 to-brand-dark/50" />
          
          {/* Animated 3D Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute w-64 h-64 bg-brand-light/10 rounded-full blur-3xl animate-pulse -top-32 -left-32" />
            <div className="absolute w-96 h-96 bg-brand-yellow/10 rounded-full blur-3xl animate-pulse delay-1000 top-1/2 -right-48" />
          </div>
        </div>

        <div className={`relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-playfair leading-tight">
            Connect with the Best AI Agencies to Transform Your Business
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Find top-tier AI service providers, consultants, and solutions tailored to your needs. 
            Streamline your AI projects and drive innovation with the right partners.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/post-project" className="btn-primary">
              Post Your Project
            </Link>
            <Link to="/register" className="btn-secondary">
              Join the Network
            </Link>
          </div>
        </div>
      </header>

      {/* Rest of the sections with enhanced animations */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-brand-dark mb-6 font-playfair">
                Power Your Business with AI Solutions
              </h2>
              <p className="text-lg text-brand-dark/70 mb-8">
                Whether you're looking to automate processes, enhance customer experiences, or leverage 
                machine learning, AI Agency Marketplace connects you with the best AI agencies that can 
                bring your vision to life.
              </p>
              <div className="space-y-4">
                {[
                  'Find the Right Agency',
                  'Tailored Solutions',
                  'Trusted Expertise',
                  'Seamless Collaboration'
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3 group">
                    <CheckCircle className="text-brand-light h-6 w-6 transform transition-transform group-hover:scale-110" />
                    <span className="text-brand-dark/70">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative animate-slide-up">
              <div className="relative transform hover:scale-105 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800"
                  alt="Team collaboration"
                  className="rounded-lg shadow-xl"
                />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-brand-light/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-dark/5">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-brand-dark mb-12 font-playfair">
            Simple, Transparent, and Efficient
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Building2 className="h-8 w-8" />,
                title: 'Post Your Project or Service',
                description: 'Start by creating a detailed project listing or service profile.'
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: 'Get Matched',
                description: 'Our intelligent algorithm connects you with the best agencies based on your needs.'
              },
              {
                icon: <Workflow className="h-8 w-8" />,
                title: 'Collaborate and Succeed',
                description: 'Work directly with agencies, track progress, and manage your project on our platform.'
              }
            ].map((step, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex justify-center mb-4 text-brand-light">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 font-playfair text-brand-dark">{step.title}</h3>
                <p className="text-brand-dark/70">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-brand-light text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 font-playfair">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Whether you're looking for a trusted AI agency partner or aiming to expand your agency's reach, 
            AI Agency Marketplace (AIAM) is your gateway to success.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/post-project" className="bg-white text-brand-light px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105">
              Post Your Project
            </Link>
            <Link to="/register" className="bg-transparent text-white px-8 py-3 rounded-lg font-semibold border-2 border-white hover:bg-white/10 transition-all duration-200 transform hover:scale-105">
              Join the Network
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}