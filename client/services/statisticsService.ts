import { Activity } from "../contexts/ActivitiesContext";

export interface ActivityStats {
  totalActivities: number;
  totalDistance?: string;
  averageDistance?: string;
  totalClimbs?: number;
  totalRides?: number;
  totalRuns?: number;
  totalHikes?: number;
  [key: string]: any;
}

// Helper function to parse distance with unit
const parseDistance = (distance: string | undefined, unit: string | undefined): number => {
  if (!distance || !unit) return 0;
  const numDistance = parseFloat(distance);
  if (isNaN(numDistance)) return 0;
  
  // Convert everything to km for consistency
  if (unit === "miles") {
    return numDistance * 1.60934; // Convert miles to km
  }
  return numDistance; // Already in km
};

// Get activities the user has participated in (created by others, and user has joined)
// For now, we'll simulate this with sample data since we don't track participation yet
const getUserParticipatedActivities = (activities: Activity[], userOrganizer: string = "You"): Activity[] => {
  // Return activities not created by the user (simulating activities they've joined)
  const participatedActivities = activities.filter(activity => 
    typeof activity.organizer === 'string' 
      ? activity.organizer !== userOrganizer 
      : activity.organizer?.name !== userOrganizer
  );
  
  // Add some sample participated activities to show the statistics
  const sampleParticipatedActivities: Activity[] = [
    {
      id: "participated-climb-1",
      type: "climbing",
      title: "Westway Women's+ Climb",
      date: "2025-01-26",
      time: "10:00",
      location: "Westway Climbing Centre",
      meetupLocation: "Westway Climbing Centre",
      organizer: "Coach Holly",
      maxParticipants: "12",
      specialComments: "Great climbing session",
      difficulty: "Intermediate",
      createdAt: new Date("2025-01-26"),
    },
    {
      id: "participated-climb-2",
      type: "climbing",
      title: "Indoor Bouldering Session",
      date: "2025-01-20",
      time: "18:00",
      location: "The Castle Climbing Centre",
      meetupLocation: "The Castle Climbing Centre",
      organizer: "London Climbers",
      maxParticipants: "15",
      specialComments: "Fun bouldering session",
      difficulty: "Beginner",
      createdAt: new Date("2025-01-20"),
    },
    {
      id: "participated-ride-1",
      type: "cycling",
      title: "Richmond Park Social Ride",
      date: "2025-01-28",
      time: "08:00",
      location: "Richmond Park",
      meetupLocation: "Richmond Park Main Gate",
      organizer: "Surrey Road Cycling",
      distance: "25",
      distanceUnit: "km",
      maxParticipants: "15",
      specialComments: "Beautiful morning ride",
      difficulty: "Beginner",
      createdAt: new Date("2025-01-28"),
    },
    {
      id: "participated-ride-2",
      type: "cycling",
      title: "Box Hill Training Ride",
      date: "2025-01-22",
      time: "09:00",
      location: "Box Hill",
      meetupLocation: "Box Hill Car Park",
      organizer: "Elite Cycling Club",
      distance: "45",
      distanceUnit: "km",
      maxParticipants: "10",
      specialComments: "Challenging hill training",
      difficulty: "Advanced",
      createdAt: new Date("2025-01-22"),
    },
    {
      id: "participated-run-1",
      type: "running",
      title: "Hyde Park Morning Run",
      date: "2025-01-25",
      time: "07:00",
      location: "Hyde Park",
      meetupLocation: "Hyde Park Corner",
      organizer: "London Runners",
      distance: "8",
      distanceUnit: "km",
      maxParticipants: "20",
      specialComments: "Energizing morning run",
      difficulty: "Intermediate",
      createdAt: new Date("2025-01-25"),
    },
  ];
  
  return [...participatedActivities, ...sampleParticipatedActivities];
};

// Calculate statistics for a specific sport
export const calculateSportStats = (activities: Activity[], sport: string, userOrganizer: string = "You"): ActivityStats => {
  const participatedActivities = getUserParticipatedActivities(activities, userOrganizer);
  const sportActivities = participatedActivities.filter(activity => 
    activity.type.toLowerCase() === sport.toLowerCase()
  );

  const totalActivities = sportActivities.length;
  
  if (sport.toLowerCase() === "climbing") {
    return {
      totalActivities,
      totalClimbs: totalActivities,
    };
  }
  
  if (sport.toLowerCase() === "cycling") {
    const totalDistanceKm = sportActivities.reduce((total, activity) => {
      return total + parseDistance(activity.distance, activity.distanceUnit);
    }, 0);
    
    const averageDistanceKm = totalActivities > 0 ? totalDistanceKm / totalActivities : 0;
    
    return {
      totalActivities,
      totalRides: totalActivities,
      totalDistance: `${Math.round(totalDistanceKm)} km`,
      averageDistance: `${Math.round(averageDistanceKm)} km`,
    };
  }
  
  if (sport.toLowerCase() === "running") {
    const totalDistanceKm = sportActivities.reduce((total, activity) => {
      return total + parseDistance(activity.distance, activity.distanceUnit);
    }, 0);
    
    const averageDistanceKm = totalActivities > 0 ? totalDistanceKm / totalActivities : 0;
    
    return {
      totalActivities,
      totalRuns: totalActivities,
      totalDistance: `${Math.round(totalDistanceKm)} km`,
      averageDistance: `${Math.round(averageDistanceKm)} km`,
    };
  }
  
  // For other sports
  return {
    totalActivities,
  };
};

// Get activities created by the user
export const getUserCreatedActivities = (activities: Activity[], userOrganizer: string = "You"): Activity[] => {
  return activities.filter(activity => 
    typeof activity.organizer === 'string' 
      ? activity.organizer === userOrganizer 
      : activity.organizer?.name === userOrganizer
  );
};

// Get activities the user has participated in
export const getUserParticipatedActivitiesForSport = (activities: Activity[], sport: string, userOrganizer: string = "You"): Activity[] => {
  const participatedActivities = getUserParticipatedActivities(activities, userOrganizer);
  return participatedActivities.filter(activity => 
    activity.type.toLowerCase() === sport.toLowerCase()
  );
};
