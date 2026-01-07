import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../hooks/useUser';
import { uploadAgencyLogo } from '../../lib/storage';

const agencySchema = z.object({
  agency_name: z.string().min(2, 'Agency name must be at least 2 characters'),
  services_offered: z.array(z.string()).min(1, 'Select at least one service'),
  industry_specialties: z.array(z.string()).min(1, 'Select at least one industry'),
  case_studies: z.string().optional(),
  certifications_awards: z.string().optional(),
  profile_picture: z.any().optional(),
  contact_email: z.string().email('Invalid email address'),
  contact_phone: z.string().optional(),
});

type AgencyFormData = z.infer<typeof agencySchema>;

interface Service {
  id: string;
  name: string;
}

interface Industry {
  id: string;
  name: string;
}

interface Agency {
  id: string;
  name: string;
  contact_email: string;
  contact_phone: string | null;
  case_studies: string | null;
  certifications_awards: string | null;
  logo_url: string | null;
  status: string;
  services: string[];
  industries: string[];
}

export function AgencyForm() {
  const { user, loading: userLoading } = useUser();
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [industriesList, setIndustriesList] = useState<Industry[]>([]);
  const [existingAgency, setExistingAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<AgencyFormData>({
    resolver: zodResolver(agencySchema),
    defaultValues: {
      services_offered: [],
      industry_specialties: [],
    },
  });

  // Fetch services and industries from database
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch services
        const { data: servicesData, error: servicesError } = await supabase
          .from('services')
          .select('id, name')
          .order('name');

        if (!servicesError && servicesData) {
          setServicesList(servicesData);
        }

        // Fetch industries
        const { data: industriesData, error: industriesError } = await supabase
          .from('industries')
          .select('id, name')
          .order('name');

        if (!industriesError && industriesData) {
          setIndustriesList(industriesData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchData();
  }, []);

  // Fetch existing agency if user is authenticated
  useEffect(() => {
    const fetchExistingAgency = async () => {
      if (!user || userLoading) {
        setLoading(false);
        return;
      }

      try {
        // Fetch agency with services and industries
        const { data: agencyData, error: agencyError } = await supabase
          .from('agencies')
          .select(`
            *,
            agency_services (
              services (
                id,
                name
              )
            ),
            agency_industries (
              industries (
                id,
                name
              )
            )
          `)
          .eq('owner_user_id', user.id)
          .limit(1)
          .single();

        if (agencyError && agencyError.code !== 'PGRST116') {
          // PGRST116 = no rows returned, which is fine for new agencies
          console.error('Error fetching agency:', agencyError);
        } else if (agencyData) {
          const agency: Agency = {
            id: agencyData.id,
            name: agencyData.name,
            contact_email: agencyData.contact_email || '',
            contact_phone: agencyData.contact_phone,
            case_studies: agencyData.case_studies,
            certifications_awards: agencyData.certifications_awards,
            logo_url: agencyData.logo_url,
            status: agencyData.status,
            services: (agencyData.agency_services || []).map((as: any) => as.services?.id).filter(Boolean),
            industries: (agencyData.agency_industries || []).map((ai: any) => ai.industries?.id).filter(Boolean),
          };

          setExistingAgency(agency);
          setSelectedServices(agency.services);
          setSelectedIndustries(agency.industries);
          setLogoPreview(agency.logo_url);

          // Prefill form
          setValue('agency_name', agency.name);
          setValue('contact_email', agency.contact_email);
          setValue('contact_phone', agency.contact_phone || '');
          setValue('case_studies', agency.case_studies || '');
          setValue('certifications_awards', agency.certifications_awards || '');
          setValue('services_offered', agency.services);
          setValue('industry_specialties', agency.industries);
        }
      } catch (err) {
        console.error('Error fetching existing agency:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingAgency();
  }, [user, userLoading, setValue]);

  const handleServiceToggle = (serviceId: string) => {
    const newServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];
    setSelectedServices(newServices);
    setValue('services_offered', newServices);
  };

  const handleIndustryToggle = (industryId: string) => {
    const newIndustries = selectedIndustries.includes(industryId)
      ? selectedIndustries.filter(id => id !== industryId)
      : [...selectedIndustries, industryId];
    setSelectedIndustries(newIndustries);
    setValue('industry_specialties', newIndustries);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: AgencyFormData) => {
    try {
      setError(null);
      setIsSubmitting(true);

      if (!user) {
        setError('You must be logged in to create an agency profile.');
        return;
      }

      // Validate selections
      if (selectedServices.length === 0) {
        setError('Please select at least one service.');
        return;
      }

      if (selectedIndustries.length === 0) {
        setError('Please select at least one industry.');
        return;
      }

      let logoUrl = existingAgency?.logo_url || null;

      // Upload logo if provided
      if (logoFile) {
        const uploadResult = await uploadAgencyLogo(logoFile, user.id, existingAgency?.id);
        if (uploadResult.error) {
          setError(uploadResult.error);
          return;
        }
        logoUrl = uploadResult.url;
      }

      if (existingAgency) {
        // Update existing agency
        const { error: updateError } = await supabase
          .from('agencies')
          .update({
            name: data.agency_name,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone || null,
            case_studies: data.case_studies || null,
            certifications_awards: data.certifications_awards || null,
            logo_url: logoUrl,
            // Keep status unchanged unless you want to reset to pending
          })
          .eq('id', existingAgency.id)
          .eq('owner_user_id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;

        // Replace join tables (delete old, insert new)
        // Delete existing services
        await supabase
          .from('agency_services')
          .delete()
          .eq('agency_id', existingAgency.id);

        // Delete existing industries
        await supabase
          .from('agency_industries')
          .delete()
          .eq('agency_id', existingAgency.id);

        // Insert new services
        if (selectedServices.length > 0) {
          const serviceInserts = selectedServices.map(serviceId => ({
            agency_id: existingAgency.id,
            service_id: serviceId,
          }));
          const { error: servicesError } = await supabase
            .from('agency_services')
            .insert(serviceInserts);
          if (servicesError) throw servicesError;
        }

        // Insert new industries
        if (selectedIndustries.length > 0) {
          const industryInserts = selectedIndustries.map(industryId => ({
            agency_id: existingAgency.id,
            industry_id: industryId,
          }));
          const { error: industriesError } = await supabase
            .from('agency_industries')
            .insert(industryInserts);
          if (industriesError) throw industriesError;
        }

        setSubmitSuccess(true);
      } else {
        // Create new agency
        const { data: newAgency, error: insertError } = await supabase
          .from('agencies')
          .insert([{
            owner_user_id: user.id,
            name: data.agency_name,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone || null,
            case_studies: data.case_studies || null,
            certifications_awards: data.certifications_awards || null,
            logo_url: logoUrl,
            status: 'pending',
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        if (!newAgency) throw new Error('Failed to create agency');

        // Insert join tables
        // Insert services
        if (selectedServices.length > 0) {
          const serviceInserts = selectedServices.map(serviceId => ({
            agency_id: newAgency.id,
            service_id: serviceId,
          }));
          const { error: servicesError } = await supabase
            .from('agency_services')
            .insert(serviceInserts);
          if (servicesError) {
            // Cleanup: delete the agency if join insert fails
            await supabase.from('agencies').delete().eq('id', newAgency.id);
            throw servicesError;
          }
        }

        // Insert industries
        if (selectedIndustries.length > 0) {
          const industryInserts = selectedIndustries.map(industryId => ({
            agency_id: newAgency.id,
            industry_id: industryId,
          }));
          const { error: industriesError } = await supabase
            .from('agency_industries')
            .insert(industryInserts);
          if (industriesError) {
            // Cleanup: delete the agency if join insert fails
            await supabase.from('agencies').delete().eq('id', newAgency.id);
            throw industriesError;
          }
        }

        // Create agency request record
        await supabase.from('agency_requests').insert([{
          user_id: user.id,
          agency_id: newAgency.id,
        }]);

        setSubmitSuccess(true);
      }
    } catch (err: any) {
      console.error('Error submitting agency profile:', err);
      setError(err.message || 'Failed to save agency profile. Please try again.');
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
            You must be logged in to create an agency profile.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Sign In
          </Link>
          <span className="mx-2 text-yellow-700">or</span>
          <Link to="/register" className="btn-secondary inline-block">
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading || userLoading) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-brand-dark/70">Loading...</p>
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
            {existingAgency ? 'Agency Profile Updated!' : 'Profile Submitted for Review!'}
          </h3>
          <p className="text-green-700 mb-4">
            {existingAgency
              ? 'Your agency profile has been updated successfully.'
              : 'Your agency profile has been submitted and is pending approval. You will be notified once it\'s reviewed.'}
          </p>
          {existingAgency && (
            <Link to={`/agencies/${existingAgency.id}`} className="btn-primary inline-block">
              View My Agency
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-6">
        <h2 className="text-3xl font-bold font-playfair">
          {existingAgency ? 'Update Agency Profile' : 'Create Agency Profile'}
        </h2>
        <p className="text-brand-dark/70">
          {existingAgency
            ? 'Update your agency information below.'
            : 'Join our network of AI agencies and connect with businesses looking for your expertise.'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {existingAgency && existingAgency.status !== 'approved' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Your agency profile is currently <strong>{existingAgency.status}</strong> and pending review.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label htmlFor="agency_name" className="block text-sm font-medium text-brand-dark mb-2">
            Agency Name *
          </label>
          <input
            type="text"
            id="agency_name"
            {...register('agency_name')}
            className="w-full px-4 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          />
          {errors.agency_name && (
            <p className="mt-1 text-sm text-red-600">{errors.agency_name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Services Offered * (Select at least one)
          </label>
          {servicesList.length === 0 ? (
            <p className="text-sm text-brand-dark/50">Loading services...</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {servicesList.map((service) => (
                <label key={service.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedServices.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="rounded border-brand-dark/10 text-brand-light focus:ring-brand-light/20"
                  />
                  <span className="text-sm text-brand-dark/70">{service.name}</span>
                </label>
              ))}
            </div>
          )}
          {errors.services_offered && (
            <p className="mt-1 text-sm text-red-600">{errors.services_offered.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Industry Specialties * (Select at least one)
          </label>
          {industriesList.length === 0 ? (
            <p className="text-sm text-brand-dark/50">Loading industries...</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {industriesList.map((industry) => (
                <label key={industry.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedIndustries.includes(industry.id)}
                    onChange={() => handleIndustryToggle(industry.id)}
                    className="rounded border-brand-dark/10 text-brand-light focus:ring-brand-light/20"
                  />
                  <span className="text-sm text-brand-dark/70">{industry.name}</span>
                </label>
              ))}
            </div>
          )}
          {errors.industry_specialties && (
            <p className="mt-1 text-sm text-red-600">{errors.industry_specialties.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="case_studies" className="block text-sm font-medium text-brand-dark mb-2">
            Case Studies / Portfolio Description
          </label>
          <textarea
            id="case_studies"
            rows={4}
            placeholder="Share your success stories and portfolio highlights..."
            {...register('case_studies')}
            className="w-full px-4 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          />
        </div>

        <div>
          <label htmlFor="certifications_awards" className="block text-sm font-medium text-brand-dark mb-2">
            Certifications & Awards
          </label>
          <textarea
            id="certifications_awards"
            rows={3}
            placeholder="List your certifications, awards, and recognitions..."
            {...register('certifications_awards')}
            className="w-full px-4 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          />
        </div>

        <div>
          <label htmlFor="profile_picture" className="block text-sm font-medium text-brand-dark mb-2">
            Agency Logo / Profile Picture
          </label>
          {logoPreview && (
            <div className="mb-4">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="w-32 h-32 object-cover rounded-lg border border-brand-dark/10"
              />
            </div>
          )}
          <input
            type="file"
            id="profile_picture"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleLogoChange}
            className="mt-1 block w-full text-sm text-brand-dark/70
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-brand-light/10 file:text-brand-light
              hover:file:bg-brand-light/20"
          />
          <p className="mt-1 text-xs text-brand-dark/50">
            PNG, JPG, or WebP. Max 5MB.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-brand-dark">Contact Information</h3>

          <div>
            <label htmlFor="contact_email" className="block text-sm font-medium text-brand-dark mb-2">
              Email *
            </label>
            <input
              type="email"
              id="contact_email"
              {...register('contact_email')}
              className="w-full px-4 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
            />
            {errors.contact_email && (
              <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="contact_phone" className="block text-sm font-medium text-brand-dark mb-2">
              Phone
            </label>
            <input
              type="tel"
              id="contact_phone"
              {...register('contact_phone')}
              className="w-full px-4 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
            />
          </div>
        </div>
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full btn-primary disabled:opacity-50"
        >
          {isSubmitting
            ? existingAgency
              ? 'Updating Profile...'
              : 'Creating Profile...'
            : existingAgency
            ? 'Update Agency Profile'
            : 'Create Agency Profile'}
        </button>
      </div>
    </form>
  );
}
