import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  X, 
  MapPin, 
  Navigation, 
  Locate, 
  Target, 
  ExternalLink,
  Map as MapIcon
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

interface SimpleInteractiveMapProps {
  activities: Activity[];
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
  initialCenter?: { lat: number; lng: number };
  userLocation?: { lat: number; lng: number } | null;
}

// Default map center (London)
const DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };

// Mock coordinates for demo locations
const LOCATION_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  "westway climbing centre": { lat: 51.5200, lng: -0.2375 },
  "richmond park": { lat: 51.4545, lng: -0.2727 },
  "stanage edge": { lat: 53.3403, lng: -1.6286 },
  "oxford": { lat: 51.7520, lng: -1.2577 },
  "london": { lat: 51.5074, lng: -0.1278 },
  "peak district": { lat: 53.3403, lng: -1.6286 },
  "hampstead heath": { lat: 51.5557, lng: -0.1657 },
  "regents park": { lat: 51.5268, lng: -0.1554 }
};

export default function SimpleInteractiveMap({
  activities,
  onClose,
  onActivitySelect,
  initialCenter = DEFAULT_CENTER,
  userLocation
}: SimpleInteractiveMapProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [mapView, setMapView] = useState<'embedded' | 'list'>('embedded');
  const [mapBounds, setMapBounds] = useState({
    north: initialCenter.lat + 0.05,
    south: initialCenter.lat - 0.05,
    east: initialCenter.lng + 0.05,
    west: initialCenter.lng - 0.05,
  });
  const mapContainerRef = useRef<HTMLDivElement>(null);

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
    
    // Try to match location to known coordinates
    const locationKey = Object.keys(LOCATION_COORDINATES).find(key => 
      activity.location.toLowerCase().includes(key)
    );
    
    const coordinates = locationKey 
      ? LOCATION_COORDINATES[locationKey]
      : {
          lat: initialCenter.lat + (Math.random() - 0.5) * 0.1,
          lng: initialCenter.lng + (Math.random() - 0.5) * 0.1,
        };
    
    return { ...activity, coordinates };
  });

  // Generate Google Maps embed URL with markers
  const generateMapUrl = () => {
    const center = userLocation || initialCenter;
    const markers = activitiesWithCoords
      .filter(activity => activity.coordinates)
      .map(activity => {
        const style = getActivityMarkerStyle(activity.type);
        return `${activity.coordinates!.lat},${activity.coordinates!.lng}`;
      })
      .slice(0, 10) // Limit to 10 markers to avoid URL length issues
      .join('|');

    const baseUrl = 'https://www.google.com/maps/embed/v1/view';
    const params = new URLSearchParams({
      key: 'AIzaSyD_demo_key', // Demo key - replace with real key in production
      center: `${center.lat},${center.lng}`,
      zoom: '12',
      maptype: 'roadmap'
    });

    // For demo purposes, we'll use a static map approach
    return `${baseUrl}?${params.toString()}`;
  };

  // Generate OpenStreetMap embed URL as fallback
  const generateOSMUrl = () => {
    const center = userLocation || initialCenter;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng-0.05},${center.lat-0.05},${center.lng+0.05},${center.lat+0.05}&layer=mapnik&marker=${center.lat},${center.lng}`;
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const openInMaps = (activity: Activity) => {
    if (activity.coordinates) {
      const url = `https://maps.google.com/maps?q=${activity.coordinates.lat},${activity.coordinates.lng}&ll=${activity.coordinates.lat},${activity.coordinates.lng}&z=15`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-4 relative z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Activity Map</h1>
            <p className="text-sm text-gray-500">
              {activitiesWithCoords.length} activities shown
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={mapView === 'embedded' ? "default" : "outline"}
            size="sm"
            onClick={() => setMapView('embedded')}
          >
            <MapIcon className="w-4 h-4 mr-1" />
            Map
          </Button>
          <Button
            variant={mapView === 'list' ? "default" : "outline"}
            size="sm"
            onClick={() => setMapView('list')}
          >
            <MapPin className="w-4 h-4 mr-1" />
            List
          </Button>
        </div>
      </div>

      {/* Map Container */}
      {mapView === 'embedded' ? (
        <div className="relative flex-1 h-[calc(100vh-4rem)]">
          {/* Embedded Map */}
          <div className="w-full h-2/3">
            <iframe
              src={generateOSMUrl()}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Activity locations map"
            />
          </div>

          {/* Activities List */}
          <div className="h-1/3 bg-white border-t p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium">Activities</h2>
              <span className="text-xs text-gray-500">{activitiesWithCoords.length} total</span>
            </div>
            
            <div className="space-y-2">
              {activitiesWithCoords.map((activity) => {
                const style = getActivityMarkerStyle(activity.type);
                const isSelected = selectedActivity?.id === activity.id;
                
                return (
                  <div
                    key={activity.id}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => handleActivityClick(activity)}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-sm"
                      style={{ backgroundColor: style.color }}
                    >
                      {style.emoji}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{activity.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{activity.location}</span>
                        <span>•</span>
                        <span>{activity.date}</span>
                        <span>•</span>
                        <span>{activity.time}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {activity.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          openInMaps(activity);
                        }}
                        title="Open in maps"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Activity Details */}
          {selectedActivity && (
            <div className="absolute top-4 left-4 right-4">
              <Card className="bg-white/95 backdrop-blur-sm shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-sm line-clamp-2">
                      {selectedActivity.title}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-6 w-6"
                      onClick={() => setSelectedActivity(null)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{selectedActivity.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {selectedActivity.type}
                      </Badge>
                      <span>{selectedActivity.date}</span>
                      <span>{selectedActivity.time}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 text-xs"
                      onClick={() => onActivitySelect(selectedActivity)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => openInMaps(selectedActivity)}
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        /* List View */
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-2xl mx-auto space-y-3">
            {activitiesWithCoords.map((activity) => {
              const style = getActivityMarkerStyle(activity.type);
              
              return (
                <Card key={activity.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium shadow-sm"
                        style={{ backgroundColor: style.color }}
                      >
                        {style.emoji}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium mb-1">{activity.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4" />
                          <span>{activity.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{activity.date}</span>
                          <span>•</span>
                          <span>{activity.time}</span>
                          <span>•</span>
                          <span>{activity.participants}/{activity.maxParticipants} people</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary">
                          {activity.type}
                        </Badge>
                        <Button
                          size="sm"
                          onClick={() => onActivitySelect(activity)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
