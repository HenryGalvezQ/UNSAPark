import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList,
  ActivityIndicator, StatusBar, Button,
  ScrollView, TouchableOpacity, Image
} from 'react-native';
import ParkingService from '../services/ParkingService';
import { HistoryItem } from '../types/entities';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";

type HistoryFilter = 'today' | 'week' | 'month' | 'all';
const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Esta Semana' },
  { id: 'month', label: 'Este Mes' },
];

const HistoryEntry = ({ item }: { item: HistoryItem }) => (
  <View style={styles.entryCard}>
    <Image source={require('../../assets/carro.png')} style={styles.entryIcon} />
    <View style={styles.entryDetails}>
      <Text style={styles.entryArea}>{item.area} ({item.puerta})</Text>
      <Text style={styles.entryTime}>
        {item.fechaEntrada?.split(' ')[1]} - {item.fechaSalida ? item.fechaSalida.split(' ')[1] : 'Estacionado'}
      </Text>
    </View>
    <Text style={styles.entryPlaca}>{item.placa}</Text>
  </View>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const groupHistoryByDate = (items: HistoryItem[]) => {
  const groups: Record<string, HistoryItem[]> = {};

  items.forEach(item => {
    const date = new Date(item.fechaEntrada);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let key = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    if (date.toDateString() === today.toDateString()) key = "Hoy";
    if (date.toDateString() === yesterday.toDateString()) key = "Ayer";

    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  return Object.keys(groups).map(key => ({ title: key, data: groups[key] }));
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

  const loadHistory = async (pageToLoad: number) => {
    if (allDataLoaded || isLoadingMore) return;

    if (pageToLoad === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const profile = await ParkingService.getUserProfile();
      const placa = profile?.vehiculos?.[0]?.placa || profile?.vehiculo?.placa;
      if (!placa) return;

      const newData = await ParkingService.getUserHistory(placa, pageToLoad);

      const normalized = newData.map((item: any) => ({
        ...item,
        id: item._id,
        area: item.area || "Ingenierías",
        fechaEntrada: item.fechaEntrada?.replace("T", " ").substring(0, 16),
        fechaSalida: item.fechaSalida ? item.fechaSalida.replace("T", " ").substring(0, 16) : null,
      }));

      if (!normalized.length) {
        if (pageToLoad === 1) setHistoryItems([]);
        setAllDataLoaded(true);
      } else {
        setHistoryItems(prev =>
          pageToLoad === 1 ? normalized : [...prev, ...normalized]
        );
        setPage(pageToLoad);
      }
    } catch (e) {
      console.warn("Error loadHistory:", e);
      setHistoryItems([]);
      setAllDataLoaded(true);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setAllDataLoaded(false);
    loadHistory(1);
  }, [filter, selectedDate]);

  const grouped = useMemo(() => groupHistoryByDate(historyItems), [historyItems]);

  const handleLoadMore = () => {
    if (!isLoadingMore && !allDataLoaded) loadHistory(page + 1);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Mi Historial</Text>

      {/* 🔹 FILTROS RESTAURADOS */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.id}
              style={[
                styles.chip,
                f.id === filter ? styles.chipActive : styles.chipInactive
              ]}
              onPress={() => setFilter(f.id)}
            >
              <Text style={f.id === filter ? styles.chipTextActive : styles.chipTextInactive}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setDatePickerVisible(true)}
          >
            <Text style={styles.datePickerText}>Buscar por fecha</Text>
            <Ionicons name="calendar-outline" size={18} color="#555" />
          </TouchableOpacity>
        </ScrollView>
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(d) => {
          setFilter('custom'); setSelectedDate(d);
          setDatePickerVisible(false);
        }}
        onCancel={() => setDatePickerVisible(false)}
        maximumDate={new Date()}
      />

      <SectionList
        sections={grouped}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <HistoryEntry item={item} />}
        renderSectionHeader={({ section: { title } }) => <SectionHeader title={title} />}
        ListFooterComponent={() => (
          <>
            {isLoadingMore && <ActivityIndicator size="large" color="#0066CC" />}
            {!isLoadingMore && !allDataLoaded && historyItems.length > 0 && (
              <View style={styles.footerButtonContainer}>
                <Button title="Cargar más" onPress={handleLoadMore} color="#0066CC" />
              </View>
            )}
            {allDataLoaded && historyItems.length > 0 && (
              <Text style={styles.footerText}>No hay más registros</Text>
            )}
          </>
        )}
        ListEmptyComponent={() => (
          <View style={styles.centerContainer}>
            <Text style={styles.footerText}>No hay datos</Text>
          </View>
        )}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: 60 },
  title: { fontSize: 26, fontWeight: '700', marginLeft: 20, marginBottom: 12 },
  filterSection: { paddingHorizontal: 20, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, marginRight: 8, borderWidth: 1 },
  chipActive: { backgroundColor: '#0066CC', borderColor: '#0066CC' },
  chipInactive: { backgroundColor: '#fff', borderColor: '#ddd' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
  chipTextInactive: { color: '#555' },
  datePickerButton: { flexDirection: 'row', alignItems: 'center', marginLeft: 8 },
  datePickerText: { marginRight: 8, color: '#555' },

  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 20 },
  sectionHeader: { fontSize: 18, fontWeight: '700', color: '#333', paddingTop: 18, paddingBottom: 10 },
  entryCard: { backgroundColor: '#fff', borderRadius: 8, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  entryIcon: { width: 36, height: 36, resizeMode: 'contain' },
  entryDetails: { flex: 1, marginLeft: 10 },
  entryArea: { fontSize: 15, fontWeight: '600' },
  entryTime: { fontSize: 13, color: '#555', marginTop: 4 },
  entryPlaca: { fontWeight: '700', color: '#0066CC' },
  footerButtonContainer: { marginVertical: 12 },
  footerText: { textAlign: 'center', color: '#999', marginTop: 12 }
});
