import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { supabase } from '../../lib/supabase';
import { Calendar, MapPin, DollarSign, Clock, ExternalLink, Briefcase } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  description: string;
  employment_type: string;
  industry: string;
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  application_deadline: string | null;
  education_required: string | null;
  experience_level: string | null;
  status: string;
  created_at: string;
  skills: string[];
  benefits: string[];
}

export function Jobs() {
  const { user, loading: userLoading } = useUser();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !userLoading) {
      fetchJobs();
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [user, userLoading]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        setError('You must be logged in to view your jobs.');
        return;
      }

      // Fetch jobs with skills and benefits
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          job_skills (
            skills (
              name
            )
          ),
          job_benefits (
            benefits (
              name
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (jobsError) throw jobsError;

      // Transform data
      const transformedJobs: Job[] = (jobsData || []).map((job: any) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        employment_type: job.employment_type,
        industry: job.industry,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        location: job.location,
        application_deadline: job.application_deadline,
        education_required: job.education_required,
        experience_level: job.experience_level,
        status: job.status,
        created_at: job.created_at,
        skills: (job.job_skills || []).map((js: any) => js.skills?.name).filter(Boolean),
        benefits: (job.job_benefits || []).map((jb: any) => jb.benefits?.name).filter(Boolean),
      }));

      setJobs(transformedJobs);
    } catch (err: any) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to load jobs.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      published: { label: 'Published', className: 'bg-green-100 text-green-800' },
      draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800' },
      closed: { label: 'Closed', className: 'bg-red-100 text-red-800' },
      filled: { label: 'Filled', className: 'bg-purple-100 text-purple-800' },
    };

    const statusInfo = statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return 'Salary not specified';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `$${min.toLocaleString()}+`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return 'Salary not specified';
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-brand-dark/70">Loading your jobs...</p>
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
              You must be logged in to view your jobs.
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
              My Jobs
            </h1>
            <p className="text-brand-dark/70">
              Manage and track your job postings
            </p>
          </div>
          <Link to="/jobs/post" className="btn-primary">
            Post New Job
          </Link>
        </div>

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-brand-dark/70 mb-6">
              You haven't posted any jobs yet.
            </p>
            <Link to="/jobs/post" className="btn-primary inline-block">
              Post Your First Job
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-brand-dark mb-2">
                      {job.title}
                    </h3>
                    <p className="text-brand-dark/70 line-clamp-2 mb-4">
                      {job.description}
                    </p>
                  </div>
                  {getStatusBadge(job.status)}
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Posted {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {job.location && (
                    <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                    <Briefcase className="w-4 h-4" />
                    <span className="capitalize">{job.employment_type.replace('-', ' ')}</span>
                  </div>
                  {job.application_deadline && (
                    <div className="flex items-center gap-2 text-sm text-brand-dark/70">
                      <Clock className="w-4 h-4" />
                      <span>
                        Deadline: {new Date(job.application_deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="font-medium text-brand-dark mr-2">Industry:</span>
                      <span className="text-brand-dark/70">{job.industry}</span>
                    </div>
                    {job.experience_level && (
                      <div>
                        <span className="font-medium text-brand-dark mr-2">Experience:</span>
                        <span className="text-brand-dark/70 capitalize">{job.experience_level}</span>
                      </div>
                    )}
                    {job.education_required && (
                      <div>
                        <span className="font-medium text-brand-dark mr-2">Education:</span>
                        <span className="text-brand-dark/70">{job.education_required}</span>
                      </div>
                    )}
                  </div>
                </div>

                {job.skills.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-brand-dark mr-2">Required Skills:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-brand-light/10 text-brand-light rounded-full text-xs"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {job.benefits.length > 0 && (
                  <div className="mb-4">
                    <span className="text-sm font-medium text-brand-dark mr-2">Benefits:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.benefits.map((benefit) => (
                        <span
                          key={benefit}
                          className="px-3 py-1 bg-brand-dark/5 text-brand-dark/70 rounded-full text-xs"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-brand-dark/10">
                  <Link
                    to={`/jobs/${job.id}`}
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

