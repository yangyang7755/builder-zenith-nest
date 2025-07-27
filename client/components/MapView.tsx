import { useState } from "react";
import { X, MapPin, Navigation, Users, Calendar } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  type: string;
  location: string;
  date: string;
  time: string;
  participants: number;
  maxParticipants: string;
  organizer: string;
  coordinates?: { lat: number; lng: number };
}

interface MapViewProps {
  activities: Activity[];
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
}

export default function MapView({ activities, onClose, onActivitySelect }: MapViewProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);

  // Mock coordinates for activities if not provided
  const activitiesWithCoords = activities.map((activity, index) => ({
    ...activity,
    coordinates: activity.coordinates || {
      lat: 51.5074 + (Math.random() - 0.5) * 0.05,
      lng: -0.1278 + (Math.random() - 0.5) * 0.05
    }
  }));

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cycling': return 'bg-blue-500';
      case 'climbing': return 'bg-red-500';
      case 'running': return 'bg-green-500';
      case 'swimming': return 'bg-cyan-500';
      case 'hiking': return 'bg-orange-500';
      case 'yoga': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cycling': return '🚴';
      case 'climbing': return '🧗';
      case 'running': return '🏃';
      case 'swimming': return '🏊';
      case 'hiking': return '🥾';
      case 'yoga': return '🧘';
      default: return '🏃';
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-explore-green font-cabin">Activities Map</h2>
          <div className="bg-explore-green text-white px-2 py-1 rounded-full text-sm font-cabin">
            {activitiesWithCoords.length} activities
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Map Container */}
      <div className="relative h-[calc(100vh-4rem)] overflow-hidden">
        {/* Map Background */}
        <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 relative">
          {/* Map Grid */}
          <div className="absolute inset-0">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className="absolute w-full border-t border-gray-200 opacity-30"
                style={{ top: `${i * 5}%` }}
              />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className="absolute h-full border-l border-gray-200 opacity-30"
                style={{ left: `${i * 5}%` }}
              />
            ))}
          </div>

          {/* Mock Streets */}
          <div className="absolute inset-0">
            <div className="absolute bg-gray-300 h-1" style={{ top: '30%', left: '10%', width: '80%' }} />
            <div className="absolute bg-gray-300 h-1" style={{ top: '60%', left: '5%', width: '90%' }} />
            <div className="absolute bg-gray-300 w-1" style={{ left: '25%', top: '20%', height: '60%' }} />
            <div className="absolute bg-gray-300 w-1" style={{ left: '70%', top: '10%', height: '70%' }} />
          </div>

          {/* Activity Markers */}
          {activitiesWithCoords.map((activity) => {
            const xPos = ((activity.coordinates!.lng + 0.1528) / 0.1) * 100;
            const yPos = ((51.5324 - activity.coordinates!.lat) / 0.05) * 100;
            
            return (
              <div
                key={activity.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{
                  left: `${Math.max(5, Math.min(95, xPos))}%`,
                  top: `${Math.max(5, Math.min(95, yPos))}%`
                }}
                onClick={() => setSelectedActivity(activity)}
              >
                {/* Activity Pin */}
                <div className={`w-10 h-10 ${getActivityColor(activity.type)} rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform`}>
                  {getActivityIcon(activity.type)}
                </div>
                
                {/* Pulse Animation */}
                <div className={`absolute inset-0 ${getActivityColor(activity.type)} rounded-full animate-ping opacity-25`}></div>
                
                {/* Quick Info Tooltip */}
                <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 min-w-max">
                  <div className="font-bold text-sm text-explore-green">{activity.title}</div>
                  <div className="text-xs text-gray-600">{activity.date} • {activity.participants || 0}/{activity.maxParticipants} people</div>
                </div>
              </div>
            );
          })}

          {/* User Location */}
          <div 
            className="absolute transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: '50%', top: '50%' }}
          >
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg">
              <div className="absolute inset-0 bg-blue-600 rounded-full animate-pulse opacity-50"></div>
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-cabin text-blue-600 font-bold">
              You
            </div>
          </div>

          {/* Legend */}
          <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
            <h3 className="font-bold text-sm mb-2 font-cabin">Activity Types</h3>
            <div className="space-y-1">
              {['Cycling', 'Climbing', 'Running', 'Swimming'].map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 ${getActivityColor(type)} rounded-full`}></div>
                  <span className="text-xs font-cabin">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Center on User Button */}
          <button className="absolute bottom-20 right-4 bg-white p-3 rounded-full shadow-lg">
            <Navigation className="w-5 h-5 text-explore-green" />
          </button>
        </div>

        {/* Activity Detail Panel */}
        {selectedActivity && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t rounded-t-xl p-4 shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg text-explore-green font-cabin">
                  {selectedActivity.title}
                </h3>
                <p className="text-sm text-gray-600 font-cabin">{selectedActivity.location}</p>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-cabin">{selectedActivity.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-cabin">
                  {selectedActivity.participants || 0}/{selectedActivity.maxParticipants} people
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onActivitySelect(selectedActivity)}
                className="flex-1 bg-explore-green text-white py-3 rounded-lg font-cabin font-medium"
              >
                View Details
              </button>
              <button className="px-6 py-3 border-2 border-explore-green text-explore-green rounded-lg font-cabin font-medium">
                Get Directions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
