import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { addTask, updateTask } from '../services/tasks';
import { Ionicons } from '@expo/vector-icons';

export default function AddTaskScreen({ navigation, route }: any) {
    const taskToEdit = route.params?.taskToEdit;
    const [title, setTitle] = useState(taskToEdit?.title || '');
    const [description, setDescription] = useState(taskToEdit?.description || '');
    const [priority, setPriority] = useState(taskToEdit?.priority || 'Medium');
    const [deadline, setDeadline] = useState(taskToEdit ? new Date(taskToEdit.deadline) : new Date());
    const [showPicker, setShowPicker] = useState(false);
    const [mode, setMode] = useState<'date' | 'time'>('date');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            title: taskToEdit ? 'Edit Task' : 'New Task',
            headerStyle: { backgroundColor: '#5D4037' },
            headerShadowVisible: false,
            headerTitleStyle: { color: '#FFFFFF', fontWeight: 'bold' },
            headerTintColor: '#FFFFFF'
        });
    }, [taskToEdit, navigation]);

    async function saveTask() {
        if (!title.trim()) {
            Alert.alert('Missing Info', 'Please enter a task title');
            return;
        }

        setLoading(true);
        let error;

        if (taskToEdit) {
            const { error: updateError } = await updateTask(taskToEdit.id, { title, description, priority, deadline });
            error = updateError;
        } else {
            const { error: addError } = await addTask(title, description, priority, deadline);
            error = addError;
        }

        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            navigation.goBack();
        }
    }

    const onChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || deadline;
        setShowPicker(Platform.OS === 'ios');
        setDeadline(currentDate);
    };

    const showMode = (currentMode: 'date' | 'time') => {
        setShowPicker(true);
        setMode(currentMode);
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>What needs to be done?</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="E.g., Buy groceries"
                        placeholderTextColor="#9CA3AF"
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Details</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        placeholder="Add some notes..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                    />
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Priority</Text>
                    <View style={styles.priorityContainer}>
                        {['Low', 'Medium', 'High'].map(p => (
                            <TouchableOpacity
                                key={p}
                                style={[
                                    styles.priorityChip,
                                    priority === p && styles.priorityChipSelected,
                                    priority === p && getPriorityColor(p)
                                ]}
                                onPress={() => setPriority(p)}
                            >
                                <Text style={[
                                    styles.priorityText,
                                    priority === p && styles.priorityTextSelected
                                ]}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.formGroup}>
                    <Text style={styles.label}>Due Date</Text>
                    <View style={styles.dateContainer}>
                        <TouchableOpacity onPress={() => showMode('date')} style={styles.dateButton}>
                            <Ionicons name="calendar-outline" size={20} color="#4B5563" />
                            <Text style={styles.dateButtonText}>{deadline.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => showMode('time')} style={styles.dateButton}>
                            <Ionicons name="time-outline" size={20} color="#4B5563" />
                            <Text style={styles.dateButtonText}>{deadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {showPicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={deadline}
                        mode={mode}
                        is24Hour={true}
                        display="default"
                        onChange={onChange}
                    />
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={saveTask} disabled={loading}>
                    <Text style={styles.saveButtonText}>
                        {loading ? 'Saving...' : (taskToEdit ? 'Update Task' : 'Create Task')}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case 'High': return { backgroundColor: '#C62828', borderColor: '#C62828' }; // Deep Red
        case 'Medium': return { backgroundColor: '#F9A825', borderColor: '#F9A825' }; // Warm Yellow/Orange
        case 'Low': return { backgroundColor: '#558B2F', borderColor: '#558B2F' }; // Olive Green
        default: return {};
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F5F0',
    },
    scrollContent: {
        padding: 24,
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: '#8D6E63',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EFEBE9',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        color: '#3E2723',
        elevation: 1,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
        lineHeight: 24,
    },
    priorityContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    priorityChip: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EFEBE9',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    priorityChipSelected: {
        backgroundColor: '#5D4037', // Fallback
    },
    priorityText: {
        fontWeight: '600',
        color: '#8D6E63',
    },
    priorityTextSelected: {
        color: '#FFFFFF',
    },
    dateContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    dateButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#EFEBE9',
        gap: 8,
    },
    dateButtonText: {
        fontSize: 16,
        color: '#4E342E',
        fontWeight: '500',
    },
    footer: {
        padding: 24,
        paddingBottom: 40,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
    },
    saveButton: {
        backgroundColor: '#5D4037',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#3E2723',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
