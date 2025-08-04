import React, { useState, useEffect, useRef } from 'react';
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
  onActivitySelect?: (activity: Activity) => void;
  onLocationSelect?: (location: { lat: number; lng: number }, address: string) => void;
  mode?: 'view' | 'select';
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
  onLocationSelect,
  mode = 'view',
  initialCenter = DEFAULT_CENTER,
  userLocation
}: SimpleInteractiveMapProps) {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapView, setMapView] = useState<'embedded' | 'list'>('embedded');
  const [mapBounds, setMapBounds] = useState({
    north: initialCenter.lat + 0.05,
    south: initialCenter.lat - 0.05,
    east: initialCenter.lng + 0.05,
    west: initialCenter.lng - 0.05,
  });
  const [mapUrl, setMapUrl] = useState<string>('');
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Handle map click for location selection
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== 'select' || !onLocationSelect) return;

    const rect = mapContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert pixel coordinates to lat/lng (rough approximation)
    const latRange = mapBounds.north - mapBounds.south;
    const lngRange = mapBounds.east - mapBounds.west;

    const lat = mapBounds.north - (y / rect.height) * latRange;
    const lng = mapBounds.west + (x / rect.width) * lngRange;

    setSelectedLocation({ lat, lng });
  };

  // Convert coordinates to address (mock implementation)
  const coordinatesToAddress = (coords: { lat: number; lng: number }): string => {
    // In a real app, you'd use a reverse geocoding API
    const knownLocations = [
      { coords: { lat: 51.5074, lng: -0.1278 }, name: "Central London" },
      { coords: { lat: 51.4545, lng: -0.2727 }, name: "Richmond Park" },
      { coords: { lat: 51.5200, lng: -0.2375 }, name: "Westway Sports Centre" },
      { coords: { lat: 51.5557, lng: -0.1657 }, name: "Hampstead Heath" },
    ];

    // Find closest known location
    let closest = knownLocations[0];
    let minDistance = Math.sqrt(
      Math.pow(coords.lat - closest.coords.lat, 2) +
      Math.pow(coords.lng - closest.coords.lng, 2)
    );

    knownLocations.forEach(location => {
      const distance = Math.sqrt(
        Math.pow(coords.lat - location.coords.lat, 2) +
        Math.pow(coords.lng - location.coords.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closest = location;
      }
    });

    return closest.name;
  };

  // Confirm location selection
  const confirmLocationSelection = () => {
    if (selectedLocation && onLocationSelect) {
      const address = coordinatesToAddress(selectedLocation);
      onLocationSelect(selectedLocation, address);
    }
  };

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
    return styles[type.toLowerCase()] || { color: '#6B7280', emoji: '���' };
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
    // Calculate bounds that include all activities
    const allCoords = activitiesWithCoords
      .filter(a => a.coordinates)
      .map(a => a.coordinates!);

    if (allCoords.length > 0) {
      const lats = allCoords.map(c => c.lat);
      const lngs = allCoords.map(c => c.lng);
      const padding = 0.01;

      const bounds = {
        north: Math.max(...lats) + padding,
        south: Math.min(...lats) - padding,
        east: Math.max(...lngs) + padding,
        west: Math.min(...lngs) - padding
      };

      setMapBounds(bounds);

      return `https://www.openstreetmap.org/export/embed.html?bbox=${bounds.west},${bounds.south},${bounds.east},${bounds.north}&layer=mapnik`;
    }

    const defaultBounds = {
      north: center.lat + 0.05,
      south: center.lat - 0.05,
      east: center.lng + 0.05,
      west: center.lng - 0.05
    };

    setMapBounds(defaultBounds);

    return `https://www.openstreetmap.org/export/embed.html?bbox=${defaultBounds.west},${defaultBounds.south},${defaultBounds.east},${defaultBounds.north}&layer=mapnik`;
  };

  // Convert lat/lng to pixel coordinates relative to the map container
  const latLngToPixel = (lat: number, lng: number) => {
    if (!mapContainerRef.current) return { x: 0, y: 0 };

    const container = mapContainerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Calculate the position within the map bounds
    const x = ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * containerWidth;
    const y = ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * containerHeight;

    return { x, y };
  };

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);

    // Scroll the activity into view in the list below
    const activityElement = document.getElementById(`activity-${activity.id}`);
    if (activityElement) {
      activityElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
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
            <h1 className="text-lg font-bold">
              {mode === 'select' ? 'Select Location' : 'Activity Map'}
            </h1>
            <p className="text-sm text-gray-500">
              {mode === 'select'
                ? 'Tap on the map to select a location'
                : `${activitiesWithCoords.length} activities shown`
              }
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
          {mapView === 'embedded' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Force map refresh by regenerating URL
                const iframe = document.querySelector('iframe[title="Activity locations map"]') as HTMLIFrameElement;
                if (iframe) {
                  iframe.src = generateOSMUrl();
                }
              }}
              title="Refresh map"
            >
              🔄
            </Button>
          )}
        </div>
      </div>

      {/* Map Container */}
      {mapView === 'embedded' ? (
        <div className="relative flex-1 h-[calc(100vh-4rem)]">
          {/* Embedded Map */}
          <div
            ref={mapContainerRef}
            className="w-full h-2/3 relative cursor-pointer"
            onClick={handleMapClick}
          >
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

            {/* Activity Markers Overlay */}
            {activitiesWithCoords.map((activity) => {
              if (!activity.coordinates) return null;

              const { x, y } = latLngToPixel(activity.coordinates.lat, activity.coordinates.lng);
              const style = getActivityMarkerStyle(activity.type);
              const isSelected = selectedActivity?.id === activity.id;

              // Only show markers that are within the visible map area
              if (x < 0 || y < 0 || x > (mapContainerRef.current?.offsetWidth || 0) || y > (mapContainerRef.current?.offsetHeight || 0)) {
                return null;
              }

              return (
                <div
                  key={activity.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 z-10 ${
                    isSelected ? 'scale-125 z-20' : ''
                  }`}
                  style={{
                    left: `${x}px`,
                    top: `${y}px`,
                  }}
                  onClick={() => handleActivityClick(activity)}
                  title={activity.title}
                >
                  {/* Activity Marker */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium shadow-lg border-2 border-white ${
                      isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: style.color }}
                  >
                    {style.emoji}
                  </div>

                  {/* Pulse animation for selected marker */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping opacity-75"
                      style={{ backgroundColor: style.color }}
                    />
                  )}

                  {/* Quick info tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {activity.title}
                  </div>
                </div>
              );
            })}

            {/* Selected Location Marker (for location selection mode) */}
            {mode === 'select' && selectedLocation && (
              (() => {
                const { x, y } = latLngToPixel(selectedLocation.lat, selectedLocation.lng);

                // Only show if within bounds
                if (x >= 0 && y >= 0 && x <= (mapContainerRef.current?.offsetWidth || 0) && y <= (mapContainerRef.current?.offsetHeight || 0)) {
                  return (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                      }}
                    >
                      <div className="relative">
                        <MapPin className="w-8 h-8 text-red-500 drop-shadow-lg" />
                        <div className="absolute inset-0 w-8 h-8 rounded-full opacity-25 animate-ping bg-red-500" />
                      </div>
                    </div>
                  );
                }
                return null;
              })()
            )}

            {/* User Location Marker */}
            {userLocation && (
              (() => {
                const { x, y } = latLngToPixel(userLocation.lat, userLocation.lng);

                // Only show if within bounds
                if (x >= 0 && y >= 0 && x <= (mapContainerRef.current?.offsetWidth || 0) && y <= (mapContainerRef.current?.offsetHeight || 0)) {
                  return (
                    <div
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                      }}
                    >
                      <div className="relative">
                        <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                        <div className="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full opacity-25 animate-ping" />
                      </div>
                    </div>
                  );
                }
                return null;
              })()
            )}

            {/* Activity Counter and Legend */}
            <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm border rounded-lg p-2 shadow-sm z-10">
              <div className="text-xs font-medium mb-2">{activitiesWithCoords.length} activities</div>

              {/* Activity Type Legend */}
              <div className="space-y-1">
                {Array.from(new Set(activitiesWithCoords.map(a => a.type))).map(type => {
                  const style = getActivityMarkerStyle(type);
                  const count = activitiesWithCoords.filter(a => a.type === type).length;

                  return (
                    <div key={type} className="flex items-center gap-1 text-xs">
                      <div
                        className="w-3 h-3 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: style.color, fontSize: '8px' }}
                      >
                        {style.emoji}
                      </div>
                      <span className="capitalize">{type}</span>
                      <span className="text-gray-500">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activities List or Location Selection */}
          <div className="h-1/3 bg-white border-t p-4 overflow-y-auto">
            {mode === 'select' ? (
              /* Location Selection UI */
              <div className="space-y-4">
                <div className="text-center">
                  <h2 className="text-lg font-medium mb-2">Select Location</h2>
                  <p className="text-sm text-gray-600">
                    {selectedLocation
                      ? "Tap 'Confirm' to use this location"
                      : "Tap anywhere on the map to select a location"
                    }
                  </p>
                </div>

                {selectedLocation && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">Selected Location</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {coordinatesToAddress(selectedLocation)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Coordinates: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-explore-green hover:bg-green-600"
                    onClick={confirmLocationSelection}
                    disabled={!selectedLocation}
                  >
                    Confirm Location
                  </Button>
                </div>
              </div>
            ) : (
              /* Activities List */
              <>
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
                        id={`activity-${activity.id}`}
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
              </>
            )}
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
                          onClick={() => onActivitySelect?.(activity)}
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
