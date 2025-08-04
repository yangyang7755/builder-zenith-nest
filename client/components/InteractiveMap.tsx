import React, { useState, useEffect, useCallback, useRef } from 'react';
import Map, { Marker, Popup, ViewState, MapRef } from 'react-map-gl';
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
  RotateCcw
} from 'lucide-react';
import 'mapbox-gl/dist/mapbox-gl.css';

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

// Mapbox access token - in production, this should be in environment variables
const MAPBOX_TOKEN = process.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example'; // Demo token

export default function InteractiveMap({ 
  activities, 
  onClose, 
  onActivitySelect,
  initialCenter = DEFAULT_CENTER,
  userLocation 
}: InteractiveMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>({
    latitude: initialCenter.lat,
    longitude: initialCenter.lng,
    zoom: 11,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, bottom: 0, left: 0, right: 0 }
  });
  
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  // Map style options
  const mapStyles = [
    { id: 'streets', name: 'Streets', style: 'mapbox://styles/mapbox/streets-v12' },
    { id: 'satellite', name: 'Satellite', style: 'mapbox://styles/mapbox/satellite-v9' },
    { id: 'outdoors', name: 'Outdoors', style: 'mapbox://styles/mapbox/outdoors-v12' },
    { id: 'light', name: 'Light', style: 'mapbox://styles/mapbox/light-v11' },
  ];

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

  // Handle map load
  const onMapLoad = useCallback(() => {
    setIsLoading(false);
    setMapError(null);
  }, []);

  // Handle map error
  const onMapError = useCallback((error: any) => {
    console.error('Map error:', error);
    setMapError('Failed to load map. Please check your connection.');
    setIsLoading(false);
  }, []);

  // Fly to user location
  const flyToUserLocation = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        duration: 2000
      });
    }
  }, [userLocation]);

  // Fit map to show all activities
  const fitToActivities = useCallback(() => {
    if (activitiesWithCoords.length === 0 || !mapRef.current) return;

    const coordinates = activitiesWithCoords
      .filter(activity => activity.coordinates)
      .map(activity => [activity.coordinates!.lng, activity.coordinates!.lat] as [number, number]);

    if (coordinates.length === 0) return;

    // Calculate bounds
    const lngs = coordinates.map(coord => coord[0]);
    const lats = coordinates.map(coord => coord[1]);
    
    const bounds: [[number, number], [number, number]] = [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)]
    ];

    mapRef.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  }, [activitiesWithCoords]);

  // Reset map view
  const resetMapView = useCallback(() => {
    setViewState({
      latitude: initialCenter.lat,
      longitude: initialCenter.lng,
      zoom: 11,
      bearing: 0,
      pitch: 0,
      padding: { top: 0, bottom: 0, left: 0, right: 0 }
    });
  }, [initialCenter]);

  // Handle marker click
  const handleMarkerClick = (activity: Activity) => {
    setSelectedActivity(activity);
    
    // Center map on selected activity
    if (activity.coordinates && mapRef.current) {
      mapRef.current.flyTo({
        center: [activity.coordinates.lng, activity.coordinates.lat],
        zoom: Math.max(viewState.zoom, 14),
        duration: 1000
      });
    }
  };

  // Custom marker component for React Native compatibility
  const ActivityMarker = ({ activity }: { activity: Activity }) => {
    if (!activity.coordinates) return null;
    
    const markerStyle = getActivityMarkerStyle(activity.type);
    
    return (
      <Marker
        latitude={activity.coordinates.lat}
        longitude={activity.coordinates.lng}
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          handleMarkerClick(activity);
        }}
      >
        <div className="relative cursor-pointer group">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-transform group-hover:scale-110"
            style={{ backgroundColor: markerStyle.color }}
          >
            <span className="text-lg">{markerStyle.emoji}</span>
          </div>
          {/* Activity count badge for overlapping activities */}
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
            1
          </div>
        </div>
      </Marker>
    );
  };

  // User location marker
  const UserLocationMarker = () => {
    if (!userLocation) return null;
    
    return (
      <Marker
        latitude={userLocation.lat}
        longitude={userLocation.lng}
      >
        <div className="relative">
          <div className="w-6 h-6 bg-blue-500 rounded-full border-4 border-white shadow-lg animate-pulse"></div>
          <div className="absolute inset-0 w-6 h-6 bg-blue-500 rounded-full opacity-25 animate-ping"></div>
        </div>
      </Marker>
    );
  };

  // Map controls component
  const MapControls = () => (
    <div className="absolute top-4 right-4 flex flex-col gap-2">
      {/* Zoom controls */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 border-b"
          onClick={() => {
            const newZoom = Math.min(viewState.zoom + 1, 20);
            setViewState(prev => ({ ...prev, zoom: newZoom }));
          }}
        >
          <Plus className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0"
          onClick={() => {
            const newZoom = Math.max(viewState.zoom - 1, 1);
            setViewState(prev => ({ ...prev, zoom: newZoom }));
          }}
        >
          <Minus className="w-4 h-4" />
        </Button>
      </div>

      {/* Navigation controls */}
      <div className="bg-white rounded-lg shadow-lg p-1">
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 mb-1"
          onClick={resetMapView}
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        
        {userLocation && (
          <Button
            variant="ghost"
            size="sm"
            className="w-10 h-10 p-0 mb-1"
            onClick={flyToUserLocation}
            title="Go to my location"
          >
            <Target className="w-4 h-4" />
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0"
          onClick={fitToActivities}
          title="Fit to activities"
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  // Error fallback component
  if (mapError || !MAPBOX_TOKEN || MAPBOX_TOKEN.includes('example')) {
    return (
      <div className="fixed inset-0 bg-white z-50">
        <div className="h-16 bg-white border-b flex items-center justify-between px-4">
          <h1 className="text-lg font-bold">Map View</h1>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-center h-full">
          <Card className="max-w-md mx-4">
            <CardContent className="p-6 text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Map Unavailable</h3>
              <p className="text-gray-600 mb-4">
                {mapError || 'Map requires a valid Mapbox access token. Please configure VITE_MAPBOX_ACCESS_TOKEN in your environment variables.'}
              </p>
              <Button onClick={onClose} variant="outline">
                Back to List View
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

        {/* Map style selector */}
        <div className="flex gap-1">
          {mapStyles.map((style) => (
            <Button
              key={style.id}
              variant={mapStyle === style.style ? "default" : "outline"}
              size="sm"
              onClick={() => setMapStyle(style.style)}
              className="text-xs"
            >
              {style.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 h-[calc(100vh-4rem)]">
        {isLoading && (
          <div className="absolute inset-0 bg-white flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        )}

        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          onLoad={onMapLoad}
          onError={onMapError}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle={mapStyle}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
          // React Native compatibility settings
          touchZoomRotate
          doubleClickZoom
          dragPan
          dragRotate
          scrollZoom
          keyboard
        >
          {/* Activity markers */}
          {activitiesWithCoords.map((activity) => (
            <ActivityMarker key={activity.id} activity={activity} />
          ))}

          {/* User location marker */}
          <UserLocationMarker />

          {/* Selected activity popup */}
          {selectedActivity && selectedActivity.coordinates && (
            <Popup
              latitude={selectedActivity.coordinates.lat}
              longitude={selectedActivity.coordinates.lng}
              onClose={() => setSelectedActivity(null)}
              closeButton={false}
              closeOnClick={false}
              anchor="bottom"
              maxWidth="300px"
            >
              <Card className="border-0 shadow-lg">
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
                      onClick={() => {
                        // Get directions functionality would go here
                        window.open(
                          `https://maps.google.com/maps?daddr=${selectedActivity.coordinates!.lat},${selectedActivity.coordinates!.lng}`,
                          '_blank'
                        );
                      }}
                    >
                      <Navigation className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Popup>
          )}
        </Map>

        {/* Map controls */}
        <MapControls />

        {/* Attribution */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
          © Mapbox © OpenStreetMap
        </div>
      </div>
    </div>
  );
}
