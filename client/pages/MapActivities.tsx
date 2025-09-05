import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MapView from "../components/MapView";
import ActivityCard from "../components/ActivityCard";
import { useActivities } from "../contexts/ActivitiesContext";

export default function MapActivities() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { activities } = useActivities();

  // Optional future: filter by query params like location/category
  const filtered = useMemo(() => {
    const location = params.get("location");
    if (!location) return activities;
    return activities.filter((a) =>
      (a.location || "").toLowerCase().includes(location.toLowerCase()) ||
      (a.meetupLocation || "").toLowerCase().includes(location.toLowerCase())
    );
  }, [activities, params]);

  return (
    <div className="fixed inset-0 bg-white z-40">
      <MapView
        activities={filtered}
        onClose={() => navigate(-1)}
        onActivitySelect={() => {}}
      />

      {/* Bottom swipeable cards */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t p-3">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {filtered.map((activity) => (
            <ActivityCard
              key={activity.id}
              title={activity.title}
              date={`📅 ${activity.date}`}
              location={`📍 ${activity.location}`}
              imageSrc={activity.imageSrc || "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=40&h=40&fit=crop&crop=face"}
              organizer={activity.organizer?.full_name || activity.organizerName || "Community"}
              type={activity.type || activity.activity_type}
              distance={activity.distance}
              pace={activity.pace}
              elevation={activity.elevation}
              difficulty={activity.difficulty || activity.difficulty_level || "Intermediate"}
              activityId={activity.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
