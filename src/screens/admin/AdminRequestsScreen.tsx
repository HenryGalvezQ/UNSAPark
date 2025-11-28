import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';
import ParkingService from '../../services/ParkingService';
import { UserRequest } from '../../types/entities';
import { Ionicons } from '@expo/vector-icons';

export default function AdminRequestsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [requests, setRequests] = useState<UserRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar datos cada vez que la pantalla gana foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    const data = await ParkingService.getPendingRequests();
    setRequests(data);
    setLoading(false);
  };

  const renderItem = ({ item }: { item: UserRequest }) => (
    <TouchableOpacity 
      style={styles.card} 
      // Pasamos el objeto completo 'item' para no tener que volver a pedirlo
      onPress={() => navigation.navigate('RequestDetail', { requestData: item })}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="person" size={24} color="#0066CC" />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.nombreCompleto}</Text>
        <Text style={styles.sub}>{item.datosPersonales.condicionLaboral} • {item.datosPersonales.dependencia}</Text>
        <Text style={styles.date}>DNI: {item.dni}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Solicitudes Pendientes</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0066CC" style={{marginTop: 50}} />
      ) : (
        <FlatList 
          data={requests} 
          renderItem={renderItem} 
          keyExtractor={i => i._id!} 
          ListEmptyComponent={<Text style={styles.empty}>No hay solicitudes pendientes.</Text>}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { fontSize: 24, fontWeight: 'bold', padding: 20, color: '#333' },
  card: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginHorizontal: 20, marginBottom: 10, borderRadius: 10, alignItems: 'center', elevation: 2 },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e6f0ff', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  info: { flex: 1 },
  name: { fontWeight: 'bold', fontSize: 16, color: '#333' },
  sub: { color: '#666', fontSize: 14 },
  date: { color: '#999', fontSize: 12, marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' }
});