import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './providers/AuthProvider';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import HomeScreen from './screens/HomeScreen';
import AddTaskScreen from './screens/AddTaskScreen';

const Stack = createNativeStackNavigator();

function Navigation() {
    const { session, loading } = useAuth();

    if (loading) {
        return null; // Or a loading spinner
    }

    return (
        <Stack.Navigator>
            {session ? (
                <>
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{
                            headerStyle: { backgroundColor: '#5D4037' }, // Dark Brown
                            headerShadowVisible: false,
                            headerTitleStyle: { color: '#FFFFFF', fontWeight: 'bold' },
                            headerTintColor: '#FFFFFF' // Back button color
                        }}
                    />
                    <Stack.Screen name="AddTask" component={AddTaskScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <Navigation />
            </NavigationContainer>
        </AuthProvider>
    );
}
