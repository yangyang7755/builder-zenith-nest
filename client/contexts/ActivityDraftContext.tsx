import { createContext, useContext, useState, ReactNode } from "react";

export interface ActivityDraft {
  id: string;
  activityType: string;
  title: string;
  date: string;
  time: string;
  location: string;
  meetupLocation: string;
  organizer: string;
  maxParticipants: string;
  specialComments: string;
  // Activity-specific fields
  distance?: string;
  distanceUnit?: string;
  elevation?: string;
  elevationUnit?: string;
  pace?: string;
  paceUnit?: string;
  climbingLevel?: string;
  routeLink?: string;
  subtype?: string;
  gender?: string;
  ageMin?: string;
  ageMax?: string;
  visibility?: string;
  // Additional fields for different activity types
  [key: string]: any;
}

interface ActivityDraftContextType {
  getDraft: (activityType: string) => ActivityDraft | null;
  saveDraft: (activityType: string, draft: Partial<ActivityDraft>) => void;
  deleteDraft: (activityType: string) => void;
  hasDraft: (activityType: string) => boolean;
}

const ActivityDraftContext = createContext<ActivityDraftContextType | undefined>(
  undefined,
);

export function ActivityDraftProvider({ children }: { children: ReactNode }) {
  const [drafts, setDrafts] = useState<{ [key: string]: ActivityDraft }>(() => {
    // Load drafts from localStorage on initialization
    const saved = localStorage.getItem("activityDrafts");
    return saved ? JSON.parse(saved) : {};
  });

  const saveDraft = (activityType: string, draft: Partial<ActivityDraft>) => {
    const newDraft: ActivityDraft = {
      id: Date.now().toString(),
      activityType,
      title: "",
      date: "",
      time: "",
      location: "",
      meetupLocation: "",
      organizer: "",
      maxParticipants: "",
      specialComments: "",
      ...draft,
    };

    const updatedDrafts = {
      ...drafts,
      [activityType]: newDraft,
    };

    setDrafts(updatedDrafts);
    localStorage.setItem("activityDrafts", JSON.stringify(updatedDrafts));
  };

  const getDraft = (activityType: string): ActivityDraft | null => {
    return drafts[activityType] || null;
  };

  const deleteDraft = (activityType: string) => {
    const updatedDrafts = { ...drafts };
    delete updatedDrafts[activityType];
    setDrafts(updatedDrafts);
    localStorage.setItem("activityDrafts", JSON.stringify(updatedDrafts));
  };

  const hasDraft = (activityType: string): boolean => {
    return Boolean(drafts[activityType]);
  };

  return (
    <ActivityDraftContext.Provider
      value={{ getDraft, saveDraft, deleteDraft, hasDraft }}
    >
      {children}
    </ActivityDraftContext.Provider>
  );
}

export function useActivityDraft() {
  const context = useContext(ActivityDraftContext);
  if (context === undefined) {
    throw new Error("useActivityDraft must be used within an ActivityDraftProvider");
  }
  return context;
}
