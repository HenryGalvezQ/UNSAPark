import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Area, PuertaStatus } from '../types/entities'; // Importamos nuestros tipos

// Un componente simple para la tarjeta de la puerta
const PuertaCard = ({ nombre, status }: { nombre: string, status: PuertaStatus }) => {
  const isOpen = status === 'OPEN';
  return (
    <View style={[styles.puertaCard, isOpen ? styles.puertaOpen : styles.puertaClosed]}>
      <Text style={styles.puertaName}>{nombre}</Text>
      <Text style={styles.puertaStatus}>{isOpen ? 'Abierta' : `Cerrada (${status})`}</Text>
    </View>
  );
};

export default function AreaDetailScreen() {
  // 1. Usamos 'useRoute' para obtener la información de la ruta
  const route = useRoute();
  
  // 2. Extraemos el parámetro 'area' que le pasamos
  // @ts-ignore - Ignoramos el error de tipo por ahora para mantenerlo simple
  const { area } = route.params as { area: Area };

  const disponibles = area.cuposTotales - area.cuposOcupados;

  return (
    <ScrollView style={styles.container}>
      {/* Header con el nombre y cupos */}
      <View style={styles.header}>
        <Text style={styles.title}>{area.nombre}</Text>
        <Text style={cuposText(disponibles)}>
          {disponibles} / {area.cuposTotales}
        </Text>
        <Text style={styles.cuposLabel}>cupos disponibles</Text>
      </View>

      {/* Placeholder para el Mapa */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>[Aquí iría el Mapa]</Text>
        <Text>(react-native-maps)</Text>
      </View>

      {/* Lista de Puertas */}
      <View style={styles.puertasSection}>
        <Text style={styles.sectionTitle}>Accesos Vehiculares</Text>
        {area.puertas.map(puerta => (
          <PuertaCard key={puerta.id} nombre={puerta.nombre} status={puerta.status} />
        ))}
      </View>
    </ScrollView>
  );
}

// --- Estilos ---

// Función de estilo dinámico (la movimos aquí)
const cuposText = (disponibles: number) => ({
  fontSize: 48,
  fontWeight: 'bold',
  color: disponibles > 10 ? '#2E8B57' : (disponibles > 0 ? '#FFA500' : '#DC143C'),
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066CC',
  },
  cuposLabel: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    borderRadius: 12,
  },
  mapText: {
    fontSize: 18,
    color: '#888',
    fontWeight: '500',
  },
  puertasSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  puertaCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 5,
  },
  puertaOpen: {
    borderColor: '#2E8B57', // Verde
  },
  puertaClosed: {
    borderColor: '#DC143C', // Rojo
  },
  puertaName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  puertaStatus: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
});