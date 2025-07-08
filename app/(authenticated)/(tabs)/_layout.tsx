import Tabs from "@/components/Tabs";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.lightText,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.lightBorder,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen 
        name="browse" 
        options={{ 
          title: "Browse",
          tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
            <Ionicons 
              name="search" 
              color={color} 
              size={size} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="search" 
        options={{ 
          title: "Search",
          tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
            <Ionicons 
              name="search" 
              color={color} 
              size={size} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="today" 
        options={{ 
          title: "Today",
          tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
            <Ionicons 
              name="calendar" 
              color={color} 
              size={size} 
            />
          ),
        }} 
      />
      <Tabs.Screen 
        name="upcoming" 
        options={{ 
          title: "Upcoming",
          tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
            <Ionicons 
              name="calendar-outline" 
              color={color} 
              size={size} 
            />
          ),
        }} 
      />
    </Tabs>
  );
}

