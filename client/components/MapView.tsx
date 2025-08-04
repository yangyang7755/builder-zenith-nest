import React, { useState, useEffect } from "react";
import InteractiveMap from "./InteractiveMap";
import EnhancedMapView from "./EnhancedMapView";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { MapPin, Wifi, WifiOff } from "lucide-react";

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

interface MapViewProps {
  activities: Activity[];
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
}

export default function MapView({
  activities,
  onClose,
  onActivitySelect,
}: MapViewProps) {
  const [useInteractiveMap, setUseInteractiveMap] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if we have a valid Mapbox token
  const hasMapboxToken = () => {
    const token = process.env.VITE_MAPBOX_ACCESS_TOKEN;
    return token && !token.includes('example') && token.length > 20;
  };

  // Get user's current location
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        setIsGettingLocation(false);

        toast({
          title: "Location found",
          description: `Located within ${Math.round(position.coords.accuracy)}m accuracy`,
        });
      },
      (error) => {
        setIsGettingLocation(false);
        let message = "Failed to get location";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Location access denied. Please allow location access.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            message = "Location request timed out.";
            break;
        }

        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });

        // Use London as fallback
        setUserLocation({ lat: 51.5074, lng: -0.1278 });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  // Initialize location on mount
  useEffect(() => {
    getUserLocation();
  }, []);

  // Decide which map component to use
  const shouldUseInteractiveMap = useInteractiveMap && hasMapboxToken() && !mapError;

  if (shouldUseInteractiveMap) {
    return (
      <InteractiveMap
        activities={activities}
        onClose={onClose}
        onActivitySelect={onActivitySelect}
        initialCenter={userLocation || { lat: 51.5074, lng: -0.1278 }}
        userLocation={userLocation}
      />
    );
  }

  // Fallback to enhanced map view if interactive map fails
  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Map type selector */}
      <div className="absolute top-20 left-4 right-4 z-10">
        <Card className="bg-white/90 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {hasMapboxToken() ? (
                  <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm font-medium">
                  {hasMapboxToken() ? 'Interactive Map Available' : 'Interactive Map Unavailable'}
                </span>
              </div>
              
              {hasMapboxToken() && (
                <Button
                  size="sm"
                  variant={useInteractiveMap ? "default" : "outline"}
                  onClick={() => setUseInteractiveMap(!useInteractiveMap)}
                >
                  {useInteractiveMap ? 'Use Simple Map' : 'Use Interactive Map'}
                </Button>
              )}
            </div>

            {!hasMapboxToken() && (
              <div className="text-xs text-gray-600">
                <p className="mb-2">
                  To enable the interactive map with satellite view, street maps, and full navigation:
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Get a free Mapbox access token at mapbox.com</li>
                  <li>Add it as VITE_MAPBOX_ACCESS_TOKEN in your environment</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <EnhancedMapView
        activities={activities}
        onClose={onClose}
        onActivitySelect={onActivitySelect}
      />
    </div>
  );
}
