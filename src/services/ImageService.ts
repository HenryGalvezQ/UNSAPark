import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

// --- CONFIGURACIÓN CLOUDINARY ---
const CLOUD_NAME = "drcmlbrci"; 
const UPLOAD_PRESET = "ml_default"; 
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

export const pickImage = async (useCamera: boolean = false): Promise<string | null> => {
  try {
    let result;

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true, // ¡CRÍTICO! Necesitamos esto
    };

    if (useCamera) {
      // 1. Permisos de Cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la cámara.');
        return null;
      }
      result = await ImagePicker.launchCameraAsync(options);

    } else {
      // 1. Permisos de Galería
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita acceso a la galería.');
        return null;
      }
      result = await ImagePicker.launchImageLibraryAsync(options);
    }

    if (!result.canceled && result.assets && result.assets.length > 0) {
      // Retornamos el Base64 listo para usar
      // El prefijo es necesario para que <Image source={{uri}} /> funcione en React Native
      // Y también Cloudinary lo acepta si se envía como Data URI
      return `data:image/jpeg;base64,${result.assets[0].base64}`;
    }

  } catch (error) {
    console.error("Error al seleccionar imagen:", error);
    Alert.alert("Error", "No se pudo cargar la imagen.");
  }
  
  return null;
};

export const uploadToCloudinary = async (base64Img: string | null): Promise<string | null> => {
  if (!base64Img) return null;

  // LÓGICA REAL
  // Generamos un nombre limpio, SIN caracteres raros ni rutas
  const fileName = `doc_${Date.now()}`; 

  const data = {
    file: base64Img,
    upload_preset: UPLOAD_PRESET,
    public_id: fileName, // Nombre simple: "doc_174000000"
  };

  try {
    console.log("☁️ Subiendo a Cloudinary...");
    
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });
    
    const json = await response.json();
    
    if (response.ok) {
      console.log("✅ Subida exitosa:", json.secure_url);
      return json.secure_url;
    } else {
      console.error("❌ Error Cloudinary:", JSON.stringify(json));
      // Si falla, intentamos una vez más SIN public_id (dejando que Cloudinary elija el nombre)
      if (json.error) {
         console.log("Reintentando sin nombre personalizado...");
         return uploadToCloudinaryRetry(base64Img);
      }
      return null;
    }
  } catch (error) {
    console.error("❌ Error de red:", error);
    return null;
  }
};

// Función auxiliar de reintento simple
const uploadToCloudinaryRetry = async (base64Img: string): Promise<string | null> => {
  const data = {
    file: base64Img,
    upload_preset: UPLOAD_PRESET,
    // SIN public_id esta vez
  };

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'content-type': 'application/json' },
    });
    const json = await response.json();
    return json.secure_url || null;
  } catch (e) {
    return null;
  }
};