import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import ParkingService from '../../services/ParkingService';
import { UserRequest } from '../../types/entities';
import { Ionicons } from '@expo/vector-icons';

export default function RequestDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  // @ts-ignore
  const { requestData } = route.params as { requestData: UserRequest };
  const [processing, setProcessing] = useState(false);

  const handleAction = async (status: 'APROBADO' | 'RECHAZADO') => {
    Alert.alert(
      status === 'APROBADO' ? "Aprobar Solicitud" : "Rechazar Solicitud",
      `¿Estás seguro de que deseas ${status.toLowerCase()} a ${requestData.nombreCompleto}?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          style: status === 'RECHAZADO' ? 'destructive' : 'default',
          onPress: async () => {
            setProcessing(true);
            const success = await ParkingService.approveRequest(requestData._id!, status);
            setProcessing(false);
            
            if (success) {
              Alert.alert("Éxito", "La solicitud ha sido procesada correctamente.", [
                { text: "OK", onPress: () => navigation.goBack() }
              ]);
            } else {
              Alert.alert("Error", "No se pudo actualizar la solicitud. Intenta nuevamente.");
            }
          } 
        }
      ]
    );
  };

  const Field = ({ label, value, icon }: { label: string, value: string, icon?: string }) => (
    <View style={styles.fieldContainer}>
      <View style={styles.labelRow}>
        {icon && <Ionicons name={icon as any} size={14} color="#666" style={{marginRight: 5}} />}
        <Text style={styles.label}>{label}</Text>
      </View>
      <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <View style={{flex:1, backgroundColor: '#f9f9f9'}}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* CABECERA */}
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
             <Ionicons name="person" size={40} color="#fff" />
          </View>
          <View style={{flex:1}}>
            <Text style={styles.mainName}>{requestData.nombreCompleto}</Text>
            <Text style={styles.mainRole}>{requestData.datosPersonales.condicionLaboral}</Text>
            <View style={[styles.statusBadge, requestData.statusSolicitud === 'PENDIENTE' ? styles.badgePending : styles.badgeOther]}>
              <Text style={styles.statusText}>{requestData.statusSolicitud}</Text>
            </View>
          </View>
        </View>

        {/* SECCIÓN 1: DATOS PERSONALES */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos Personales</Text>
          <Field label="DNI" value={requestData.dni} icon="card-outline" />
          <Field label="Dependencia / Facultad" value={requestData.datosPersonales.dependencia} icon="business-outline" />
          <Field label="Cargo" value={requestData.datosPersonales.cargo} icon="briefcase-outline" />
          <Field label="Fecha de Ingreso" value={new Date(requestData.datosPersonales.fechaIngreso).toLocaleDateString()} icon="calendar-outline" />
          <Field label="Teléfono" value={requestData.telefono} icon="call-outline" />
          <Field label="Correo" value={requestData.email} icon="mail-outline" />
        </View>
        
        {/* SECCIÓN 2: VEHÍCULO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehículo</Text>
          <View style={styles.plateContainer}>
            <Text style={styles.plateText}>{requestData.vehiculo.placa}</Text>
          </View>
          <View style={styles.row}>
            <View style={{flex:1}}><Field label="Marca" value={requestData.vehiculo.marca} /></View>
            <View style={{flex:1}}><Field label="Modelo" value={requestData.vehiculo.modelo} /></View>
          </View>
          <Field label="Color" value={requestData.vehiculo.color} />
        </View>

        {/* SECCIÓN 3: DOCUMENTOS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentos Adjuntos</Text>
          <Text style={styles.docLabel}>DNI (Frontal)</Text>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: requestData.documentos.dniUrl || 'https://via.placeholder.com/300' }} style={styles.docImg} />
          </View>
          
          <Text style={[styles.docLabel, {marginTop: 15}]}>Licencia de Conducir</Text>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: requestData.documentos.licenciaUrl || 'https://via.placeholder.com/300' }} style={styles.docImg} />
          </View>
        </View>

      </ScrollView>

      {/* FOOTER ACCIONES */}
      <View style={styles.footer}>
        {processing ? <ActivityIndicator color="#0066CC" size="large" /> : (
          <>
            <TouchableOpacity style={[styles.btn, styles.btnReject]} onPress={() => handleAction('RECHAZADO')}>
              <Ionicons name="close-circle-outline" size={20} color="#d32f2f" style={{marginRight: 5}}/>
              <Text style={styles.btnTextReject}>Rechazar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnApprove]} onPress={() => handleAction('APROBADO')}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#fff" style={{marginRight: 5}}/>
              <Text style={styles.btnTextApprove}>Aprobar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, paddingBottom: 100 },
  
  // Header
  headerCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 20, borderRadius: 12, marginBottom: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#0066CC', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  mainName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  mainRole: { fontSize: 14, color: '#666', marginTop: 2 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, marginTop: 5 },
  badgePending: { backgroundColor: '#fff3cd' },
  badgeOther: { backgroundColor: '#e0e0e0' },
  statusText: { fontSize: 10, fontWeight: 'bold', color: '#856404' },

  // Secciones
  section: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0066CC', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', paddingBottom: 5 },
  
  // Campos
  fieldContainer: { marginBottom: 12 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  label: { fontSize: 12, color: '#888', textTransform: 'uppercase' },
  value: { fontSize: 15, color: '#333', fontWeight: '500' },
  row: { flexDirection: 'row', gap: 15 },

  // Vehículo
  plateContainer: { backgroundColor: '#FFD700', alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 6, borderWidth: 1, borderColor: '#DAA520', marginBottom: 10 },
  plateText: { fontSize: 20, fontWeight: 'bold', color: '#000', letterSpacing: 1 },

  // Documentos
  docLabel: { fontSize: 13, color: '#555', marginBottom: 5, fontWeight: '600' },
  imageWrapper: { borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee', backgroundColor: '#f5f5f5' },
  docImg: { width: '100%', height: 200, resizeMode: 'contain' },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 15, paddingBottom: 30, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#eee', flexDirection: 'row', gap: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  btn: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  btnApprove: { backgroundColor: '#0066CC' },
  btnReject: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d32f2f' },
  btnTextApprove: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnTextReject: { color: '#d32f2f', fontWeight: 'bold', fontSize: 16 },
});