import { supabase } from './supabase';

export async function getTasks() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*');

    if (data) {
        data.sort((a, b) => {
            // 1. Sort by Priority: High > Medium > Low
            const priorityOrder: { [key: string]: number } = { 'High': 1, 'Medium': 2, 'Low': 3 };
            const pA = priorityOrder[a.priority] || 99;
            const pB = priorityOrder[b.priority] || 99;

            if (pA !== pB) return pA - pB;

            // 2. Sort by Deadline: Ascending (Earlier times first)
            const dateA = a.deadline ? new Date(a.deadline).getTime() : Number.MAX_SAFE_INTEGER;
            const dateB = b.deadline ? new Date(b.deadline).getTime() : Number.MAX_SAFE_INTEGER;

            return dateA - dateB;
        });
    }

    return { data, error };
}

export async function addTask(title: string, description: string, priority: string, deadline: Date) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: { message: 'User not found' } };

    const { data, error } = await supabase
        .from('tasks')
        .insert([
            {
                title,
                description,
                priority,
                deadline,
                user_id: user.id,
                is_completed: false,
            }
        ])
        .select();
    return { data, error };
}

export async function updateTask(id: string, updates: any) {
    const { data, error } = await supabase
        .from('tasks') // Ensure table name matches
        .update(updates)
        .eq('id', id)
        .select();
    return { data, error };
}

export async function deleteTask(id: string) {
    const { data, error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
    return { data, error };
}
