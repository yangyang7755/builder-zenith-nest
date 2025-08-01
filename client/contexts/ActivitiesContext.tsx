import { createContext, useContext, useState, ReactNode } from "react";

export interface Activity {
  id: string;
  type: "cycling" | "climbing" | "running" | "hiking" | "skiing" | "surfing" | "tennis";
  title: string;
  date: string;
  time: string;
  location: string;
  meetupLocation: string;
  organizer: string;
  distance?: string;
  distanceUnit?: "km" | "miles";
  elevation?: string;
  elevationUnit?: "m" | "feet";
  pace?: string;
  paceUnit?: "kph" | "mph";
  maxParticipants: string;
  specialComments: string;
  imageSrc?: string;
  climbingLevel?: string;
  languages?: string;
  gearRequired?: string;
  routeLink?: string;
  cafeStop?: string;
  subtype?: string;
  gender?: string;
  ageMin?: string;
  ageMax?: string;
  visibility?: string;
  club?: string; // Club ID if this is a club activity
  difficulty?: string;
  createdAt: Date;
}

interface ActivitiesContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "createdAt">) => void;
  searchActivities: (query: string) => Activity[];
}

const ActivitiesContext = createContext<ActivitiesContextType | undefined>(
  undefined,
);

export function ActivitiesProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: "westway-womens-climb",
      type: "climbing",
      title: "Westway women's+ climbing morning",
      date: "2025-08-06",
      time: "10:00",
      location: "Westway Climbing Centre",
      meetupLocation: "Westway Climbing Centre",
      organizer: "Coach Holly Peristiani",
      maxParticipants: "12",
      difficulty: "Intermediate",
      specialComments:
        "This session is perfect for meeting fellow climbers and boosting your confidence. Holly can provide expert tips on top-roping, lead climbing, abseiling, fall practice and more.",
      imageSrc:
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=80&h=80&fit=crop&crop=face",
      climbingLevel: "Intermediate",
      gender: "Female only",
      visibility: "All",
      club: "westway",
      createdAt: new Date(),
    },
    {
      id: "sunday-morning-ride",
      type: "cycling",
      title: "Sunday Morning Social Ride",
      date: "2025-08-10",
      time: "08:00",
      location: "Richmond Park",
      meetupLocation: "Richmond Park Main Gate",
      organizer: "Richmond Cycling Club",
      distance: "25",
      distanceUnit: "km",
      pace: "20",
      paceUnit: "kph",
      elevation: "150",
      elevationUnit: "m",
      maxParticipants: "15",
      difficulty: "Beginner",
      specialComments:
        "Join us for a friendly social ride through Richmond Park and surrounding areas. Perfect for cyclists looking to meet new people and explore beautiful routes. Coffee stop included at Roehampton Cafe.",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      cafeStop: "Roehampton Cafe",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "chaingang-training",
      type: "cycling",
      title: "Intermediate Chaingang",
      date: "2025-08-12",
      time: "18:30",
      location: "Box Hill, Surrey",
      meetupLocation: "Box Hill car park",
      organizer: "Surrey Road Cycling",
      distance: "40",
      distanceUnit: "km",
      pace: "32",
      paceUnit: "kph",
      elevation: "420",
      elevationUnit: "m",
      maxParticipants: "12",
      difficulty: "Intermediate",
      specialComments:
        "High-intensity training session for intermediate to advanced cyclists. We'll focus on paceline skills, hill repeats, and interval training.",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "peak-district-climb",
      type: "climbing",
      title: "Peak District Sport Climbing",
      date: "2025-09-06",
      time: "09:00",
      location: "Stanage Edge & Burbage",
      meetupLocation: "Stanage Edge car park",
      organizer: "Peak Adventures",
      maxParticipants: "8",
      difficulty: "Advanced",
      specialComments: "Weekend climbing adventure in the Peak District. We'll tackle some classic sport routes at Stanage Edge and Burbage. Perfect for those looking to transition from indoor to outdoor climbing.",
      imageSrc:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      climbingLevel: "Advanced",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "morning-trail-run",
      type: "running",
      title: "Richmond Park Morning Trail Run",
      date: "2025-08-16",
      time: "07:00",
      location: "Richmond Park",
      meetupLocation: "Richmond Park Roehampton Gate",
      organizer: "Richmond Runners",
      distance: "8",
      distanceUnit: "km",
      pace: "5:30",
      paceUnit: "min/km",
      maxParticipants: "20",
      difficulty: "Intermediate",
      specialComments: "Join us for an energizing trail run through the beautiful paths of Richmond Park. Perfect for intermediate runners looking to improve their trail running skills.",
      imageSrc: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=40&h=40&fit=crop&crop=face",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "lake-district-hike",
      type: "hiking",
      title: "Lake District Day Hike - Helvellyn",
      date: "2025-08-23",
      time: "08:00",
      location: "Lake District - Helvellyn",
      meetupLocation: "Glenridding car park",
      organizer: "Lake District Hiking Club",
      distance: "12",
      distanceUnit: "km",
      elevation: "950",
      elevationUnit: "m",
      maxParticipants: "15",
      difficulty: "Advanced",
      specialComments: "Challenging day hike up Helvellyn via Striding Edge. Experience the thrill of one of England's most famous ridge walks with stunning views across the Lake District.",
      imageSrc: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=40&h=40&fit=crop&crop=face",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "alps-skiing-weekend",
      type: "skiing",
      title: "French Alps Skiing Weekend",
      date: "2025-09-14",
      time: "06:00",
      location: "Chamonix, French Alps",
      meetupLocation: "Chamonix Aiguille du Midi Cable Car",
      organizer: "Alpine Adventures UK",
      maxParticipants: "12",
      difficulty: "Intermediate",
      specialComments: "Weekend skiing adventure in Chamonix with stunning views of Mont Blanc. All skill levels welcome with expert instruction available. Equipment rental included.",
      imageSrc: "https://images.unsplash.com/photo-1551524164-6cf2ac426081?w=40&h=40&fit=crop&crop=face",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "cornwall-surf-session",
      type: "surfing",
      title: "Cornwall Dawn Patrol Surf",
      date: "2025-08-30",
      time: "06:30",
      location: "Fistral Beach, Cornwall",
      meetupLocation: "Fistral Beach Surf School",
      organizer: "Cornwall Surf Collective",
      maxParticipants: "10",
      difficulty: "Intermediate",
      specialComments: "Early morning surf session at one of Cornwall's most famous breaks. Perfect waves for intermediate surfers. Wetsuit and board rental available.",
      imageSrc: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=40&h=40&fit=crop&crop=face",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
    {
      id: "wimbledon-tennis-singles",
      type: "tennis",
      title: "Competitive Singles Tournament",
      date: "2025-09-21",
      time: "10:00",
      location: "Wimbledon Tennis Club",
      meetupLocation: "Wimbledon Tennis Club Reception",
      organizer: "London Tennis League",
      maxParticipants: "16",
      difficulty: "Advanced",
      specialComments: "Competitive singles tournament for advanced players. Round-robin format followed by knockout stages. Prizes for winners and refreshments provided.",
      imageSrc: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=40&h=40&fit=crop&crop=face",
      gender: "All genders",
      visibility: "All",
      createdAt: new Date(),
    },
  ]);

  const addActivity = (activityData: Omit<Activity, "id" | "createdAt">) => {
    const newActivity: Activity = {
      ...activityData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  const searchActivities = (query: string): Activity[] => {
    if (!query.trim()) return activities;

    const lowercaseQuery = query.toLowerCase();
    return activities.filter(
      (activity) =>
        activity.title.toLowerCase().includes(lowercaseQuery) ||
        activity.location.toLowerCase().includes(lowercaseQuery) ||
        activity.meetupLocation.toLowerCase().includes(lowercaseQuery) ||
        activity.organizer.toLowerCase().includes(lowercaseQuery) ||
        activity.specialComments.toLowerCase().includes(lowercaseQuery),
    );
  };

  return (
    <ActivitiesContext.Provider
      value={{ activities, addActivity, searchActivities }}
    >
      {children}
    </ActivitiesContext.Provider>
  );
}

export function useActivities() {
  const context = useContext(ActivitiesContext);
  if (context === undefined) {
    throw new Error("useActivities must be used within an ActivitiesProvider");
  }
  return context;
}
