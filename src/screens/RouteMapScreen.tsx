import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRoute } from '@react-navigation/native';
import { Puerta } from '../types/entities';
import * as Location from 'expo-location'; // Para la ubicación del usuario
import MapViewDirections from 'react-native-maps-directions'; // Para la ruta

// La clave de API desde el .env
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

type Coords = {
  latitude: number;
  longitude: number;
};

// --- FUNCIÓN DE ESTILO (CORREGIDA) ---
// La movemos aquí AFUERA del StyleSheet
const infoStatus = (disponible: boolean) => ({
  fontSize: 16,
  color: disponible ? '#2E8B57' : '#DC143C', // Verde o Rojo
  fontWeight: 'bold',
  marginTop: 4,
});
// --- FIN DE LA CORRECCIÓN ---


export default function RouteMapScreen() {
  const route = useRoute();
  // @ts-ignore
  const { puerta } = route.params as { puerta: Puerta };

  const [origin, setOrigin] = useState<Coords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Pedir permiso y obtener ubicación
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permiso de ubicación denegado');
        setIsLoading(false);
        Alert.alert('Permiso denegado', 'No podemos trazar la ruta sin tu ubicación.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setOrigin({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      setIsLoading(false);
    })();
  }, []);

  const destination = {
    latitude: puerta.latitude,
    longitude: puerta.longitude,
  };

  // Calculamos la disponibilidad de la puerta
  const disponibles = puerta.cuposTotales - puerta.cuposOcupados;
  const hasCupos = disponibles > 0;

  // Pantalla de carga
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
      </View>
    );
  }

  // Pantalla de error
  if (errorMsg || !origin) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>{errorMsg || 'No se pudo obtener la ubicación.'}</Text>
      </View>
    );
  }

  // Pantalla con el Mapa y la Ruta
  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...origin,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <MapViewDirections
          origin={origin}
          destination={destination}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={4}
          strokeColor="red"
          onError={(error) => console.log('Directions error: ', error)}
        />
        <Marker coordinate={origin} title="Tu Ubicación" pinColor="blue" />
        <Marker coordinate={destination} title={puerta.nombre} />
      </MapView>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Ruta a: {puerta.nombre}</Text>
        
        {/* --- CORRECCIÓN DE LLAMADA --- */}
        {/* Se llama a la función 'infoStatus' (sin styles.) 
            y le pasamos la variable 'hasCupos' */}
        <Text style={infoStatus(hasCupos)}>
          Cupos: {disponibles} / {puerta.cuposTotales}
        </Text>
        
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, marginTop: 10 },
  map: { flex: 1 },
  infoBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  // 'infoStatus' ya no está aquí
});