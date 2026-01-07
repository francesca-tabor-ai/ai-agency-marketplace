import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

const eventTypes = [
  { label: 'All Events', value: 'all' },
  { label: 'Conference', value: 'conference' },
  { label: 'Webinar', value: 'webinar' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Hackathon', value: 'hackathon' },
  { label: 'Meetup', value: 'meetup' },
  { label: 'Training', value: 'training' },
  { label: 'Networking', value: 'networking' },
];

const locations = [
  { label: 'All Locations', value: 'all' },
  { label: 'Virtual', value: 'virtual' },
  { label: 'United States', value: 'united states' },
  { label: 'Europe', value: 'europe' },
  { label: 'Asia', value: 'asia' },
  { label: 'Other', value: 'other' },
];

export interface EventFilters {
  search: string;
  eventType: string;
  location: string;
  dateRange: string;
  price: string;
}

interface FiltersProps {
  onFilterChange: (filters: EventFilters) => void;
}

export function EventFilters({ onFilterChange }: FiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<EventFilters>({
    search: '',
    eventType: 'all',
    location: 'all',
    dateRange: 'all',
    price: 'all',
  });

  const handleFilterChange = (key: keyof EventFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-lg border border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20 transition-colors duration-200"
        />
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brand-dark/40 w-5 h-5" />
      </div>

      {/* Mobile Filter Toggle */}
      <button
        className="md:hidden w-full flex items-center justify-between px-4 py-2 bg-brand-dark/5 rounded-lg mb-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-brand-dark">Filters</span>
        <ChevronDown className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Filters Grid */}
      <div className={`grid gap-6 ${isOpen ? 'block' : 'hidden md:grid'} md:grid-cols-4`}>
        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Event Type
          </label>
          <select
            value={filters.eventType}
            onChange={(e) => handleFilterChange('eventType', e.target.value)}
            className="w-full rounded-lg border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          >
            {eventTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full rounded-lg border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          >
            {locations.map((location) => (
              <option key={location.value} value={location.value}>
                {location.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full rounded-lg border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="this-week">This Week</option>
            <option value="this-month">This Month</option>
            <option value="next-month">Next Month</option>
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Price
          </label>
          <select
            value={filters.price}
            onChange={(e) => handleFilterChange('price', e.target.value)}
            className="w-full rounded-lg border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          >
            <option value="all">All Prices</option>
            <option value="free">Free</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>
    </div>
  );
}