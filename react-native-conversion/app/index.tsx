import { Redirect } from "expo-router";
import { useAuth } from "../src/shared/contexts/AuthContext";

export default function Index() {
  // TODO: Implement auth context
  const isAuthenticated = false; // This will come from auth context

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)" />;
}
