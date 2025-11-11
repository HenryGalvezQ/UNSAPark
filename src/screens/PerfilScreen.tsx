import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Button, 
  ActivityIndicator, ScrollView, StatusBar 
} from 'react-native';
import ParkingService from '../services/ParkingService';
import { UserProfile, Vehiculo } from '../types/entities';
import { Ionicons } from '@expo/vector-icons';

// Props que recibe (ya teníamos 'onLogout')
type PerfilScreenProps = {
  onLogout: () => void;
};

// --- Componentes de UI Pequeños ---
// Para mostrar una fila de información (Ej: DNI: 12345678)
const InfoRow = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// Para mostrar la tarjeta de un vehículo
const VehiculoCard = ({ vehiculo }: { vehiculo: Vehiculo }) => (
  <View style={styles.vehiculoCard}>
    <Ionicons name="car-sport" size={24} color="#0066CC" />
    <View style={styles.vehiculoInfo}>
      <Text style={styles.vehiculoPlaca}>{vehiculo.placa}</Text>
      <Text style={styles.vehiculoModelo}>{vehiculo.modelo}</Text>
    </View>
  </View>
);
// --- Fin de Componentes UI ---


export default function PerfilScreen({ onLogout }: PerfilScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await ParkingService.getUserProfile();
        setProfile(data);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Pantalla de Carga
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  // Pantalla de Error (si el perfil no cargó)
  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Text>Error al cargar el perfil.</Text>
        <View style={styles.logoutButtonContainer}>
          <Button title="Cerrar Sesión" onPress={onLogout} color="#DC143C" />
        </View>
      </View>
    );
  }

  // Pantalla de Perfil Cargado
  return (
    <ScrollView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header del Perfil */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle" size={80} color="#0066CC" />
        </View>
        <Text style={styles.name}>{profile.nombreCompleto}</Text>
        <Text style={styles.dni}>DNI: {profile.dni}</Text>
      </View>

      {/* Sección de Información Académica */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información Académica</Text>
        <View style={styles.card}>
          <InfoRow label="Tipo de Usuario" value={profile.tipoUsuario} />
          <InfoRow label="Código" value={profile.codigo} />
          <InfoRow label="Escuela Profesional" value={profile.escuela} />
        </View>
      </View>

      {/* Sección de Vehículos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehículos Registrados</Text>
        {profile.vehiculos.map(v => (
          <VehiculoCard key={v.placa} vehiculo={v} />
        ))}
      </View>

      {/* Botón de Logout */}
      <View style={styles.logoutButtonContainer}>
        <Button title="Cerrar Sesión" onPress={onLogout} color="#DC143C" />
      </View>
    </ScrollView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 20,
  },
  avatar: {
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  dni: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#555',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    maxWidth: '60%', // Evita que el texto largo se desborde
  },
  vehiculoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  vehiculoInfo: {
    flex: 1,
  },
  vehiculoPlaca: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  vehiculoModelo: {
    fontSize: 14,
    color: '#555',
  },
  logoutButtonContainer: {
    padding: 20,
    paddingBottom: 40, // Espacio extra al final
  },
});