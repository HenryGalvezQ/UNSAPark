import { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, ActivityIndicator,
  ScrollView, StatusBar, TouchableOpacity,
  Image // <-- 1. Importamos Image
} from 'react-native';
import ParkingService from '../services/ParkingService';
// --- 2. Importamos HistoryItem ---
import { Area, AreaStatus, PuertaStatus, HistoryItem } from '../types/entities';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Ionicons } from '@expo/vector-icons';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AreaDetail'>;

// --- Funciones de estilo (no cambian) ---
const cuposText = (disponibles: boolean) => ({
  fontSize: 16, fontWeight: 'bold', color: disponibles ? '#2E8B57' : '#DC143C',
});
const statusText = (status: AreaStatus) => ({
  fontSize: 14, fontStyle: 'italic', color: status === 'OPEN' ? '#555' : '#DC143C',
  marginTop: 8, borderTopColor: '#eee', borderTopWidth: 1, paddingTop: 8,
});

// --- Componente AreaCard (no cambia) ---
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
      onPress={() => navigation.navigate('AreaDetail', { area: area })}
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

// --- 3. NUEVO COMPONENTE: TARJETA DE ÚLTIMO MOVIMIENTO ---
const LatestMovementCard = ({ item }: { item: HistoryItem }) => {
  // Comprobamos si el usuario sigue estacionado
  const isCurrentlyParked = item.fechaSalida === null;
  
  return (
    <View style={styles.latestCard}>
      {/* Header de la tarjeta */}
      <View style={styles.latestHeader}>
        <Text style={styles.latestTitle}>Último Movimiento</Text>
        <View style={[
          styles.statusBadge, 
          isCurrentlyParked ? styles.statusBadgeActive : styles.statusBadgeInactive
        ]}>
          <Text style={styles.statusBadgeText}>
            {isCurrentlyParked ? "Estacionado" : "Finalizado"}
          </Text>
        </View>
      </View>

      {/* Cuerpo con el ícono y detalles */}
      <View style={styles.latestBody}>
        <Ionicons name="car-sport" size={54} color="#f8f8f8ff" />
        <View style={styles.latestDetails}>
          <Text style={styles.latestArea}>{item.area}</Text>
          <Text style={styles.latestLocation}>{item.puerta}</Text>
          <Text style={styles.latestPlaca}>{item.placa}</Text>
        </View>
      </View>

      {/* Footer con las horas */}
      <View style={styles.latestFooter}>
        <View style={styles.latestTimeBox}>
          <Text style={styles.latestTimeLabel}>Entrada</Text>
          <Text style={styles.latestTimeValue}>{item.fechaEntrada.split(' ')[1]}</Text>
          <Text style={styles.latestTimeDate}>{item.fechaEntrada.split(' ')[0]}</Text>
        </View>
        <View style={styles.latestTimeBox}>
          <Text style={styles.latestTimeLabel}>Salida</Text>
          <Text style={styles.latestTimeValue}>
            {isCurrentlyParked ? "--:--" : item.fechaSalida?.split(' ')[1]}
          </Text>
          <Text style={styles.latestTimeDate}>
            {isCurrentlyParked ? "" : item.fechaSalida?.split(' ')[0]}
          </Text>
        </View>
      </View>
    </View>
  );
};
// --- FIN DEL NUEVO COMPONENTE ---


// --- Componente Principal ---
export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [areas, setAreas] = useState<Area[]>([]);
  
  // --- 4. NUEVO ESTADO ---
  const [latestMovement, setLatestMovement] = useState<HistoryItem | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Cargamos los datos de las áreas y el último mov. en paralelo
        const [areasData, latestMove] = await Promise.all([
          ParkingService.getParkingStatus(),
          ParkingService.getLatestMovement()
        ]);
        
        setAreas(areasData.areas);
        setLatestMovement(latestMove);

      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []); 

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Estacionamiento UNSA</Text>
      
      <ScrollView style={styles.list}>
        {/* --- 5. RENDERIZADO DE LA NUEVA TARJETA --- */}
        {latestMovement && (
          <LatestMovementCard item={latestMovement} />
        )}
        {/* Lista de Áreas */}
        {areas.map(area => (
          <AreaCard key={area.id} area={area} />
        ))}
      </ScrollView>
    </View>
  );
}

// --- 6. ESTILOS (ACTUALIZADOS) ---
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
  cuposContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, },

  // --- 7. NUEVOS ESTILOS PARA LA TARJETA "ÚLTIMO MOVIMIENTO" ---
  latestCard: {
    backgroundColor: '#0066CC', // Color de acento principal
    borderRadius: 12,
    padding: 20,
    marginBottom: 20, // Espacio al final de la lista
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    paddingBottom: 12,
  },
  latestTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: 'rgba(46, 204, 113, 0.8)', // Verde
  },
  statusBadgeInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)', // Gris
  },
  statusBadgeText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  latestBody: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  latestCarIcon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    tintColor: '#ffffff' // Tiñe el carro de blanco
  },
  latestDetails: {
    flex: 1,
  },
  latestArea: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  latestLocation: {
    fontSize: 14,
    color: '#f0f5ff',
  },
  latestPlaca: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066CC',
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
    alignSelf: 'flex-start', // Para que no ocupe toda la línea
  },
  latestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    paddingTop: 12,
  },
  latestTimeBox: {
    alignItems: 'center',
    flex: 1,
  },
  latestTimeLabel: {
    fontSize: 12,
    color: '#f0f5ff',
    textTransform: 'uppercase',
  },
  latestTimeValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginVertical: 2,
  },
  latestTimeDate: {
    fontSize: 12,
    color: '#f0f5ff',
  },
});