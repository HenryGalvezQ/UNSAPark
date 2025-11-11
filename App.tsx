import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Importamos nuestras pantallas (SIN llaves, son 'export default')
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import HistorialScreen from './src/screens/HistorialScreen';
import PerfilScreen from './src/screens/PerfilScreen';
import AreaDetailScreen from './src/screens/AreaDetailScreen'; // <-- 1. Importamos la nueva pantalla
import RouteMapScreen from './src/screens/RouteMapScreen';

// Importamos íconos (¡Expo los incluye por defecto!)
import { Ionicons } from '@expo/vector-icons';

// 1. Definimos los navegadores
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// 2. Creamos el Navegador Principal (con pestañas)
// Esta será la app *después* de iniciar sesión
function MainAppTabs({ onLogout }: { onLogout: () => void }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Esta función configura los íconos de las pestañas
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'alert-circle'; // Icono por defecto

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Historial') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0066CC', // Color de pestaña activa
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Ocultamos el header de las pestañas
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Áreas' }} />
      <Tab.Screen name="Historial" component={HistorialScreen} />
      
      {/* Para Perfil, necesitamos pasar la función onLogout.
        Usamos un 'children' render prop para esto.
      */}
      <Tab.Screen name="Perfil">
        {(props) => <PerfilScreen {...props} onLogout={onLogout} />}
      </Tab.Screen>

    </Tab.Navigator>
  );
}

// 3. Creamos el Navegador Raíz (el App.tsx)
export default function App() {
  // Este estado simple controlará si el usuario está logueado o no
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Funciones para cambiar el estado
  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {isLoggedIn ? (
          // --- Si está LOGUEADO ---
          // Usamos un Fragment (<>) para agrupar las pantallas de "logueado"
          <>
            {/* Pantalla 1: El navegador de Pestañas */}
            <Stack.Screen name="MainApp" options={{ headerShown: false }}>
              {(props) => <MainAppTabs {...props} onLogout={handleLogout} />}
            </Stack.Screen>

            {/* Pantalla 2: El detalle del Área (la añadimos aquí) */}
            <Stack.Screen 
              name="AreaDetail" 
              component={AreaDetailScreen}
              // Esta sí tiene header, con título y botón de "Volver"
              options={{ 
                title: 'Detalle del Área',
                headerBackTitle: 'Volver', // Texto de "Volver" en iOS
              }} 
            />
            <Stack.Screen 
              name="RouteMap" 
              component={RouteMapScreen}
              options={{ 
                title: 'Trazando Ruta',
                headerBackTitle: 'Volver',
              }} 
            />
          </>
        ) : (
          // --- Si NO está LOGUEADO ---
          // Muestra la pantalla de Login
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}