
import React from 'react';
import type { HistoricalEvent } from '../types';
import { HISTORICAL_EVENTS } from '../constants';

interface EventSelectorProps {
  onSelectEvent: (event: HistoricalEvent) => void;
  selectedEvent: HistoricalEvent | null;
}

const EventSelector: React.FC<EventSelectorProps> = ({ onSelectEvent, selectedEvent }) => {
  return (
    <div className="w-full flex flex-col items-center gap-4 p-6 bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-600">
      <h2 className="text-2xl font-bold text-slate-200">2. Choose Your Destination</h2>
      <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-4 mt-2 max-h-96 overflow-y-auto pr-2">
        {HISTORICAL_EVENTS.map((event) => (
          <div
            key={event.id}
            onClick={() => onSelectEvent(event)}
            className={`
              group relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300
              transform hover:scale-105
              ${selectedEvent?.id === event.id ? 'ring-4 ring-teal-500 shadow-2xl shadow-teal-500/30' : 'ring-2 ring-transparent hover:ring-teal-600'}
            `}
          >
            <img 
              src={event.backgroundImageUrl} 
              alt={event.name} 
              className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors duration-300 flex flex-col justify-end p-2">
              <h3 className="font-bold text-sm text-white">{event.name}</h3>
              <p className="text-xs text-slate-300 hidden md:block">{event.description.split('-')[0]}</p>
            </div>
            {selectedEvent?.id === event.id && (
              <div className="absolute top-2 right-2 bg-teal-500 rounded-full p-1 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventSelector;
