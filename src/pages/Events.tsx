import React from 'react';
import { EventCard } from '../components/events/EventCard';
import { EventFilters, EventFilters as EventFiltersType } from '../components/events/EventFilters';
import { AgencyPagination } from '../components/agencies/AgencyPagination';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  title: string;
  type: 'conference' | 'webinar' | 'workshop' | 'hackathon' | 'meetup' | 'training' | 'networking';
  description: string;
  location: string;
  date: string;
  duration: string;
  organizer: string;
  organizerLogo: string;
  ticketPrice: number | 'Free';
  tags: string[];
  speakers: Array<{
    name: string;
    title: string;
    image: string;
  }>;
  registrationUrl?: string;
}

export function Events() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [filters, setFilters] = React.useState<EventFiltersType>({
    search: '',
    eventType: 'all',
    location: 'all',
    dateRange: 'all',
    price: 'all',
  });
  const itemsPerPage = 9;

  React.useEffect(() => {
    fetchEvents();
  }, [currentPage, filters]);

  const getDateRange = (range: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (range) {
      case 'today':
        return {
          start: today.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        };
      case 'this-week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return {
          start: weekStart.toISOString().split('T')[0],
          end: weekEnd.toISOString().split('T')[0],
        };
      case 'this-month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return {
          start: monthStart.toISOString().split('T')[0],
          end: monthEnd.toISOString().split('T')[0],
        };
      case 'next-month':
        const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        return {
          start: nextMonthStart.toISOString().split('T')[0],
          end: nextMonthEnd.toISOString().split('T')[0],
        };
      default:
        return null;
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use view_event_card for simplified query
      let query = supabase
        .from('view_event_card')
        .select('*', { count: 'exact' });

      // Apply filters
      if (filters.eventType !== 'all') {
        query = query.eq('event_type', filters.eventType);
      }

      if (filters.location !== 'all') {
        if (filters.location === 'virtual') {
          query = query.eq('location_type', 'virtual');
        } else {
          // For location labels, check location_label field
          // Use ilike for case-insensitive matching
          const locationMap: Record<string, string> = {
            'united states': 'USA',
            'europe': 'Europe',
            'asia': 'Asia',
          };
          const locationPattern = locationMap[filters.location.toLowerCase()];
          if (locationPattern) {
            query = query.ilike('location_label', `%${locationPattern}%`);
          } else if (filters.location === 'other') {
            // Other locations (not virtual, not matching common patterns)
            // We'll filter these by excluding known patterns
            query = query.neq('location_type', 'virtual')
              .not('location_label', 'ilike', '%USA%')
              .not('location_label', 'ilike', '%United States%')
              .not('location_label', 'ilike', '%Europe%')
              .not('location_label', 'ilike', '%Asia%')
              .not('location_label', 'ilike', '%UK%')
              .not('location_label', 'ilike', '%London%');
          }
        }
      }

      if (filters.dateRange !== 'all') {
        const dateRange = getDateRange(filters.dateRange);
        if (dateRange) {
          query = query.gte('start_at', dateRange.start)
            .lte('start_at', dateRange.end);
        }
      }

      if (filters.price !== 'all') {
        query = query.eq('price_type', filters.price);
      }

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      // View already filters to published events, but we can add explicit filter for safety
      query = query.eq('status', 'published');

      // Order by featured first, then by start date
      query = query.order('is_featured', { ascending: false })
        .order('start_at', { ascending: true });

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) throw fetchError;

      // Transform data to match component interface
      const transformedEvents: Event[] = (data || []).map((event: any) => {
        // Calculate duration from start_at and end_at
        let duration = 'TBD';
        if (event.start_at) {
          if (event.end_at) {
            const start = new Date(event.start_at);
            const end = new Date(event.end_at);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
            if (diffDays === 1) {
              duration = '1 day';
            } else {
              duration = `${diffDays} days`;
            }
          } else {
            // Single day event
            duration = '1 day';
          }
        }

        // Get location label
        let location = event.location_label || 'TBD';
        if (event.location_type === 'virtual') {
          location = 'Virtual';
        }

        // View provides tags array, speakers_count, and speaker_names array
        // Map speaker names to speaker objects (basic info for card view)
        const speakers = (event.speaker_names || []).map((name: string, index: number) => ({
          name: name,
          title: '',
          image: '',
        }));

        return {
          id: event.id,
          title: event.title,
          type: event.event_type,
          description: event.description,
          location,
          date: event.start_at,
          duration,
          organizer: event.organizer_name || 'TBD',
          organizerLogo: event.organizer_logo_url || event.cover_image_url || '',
          ticketPrice: event.price_type === 'free' ? 'Free' : Number(event.price_amount) || 0,
          tags: event.tags || [],
          speakers,
          registrationUrl: event.registration_url,
        };
      });

      setEvents(transformedEvents);
      setTotalPages(count ? Math.ceil(count / itemsPerPage) : 1);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again later.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: EventFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-brand-dark/70">Loading events...</p>
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

  // Since we order by is_featured DESC, the first event should be featured
  // Show first event as featured if we have events
  const featuredEvent = events.length > 0 ? events[0] : null;
  const otherEvents = events.slice(1);

  return (
    <div className="min-h-screen bg-brand-dark/5 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-brand-dark mb-4 font-playfair">
            AI Events & Conferences
          </h1>
          <p className="text-xl text-brand-dark/70 max-w-2xl mx-auto">
            Discover upcoming AI conferences, workshops, webinars, and networking events.
          </p>
        </div>

        {/* Featured Event */}
        {featuredEvent && (
        <div className="mb-12">
          <div className="relative h-96 rounded-lg overflow-hidden">
            <img
                src={featuredEvent.organizerLogo || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=2000'}
                alt={featuredEvent.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <div className="flex items-center gap-2 text-sm mb-2">
                <span className="px-2 py-1 bg-brand-light rounded-full">Featured</span>
                  <span>{featuredEvent.type}</span>
                <span>•</span>
                  <span>{new Date(featuredEvent.date).toLocaleDateString()}</span>
                </div>
                <h2 className="text-3xl font-bold mb-4">{featuredEvent.title}</h2>
                <p className="text-lg text-gray-200 mb-6 max-w-3xl line-clamp-2">
                  {featuredEvent.description}
                </p>
                <a
                  href={featuredEvent.registrationUrl || '#'}
                  className="btn-primary inline-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Register Now
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <EventFilters onFilterChange={handleFilterChange} />

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-brand-dark/70">Loading events...</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading && otherEvents.length === 0 && !featuredEvent ? (
          <div className="text-center py-12">
            <p className="text-brand-dark/70">No events found. Try adjusting your filters.</p>
          </div>
        ) : !loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {otherEvents.map((event) => (
            <EventCard key={event.id} {...event} />
          ))}
        </div>
        ) : null}

        {/* Pagination */}
        {totalPages > 1 && (
        <AgencyPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        )}

        {/* Newsletter Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm p-8">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-brand-dark mb-4 font-playfair">Stay Updated</h2>
            <p className="text-brand-dark/70 mb-6">
              Subscribe to our newsletter to receive updates about upcoming AI events and conferences.
            </p>
            <form className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
              />
              <button type="submit" className="btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}