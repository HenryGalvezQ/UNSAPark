import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList,
  ActivityIndicator, StatusBar, Button,
  ScrollView, TouchableOpacity,
  Image 
} from 'react-native';
import ParkingService from '../services/ParkingService';
import { HistoryItem } from '../types/entities';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";

// --- Tipos y Constantes (no cambian) ---
type HistoryFilter = 'today' | 'week' | 'month' | 'all';
const FILTERS: { id: HistoryFilter, label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta Semana' },
  { id: 'month', label: 'Este Mes' },
];

// --- HistoryEntry (con ícono de carro) ---
const HistoryEntry = ({ item }: { item: HistoryItem }) => (
  <View style={styles.entryCard}>
    <Image 
      source={require('../../assets/carro.png')} 
      style={styles.entryIcon} 
    />
    <View style={styles.entryDetails}>
      <Text style={styles.entryArea}>{item.area} ({item.puerta})</Text>
      <Text style={styles.entryTime}>
        {item.fechaEntrada.split(' ')[1]} - {item.fechaSalida ? item.fechaSalida.split(' ')[1] : 'Estacionado'}
      </Text>
    </View>
    <Text style={styles.entryPlaca}>{item.placa}</Text>
  </View>
);

// --- SectionHeader (no cambia) ---
const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

// --- groupHistoryByDate (no cambia) ---
const groupHistoryByDate = (items: HistoryItem[]) => {
  const groups: { [key: string]: HistoryItem[] } = {};
  items.forEach(item => {
    const date = new Date(item.fechaEntrada);
    const dateString = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    const today = new Date();
    // const today = new Date('2025-11-10T10:00:00'); // Para probar MOCK
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let key = dateString;
    if (date.toDateString() === today.toDateString()) key = 'Hoy';
    else if (date.toDateString() === yesterday.toDateString()) key = 'Ayer';
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });
  return Object.keys(groups).map(key => ({ title: key, data: groups[key] }));
};


