import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../hooks/useUser';

const projectSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  required_services: z.array(z.string()).min(1, 'Select at least one service'),
  industry: z.string().min(1, 'Please select an industry'),
  budget_range: z.string().min(1, 'Please select a budget range'),
  timing: z.enum(['short-term', 'long-term']),
  location: z.string().optional(),
  company_details: z.object({
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    company_name: z.string().min(2, 'Company name is required'),
  }),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const services = [
  'AI Development',
  'Machine Learning',
  'Natural Language Processing',
  'Computer Vision',
  'Robotics',
  'Data Analytics',
  'AI Consulting',
];

const industries = [
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Technology',
  'Education',
  'Other',
];

const budgetRanges = [
  { label: '$5,000 - $10,000', value: '5000-10000' },
  { label: '$10,000 - $25,000', value: '10000-25000' },
  { label: '$25,000 - $50,000', value: '25000-50000' },
  { label: '$50,000+', value: '50000-plus' },
];

export function ProjectForm() {
  const navigate = useNavigate();
  const { user, loading: userLoading } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servicesList, setServicesList] = useState<Array<{ id: string; name: string }>>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      required_services: [],
    },
  });

  const selectedServices = watch('required_services') || [];

  // Fetch services list on mount
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('id, name')
        .order('name');
      
      if (!error && data) {
        setServicesList(data);
      }
    };
    fetchServices();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userLoading && !user) {
      // Don't redirect immediately, show message instead
    }
  }, [user, userLoading]);

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setError(null);
      setIsSubmitting(true);

      // Check authentication
      if (!user) {
        setError('You must be logged in to post a project. Please sign in first.');
        return;
      }

      // Map service names to service IDs
      const serviceIds: string[] = [];
      for (const serviceName of data.required_services) {
        const service = servicesList.find(s => s.name === serviceName);
        if (service) {
          serviceIds.push(service.id);
        } else {
          throw new Error(`Service "${serviceName}" not found. Please refresh and try again.`);
        }
      }

      if (serviceIds.length === 0) {
        throw new Error('Please select at least one service.');
      }

      // Insert project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert([{
          user_id: user.id,
          title: data.title,
          description: data.description,
          industry: data.industry,
          budget_range: data.budget_range,
          project_timing: data.timing,
          location_preference: data.location || null,
          contact_email: data.company_details.email,
          status: 'open',
        }])
        .select()
        .single();

      if (projectError) throw projectError;
      if (!project) throw new Error('Failed to create project');

      // Insert project services
      const projectServices = serviceIds.map(serviceId => ({
        project_id: project.id,
        service_id: serviceId,
      }));

      const { error: servicesError } = await supabase
        .from('project_services')
        .insert(projectServices);

      if (servicesError) throw servicesError;

      // Success!
      setSubmitSuccess(true);
      reset();

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/account/projects');
      }, 2000);
    } catch (err: any) {
      console.error('Error submitting project:', err);
      setError(err.message || 'Failed to post project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show login prompt if not authenticated
  if (!userLoading && !user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Authentication Required
          </h3>
          <p className="text-yellow-700 mb-4">
            You must be logged in to post a project.
          </p>
          <Link
            to="/login"
            className="btn-primary inline-block"
          >
            Sign In
          </Link>
          <span className="mx-2 text-yellow-700">or</span>
          <Link
            to="/register"
            className="btn-secondary inline-block"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // Show success message
  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            Project Posted Successfully!
          </h3>
          <p className="text-green-700 mb-4">
            Your project has been submitted and is now visible to AI agencies.
          </p>
          <p className="text-sm text-green-600">
            Redirecting to your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold font-playfair">Post Your Project</h2>
        <p className="text-gray-600">
          Tell us about your project and we'll help you find the perfect AI agency.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Project Title
          </label>
          <input
            type="text"
            id="title"
            {...register('title')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Project Description
          </label>
          <textarea
            id="description"
            rows={4}
            {...register('description')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Required Services</label>
          {servicesList.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">Loading services...</p>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2">
              {servicesList.map((service) => (
                <label key={service.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={service.name}
                    checked={selectedServices.includes(service.name)}
                    {...register('required_services')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{service.name}</span>
                </label>
              ))}
            </div>
          )}
          {errors.required_services && (
            <p className="mt-1 text-sm text-red-600">{errors.required_services.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
            Industry
          </label>
          <select
            id="industry"
            {...register('industry')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select an industry</option>
            {industries.map((industry) => (
              <option key={industry} value={industry}>
                {industry}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="mt-1 text-sm text-red-600">{errors.industry.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="budget_range" className="block text-sm font-medium text-gray-700">
            Budget Range
          </label>
          <select
            id="budget_range"
            {...register('budget_range')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a budget range</option>
            {budgetRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          {errors.budget_range && (
            <p className="mt-1 text-sm text-red-600">{errors.budget_range.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Project Timing</label>
          <div className="mt-2 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="short-term"
                {...register('timing')}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Short-term</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="long-term"
                {...register('timing')}
                className="border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Long-term</span>
            </label>
          </div>
          {errors.timing && (
            <p className="mt-1 text-sm text-red-600">{errors.timing.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location Preference
          </label>
          <input
            type="text"
            id="location"
            {...register('location')}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Company Details</h3>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              {...register('company_details.email')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.company_details?.email && (
              <p className="mt-1 text-sm text-red-600">{errors.company_details.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              {...register('company_details.phone')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
              Company Name
            </label>
            <input
              type="text"
              id="company_name"
              {...register('company_details.company_name')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.company_details?.company_name && (
              <p className="mt-1 text-sm text-red-600">
                {errors.company_details.company_name.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Post Your Project'}
        </button>
      </div>
    </form>
  );
}