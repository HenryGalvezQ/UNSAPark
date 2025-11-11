import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, StatusBar } from 'react-native';
import ParkingService from '../services/ParkingService';
import { HistoryItem } from '../types/entities';
import { Ionicons } from '@expo/vector-icons'; // Usaremos íconos

// Componente para renderizar cada item del historial
const HistoryItemCard = ({ item }: { item: HistoryItem }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Text style={styles.cardTitle}>{item.area}</Text>
      <Text style={styles.cardSubtitle}>{item.puerta}</Text>
    </View>
    <View style={styles.cardBody}>
      <View style={styles.row}>
        <Ionicons name="car-sport-outline" size={16} color="#555" />
        <Text style={styles.rowText}>{item.placa}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="log-in-outline" size={16} color="#2E8B57" />
        <Text style={styles.rowText}>Entrada: {item.fechaEntrada}</Text>
      </View>
      <View style={styles.row}>
        <Ionicons name="log-out-outline" size={16} color="#DC143C" />
        <Text style={styles.rowText}>Salida: {item.fechaSalida}</Text>
      </View>
    </View>
  </View>
);

export default function HistorialScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Usamos useEffect para cargar los datos cuando la pantalla se monta
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await ParkingService.getUserHistory();
        setHistory(data);
      } catch (error) {
        console.error("Error cargando historial:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, []); // El array vacío [] asegura que se ejecute solo una vez

  // Pantalla de carga
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Mi Historial</Text>
      
      {/* Si no hay historial, muestra un mensaje */}
      {history.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text>No se encontraron registros.</Text>
        </View>
      ) : (
        // Si hay historial, muestra la lista
        <FlatList
          data={history}
          renderItem={({ item }) => <HistoryItemCard item={item} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0066CC',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  cardBody: {
    padding: 16,
    gap: 12, // 'gap' es más simple que marginBottom en cada hijo
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // 'gap' es genial para espaciado
  },
  rowText: {
    fontSize: 14,
    color: '#333',
  },
});