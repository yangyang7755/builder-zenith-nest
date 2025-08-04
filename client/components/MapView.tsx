import React, { useState, useEffect } from "react";
import SimpleInteractiveMap from "./SimpleInteractiveMap";
import EnhancedMapView from "./EnhancedMapView";
import { useToast } from "../hooks/use-toast";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { MapPin, Map as MapIcon, List } from "lucide-react";

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
  onActivitySelect?: (activity: Activity) => void;
  onLocationSelect?: (location: { lat: number; lng: number }, address: string) => void;
  mode?: 'view' | 'select';
}

export default function MapView({
  activities,
  onClose,
  onActivitySelect,
  onLocationSelect,
  mode = 'view',
}: MapViewProps) {
  const [useAdvancedMap, setUseAdvancedMap] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

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

  // Use the simple interactive map by default
  if (!useAdvancedMap) {
    return (
      <SimpleInteractiveMap
        activities={activities}
        onClose={onClose}
        onActivitySelect={onActivitySelect}
        onLocationSelect={onLocationSelect}
        mode={mode}
        initialCenter={userLocation || { lat: 51.5074, lng: -0.1278 }}
        userLocation={userLocation}
      />
    );
  }

  // Fallback to enhanced map view
  return (
    <EnhancedMapView
      activities={activities}
      onClose={onClose}
      onActivitySelect={onActivitySelect}
    />
  );
}
