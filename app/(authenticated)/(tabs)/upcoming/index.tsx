import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import { useUser } from "@clerk/clerk-expo";
import { useFocusEffect } from "@react-navigation/native";
import moment from "moment";
import React, { useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { CalendarList, CalendarProvider, ExpandableCalendar } from "react-native-calendars";

export default function Upcoming() {
  const { user } = useUser();
  const userId = user?.id;
  const [tasks, setTasks] = useState<any[]>([]);
  const [expirations, setExpirations] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(moment().format("YYYY-MM-DD"));

  useFocusEffect(
    React.useCallback(() => {
      if (!userId) return;
      fetchData();
    }, [userId])
  );

  const fetchData = async () => {
    // Fetch tasks
    const { data: taskData } = await supabase
      .from("todos_items")
      .select("*")
      .eq("user_id", userId);

    // Fetch medical expirations
    const { data: medData } = await supabase
      .from("medicaltracking")
      .select("id, drug_name, expiration_date")
      .eq("user_id", userId);

    // Fetch pharmacy expirations
    const { data: pharmData } = await supabase
      .from("pharmacytracking")
      .select("id, drug_name, expiration_date")
      .eq("user_id", userId);

    setTasks(taskData || []);
    // Combine and filter for valid expiration dates
    const allExpirations = [
      ...(medData || []),
      ...(pharmData || []),
    ].filter(item => item.expiration_date);
    setExpirations(allExpirations);
  };

  // Mark dates with tasks and expirations
  const markedDates: Record<string, any> = {};

  // Mark tasks
  tasks.forEach(task => {
    if (task.due_date) {
      const date = moment(task.due_date).format("YYYY-MM-DD");
      if (!markedDates[date]) markedDates[date] = { dots: [] };
      markedDates[date].dots.push({
        key: "task",
        color: Colors.primary,
      });
    }
  });

  // Mark expirations
  expirations.forEach(item => {
    const date = moment(item.expiration_date).format("YYYY-MM-DD");
    if (!markedDates[date]) markedDates[date] = { dots: [] };
    markedDates[date].dots.push({
      key: "exp",
      color: "#ff9800", // orange for expiration
    });
  });

  // Always mark the selected date
  markedDates[selectedDate] = {
    ...(markedDates[selectedDate] || { dots: [] }),
    selected: true,
    selectedColor: Colors.primary,
  };

  // Tasks for the selected date
  const tasksForSelectedDate = tasks.filter(
    t => t.due_date && moment(t.due_date).format("YYYY-MM-DD") === selectedDate
  );

  // Expirations for the selected date
  const expirationsForSelectedDate = expirations.filter(
    e => moment(e.expiration_date).format("YYYY-MM-DD") === selectedDate
  );

  return (
    <View style={styles.container}>
      <View style={styles.calendarWrapper}>
        <CalendarList
          markedDates={markedDates}
          markingType="multi-dot"
          onDayPress={(day) => setSelectedDate(day.dateString)}
          pastScrollRange={12}
          futureScrollRange={12}
          scrollEnabled
          showScrollIndicator
          theme={{
            selectedDayBackgroundColor: Colors.primary,
            todayTextColor: Colors.primary,
            dotColor: Colors.primary,
            selectedDotColor: "#fff",
            arrowColor: Colors.primary,
            monthTextColor: Colors.primary,
            textDayFontWeight: "500",
            textMonthFontWeight: "bold",
            textDayHeaderFontWeight: "600",
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
          }}
        />
       <CalendarProvider date={selectedDate}>
        <ExpandableCalendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          markingType="multi-dot"
        />
       </CalendarProvider>
      </View>
      <Text style={styles.sectionTitle}>
        Tasks for {moment(selectedDate).format("dddd, MMM D")}
      </Text>
      <FlatList
        data={tasksForSelectedDate}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.name}</Text>
            {item.description ? (
              <Text style={styles.taskDesc}>{item.description}</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noTasks}>No tasks for this day.</Text>
        }
      />
      {expirationsForSelectedDate.length > 0 && (
        <View style={styles.expSection}>
          <Text style={styles.expTitle}>Expirations:</Text>
          {expirationsForSelectedDate.map((item, idx) => (
            <Text key={item.id || idx} style={styles.expText}>
              {item.drug_name} expires today!
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, paddingTop: 20 },
  calendarWrapper: {
    height: 480,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.primary,
    margin: 16,
  },
  taskCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  taskTitle: { fontSize: 16, fontWeight: "600", color: Colors.dark },
  taskDesc: { fontSize: 14, color: Colors.lightText, marginTop: 4 },
  noTasks: { textAlign: "center", color: Colors.lightText, marginTop: 20 },
  expSection: { marginHorizontal: 16, marginTop: 0, marginBottom: 40 },
  expTitle: { fontWeight: "bold", color: "#ff9800", marginBottom: 30, fontSize: 18 },
  expText: { color: "#ff9800", fontSize: 15, marginBottom: 2 },
});