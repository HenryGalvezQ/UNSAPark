import React, { useState } from 'react';
import { 
  View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, 
  Image, ActivityIndicator, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { pickImage, uploadToCloudinary } from '../services/ImageService'; // Asegúrate que este archivo exista
import ParkingService from '../services/ParkingService';
import { UserRequest } from '../types/entities';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type RegisterScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: RegisterScreenProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  // Estados para las URIs locales de las fotos (antes de subir)
  const [localDniUri, setLocalDniUri] = useState<string | null>(null);
  const [localLicenciaUri, setLocalLicenciaUri] = useState<string | null>(null);

  // Estado del formulario completo
  const [form, setForm] = useState<UserRequest>({
    email: '', password: '', nombreCompleto: '', dni: '', telefono: '',
    statusSolicitud: 'PENDIENTE',
    datosPersonales: {
      dependencia: '', cargo: '', fechaIngreso: '', condicionLaboral: 'ESTUDIANTE'
    },
    vehiculo: { marca: '', modelo: '', placa: '', color: '' },
    documentos: { dniUrl: '', licenciaUrl: '' }
  });

  // --- Helpers para actualizar el estado anidado ---
  const updateForm = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const updatePersonal = (key: string, value: string) => setForm(prev => ({ 
    ...prev, datosPersonales: { ...prev.datosPersonales, [key]: value } 
  }));
  const updateVehiculo = (key: string, value: string) => setForm(prev => ({ 
    ...prev, vehiculo: { ...prev.vehiculo, [key]: value } 
  }));

  // --- CAMBIO: Nueva lógica de selección ---
  const handlePhotoRequest = (type: 'dni' | 'licencia') => {
    Alert.alert(
      "Subir Documento",
      "Selecciona una opción",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Tomar Foto", 
          onPress: () => processImage(type, true) // true = Cámara
        },
        { 
          text: "Abrir Galería", 
          onPress: () => processImage(type, false) // false = Galería
        },
      ]
    );
  };

  const processImage = async (type: 'dni' | 'licencia', useCamera: boolean) => {
    // Aquí llamamos a tu servicio actualizado que ya acepta el booleano
    const uri = await pickImage(useCamera); 
    if (uri) {
      if (type === 'dni') setLocalDniUri(uri);
      else setLocalLicenciaUri(uri);
    }
  };
  // ----------------------------------------

  // --- Validar y Enviar ---
  const handleNext = async () => {
    if (step === 1) {
      // Validación básica paso 1
      if (!form.nombreCompleto || !form.dni || !form.email || !form.password || !form.datosPersonales.dependencia) {
        Alert.alert("Campos incompletos", "Por favor completa todos los datos obligatorios.");
        return;
      }
      setStep(2);
    } else {
      // Validación paso 2
      if (!form.vehiculo.placa || !localDniUri || !localLicenciaUri) {
        Alert.alert("Faltan datos", "Debes ingresar la placa y adjuntar ambas fotos.");
        return;
      }

      setLoading(true);
      try {
        // 1. Subir fotos a Cloudinary (o simular subida)
        // Nota: Si ImageService está en modo simulado, devolverá una URL falsa rápido.
        const dniUrl = await uploadToCloudinary(localDniUri);
        const licenciaUrl = await uploadToCloudinary(localLicenciaUri);

        if (!dniUrl || !licenciaUrl) {
          throw new Error("Error al subir las imágenes.");
        }

        // 2. Armar el objeto final
        const finalData: UserRequest = {
          ...form,
          documentos: { dniUrl, licenciaUrl }
        };

        // 3. Enviar al Backend
        const result = await ParkingService.register(finalData);

        if (result.success) {
          Alert.alert("¡Registro Exitoso!", "Tu solicitud ha sido enviada. Espera la aprobación del administrador.", [
            { text: "Entendido", onPress: () => navigation.goBack() }
          ]);
        } else {
          Alert.alert("Error", result.msg || "No se pudo completar el registro.");
        }

      } catch (error) {
        Alert.alert("Error", "Ocurrió un problema de conexión.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  // --- RENDERIZADO DEL PASO 1 ---
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>I. Datos Personales</Text>
      
      <TextInput style={styles.input} placeholder="Apellidos y Nombres" value={form.nombreCompleto} onChangeText={t => updateForm('nombreCompleto', t)} />
      <View style={styles.row}>
        <TextInput style={[styles.input, {flex: 1}]} placeholder="DNI" keyboardType="numeric" value={form.dni} onChangeText={t => updateForm('dni', t)} />
        <TextInput style={[styles.input, {flex: 1, marginLeft: 10}]} placeholder="Teléfono" keyboardType="phone-pad" value={form.telefono} onChangeText={t => updateForm('telefono', t)} />
      </View>

      <Text style={styles.label}>Condición Laboral:</Text>
      <View style={styles.chipsContainer}>
        {['ESTUDIANTE', 'DOCENTE', 'ADMINISTRATIVO'].map((cond) => (
          <TouchableOpacity 
            key={cond} 
            style={[styles.chip, form.datosPersonales.condicionLaboral === cond && styles.chipSelected]}
            onPress={() => updatePersonal('condicionLaboral', cond)}
          >
            <Text style={form.datosPersonales.condicionLaboral === cond ? styles.chipTextSelected : styles.chipText}>{cond}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput style={styles.input} placeholder="Dependencia / Facultad" value={form.datosPersonales.dependencia} onChangeText={t => updatePersonal('dependencia', t)} />
      <TextInput style={styles.input} placeholder="Cargo" value={form.datosPersonales.cargo} onChangeText={t => updatePersonal('cargo', t)} />
      
      <TouchableOpacity style={styles.dateInput} onPress={() => setDatePickerVisible(true)}>
        <Ionicons name="calendar-outline" size={20} color="#666" />
        <Text style={{ marginLeft: 10, color: form.datosPersonales.fechaIngreso ? '#000' : '#999' }}>
          {form.datosPersonales.fechaIngreso || 'Fecha de Ingreso a la UNSA'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Credenciales de Acceso</Text>
      <TextInput style={styles.input} placeholder="Correo Institucional" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={t => updateForm('email', t)} />
      <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={form.password} onChangeText={t => updateForm('password', t)} />

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={(date) => {
          setDatePickerVisible(false);
          updatePersonal('fechaIngreso', date.toISOString().split('T')[0]);
        }}
        onCancel={() => setDatePickerVisible(false)}
      />
    </View>
  );

  // --- RENDERIZADO DEL PASO 2 ---
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.sectionTitle}>II. Datos del Vehículo</Text>
      <TextInput style={styles.input} placeholder="Placa (Ej: V1X-234)" autoCapitalize="characters" value={form.vehiculo.placa} onChangeText={t => updateVehiculo('placa', t)} />
      <View style={styles.row}>
        <TextInput style={[styles.input, {flex:1}]} placeholder="Marca" value={form.vehiculo.marca} onChangeText={t => updateVehiculo('marca', t)} />
        <TextInput style={[styles.input, {flex:1, marginLeft:10}]} placeholder="Modelo" value={form.vehiculo.modelo} onChangeText={t => updateVehiculo('modelo', t)} />
      </View>
      <TextInput style={styles.input} placeholder="Color" value={form.vehiculo.color} onChangeText={t => updateVehiculo('color', t)} />

      <Text style={styles.sectionTitle}>III. Documentos Adjuntos</Text>
      <View style={styles.photoRow}>
        {/* Foto DNI */}
        <TouchableOpacity style={styles.photoBox} onPress={() => handlePhotoRequest('dni')}>
          {localDniUri ? (
            <Image source={{ uri: localDniUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="camera" size={32} color="#ccc" />
              <Text style={styles.photoText}>DNI (Frontal)</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Foto Licencia */}
        <TouchableOpacity style={styles.photoBox} onPress={() => handlePhotoRequest('licencia')}>
          {localLicenciaUri ? (
            <Image source={{ uri: localLicenciaUri }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="card" size={32} color="#ccc" />
              <Text style={styles.photoText}>Licencia</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Solicitud de Registro</Text>
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepActive]}>
              <Text style={styles.stepNumber}>1</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step >= 2 && styles.stepActive]}>
              <Text style={styles.stepNumber}>2</Text>
            </View>
          </View>
        </View>

        {step === 1 ? renderStep1() : renderStep2()}

        <View style={styles.footer}>
          {step === 2 && (
            <TouchableOpacity style={styles.btnSecondary} onPress={() => setStep(1)} disabled={loading}>
              <Text style={styles.btnTextSecondary}>Atrás</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.btnPrimary, step === 1 && { flex: 1 }]} 
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnTextPrimary}>{step === 1 ? "Siguiente" : "Enviar Solicitud"}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f9f9f9', padding: 20 },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0066CC', marginBottom: 15 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  stepDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ddd', alignItems: 'center', justifyContent: 'center' },
  stepActive: { backgroundColor: '#0066CC' },
  stepNumber: { color: '#fff', fontWeight: 'bold' },
  stepLine: { width: 50, height: 3, backgroundColor: '#ddd', marginHorizontal: 5 },
  
  stepContent: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginTop: 10, marginBottom: 15 },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 12, fontSize: 16 },
  row: { flexDirection: 'row' },
  label: { fontSize: 14, color: '#666', marginBottom: 8 },
  chipsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#e0e0e0' },
  chipSelected: { backgroundColor: '#0066CC' },
  chipText: { color: '#555', fontSize: 12 },
  chipTextSelected: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  dateInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 15 },
  
  photoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  photoBox: { width: '48%', aspectRatio: 1.3, backgroundColor: '#e9e9e9', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#ccc', borderStyle: 'dashed' },
  photoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  photoText: { color: '#888', marginTop: 5, fontSize: 12 },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },

  footer: { flexDirection: 'row', gap: 15 },
  btnPrimary: { flex: 2, backgroundColor: '#0066CC', padding: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnSecondary: { flex: 1, backgroundColor: '#fff', padding: 16, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#0066CC' },
  btnTextPrimary: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnTextSecondary: { color: '#0066CC', fontWeight: 'bold', fontSize: 16 },
});