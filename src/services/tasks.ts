import { supabase } from './supabase';

export async function getTasks() {
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
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
