import { Stack } from "expo-router";
import { UserProvider } from "@/app/(root)/prooperties/UserContext";

export default function RootLayout() {
  return (
      <UserProvider>
        <Stack />
      </UserProvider>
  );
}