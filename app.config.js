import 'dotenv/config'; // Carga las variables de .env al inicio
export default {
  expo: {
    name: "UNSAPark", // El nombre de tu app
    slug: "UNSAPark", // El slug
version: "1.0.0",
    orientation: "portrait",
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      // Aquí leemos la clave para iOS
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
      },
      infoPlist: {
        NSLocationWhenInUseUsageDescription: "Necesitamos tu ubicación para trazar la ruta al estacionamiento."
      }
    },
    android: {
      // Aquí leemos la clave para Android
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
        }
      },
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ]
    },
  }
}