// Shared utility functions that work across web and React Native

// Format activity date
export const formatActivityDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long", 
    year: "numeric",
  });
};

// Calculate age from birthday
export const calculateAge = (birthday: string): number => {
  if (!birthday) return 22;
  const birthDate = new Date(birthday);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Validate email format
export const isValidEmail = (email: string): boolean => {
  return /\S+@\S+\.\S+/.test(email);
};

// Validate password strength
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Distance calculation using Haversine formula
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
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

// Activity type helpers
export const getActivityEmoji = (type: string): string => {
  const emojiMap: { [key: string]: string } = {
    climbing: "🧗",
    cycling: "🚴", 
    running: "🏃",
    hiking: "🥾",
    skiing: "⛷���",
    surfing: "🏄",
    tennis: "🎾",
    general: "⚡"
  };
  return emojiMap[type.toLowerCase()] || "⚡";
};

// Difficulty level helpers
export const getDifficultyColor = (difficulty: string): string => {
  const level = difficulty.toLowerCase();
  if (level.includes("beginner") || level.includes("all")) {
    return "#10B981"; // green
  }
  if (level.includes("intermediate")) {
    return "#F59E0B"; // yellow
  }
  if (level.includes("advanced") || level.includes("expert")) {
    return "#EF4444"; // red
  }
  return "#6B7280"; // gray
};

// Sort activities by date
export const sortActivitiesByDate = (activities: any[], ascending = true) => {
  return [...activities].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return ascending ? dateA.getTime() - dateB.getTime() : dateB.getTime() - dateA.getTime();
  });
};

// Filter activities by type
export const filterActivitiesByType = (activities: any[], types: string[]) => {
  if (types.length === 0) return activities;
  return activities.filter(activity => 
    types.some(type => 
      activity.type === type.toLowerCase() ||
      activity.activity_type === type.toLowerCase()
    )
  );
};

// Format currency
export const formatCurrency = (amount: number, currency = "GBP"): string => {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
  }).format(amount);
};

// Truncate text
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
