import React from "react";
import { View, Text } from "react-native";

export default function VipBadge({ name, color }: { name?: string | null; color?: string | null }) {
  if (!name) return null;
  return (
    <View style={{ 
      alignSelf: "flex-start", 
      paddingHorizontal: 8, 
      paddingVertical: 2, 
      borderRadius: 999, 
      backgroundColor: (color || "#FFD700") + "22", 
      borderWidth: 1, 
      borderColor: color || "#FFD700", 
      marginTop: 4 
    }}>
      <Text style={{ 
        color: color || "#FFD700", 
        fontSize: 12, 
        fontWeight: "700" 
      }}>
        {name}
      </Text>
    </View>
  );
}





