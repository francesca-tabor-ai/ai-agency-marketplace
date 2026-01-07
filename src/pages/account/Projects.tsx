import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';
import { Calendar, MapPin, DollarSign, Clock, ExternalLink } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  industry: string;
  budget_range: string;
  project_timing: string;
  location_preference: string | null;
  status: string;
  created_at: string;
  services: string[];
}

export function Projects() {
  const { user, loading: userLoading } = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !userLoading) {
      fetchProjects();
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [user, userLoading]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('You must be logged in to view your projects.');
        return;
      }

      // Fetch projects with services
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`
          *,
          project_services (
            services (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Transform data
      const transformedProjects: Project[] = (projectsData || []).map((project: any) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        industry: project.industry,
        budget_range: project.budget_range,
        project_timing: project.project_timing,
        location_preference: project.location_preference,
        status: project.status,
        created_at: project.created_at,
        services: (project.project_services || []).map((ps: any) => ps.services?.name).filter(Boolean),
      }));

      setProjects(transformedProjects);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      open: { label: 'Open', className: 'bg-green-100 text-green-800' },
      'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-800' },
      closed: { label: 'Closed', className: 'bg-gray-100 text-gray-800' },
      completed: { label: 'Completed', className: 'bg-purple-100 text-purple-800' },
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-brand-dark/70">Loading your projects...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-2xl font-bold text-brand-dark mb-4">Authentication Required</h2>
            <p className="text-brand-dark/70 mb-6">
              You must be logged in to view your projects.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/login" className="btn-primary">
                Sign In
              </Link>
              <Link to="/register" className="btn-secondary">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-brand-dark mb-2 font-playfair">
              My Projects
            </h1>
            <p className="text-brand-dark/70">
              Manage and track your AI project postings
            </p>
          </div>
          <Link to="/post-project" className="btn-primary">
            Post New Project
          </Link>
        </div>

        {/* Projects List */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-brand-dark/70 mb-6">
              You haven't posted any projects yet.
            </p>
            <Link to="/post-project" className="btn-primary inline-block">
              Post Your First Project
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-brand-dark mb-2">
                      {project.title}
                    </h3>
                    <p className="text-brand-dark/70 line-clamp-2 mb-4">
                      {project.description}
                    </p>
                  </div>
                  {getStatusBadge(project.status)}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Posted {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {project.location_preference && (
                    <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location_preference}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                    <DollarSign className="w-4 h-4" />
                    <span>{project.budget_range}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                    <Clock className="w-4 h-4" />
                    <span className="capitalize">{project.project_timing.replace('-', ' ')}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-sm font-medium text-brand-dark mr-2">Industry:</span>
                  <span className="text-sm text-brand-dark/70">{project.industry}</span>
                </div>

                {project.services.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-brand-dark mr-2">Services:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.services.map((service) => (
                        <span
                          key={service}
                          className="px-3 py-1 bg-brand-light/10 text-brand-light rounded-full text-xs"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-brand-dark/10">
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex items-center gap-2 text-brand-light hover:text-brand-yellow transition-colors duration-200"
                  >
                    <span>View Details</span>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

