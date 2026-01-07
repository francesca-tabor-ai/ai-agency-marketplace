import React, { useState, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export interface AgencyFilters {
  search: string;
  service: string;
  industry: string;
  technology: string;
  location: string;
  rating: string;
  size: string;
}

interface FiltersProps {
  onFilterChange: (filters: AgencyFilters) => void;
}

export function AgencyFilters({ onFilterChange }: FiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [servicesList, setServicesList] = useState<Array<{ id: string; name: string }>>([]);
  const [industriesList, setIndustriesList] = useState<Array<{ id: string; name: string }>>([]);
  const [technologiesList, setTechnologiesList] = useState<Array<{ id: string; name: string }>>([]);
  const [filters, setFilters] = useState<AgencyFilters>({
    search: '',
    service: '',
    industry: '',
    technology: '',
    location: '',
    rating: '',
    size: '',
  });

  // Fetch filter options from database
  useEffect(() => {
    const fetchFilterOptions = async () => {
      // Fetch services
      const { data: services } = await supabase
        .from('services')
        .select('id, name')
        .order('name');
      if (services) setServicesList(services);

      // Fetch industries
      const { data: industries } = await supabase
        .from('industries')
        .select('id, name')
        .order('name');
      if (industries) setIndustriesList(industries);

      // Fetch technologies
      const { data: technologies } = await supabase
        .from('technologies')
        .select('id, name')
        .order('name');
      if (technologies) setTechnologiesList(technologies);
    };
    fetchFilterOptions();
  }, []);

  const handleFilterChange = (key: keyof AgencyFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const locations = [
    'United States',
    'United Kingdom',
    'Europe',
    'Asia',
    'Remote',
  ];

  const sizes = [
    '1-10 employees',
    '11-50 employees',
    '51-200 employees',
    '201+ employees',
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-8">
      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search for AI agencies..."
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
      <div className={`grid gap-6 ${isOpen ? 'block' : 'hidden md:grid'} md:grid-cols-2 lg:grid-cols-4`}>
        {/* Services */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Services
          </label>
          <select
            value={filters.service}
            onChange={(e) => handleFilterChange('service', e.target.value)}
            className="w-full rounded-lg border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          >
            <option value="">All Services</option>
            {servicesList.map((service) => (
              <option key={service.id} value={service.name}>{service.name}</option>
            ))}
          </select>
        </div>

        {/* Industries */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Industries
          </label>
          <select
            value={filters.industry}
            onChange={(e) => handleFilterChange('industry', e.target.value)}
            className="w-full rounded-lg border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          >
            <option value="">All Industries</option>
            {industriesList.map((industry) => (
              <option key={industry.id} value={industry.name}>{industry.name}</option>
            ))}
          </select>
        </div>

        {/* Technologies */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Technologies
          </label>
          <select
            value={filters.technology}
            onChange={(e) => handleFilterChange('technology', e.target.value)}
            className="w-full rounded-lg border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          >
            <option value="">All Technologies</option>
            {technologiesList.map((tech) => (
              <option key={tech.id} value={tech.name}>{tech.name}</option>
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
            <option value="">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className={`mt-6 grid gap-6 ${isOpen ? 'block' : 'hidden md:grid'} md:grid-cols-2 lg:grid-cols-4`}>
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Minimum Rating
          </label>
          <select
            value={filters.rating}
            onChange={(e) => handleFilterChange('rating', e.target.value)}
            className="w-full rounded-lg border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ Stars</option>
            <option value="4">4+ Stars</option>
            <option value="3.5">3.5+ Stars</option>
            <option value="3">3+ Stars</option>
          </select>
        </div>

        {/* Agency Size */}
        <div>
          <label className="block text-sm font-medium text-brand-dark mb-2">
            Agency Size
          </label>
          <select
            value={filters.size}
            onChange={(e) => handleFilterChange('size', e.target.value)}
            className="w-full rounded-lg border-brand-dark/10 focus:border-brand-light focus:ring-2 focus:ring-brand-light/20"
          >
            <option value="">Any Size</option>
            {sizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}