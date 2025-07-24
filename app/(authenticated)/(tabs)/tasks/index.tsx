import BackgroundLogo from "@/components/BackgroundLogo";
import { Colors } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Todo {
  id: string;
  name: string;
  description: string | null;
  completed: boolean;
  due_date: string | null;
  priority: number; // 1=low, 2=medium, 3=high
  project_id: string;
  date_added: string;
  date_completed: string | null;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

const Page = () => {  
  const { top } = useSafeAreaInsets();
  const { user } = useUser();
  const userId = user?.id;

  const [todos, setTodos] = useState<Todo[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      if (!userId) return;
      fetchData();
    }, [userId])
  );

  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);
    
    // Fetch projects first
    const { data: projectsData, error: projectsError } = await supabase
      .from("todos_projects")
      .select("*")
      .eq("user_id", userId);
    
    if (!projectsError && projectsData) {
      setProjects(projectsData as Project[]);
    }

    // Fetch todos
    const { data: todosData, error: todosError } = await supabase
      .from("todos_items")
      .select("*")
      .eq("user_id", userId)
      .order("date_added", { ascending: false });
    
    if (!todosError && todosData) {
      setTodos(todosData as Todo[]);
    }
    
    setLoading(false);
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return '#ef4444'; // high
      case 2: return '#f59e0b'; // medium
      case 1: return '#10b981'; // low
      default: return Colors.lightText;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'High';
      case 2: return 'Medium';
      case 1: return 'Low';
      default: return 'Medium';
    }
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return null;
    const project = projects.find(p => p.id === projectId);
    return project?.name || null;
  };

  const getProjectColor = (projectId: string | null) => {
    if (!projectId) return Colors.lightText;
    const project = projects.find(p => p.id === projectId);
    return project?.color || Colors.lightText;
  };

  const toggleTodoComplete = async (todoId: string, completed: boolean) => {
    const { error } = await supabase
      .from("todos_items")
      .update({ completed: !completed })
      .eq("id", todoId);
    
    if (!error) {
      setTodos(todos.map(todo => 
        todo.id === todoId ? { ...todo, completed: !completed } : todo
      ));
    }
  };

  const renderTodo = ({ item }: { item: Todo }) => {
    return (
      <View style={styles.todoCard}>
        <View style={styles.todoRow}>
          <BouncyCheckbox
            size={24}
            fillColor={Colors.primary}
            unFillColor="#f9f9f9"
            iconStyle={{ borderColor: Colors.primary }}
            innerIconStyle={{ borderWidth: 2 }}
            onPress={() => toggleTodoComplete(item.id, item.completed)}
            isChecked={item.completed}
            style={styles.checkbox}
         
          />
          
          <View style={styles.todoMainContent}>
            <View style={styles.todoHeaderRow}>
              <Text style={[styles.todoTitle, item.completed && styles.completedText]} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}> 
                <Text style={styles.priorityText}>{getPriorityLabel(item.priority)}</Text>
              </View>
            </View>
            {item.description ? (
              <Text style={[styles.todoDescription, item.completed && styles.completedText]} numberOfLines={2}>
                {item.description}
              </Text>
            ) : null}
            <View style={styles.todoMetaRow}>
              {item.due_date && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={Colors.lightText} style={{ marginRight: 10 }} />
                  <Text style={styles.dueDate}>Due: {new Date(item.due_date).toLocaleDateString()}</Text>
                </View>
              )}
              <View style={[styles.projectBadge, { backgroundColor: getProjectColor(item.project_id) }]}> 
                <Text style={styles.projectText}>{getProjectName(item.project_id)}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderProject = ({ item }: { item: Project }) => (
    <View style={[styles.projectCard, { borderLeftColor: item.color }]}> 
      <Text style={styles.projectName}>{item.name}</Text>
      <Text style={styles.projectDate}>Project</Text>
    </View>
  );

  const todayTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

  return (
    <View style={{ paddingTop: top, flex: 1 }}>
      <BackgroundLogo opacity={0.1} position="left" />
      
      <View style={styles.container}>
        <Text style={styles.title}>Today</Text>
        
        {loading ? (
          <Text style={styles.loading}>Loading...</Text>
        ) : (
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Active Projects */}
            {projects.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Projects</Text>
                <FlatList
                  data={projects}
                  renderItem={renderProject}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.projectsList}
                />
              </View>
            )}

            {/* Today's Todos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Today's Tasks</Text>
              {todayTodos.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkmark-circle-outline" size={48} color={Colors.lightText} />
                  <Text style={styles.emptyText}>No tasks for today!</Text>
                </View>
              ) : (
                <FlatList
                  data={todayTodos}
                  renderItem={renderTodo}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              )}
            </View>

            {/* Completed Todos */}
            {completedTodos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Completed</Text>
                <FlatList
                  data={completedTodos}
                  renderItem={renderTodo}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}
          </ScrollView>
        )}
      </View>

      <TouchableOpacity style={styles.fab} onPress={() => router.push('/task/newTask')}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}

export default Page;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20, // Make this at least 16-20 for breathing room
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.dark, // Use a dark color for visibility
    marginBottom: 20,
  },
  loading: {
    textAlign: "center",
    fontSize: 16,
    color: Colors.lightText,
    marginTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 0,
    marginTop: 30,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.lightText,
    marginTop: 10,
  },
  todoCard: {
    backgroundColor: "#fff", // Or Colors.background if it's not too light
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.lightBorder,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginRight: 14,
    marginTop: 2,
    width: 24,
    height: 24,
  },
  todoMainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  todoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  todoTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.dark, // Use a dark color for visibility
    flex: 1,
    marginRight: 8,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.5,
  },
  todoDescription: {
    fontSize: 14,
    color: Colors.lightText,
    marginBottom: 4,
  },
  todoMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    textTransform: 'uppercase',
  },
  projectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightBorder,
  },
  projectText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#fff",
    textTransform: 'uppercase',
  },
  dueDate: {
    fontSize: 13,
    color: Colors.lightText,
    marginLeft: 2,
  },
  projectsList: {
    paddingRight: 20,
  },
  projectCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 200,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 8,
  },
  projectDate: {
    fontSize: 12,
    color: Colors.lightText,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: Colors.primary,
    borderRadius: 50,
    padding: 10,
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});