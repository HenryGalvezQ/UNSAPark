import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, TouchableOpacity } from 'react-native';

// --- IMPORTAR PANTALLAS ---
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistorialScreen from './src/screens/HistorialScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import AreaDetailScreen from './src/screens/AreaDetailScreen';
import RouteMapScreen from './src/screens/RouteMapScreen';
import AdminRequestsScreen from './src/screens/admin/AdminRequestsScreen'; 
import RequestDetailScreen from './src/screens/admin/RequestDetailScreen';

import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();
const AdminStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// --- TABS PRINCIPALES (Usuario Normal) ---
function MainAppTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any = 'alert-circle';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Historial') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Perfil') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066CC',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Historial" component={HistorialScreen} />
      <Tab.Screen name="Perfil">
        {(props) => <PerfilScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// --- STACK ADMINISTRADOR ---
function AdminNavigator({ onLogout }: { onLogout: () => void }) {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen 
        name="AdminRequests" 
        component={AdminRequestsScreen} 
        options={{ 
          title: 'Panel Administrador',
          headerRight: () => (
            <TouchableOpacity onPress={onLogout} style={{ marginRight: 10 }}>
              <Ionicons name="log-out-outline" size={24} color="#d32f2f" />
            </TouchableOpacity>
          )
        }} 
      />
      <AdminStack.Screen 
        name="RequestDetail" 
        component={RequestDetailScreen} 
        options={{ title: 'Revisar Solicitud' }} 
      />
    </AdminStack.Navigator>
  );
}

// --- APP ROOT ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'USER' | 'ADMIN'>('USER'); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simular carga rápida
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  // Función que recibe el rol desde el Login
  const handleLogin = (role: 'USER' | 'ADMIN') => {
    console.log(`✅ Login exitoso como: ${role}`);
    setUserRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('USER'); // Resetear rol por seguridad
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      
      {/* Navegador Principal */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {!isLoggedIn ? (
          // --- FLUJO PÚBLICO (LOGIN) ---
          <Stack.Group>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen} 
              options={{ title: 'Crear Cuenta', headerShown: true }} 
            />
          </Stack.Group>

        ) : userRole === 'ADMIN' ? (
          // --- FLUJO ADMINISTRADOR ---
          <Stack.Screen name="AdminApp">
            {() => <AdminNavigator onLogout={handleLogout} />}
          </Stack.Screen>

        ) : (
          // --- FLUJO USUARIO NORMAL ---
          <Stack.Group>
            <Stack.Screen name="MainApp">
              {(props) => <MainAppTabs {...props} onLogout={handleLogout} />}
            </Stack.Screen>
            <Stack.Screen 
              name="AreaDetail" 
              component={AreaDetailScreen} 
              options={{ title: 'Detalle', headerShown: true }} 
            />
            <Stack.Screen 
              name="RouteMap" 
              component={RouteMapScreen} 
              options={{ title: 'Ruta', headerShown: true }} 
            />
          </Stack.Group>
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}