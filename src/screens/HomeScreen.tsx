import { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, ActivityIndicator,
  ScrollView, StatusBar, TouchableOpacity
} from 'react-native';
import ParkingService from '../services/ParkingService';
import { Area, AreaStatus, PuertaStatus } from '../types/entities';
import { useNavigation } from '@react-navigation/native';

// --- Tipos de Navegación (para corregir el error) ---
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

// Definimos el tipo de 'navigation' que esperamos usar
type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AreaDetail'>;

// --- Funciones de estilo DINÁMICAS ---
// Las definimos como funciones normales, fuera del StyleSheet
const cuposText = (disponibles: number) => ({
  fontSize: 18,
  fontWeight: 'bold',
  color: disponibles > 10 ? '#2E8B57' : (disponibles > 0 ? '#FFA500' : '#DC143C'),
  marginBottom: 4,
});

const statusText = (status: AreaStatus) => ({
  fontSize: 14,
  fontStyle: 'italic',
  color: status === 'OPEN' ? '#555' : '#DC143C',
  marginBottom: 12,
});

const puertaText = (status: PuertaStatus) => ({
  fontSize: 14,
  color: status === 'OPEN' ? '#333' : '#999',
  lineHeight: 20,
});

// --- Componente Principal ---
export default function HomeScreen() {
  // Usamos el hook 'useNavigation' con nuestro tipo personalizado
  const navigation = useNavigation<HomeScreenNavigationProp>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [areas, setAreas] = useState<Area[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await ParkingService.getParkingStatus();
        setAreas(data.areas);
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
        <Text style={styles.loadingText}>Cargando estacionamientos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Estacionamiento UNSA</Text>

      <ScrollView style={styles.list}>
        {areas.map(area => {
          const disponibles = area.cuposTotales - area.cuposOcupados;
          return (
            <TouchableOpacity
              key={area.id}
              style={styles.areaCard}
              // Esta línea ahora funciona gracias a nuestro tipo
              onPress={() => navigation.navigate('AreaDetail', { area: area })}
            >
              <Text style={styles.areaTitle}>{area.nombre}</Text>

              <Text style={cuposText(disponibles)}>
                Cupos: {disponibles} / {area.cuposTotales}
              </Text>

              <Text style={statusText(area.status)}>
                Estado: {area.status} {area.mensaje && ` - ${area.mensaje}`}
              </Text>

              <View style={styles.puertasContainer}>
                <Text style={styles.puertaTitle}>Accesos:</Text>
                {area.puertas.map(puerta => (
                  <Text key={puerta.id} style={puertaText(puerta.status)}>
                    • {puerta.nombre} ({puerta.status})
                  </Text>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// --- Estilos ESTÁTICOS ---
const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5fS' },
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
  areaTitle: { fontSize: 20, fontWeight: '600', color: '#0066CC', marginBottom: 8 },
  puertasContainer: { borderTopColor: '#eee', borderTopWidth: 1, paddingTop: 12, marginTop: 8 },
  puertaTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
});