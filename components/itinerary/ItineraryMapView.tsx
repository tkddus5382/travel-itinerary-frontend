'use client';

import { useState } from 'react';
import DayTabs from './DayTabs';
import SimpleMap from '../map/SimpleMap';

interface Place {
  id: number;
  attributes: {
    name: string;
    category: string;
    dayNumber: number;
    timeSlot?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
    order: number;
  };
}

interface ItineraryMapViewProps {
  places: Place[];
}

export default function ItineraryMapView({ places }: ItineraryMapViewProps) {
  const [currentDay, setCurrentDay] = useState(1);

  // Group places by day
  const placesByDay: { [key: number]: Place[] } = {};
  places.forEach((place) => {
    const dayNum = place.attributes.dayNumber;
    if (!placesByDay[dayNum]) {
      placesByDay[dayNum] = [];
    }
    placesByDay[dayNum].push(place);
  });

  // Sort places within each day
  Object.keys(placesByDay).forEach((dayNum) => {
    placesByDay[Number(dayNum)].sort(
      (a, b) => a.attributes.order - b.attributes.order
    );
  });

  // Create days array for tabs
  const days = Object.keys(placesByDay)
    .map((dayNum) => ({
      id: Number(dayNum),
      dayNumber: Number(dayNum),
      title: `Day ${dayNum}`,
    }))
    .sort((a, b) => a.dayNumber - b.dayNumber);

  // Get current day places with coordinates
  const currentDayPlaces = (placesByDay[currentDay] || [])
    .filter((p) => p.attributes.latitude && p.attributes.longitude)
    .map((p) => ({
      id: p.id,
      name: p.attributes.name,
      latitude: p.attributes.latitude!,
      longitude: p.attributes.longitude!,
      order: p.attributes.order,
    }));

  if (places.length === 0 || days.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-8 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">일정별 장소</h2>

      {/* Day Tabs */}
      <DayTabs
        days={days}
        currentDay={currentDay}
        onDayChange={setCurrentDay}
        showControls={false}
      />

      {/* Current Day Content */}
      <div className="mt-6">
        {/* Map */}
        {currentDayPlaces.length > 0 && (
          <div className="mb-6">
            <SimpleMap places={currentDayPlaces} height="500px" />
          </div>
        )}

        {/* Places List */}
        <div className="space-y-4">
          {(placesByDay[currentDay] || []).map((place, index) => (
            <div
              key={place.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {place.attributes.name}
                  </h3>
                  {place.attributes.timeSlot && (
                    <p className="text-sm text-gray-600 mb-2">
                      ⏰ {place.attributes.timeSlot}
                    </p>
                  )}
                  {place.attributes.description && (
                    <p className="text-gray-700 leading-relaxed">
                      {place.attributes.description}
                    </p>
                  )}
                  {!place.attributes.latitude && !place.attributes.longitude && (
                    <p className="text-sm text-amber-600 mt-2">
                      ⚠️ 좌표 정보가 없습니다
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
