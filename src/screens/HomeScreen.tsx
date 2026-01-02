import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { getTasks, deleteTask, updateTask } from '../services/tasks';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }: any) {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadTasks() {
        setLoading(true);
        const { data, error } = await getTasks();
        if (error) Alert.alert('Error fetching tasks', error.message);
        else setTasks(data || []);
        setLoading(false);
    }

    useFocusEffect(
        useCallback(() => {
            loadTasks();
        }, [])
    );

    async function handleDelete(id: string) {
        Alert.alert('Delete Task', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    const { error } = await deleteTask(id);
                    if (error) Alert.alert('Error', error.message);
                    else loadTasks();
                }
            }
        ]);
    }

    async function toggleComplete(task: any) {
        const { error } = await updateTask(task.id, { is_completed: !task.is_completed });
        if (error) Alert.alert('Error', error.message);
        else loadTasks();
    }

    async function logout() {
        await supabase.auth.signOut();
    }

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.card, item.is_completed && styles.cardCompleted]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.taskTitle, item.is_completed && styles.completedText]}>{item.title}</Text>
                <View style={[styles.badge, getPriorityStyle(item.priority)]}>
                    <Text style={[styles.badgeText, getPriorityTextStyle(item.priority)]}>{item.priority}</Text>
                </View>
            </View>

            {item.description ? <Text style={styles.description} numberOfLines={2}>{item.description}</Text> : null}

            <View style={styles.metaRow}>
                <View style={styles.dateContainer}>
                    <Ionicons name="time-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.dateText}>
                        {new Date(item.deadline).toLocaleDateString()}
                    </Text>
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => toggleComplete(item)} style={[styles.iconButton, styles.successButton]}>
                        <Ionicons name={item.is_completed ? "arrow-undo" : "checkmark"} size={18} color="#059669" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('AddTask', { taskToEdit: item })} style={[styles.iconButton, styles.editButton]}>
                        <Ionicons name="pencil" size={18} color="#2563EB" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => handleDelete(item.id)} style={[styles.iconButton, styles.deleteButton]}>
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    function getPriorityStyle(priority: string) {
        switch (priority) {
            case 'High': return { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }; // Red
            case 'Medium': return { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' }; // Yellow
            case 'Low': return { backgroundColor: '#D1FAE5', borderColor: '#A7F3D0' }; // Green
            default: return { backgroundColor: '#F3F4F6' };
        }
    }

    function getPriorityTextStyle(priority: string) {
        switch (priority) {
            case 'High': return { color: '#B91C1C' };
            case 'Medium': return { color: '#B45309' };
            case 'Low': return { color: '#047857' };
            default: return { color: '#374151' };
        }
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#5D4037" />
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>My Tasks</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                    <Ionicons name="log-out-outline" size={24} color="#5D4037" />
                </TouchableOpacity>
            </View>

            {loading ? <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 50 }} /> : (
                <FlatList
                    data={tasks}
                    renderItem={renderItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="clipboard-outline" size={64} color="#D1D5DB" />
                            <Text style={styles.emptyText}>No tasks yet.</Text>
                            <Text style={styles.emptySubText}>Tap + to add a new task</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddTask')} activeOpacity={0.8}>
                <Ionicons name="add" size={32} color="#FFF" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F5F0', // Warm Cream
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingTop: 20, // Reduced from 60 for professional spacing
        paddingBottom: 20,
    },
    greeting: {
        fontSize: 14,
        color: '#8D6E63', // Light Brown
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '800',
        color: '#3E2723', // Dark Coffee
        letterSpacing: -0.5,
    },
    logoutButton: {
        padding: 10,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        shadowColor: '#3E2723',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    list: {
        padding: 24,
        paddingBottom: 100,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#5D4037',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#EFEBE9',
    },
    cardCompleted: {
        opacity: 0.7,
        backgroundColor: '#F5F5F5',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    taskTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#4E342E',
        flex: 1,
        marginRight: 10,
    },
    completedText: {
        textDecorationLine: 'line-through',
        color: '#A1887F',
    },
    description: {
        color: '#6D4C41',
        fontSize: 14,
        marginBottom: 16,
        lineHeight: 20,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F5F5F5',
        paddingTop: 12,
        marginTop: 4,
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        marginLeft: 6,
        fontSize: 13,
        color: '#8D6E63',
        fontWeight: '500',
    },
    actions: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 10,
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#EFEBE9',
    },
    successButton: { backgroundColor: '#F1F8E9', borderColor: '#DCEDC8' },
    editButton: { backgroundColor: '#E3F2FD', borderColor: '#BBDEFB' },
    deleteButton: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
    fab: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        backgroundColor: '#5D4037', // Dark Brown
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#3E2723',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 6,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 80,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '700',
        color: '#4E342E',
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 15,
        color: '#8D6E63',
        marginTop: 8,
    },
});
