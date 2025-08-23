import React from "react";
import { Screen, Title, Card } from "@/src/ui/atoms";
import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import { useTheme } from "@/lib/ThemeProvider";

export default function Profile() {
  const theme = useTheme();
  return (
    <Screen>
      <Title>Profile</Title>
      <View style={{ height: 12 }} />
      <Card>
        <Text style={{ color: "white", fontSize: 16, marginBottom: 12 }}>
          Manage your profile, avatar, and preferences
        </Text>
        <Link href="/profile" asChild>
          <Pressable style={{ 
            padding: 12, 
            backgroundColor: theme.colors.primary, 
            borderRadius: 12, 
            alignItems: "center" 
          }}>
            <Text style={{ color: "white", fontWeight: "700" }}>
              View Full Profile →
            </Text>
          </Pressable>
        </Link>
      </Card>
    </Screen>
  );
}