// --- 1. Componente de Filtros (MODIFICADO) ---
// Ahora SÓLO renderiza los chips de filtro rápido.
const FilterChips = ({ activeFilter, onSelectFilter }: {
  activeFilter: HistoryFilter | 'custom';
  onSelectFilter: (filter: HistoryFilter) => void;
}) => {
  return (
    <View style={styles.filterChipContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {FILTERS.map(filter => {
          const isActive = filter.id === activeFilter;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
              onPress={() => onSelectFilter(filter.id)}
            >
              <Text style={isActive ? styles.chipTextActive : styles.chipTextInactive}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        {/* El botón de calendario se movió al componente principal */}
      </ScrollView>
    </View>
  );
};


export default function HistorialScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  
  const [filter, setFilter] = useState<HistoryFilter | 'custom'>('all');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // --- Lógica de Carga de Datos (no cambia) ---
  const loadHistory = async (pageToLoad: number) => {
    if (allDataLoaded || isLoadingMore) return;
    if (pageToLoad === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    try {
      const filterToSend = (filter === 'custom' && selectedDate) ? selectedDate : filter;
      // @ts-ignore
      const newData = await ParkingService.getUserHistory(pageToLoad, filterToSend);
      if (newData.length === 0) {
        setAllDataLoaded(true);
      } else {
        setHistoryItems(prevItems => 
          pageToLoad === 1 ? newData : [...prevItems, ...newData]
        );
        setPage(pageToLoad);
      }
    } catch (error) {
      console.error("Error cargando historial:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // --- useEffect (no cambia) ---
  useEffect(() => {
    setPage(1);
    setHistoryItems([]);
    setAllDataLoaded(false);
    loadHistory(1);
  }, [filter, selectedDate]);

  // --- Funciones del Calendario (no cambian) ---
  const showDatePicker = () => { setDatePickerVisible(true); };
  const hideDatePicker = () => { setDatePickerVisible(false); };
  const handleConfirmDate = (date: Date) => {
    setFilter('custom');
    setSelectedDate(date);
    hideDatePicker();
  };
  
  // --- handleLoadMore (no cambia) ---
  const handleLoadMore = () => {
    if (!allDataLoaded && !isLoadingMore) {
      loadHistory(page + 1);
    }
  };

  // --- renderFooter (no cambia) ---
  const renderFooter = () => {
    if (isLoadingMore) {
      return <ActivityIndicator size="large" color="#0066CC" style={{ margin: 20 }} />;
    }
    if (allDataLoaded && historyItems.length > 0) {
      return <Text style={styles.footerText}>No hay más registros</Text>;
    }
    if (!allDataLoaded && historyItems.length > 0) {
      return (
        <View style={styles.footerButtonContainer}>
          <Button title="Cargar más registros" onPress={handleLoadMore} color="#0066CC" />
        </View>
      );
    }
    return null;
  };

  const groupedData = useMemo(() => groupHistoryByDate(historyItems), [historyItems]);

  // --- Renderizado Principal ---
  if (isLoading && page === 1) {
    // ... (igual que antes, muestra el cargando inicial)
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Mi Historial</Text>
        {/* --- 2. RENDERIZADO DE FILTROS ACTUALIZADO --- */}
        <View style={styles.filterSection}>
          <FilterChips 
            activeFilter={filter} 
            onSelectFilter={setFilter} 
          />
          <TouchableOpacity style={styles.datePickerButton} onPress={showDatePicker}>
            <Text style={styles.datePickerText}>Buscar por fecha:</Text>
            <Ionicons name="calendar-outline" size={20} color={filter === 'custom' ? '#0066CC' : '#555'} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Mi Historial</Text>
      
      {/* --- 3. RENDERIZADO DE FILTROS ACTUALIZADO --- */}
      <View style={styles.filterSection}>
        <FilterChips 
          activeFilter={filter} 
          onSelectFilter={setFilter} 
        />
        <TouchableOpacity style={styles.datePickerButton} onPress={showDatePicker}>
          <Text style={styles.datePickerText}>Buscar por fecha:</Text>
          <Ionicons 
            name="calendar-outline" 
            size={20} 
            // El ícono se pone azul si el filtro 'custom' está activo
            color={filter === 'custom' ? '#0066CC' : '#555'} 
          />
        </TouchableOpacity>
      </View>
      
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        maximumDate={new Date()} 
      />
      
      <SectionList
        sections={groupedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HistoryEntry item={item} />}
        renderSectionHeader={({ section: { title } }) => <SectionHeader title={title} />}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.centerContainer}>
              <Text style={styles.footerText}>No se encontraron registros para este filtro.</Text>
            </View>
          ) : null
        }
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

// --- 4. ESTILOS ACTUALIZADOS ---
const styles = StyleSheet.create({
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f5f5f5', },
  loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333', paddingHorizontal: 20, marginBottom: 12 },
  
  // Contenedor principal de filtros
  filterSection: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  // Contenedor solo de los chips
  filterChipContainer: {
    marginBottom: 12, // Espacio entre chips y el botón de fecha
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 3, // <-- Gap reducido
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipActive: { backgroundColor: '#0066CC', borderColor: '#0066CC', },
  chipInactive: { backgroundColor: '#ffffff', borderColor: '#ddd', },
  chipTextActive: { color: '#ffffff', fontWeight: 'bold', },
  chipTextInactive: { color: '#555', },

  // Estilos para el botón de calendario
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end', // Alineado a la derecha
    paddingVertical: 4,
  },
  datePickerText: {
    fontSize: 14,
    color: '#555',
    marginRight: 8,
    fontWeight: '500',
  },
  // Fin de estilos de filtro

  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    backgroundColor: '#f5f5f5', 
    paddingTop: 20,
    paddingBottom: 10,
    textTransform: 'capitalize',
  },
  entryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    gap: 12,
  },
  entryIcon: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
    // tintColor: '#0066CC' // Descomenta si tu png es de un solo color
  },
  entryDetails: {
    flex: 1,
  },
  entryArea: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  entryTime: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  entryPlaca: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0066CC',
    backgroundColor: '#f0f5ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
  },
  footerButtonContainer: {
    marginVertical: 20,
  },
  footerText: {
    textAlign: 'center',
    color: '#999',
    margin: 20,
    fontSize: 14,
  },
});