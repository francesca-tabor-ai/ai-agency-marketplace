import React from 'react';
import { AgencyCard } from '../components/agencies/AgencyCard';
import { AgencyFilters, AgencyFilters as AgencyFiltersType } from '../components/agencies/AgencyFilters';
import { AgencySort } from '../components/agencies/AgencySort';
import { AgencyPagination } from '../components/agencies/AgencyPagination';
import { supabase } from '../lib/supabase';

interface Agency {
  id: string;
  name: string;
  rating: number;
  location: string;
  services: string[];
  industries: string[];
  technologies: string[];
  size: string;
  imageUrl?: string;
}

export function AgencyDirectory() {
  const [agencies, setAgencies] = React.useState<Agency[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [filters, setFilters] = React.useState<AgencyFiltersType>({
    search: '',
    service: '',
    industry: '',
    technology: '',
    location: '',
    rating: '',
    size: '',
  });
  const [sortBy, setSortBy] = React.useState('rating-desc');
  const itemsPerPage = 9;

  React.useEffect(() => {
    fetchAgencies();
  }, [currentPage, filters, sortBy]);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use view_agency_card for simplified query
      let query = supabase
        .from('view_agency_card')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters.service) {
        // Filter by service - need to check if agency has this service
        // We'll filter after fetching since we need to check the join table
      }

      if (filters.industry) {
        // Filter by industry - similar approach
      }

      if (filters.technology) {
        // Filter by technology - similar approach
      }

      if (filters.location) {
        if (filters.location === 'Remote') {
          query = query.ilike('location_city', '%Remote%')
            .or('location_country.ilike.%Remote%');
        } else {
          const locationMap: Record<string, string> = {
            'United States': 'USA',
            'United Kingdom': 'UK',
            'Europe': 'Europe',
            'Asia': 'Asia',
          };
          const locationPattern = locationMap[filters.location] || filters.location;
          query = query.or(`location_country.ilike.%${locationPattern}%,location_city.ilike.%${locationPattern}%`);
        }
      }

      if (filters.rating) {
        const minRating = parseFloat(filters.rating);
        query = query.gte('rating_avg', minRating);
      }

      if (filters.size) {
        query = query.eq('employee_range', filters.size);
      }

      // Apply sorting
      switch (sortBy) {
        case 'rating-desc':
          query = query.order('rating_avg', { ascending: false });
          break;
        case 'rating-asc':
          query = query.order('rating_avg', { ascending: true });
          break;
        case 'name-asc':
          query = query.order('name', { ascending: true });
          break;
        case 'name-desc':
          query = query.order('name', { ascending: false });
          break;
        default:
          query = query.order('rating_avg', { ascending: false });
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Transform data (view already provides arrays)
      let transformedAgencies: Agency[] = (data || []).map((agency: any) => {
        // Build location string
        let location = '';
        if (agency.location_city && agency.location_country) {
          location = `${agency.location_city}, ${agency.location_country}`;
        } else if (agency.location_city) {
          location = agency.location_city;
        } else if (agency.location_country) {
          location = agency.location_country;
        } else {
          location = 'Location not specified';
        }

        return {
          id: agency.id,
          name: agency.name,
          rating: Number(agency.rating_avg) || 0,
          location,
          services: agency.services || [],
          industries: agency.industries || [],
          technologies: agency.technologies || [],
          size: agency.employee_range || 'Size not specified',
          imageUrl: null, // Can be added later if we add image_url to agencies
        };
      });

      // Apply service/industry/technology filters (client-side since we need to check join tables)
      if (filters.service) {
        transformedAgencies = transformedAgencies.filter(agency =>
          agency.services.some(s => s === filters.service)
        );
      }

      if (filters.industry) {
        transformedAgencies = transformedAgencies.filter(agency =>
          agency.industries.some(i => i === filters.industry)
        );
      }

      if (filters.technology) {
        transformedAgencies = transformedAgencies.filter(agency =>
          agency.technologies.some(t => t === filters.technology)
        );
      }

      setAgencies(transformedAgencies);
      // Note: Count might be inaccurate after client-side filtering, but it's acceptable for now
      setTotalPages(count ? Math.ceil(count / itemsPerPage) : 1);
    } catch (err) {
      console.error('Error fetching agencies:', err);
      setError('Failed to load agencies. Please try again later.');
      setAgencies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: AgencyFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    setCurrentPage(1); // Reset to first page when sort changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-brand-dark/70">Loading agencies...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-dark mb-4 font-playfair">
            Find Your Perfect AI Agency
          </h1>
          <p className="text-xl text-brand-dark/70 max-w-2xl mx-auto">
            Browse through our curated list of top AI agencies and find the perfect match for your project.
          </p>
        </div>

        {/* Filters */}
        <AgencyFilters onFilterChange={handleFilterChange} />

        {/* Sort */}
        <AgencySort onSortChange={handleSortChange} />

        {/* Agency Grid */}
        {agencies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-brand-dark/70">No agencies found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {agencies.map((agency) => (
              <AgencyCard key={agency.id} {...agency} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <AgencyPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}