import { useState, useCallback } from 'react';
import {
  StyleSheet, Text, View, ActivityIndicator,
  ScrollView, StatusBar, TouchableOpacity
} from 'react-native';
import ParkingService from '../services/ParkingService';
import { Area, AreaStatus, HistoryItem } from '../types/entities';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; 
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AreaDetail'>;

const cuposText = (disponibles: boolean) => ({
  fontSize: 16, fontWeight: 'bold', color: disponibles ? '#2E8B57' : '#DC143C',
});
const statusText = (status: AreaStatus) => ({
  fontSize: 14, fontStyle: 'italic', color: status === 'OPEN' ? '#555' : '#DC143C',
  marginTop: 8, borderTopColor: '#eee', borderTopWidth: 1, paddingTop: 8,
});

// Componente Tarjeta
function AreaCard({ area }: { area: Area }) {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const puertasDisponibles = area.puertas.filter(
    p => p.status === 'OPEN' && p.cuposOcupados < p.cuposTotales
  ).length;
  const totalPuertasAbiertas = area.puertas.filter(p => p.status === 'OPEN').length;
  const tieneDisponibilidad = puertasDisponibles > 0;

  return (
    <TouchableOpacity
      style={styles.areaCard}
      onPress={() => navigation.navigate('AreaDetail', { area })}
      activeOpacity={0.85}
    >
      <Text style={styles.areaTitle}>{area.nombre}</Text>
      <View style={styles.cuposContainer}>
        <Ionicons
          name={tieneDisponibilidad ? "checkmark-circle" : "close-circle"}
          size={24}
          color={tieneDisponibilidad ? '#2E8B57' : '#DC143C'}
        />
        {area.status === 'OPEN' ? (
          <Text style={cuposText(tieneDisponibilidad)}>
            {puertasDisponibles} de {totalPuertasAbiertas} puertas con cupos
          </Text>
        ) : (
          <Text style={cuposText(false)}>Área Cerrada</Text>
        )}
      </View>
      {area.mensaje && (
        <Text style={statusText(area.status)}>Nota: {area.mensaje}</Text>
      )}
    </TouchableOpacity>
  );
}

// PANTALLA PRINCIPAL CORREGIDA
export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [areas, setAreas] = useState<Area[]>([]);
  const [latestMovement, setLatestMovement] = useState<HistoryItem | null>(null);

  const loadData = async () => {
    try {
      const profile = await ParkingService.getUserProfile();
      const placa = profile?.vehiculos[0]?.placa;

      const [areasData, latestMove] = await Promise.all([
        ParkingService.getParkingStatus(),
        placa ? ParkingService.getLatestMovement(placa) : Promise.resolve(null)
      ]);

      setAreas(areasData.areas);
      setLatestMovement(latestMove);
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
      
      const intervalId = setInterval(() => {
        loadData();
      }, 5000);

      return () => clearInterval(intervalId);
    }, [])
  );

  // Renderizado
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  const isParked = latestMovement?.estacionado === true;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Estacionamiento UNSA</Text>

      <ScrollView style={styles.list}>
        {latestMovement ? (
          isParked ? (
            <View style={[styles.latestCard, { backgroundColor: "#2ecc71" }]}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                🚗 Tu auto está en:
              </Text>
              <Text style={{ color: "#fff", fontSize: 16 }}>
                {latestMovement.puerta}
              </Text>
            </View>
          ) : (
            <View style={[styles.latestCard, { backgroundColor: "#7f8c8d" }]}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
                ❌ No estás estacionado
              </Text>
            </View>
          )
        ) : (
          <View style={[styles.latestCard, { backgroundColor: "#7f8c8d" }]}>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>
              No hay datos recientes
            </Text>
          </View>
        )}

        {areas.map(area => (
          <AreaCard key={area.id} area={area} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', paddingHorizontal: 20, marginBottom: 20 },
  list: { paddingHorizontal: 20 },
  areaCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  areaTitle: { fontSize: 20, fontWeight: '600', color: '#0066CC', marginBottom: 12 },
  cuposContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  latestCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
});