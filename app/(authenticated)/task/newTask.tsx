import { Colors, PROJECT_COLORS } from "@/constants/Colors";
import { supabase } from "@/utils/supabase";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Project {
  id: string;
  name: string;
  color: string;
}

export default function NewTask() {
  const { user } = useUser();
  const userId = user?.id;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    due_date: "",
    priority: 2 as number, // 1=low, 2=medium, 3=high
    project_id: "",
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState("");

  // Add Project Modal State
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", color: PROJECT_COLORS[0] });
  const [addProjectLoading, setAddProjectLoading] = useState(false);
  const [addProjectError, setAddProjectError] = useState("");

  useEffect(() => {
    if (!userId) return;
    const fetchProjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("todos_projects")
        .select("id, name, color")
        .eq("user_id", userId);
      if (!error && data) {
        setProjects(data as Project[]);
      }
      setLoading(false);
    };
    fetchProjects();
  }, [userId]);

  const refreshProjects = async (selectId?: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("todos_projects")
      .select("id, name, color")
      .eq("user_id", userId);
    if (!error && data) {
      setProjects(data as Project[]);
      if (selectId) setForm(f => ({ ...f, project_id: selectId }));
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm(f => ({ ...f, due_date: selectedDate.toISOString().split('T')[0] }));
    }
  };

  const handleSave = async () => {
    setError("");
    if (!form.name.trim()) {
      setError("Task name is required");
      return;
    }
    if (!form.project_id) {
      setError("Please select a project");
      return;
    }
    if (!userId) {
      setError("User not found");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("todos_items").insert([
      {
        user_id: userId,
        project_id: form.project_id,
        name: form.name,
        description: form.description,
        priority: form.priority,
        due_date: form.due_date ? new Date(form.due_date) : null,
        date_added: new Date(),
        completed: false,
        date_completed: null,
      },
    ]);
    setSaving(false);
    if (!error) {
      router.back();
    } else {
      setError(error.message || "Failed to add task");
    }
  };

  // Add Project Logic
  const handleAddProject = async () => {
    setAddProjectError("");
    if (!newProject.name.trim()) {
      setAddProjectError("Project name is required");
      return;
    }
    if (!userId) {
      setAddProjectError("User not found");
      return;
    }
    setAddProjectLoading(true);
    const { data, error } = await supabase.from("todos_projects").insert([
      {
        user_id: userId,
        name: newProject.name,
        color: newProject.color,
      },
    ]).select();
    setAddProjectLoading(false);
    if (!error && data && data.length > 0) {
      setShowAddProject(false);
      setNewProject({ name: "", color: PROJECT_COLORS[0] });
      await refreshProjects(data[0].id);
    } else {
      setAddProjectError(error?.message || "Failed to add project");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Task</Text>
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} />
      ) : (
        <ScrollView>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Text style={styles.label}>Task Name *</Text>
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={text => setForm(f => ({ ...f, name: text }))}
            placeholder="Enter task name"
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={form.description}
            onChangeText={text => setForm(f => ({ ...f, description: text }))}
            placeholder="Enter task description"
            multiline
          />

          <View style={styles.projectLabelRow}>
            <Text style={styles.label}>Project *</Text>
            <TouchableOpacity style={styles.addProjectBtn} onPress={() => setShowAddProject(true)}>
              <Ionicons name="add-circle" size={20} color={Colors.primary} />
              <Text style={styles.addProjectBtnText}>Add Project</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.projectList}>
            {projects.map(project => (
              <TouchableOpacity
                key={project.id}
                style={[
                  styles.projectButton,
                  form.project_id === project.id && { backgroundColor: project.color },
                ]}
                onPress={() => setForm(f => ({ ...f, project_id: project.id }))}
              >
                <Text style={[
                  styles.projectButtonText,
                  form.project_id === project.id && { color: 'white' },
                ]}>{project.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={{ color: form.due_date ? Colors.dark : Colors.lightText }}>
              {form.due_date ? form.due_date : 'Select due date'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={form.due_date ? new Date(form.due_date) : new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityList}>
            {[1, 2, 3].map(priority => (
              <TouchableOpacity
                key={priority}
                style={[
                  styles.priorityButton,
                  form.priority === priority && { backgroundColor: Colors.primary },
                ]}
                onPress={() => setForm(f => ({ ...f, priority }))}
              >
                <Text style={[
                  styles.priorityButtonText,
                  form.priority === priority && { color: 'white' },
                ]}>
                  {priority === 1 ? 'Low' : priority === 2 ? 'Medium' : 'High'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveButton, (!form.name.trim() || !form.project_id || saving) && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!form.name.trim() || !form.project_id || saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Add Task</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Add Project Modal */}
      <Modal visible={showAddProject} animationType="slide" transparent onRequestClose={() => setShowAddProject(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Project</Text>
            {addProjectError ? <Text style={styles.error}>{addProjectError}</Text> : null}
            <Text style={styles.label}>Project Name *</Text>
            <TextInput
              style={styles.input}
              value={newProject.name}
              onChangeText={text => setNewProject(p => ({ ...p, name: text }))}
              placeholder="Enter project name"
            />
            <Text style={styles.label}>Color</Text>
            <View style={styles.colorRow}>
              {PROJECT_COLORS.map((color: string) => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorCircle, { backgroundColor: color }, newProject.color === color && styles.colorCircleSelected]}
                  onPress={() => setNewProject(p => ({ ...p, color }))}
                />
              ))}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddProject(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddProject} disabled={addProjectLoading}>
                {addProjectLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Add</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
    marginBottom: 8,
    marginTop: 16,
  },
  projectLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 0,
  },
  addProjectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  addProjectBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.lightBorder,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    backgroundColor: "white",
  },
  projectList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  projectButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightBorder,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: Colors.background,
  },
  projectButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark,
  },
  priorityList: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightBorder,
    marginRight: 8,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.dark,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 14,
    marginTop: 24,
    minWidth: 100,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.lightBorder,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  error: {
    color: '#ef4444',
    marginBottom: 8,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: "90%",
    maxWidth: 400,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.dark,
    marginBottom: 16,
    textAlign: "center",
  },
  colorRow: {
    flexDirection: 'row',
    marginBottom: 16,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  colorCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleSelected: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.lightBorder,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark,
  },
});
