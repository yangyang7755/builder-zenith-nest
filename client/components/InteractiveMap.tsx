import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  X, 
  MapPin, 
  Navigation, 
  Locate, 
  Target, 
  Layers,
  Plus,
  Minus,
  RotateCcw,
  AlertTriangle
} from 'lucide-react';

// Activity interface
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
  distance?: number;
}

interface InteractiveMapProps {
  activities: Activity[];
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
  initialCenter?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
}

// Default map center (London)
const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };

export default function InteractiveMap({ 
  activities, 
  onClose, 
  onActivitySelect,
  initialCenter = DEFAULT_CENTER,
  userLocation 
}: InteractiveMapProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [mapError] = useState<string>('Mapbox GL is being configured. Please check the setup instructions.');

  // Activity type colors and icons
  const getActivityMarkerStyle = (type: string) => {
    const styles: { [key: string]: { color: string; emoji: string } } = {
      cycling: { color: '#3B82F6', emoji: '🚴' },
      running: { color: '#EF4444', emoji: '🏃' },
      climbing: { color: '#F59E0B', emoji: '🧗' },
      hiking: { color: '#10B981', emoji: '🥾' },
      swimming: { color: '#06B6D4', emoji: '🏊' },
      tennis: { color: '#8B5CF6', emoji: '🎾' },
      football: { color: '#F97316', emoji: '⚽' },
      yoga: { color: '#EC4899', emoji: '🧘' },
    };
    return styles[type.toLowerCase()] || { color: '#6B7280', emoji: '⚡' };
  };

  // Add coordinates to activities if not present
  const activitiesWithCoords = activities.map((activity) => {
    if (activity.coordinates) return activity;
    
    // Mock coordinates for demo - in production, these would come from geocoding
    const mockCoords = {
      lat: initialCenter.lat + (Math.random() - 0.5) * 0.1,
      lng: initialCenter.lng + (Math.random() - 0.5) * 0.1,
    };
    
    return { ...activity, coordinates: mockCoords };
  });

  // Temporary fallback component while Mapbox is being set up
  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-4 relative z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Interactive Map</h1>
            <p className="text-sm text-gray-500">
              {activitiesWithCoords.length} activities available
            </p>
          </div>
        </div>
      </div>

      {/* Map Container - Showing setup message */}
      <div className="relative flex-1 h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <Card className="max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Interactive Map Setup Required</h3>
              <p className="text-gray-600 mb-4">
                The interactive map is being configured. To enable full mapping functionality with Mapbox:
              </p>
              <ol className="text-sm text-left space-y-2 mb-4">
                <li>1. Get a free Mapbox access token at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a></li>
                <li>2. Set VITE_MAPBOX_ACCESS_TOKEN in your environment</li>
                <li>3. Restart the development server</li>
              </ol>
              <div className="space-y-2">
                <Button onClick={onClose} variant="outline" className="w-full">
                  Back to List View
                </Button>
                <Button 
                  onClick={() => window.open('/database-management', '_blank')} 
                  className="w-full"
                >
                  Open Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activities List Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 max-h-64 overflow-y-auto">
          <h2 className="text-sm font-medium mb-3">Activities in this area:</h2>
          <div className="space-y-2">
            {activitiesWithCoords.slice(0, 3).map((activity) => {
              const style = getActivityMarkerStyle(activity.type);
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => onActivitySelect(activity)}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                    style={{ backgroundColor: style.color }}
                  >
                    {style.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.location} • {activity.date}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              );
            })}
            {activitiesWithCoords.length > 3 && (
              <p className="text-xs text-gray-500 text-center pt-2">
                +{activitiesWithCoords.length - 3} more activities
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
