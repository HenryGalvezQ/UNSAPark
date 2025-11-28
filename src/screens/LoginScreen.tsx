import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, 
  TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import ParkingService from '../services/ParkingService'; 
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

// 1. CORRECCIÓN DE TIPO: onLogin ahora recibe el rol
type LoginScreenProps = {
  onLogin: (role: 'USER' | 'ADMIN') => void;
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLoginPress = async () => {
    console.log("🔵 Iniciando proceso de login...");

    if (!email || !password) {
      Alert.alert('Atención', 'Por favor, ingrese correo y contraseña.');
      return;
    }

    setIsLoading(true);

    try {
      console.log(`📡 Consultando API para: ${email}`);
      const result = await ParkingService.login(email, password);
      console.log("🟢 Respuesta API:", JSON.stringify(result, null, 2));

      if (result.success && result.user) {
        const { role, status } = result.user; // Obtenemos el rol y el status
        console.log(`🧐 Estado del usuario: ${status}`);
        console.log('rol del usuario:', role);
        // CASO A: ES ADMINISTRADOR
        if (role === 'ADMIN') {
          onLogin('ADMIN'); // <--- ENVIAMOS 'ADMIN' PARA QUE APP.TSX LO SEPA
          return;
        }
        // CASO B: ES USUARIO NORMAL (Verificar aprobación)
        if (status === 'APROBADO') {
          onLogin('USER'); // <--- ENVIAMOS 'USER'
        } else if (status === 'PENDIENTE') {
          Alert.alert("En Revisión", "Tu solicitud aún no ha sido aprobada por el administrador.");
        }
        else if (status === 'RECHAZADO') {
          console.log("❌ Usuario RECHAZADO.");
          Alert.alert("Solicitud Rechazada", "Contacta a soporte.");
        }

      } else {
        console.log("🔴 Login fallido:", result.msg);
        Alert.alert('Error de Acceso', result.msg || 'Credenciales incorrectas');
      }
    } catch (error) {
      console.error("💥 Error Crítico:", error);
      Alert.alert('Error', 'Problema de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <View style={styles.logoContainer}>
        <Ionicons name="car-sport" size={64} color="#0066CC" />
        <Text style={styles.title}>UNSA Park</Text>
        <Text style={styles.subtitle}>Gestión de Estacionamiento</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={24} color="#555" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLoginPress} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Ingresar</Text>}
        </TouchableOpacity>

        <View style={styles.linksContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>¿No tienes cuenta? <Text style={styles.linkBold}>Regístrate aquí</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#f5f5f5', padding: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#0066CC', marginTop: 16 },
  subtitle: { fontSize: 18, color: '#555' },
  formContainer: { width: '100%' },
  input: { backgroundColor: '#ffffff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd', fontSize: 16, marginBottom: 16 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', marginBottom: 16 },
  inputPassword: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16 },
  eyeIcon: { padding: 12 },
  button: { backgroundColor: '#0066CC', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
  linksContainer: { marginTop: 25, alignItems: 'center', gap: 15 },
  linkText: { color: '#555', fontSize: 15 }
});