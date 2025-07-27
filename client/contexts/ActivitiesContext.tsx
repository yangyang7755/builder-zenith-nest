import { createContext, useContext, useState, ReactNode } from "react";

export interface Activity {
  id: string;
  type: "cycling" | "climbing";
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
  const [activities, setActivities] = useState<Activity[]>([]);

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
