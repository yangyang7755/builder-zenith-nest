import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  X,
  MapPin,
  Navigation,
  Users,
  Calendar,
  Locate,
  Target,
  Clock,
  Map as MapIcon,
} from "lucide-react";

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
  distance?: number; // Distance from user in km
}

interface MapViewProps {
  activities: Activity[];
  onClose: () => void;
  onActivitySelect: (activity: Activity) => void;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export default function EnhancedMapView({
  activities,
  onClose,
  onActivitySelect,
}: MapViewProps) {
  const { toast } = useToast();
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [nearbyActivities, setNearbyActivities] = useState<Activity[]>([]);
  const [radiusKm, setRadiusKm] = useState(10); // Default 10km radius

  // Mock coordinates for demonstration
  const mockActivityLocations = {
    Oxford: { lat: 51.752, lng: -1.2577 },
    London: { lat: 51.5074, lng: -0.1278 },
    Cambridge: { lat: 52.2053, lng: 0.1218 },
    "Richmond Park": { lat: 51.4613, lng: -0.2929 },
    "Hyde Park": { lat: 51.5074, lng: -0.1657 },
    "Regent's Park": { lat: 51.5314, lng: -0.156 },
    "Hampstead Heath": { lat: 51.5673, lng: -0.1593 },
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Add mock coordinates to activities
  const activitiesWithCoords = activities.map((activity) => {
    const location = Object.keys(mockActivityLocations).find((loc) =>
      activity.location.toLowerCase().includes(loc.toLowerCase()),
    );

    const coordinates = location
      ? mockActivityLocations[location as keyof typeof mockActivityLocations]
      : {
          lat: 51.5074 + (Math.random() - 0.5) * 0.2, // Random around London
          lng: -0.1278 + (Math.random() - 0.5) * 0.2,
        };

    return {
      ...activity,
      coordinates,
    };
  });

  // Get user's current location
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };
        setUserLocation(location);
        setIsLocating(false);

        toast({
          title: "Location found",
          description: `Located within ${Math.round(position.coords.accuracy)}m accuracy`,
        });

        // Calculate nearby activities
        calculateNearbyActivities(location);
      },
      (error) => {
        setIsLocating(false);
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
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  };

  // Calculate activities within radius
  const calculateNearbyActivities = (location: UserLocation) => {
    const nearby = activitiesWithCoords
      .map((activity) => {
        if (!activity.coordinates) return null;

        const distance = calculateDistance(
          location.lat,
          location.lng,
          activity.coordinates.lat,
          activity.coordinates.lng,
        );

        return { ...activity, distance };
      })
      .filter(
        (activity): activity is Activity =>
          activity !== null && activity.distance! <= radiusKm,
      )
      .sort((a, b) => a.distance! - b.distance!);

    setNearbyActivities(nearby);
  };

  // Use demo location (London) if real location fails
  const useDemoLocation = () => {
    const demoLocation: UserLocation = {
      lat: 51.5074, // London
      lng: -0.1278,
    };
    setUserLocation(demoLocation);
    calculateNearbyActivities(demoLocation);

    toast({
      title: "Demo Location Set",
      description:
        "Using London as demo location. Nearby activities calculated.",
    });
  };

  useEffect(() => {
    // Auto-set demo location for demonstration
    setTimeout(() => {
      if (!userLocation) {
        useDemoLocation();
      }
    }, 1000);
  }, []);

  const handleActivityClick = (activity: Activity) => {
    setSelectedActivity(activity);
  };

  const getActivityTypeIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      cycling: "🚴",
      running: "🏃",
      climbing: "🧗",
      hiking: "🥾",
      swimming: "🏊",
      tennis: "🎾",
    };
    return iconMap[type.toLowerCase()] || "⚡";
  };

  const formatDistance = (distance: number) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m away`;
    }
    return `${distance.toFixed(1)}km away`;
  };

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header */}
      <div className="h-16 bg-white border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Nearby Activities</h1>
            <p className="text-sm text-gray-500">
              {userLocation
                ? `${nearbyActivities.length} activities within ${radiusKm}km`
                : "Getting location..."}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={getCurrentLocation}
            disabled={isLocating}
          >
            {isLocating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <Locate className="w-4 h-4" />
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={useDemoLocation}>
            <Target className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map Area (Mock) */}
      <div className="h-64 bg-gray-100 relative border-b">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              Interactive Map
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {userLocation
                ? `Showing activities near ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                : "Waiting for location..."}
            </p>

            {/* Radius Controls */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-sm text-gray-600">Radius:</span>
              {[5, 10, 25, 50].map((radius) => (
                <Button
                  key={radius}
                  variant={radiusKm === radius ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setRadiusKm(radius);
                    if (userLocation) calculateNearbyActivities(userLocation);
                  }}
                >
                  {radius}km
                </Button>
              ))}
            </div>

            <p className="text-xs text-gray-400">
              In production, this would show an interactive map with pins for
              each activity
            </p>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">
            {userLocation ? "Nearby Activities" : "All Activities"}
          </h2>
          {userLocation && (
            <p className="text-sm text-gray-600">
              Found {nearbyActivities.length} activities within {radiusKm}km of
              your location
            </p>
          )}
        </div>

        <div className="space-y-3">
          {(userLocation ? nearbyActivities : activitiesWithCoords).map(
            (activity) => (
              <Card
                key={activity.id}
                className={`cursor-pointer transition-all ${
                  selectedActivity?.id === activity.id
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                onClick={() => handleActivityClick(activity)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">
                          {getActivityTypeIcon(activity.type)}
                        </span>
                        <h3 className="font-medium text-gray-900">
                          {activity.title}
                        </h3>
                        <Badge variant="secondary">{activity.type}</Badge>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{activity.location}</span>
                          {activity.distance && (
                            <Badge variant="outline" className="text-xs">
                              {formatDistance(activity.distance)}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{activity.date}</span>
                          <Clock className="w-4 h-4" />
                          <span>{activity.time}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>
                            {activity.participants}/{activity.maxParticipants}{" "}
                            participants
                          </span>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onActivitySelect(activity);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ),
          )}
        </div>

        {nearbyActivities.length === 0 && userLocation && (
          <Card>
            <CardContent className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Nearby Activities
              </h3>
              <p className="text-gray-500 mb-4">
                No activities found within {radiusKm}km of your location.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setRadiusKm(50);
                  calculateNearbyActivities(userLocation);
                }}
              >
                Expand to 50km radius
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Location Permission Info */}
      {!userLocation && !isLocating && (
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Navigation className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Enable Location
                  </p>
                  <p className="text-xs text-blue-600">
                    Allow location access to find activities near you
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={getCurrentLocation}
                  className="ml-auto"
                >
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
