import { Redirect } from "expo-router";
import useAuth from "@/stores/auth";

export default function Index() {
  const isAuthenticated = useAuth((store) => store.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)/(tabs)/(home)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
