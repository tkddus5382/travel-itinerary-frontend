'use client';

import { useState, useEffect, useRef } from 'react';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
const geocodingClient = mbxGeocoding({ accessToken: mapboxToken });

interface GeocodingFeature {
  id: string;
  place_name: string;
  center: [number, number]; // [longitude, latitude]
  text: string;
}

interface PlaceSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (data: {
    name: string;
    latitude: number;
    longitude: number;
  }) => void;
  placeholder?: string;
  className?: string;
}

export default function PlaceSearchInput({
  value,
  onChange,
  onSelect,
  placeholder = '장소를 검색하세요...',
  className = '',
}: PlaceSearchInputProps) {
  const [suggestions, setSuggestions] = useState<GeocodingFeature[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search with debounce
  useEffect(() => {
    if (!value || value.length < 2) {
      setSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await geocodingClient
          .forwardGeocode({
            query: value,
            limit: 5,
            language: ['ko', 'en'],
          })
          .send();

        setSuggestions(response.body.features);
        setShowDropdown(true);
      } catch (error) {
        console.error('Geocoding error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleSelect = (feature: GeocodingFeature) => {
    const [longitude, latitude] = feature.center;
    onChange(feature.text);
    onSelect({
      name: feature.text,
      latitude,
      longitude,
    });
    setSuggestions([]);
    setShowDropdown(false);
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {isLoading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleSelect(feature)}
              className="w-full px-4 py-3 text-left hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{feature.text}</div>
              <div className="text-sm text-gray-500 mt-1">{feature.place_name}</div>
            </button>
          ))}
        </div>
      )}

      {showDropdown && !isLoading && suggestions.length === 0 && value.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
}
