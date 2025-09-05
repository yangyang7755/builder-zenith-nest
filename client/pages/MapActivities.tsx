import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MapView from "../components/MapView";
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
    <div className="mobile-container bg-white">
      <MapView
        activities={filtered}
        onClose={() => navigate(-1)}
        onActivitySelect={() => {}}
      />
    </div>
  );
}
