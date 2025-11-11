import React, { useState } from 'react';
import { 
  View, Text, TextInput, Button, StyleSheet, 
  TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform
} from 'react-native';
import ParkingService from '../services/ParkingService'; // Importamos el servicio
import { Ionicons } from '@expo/vector-icons'; // Para el ícono

// Simulación de 'props' de navegación
type LoginScreenProps = {
  onLogin: () => void; // Función que pasaremos para "iniciar sesión"
};

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  // Estados para guardar los datos del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Estado para mostrar un "cargando..." mientras validamos
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  // Función que se llama al presionar "Ingresar"
  const handleLoginPress = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingrese su correo y contraseña.');
      return;
    }

    setIsLoading(true); // Mostrar "cargando"

    try {
      // Llamamos a nuestra API simulada
      const exito = await ParkingService.login(email, password);

      if (exito) {
        // Si el login es exitoso, llamamos a la función onLogin
        // que nos pasó App.tsx para cambiar de pantalla.
        onLogin();
      } else {
        // Si no, mostramos un error
        Alert.alert('Error', 'Correo o contraseña incorrectos.');
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un problema de conexión.');
    } finally {
      setIsLoading(false); // Ocultar "cargando"
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    // KeyboardAvoidingView evita que el teclado tape los inputs
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
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
          onChangeText={setEmail} // Actualiza el estado 'email'
          keyboardType="email-address" // Muestra teclado para email
          autoCapitalize="none" // Desactiva mayúsculas automáticas
          autoCorrect={false}
        />
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.inputPassword}
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            // El 'secureTextEntry' ahora depende del estado
            secureTextEntry={!isPasswordVisible}
          />
          <TouchableOpacity 
            style={styles.eyeIcon} 
            onPress={togglePasswordVisibility}
          >
            <Ionicons 
              // Cambia el ícono dependiendo del estado
              name={isPasswordVisible ? 'eye-off' : 'eye'} 
              size={24} 
              color="#555" 
            />
          </TouchableOpacity>
        </View>

        {/* Usamos un TouchableOpacity para un botón más bonito */}
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleLoginPress}
          disabled={isLoading} // Deshabilita el botón si está cargando
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0066CC',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
    marginBottom: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  inputPassword: {
    flex: 1, // El input toma todo el espacio
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    fontSize: 16,
  },
  eyeIcon: {
    padding: 12, // Área táctil para el ícono
  },
  button: {
    backgroundColor: '#0066CC',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});