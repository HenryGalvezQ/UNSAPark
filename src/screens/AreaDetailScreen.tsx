import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native'; // <-- 1. Importar useNavigation
import { Area, Puerta } from '../types/entities';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps'; 
import { Ionicons } from '@expo/vector-icons';

// --- Tipos de Navegación ---
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
type AreaDetailNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RouteMap'>;

// --- Componente de Tarjeta de Puerta ACTUALIZADO ---
const PuertaCard = ({ puerta }: { puerta: Puerta }) => {
  const navigation = useNavigation<AreaDetailNavigationProp>(); // <-- 2. Obtener navegación

  const disponibles = puerta.cuposTotales - puerta.cuposOcupados;
  const isOpen = puerta.status === 'OPEN';
  const hasCupos = disponibles > 0;
  
  // --- 3. Lógica del botón ---
  const isButtonDisabled = !isOpen || !hasCupos;

  const color = isOpen && hasCupos ? '#2E8B57' : (isOpen ? '#FFA500' : '#DC143C');

  const handlePress = () => {
    if (!isButtonDisabled) {
      navigation.navigate('RouteMap', { puerta: puerta });
    }
  };

  return (
    <View style={[styles.puertaCard, { borderColor: color }]}>
      <View style={styles.puertaInfo}>
        <Text style={styles.puertaName}>{puerta.nombre}</Text>
        {isOpen ? (
          <Text style={[styles.cuposText, { color: color }]}>
            {disponibles} / {puerta.cuposTotales} disponibles
          </Text>
        ) : (
          <Text style={styles.cuposTextCerrado}>
            Cerrada ({puerta.status})
          </Text>
        )}
      </View>
      
      {/* --- 4. Botón "Trazar Ruta" --- */}
      <TouchableOpacity 
        style={[styles.routeButton, isButtonDisabled && styles.routeButtonDisabled]}
        disabled={isButtonDisabled}
        onPress={handlePress}
      >
        <Ionicons name="map-outline" size={20} color={isButtonDisabled ? '#999' : '#0066CC'} />
        <Text style={[styles.routeButtonText, isButtonDisabled && styles.routeButtonTextDisabled]}>
          Ruta
        </Text>
      </TouchableOpacity>
    </View>
  );
};
// --- Fin PuertaCard ---


export default function AreaDetailScreen() {
  const route = useRoute();
  // @ts-ignore
  const { area } = route.params as { area: Area };

  const initialRegion = {
    latitude: area.latitude,
    longitude: area.longitude,
    latitudeDelta: area.latitudeDelta,
    longitudeDelta: area.longitudeDelta,
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{area.nombre}</Text>
        <Text style={styles.subtitle}>Estado de accesos y mapa</Text>
      </View>

      <MapView
        // ... (el mapa no cambia)
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {area.puertas.map(puerta => (
          <Marker
            key={puerta.id}
            coordinate={{
              latitude: puerta.latitude,
              longitude: puerta.longitude,
            }}
            title={puerta.nombre}
            description={`Cupos: ${puerta.cuposOcupados}/${puerta.cuposTotales}`}
            pinColor={puerta.status === 'OPEN' && puerta.cuposOcupados < puerta.cuposTotales ? 'green' : (puerta.status === 'OPEN' ? 'orange' : 'red')}
          />
        ))}
      </MapView>
      
      <View style={styles.puertasSection}>
        <Text style={styles.sectionTitle}>Accesos Vehiculares</Text>
        {area.puertas.map(puerta => (
          <PuertaCard key={puerta.id} puerta={puerta} />
        ))}
      </View>
    </ScrollView>
  );
}

// --- Estilos Actualizados ---
const styles = StyleSheet.create({
  // ... (container, header, title, subtitle, map... no cambian)
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#ffffff', paddingVertical: 24, paddingHorizontal: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0066CC' },
  subtitle: { fontSize: 16, color: '#555', marginTop: 4 },
  map: { height: 300, margin: 20, borderRadius: 12 },
  puertasSection: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 16 },

  puertaCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
    flexDirection: 'row', // <-- 5. Alineación horizontal
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  puertaInfo: {
    flex: 1, // Permite que el texto se ajuste
  },
  puertaName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  cuposText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  cuposTextCerrado: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
    color: '#777',
    fontStyle: 'italic',
  },
  
  // --- 6. Estilos para el nuevo botón ---
  routeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f5ff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: '#0066CC'
  },
  routeButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ddd'
  },
  routeButtonText: {
    color: '#0066CC',
    fontSize: 14,
    fontWeight: '600',
  },
  routeButtonTextDisabled: {
    color: '#999',
  }
});