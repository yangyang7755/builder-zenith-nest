// Shared validation functions for forms and data

import { ValidationResult, SignUpData, LoginCredentials, CreateActivityData } from '../types';

// Email validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  
  if (!/[A-Za-z]/.test(password)) {
    errors.push("Password must contain at least one letter");
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Login form validation
export const validateLoginForm = (credentials: LoginCredentials): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  // Email validation
  if (!credentials.email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(credentials.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  // Password validation
  if (!credentials.password) {
    errors.password = "Password is required";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sign up form validation
export const validateSignUpForm = (data: SignUpData): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  // Full name validation
  if (!data.full_name.trim()) {
    errors.full_name = "Full name is required";
  } else if (data.full_name.trim().length < 2) {
    errors.full_name = "Full name must be at least 2 characters long";
  }
  
  // Email validation
  if (!data.email.trim()) {
    errors.email = "Email is required";
  } else if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  // Password validation
  if (!data.password) {
    errors.password = "Password is required";
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }
  }
  
  // Confirm password validation
  if (!data.confirmPassword) {
    errors.confirmPassword = "Please confirm your password";
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Activity creation validation
export const validateCreateActivityForm = (data: CreateActivityData): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  // Title validation
  if (!data.title.trim()) {
    errors.title = "Activity title is required";
  } else if (data.title.trim().length < 3) {
    errors.title = "Title must be at least 3 characters long";
  }
  
  // Type validation
  if (!data.type) {
    errors.type = "Activity type is required";
  }
  
  // Date validation
  if (!data.date) {
    errors.date = "Date is required";
  } else {
    const selectedDate = new Date(data.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      errors.date = "Date cannot be in the past";
    }
  }
  
  // Time validation
  if (!data.time) {
    errors.time = "Time is required";
  }
  
  // Location validation
  if (!data.location.trim()) {
    errors.location = "Location is required";
  }
  
  // Max participants validation
  if (!data.max_participants || data.max_participants < 1) {
    errors.max_participants = "Maximum participants must be at least 1";
  } else if (data.max_participants > 100) {
    errors.max_participants = "Maximum participants cannot exceed 100";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Profile update validation
export const validateProfileForm = (data: any): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  // Full name validation
  if (!data.full_name?.trim()) {
    errors.full_name = "Full name is required";
  } else if (data.full_name.trim().length < 2) {
    errors.full_name = "Full name must be at least 2 characters long";
  }
  
  // Bio validation (optional but limited length)
  if (data.bio && data.bio.length > 500) {
    errors.bio = "Bio cannot exceed 500 characters";
  }
  
  // Birthday validation (optional but must be valid date if provided)
  if (data.birthday) {
    const birthDate = new Date(data.birthday);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
    
    if (birthDate < minDate || birthDate > maxDate) {
      errors.birthday = "Please enter a valid birth date (must be between 13 and 120 years old)";
    }
  }
  
  // Location validation (optional but limited length)
  if (data.location && data.location.length > 100) {
    errors.location = "Location cannot exceed 100 characters";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Review validation
export const validateReviewForm = (data: { rating: number; comment?: string }): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  // Rating validation
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    errors.rating = "Please provide a rating between 1 and 5 stars";
  }
  
  // Comment validation (optional but limited length)
  if (data.comment && data.comment.length > 1000) {
    errors.comment = "Comment cannot exceed 1000 characters";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Search query validation
export const validateSearchQuery = (query: string): boolean => {
  // Basic search validation - not empty and reasonable length
  return query.trim().length > 0 && query.trim().length <= 100;
};

// Filter validation
export const validateFilters = (filters: any): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  // Number of people validation
  if (filters.numberOfPeople) {
    if (filters.numberOfPeople.min < 1) {
      errors.numberOfPeople = "Minimum number of people must be at least 1";
    }
    if (filters.numberOfPeople.max > 100) {
      errors.numberOfPeople = "Maximum number of people cannot exceed 100";
    }
    if (filters.numberOfPeople.min > filters.numberOfPeople.max) {
      errors.numberOfPeople = "Minimum cannot be greater than maximum";
    }
  }
  
  // Age validation
  if (filters.age) {
    if (filters.age.min < 13) {
      errors.age = "Minimum age must be at least 13";
    }
    if (filters.age.max > 120) {
      errors.age = "Maximum age cannot exceed 120";
    }
    if (filters.age.min > filters.age.max) {
      errors.age = "Minimum age cannot be greater than maximum age";
    }
  }
  
  // Distance validation
  if (filters.distance) {
    if (filters.distance.min < 0) {
      errors.distance = "Distance cannot be negative";
    }
    if (filters.distance.max > 1000) {
      errors.distance = "Maximum distance cannot exceed 1000km";
    }
    if (filters.distance.min > filters.distance.max) {
      errors.distance = "Minimum distance cannot be greater than maximum distance";
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Date range validation
export const validateDateRange = (startDate: string, endDate: string): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      errors.dateRange = "Start date cannot be after end date";
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// File validation (for image uploads)
export const validateImageFile = (file: { size?: number; type?: string; name?: string }): ValidationResult => {
  const errors: { [key: string]: string } = {};
  
  // Size validation (5MB limit)
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  if (file.size && file.size > maxSize) {
    errors.file = "Image size cannot exceed 5MB";
  }
  
  // Type validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (file.type && !allowedTypes.includes(file.type)) {
    errors.file = "Only JPEG, PNG, and WebP images are allowed";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePassword,
  validateLoginForm,
  validateSignUpForm,
  validateCreateActivityForm,
  validateProfileForm,
  validateReviewForm,
  validateSearchQuery,
  validateFilters,
  validateDateRange,
  validateImageFile,
};
