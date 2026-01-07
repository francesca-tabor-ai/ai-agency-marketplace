import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Star, MapPin, Mail, Phone, ExternalLink, CheckCircle, Download, Calendar, Users, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface AgencyData {
  id: string;
  name: string;
  description: string | null;
  rating_avg: number;
  review_count: number;
  location_city: string | null;
  location_country: string | null;
  employee_range: string | null;
  services: string[];
  industries: string[];
  technologies: string[];
}

// Removed mock data - now using Supabase

export function AgencyProfile() {
  const { id } = useParams<{ id: string }>();
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredProjects, setFeaturedProjects] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchAgency();
    }
  }, [id]);

  const fetchAgency = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error('Agency ID is required');
      }

      // Fetch agency with all joins
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select(`
          *,
          agency_services (
            services (
              name
            )
          ),
          agency_industries (
            industries (
              name
            )
          ),
          agency_technologies (
            technologies (
              name
            )
          )
        `)
        .eq('id', id)
        .single();

      if (agencyError) throw agencyError;
      if (!agencyData) throw new Error('Agency not found');

      // Transform data
      const transformedAgency: AgencyData = {
        id: agencyData.id,
        name: agencyData.name,
        description: agencyData.description,
        rating_avg: Number(agencyData.rating_avg) || 0,
        review_count: agencyData.review_count || 0,
        location_city: agencyData.location_city,
        location_country: agencyData.location_country,
        employee_range: agencyData.employee_range,
        services: (agencyData.agency_services || []).map((as: any) => as.services?.name).filter(Boolean),
        industries: (agencyData.agency_industries || []).map((ai: any) => ai.industries?.name).filter(Boolean),
        technologies: (agencyData.agency_technologies || []).map((at: any) => at.technologies?.name).filter(Boolean),
      };

      setAgency(transformedAgency);

      // Fetch featured projects (projects that mention this agency or are related)
      // For now, we'll fetch some sample projects - this can be enhanced later
      // with a proper relationship table
      const { data: projectsData } = await supabase
        .from('projects')
        .select('*')
        .eq('status', 'open')
        .limit(2);

      if (projectsData) {
        setFeaturedProjects(projectsData);
      }
    } catch (err: any) {
      console.error('Error fetching agency:', err);
      setError(err.message || 'Failed to load agency details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-brand-dark/70">Loading agency details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !agency) {
    return (
      <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error || 'Agency not found'}</p>
            <Link to="/agencies" className="btn-primary mt-4 inline-block">
              Back to Agencies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const location = agency.location_city && agency.location_country
    ? `${agency.location_city}, ${agency.location_country}`
    : agency.location_city || agency.location_country || 'Location not specified';

  return (
    <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 rounded-lg bg-brand-light/10 flex items-center justify-center">
              <Building2 className="w-12 h-12 text-brand-light" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 flex-wrap">
                <h1 className="text-3xl font-bold text-brand-dark font-playfair">{agency.name}</h1>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-brand-yellow fill-current" />
                  <span className="font-medium">{agency.rating_avg.toFixed(1)}</span>
                  <span className="text-brand-dark/60">({agency.review_count} reviews)</span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 text-brand-dark/70 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{location}</span>
                </div>
                {agency.employee_range && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{agency.employee_range}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Link to={`/post-project?agency=${agency.id}`} className="btn-primary">
                Request Quote
              </Link>
              <button className="btn-secondary">
                Contact Agency
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-brand-dark mb-4 font-playfair">Overview</h2>
              <p className="text-brand-dark/70 mb-6">
                {agency.description || 'No description available.'}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {agency.services.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-brand-dark mb-3">Services</h3>
                    <div className="flex flex-wrap gap-2">
                      {agency.services.map((service) => (
                        <span
                          key={service}
                          className="px-3 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {agency.industries.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-brand-dark mb-3">Industries</h3>
                    <div className="flex flex-wrap gap-2">
                      {agency.industries.map((industry) => (
                        <span
                          key={industry}
                          className="px-3 py-1 bg-brand-dark/5 text-brand-dark/70 rounded-full text-sm"
                        >
                          {industry}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-brand-dark mb-6 font-playfair">Featured Projects</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredProjects.map((project) => (
                    <Link
                      key={project.id}
                      to={`/projects/${project.id}`}
                      className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="p-4">
                        <h3 className="font-semibold text-brand-dark mb-2">{project.title}</h3>
                        <p className="text-sm text-brand-dark/70 mb-3 line-clamp-2">{project.description}</p>
                        <div className="flex items-center justify-between text-sm text-brand-dark/70">
                          <span className="capitalize">{project.industry}</span>
                          <span>{project.project_timing}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews - Optional for now */}
            {agency.review_count > 0 && (
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-brand-dark mb-6 font-playfair">
                  Client Reviews ({agency.review_count})
                </h2>
                <div className="text-center py-8 text-brand-dark/70">
                  <p>Reviews will be displayed here once available.</p>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-brand-dark mb-4">Primary Contact</h3>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={agencyData.primaryContact.image}
                  alt={agencyData.primaryContact.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <p className="font-medium text-brand-dark">{agencyData.primaryContact.name}</p>
                  <p className="text-sm text-brand-dark/70">{agencyData.primaryContact.title}</p>
                </div>
              </div>
              <div className="space-y-2">
                <button className="w-full btn-primary">
                  Schedule a Call
                </button>
                <button className="w-full btn-secondary">
                  Send Message
                </button>
              </div>
            </div>

            {/* Technologies */}
            {agency.technologies.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="font-semibold text-brand-dark mb-4">Technologies & Tools</h3>
                <div className="flex flex-wrap gap-2">
                  {agency.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-brand-light/10 text-brand-light rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}