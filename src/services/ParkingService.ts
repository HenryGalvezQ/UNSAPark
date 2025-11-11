// Importamos las interfaces que acabamos de definir
import { ParkingStatusResponse, Area, HistoryItem,UserProfile,Vehiculo } from '../types/entities'; // <-- 1. Añadimos HistoryItem

// --- ESTOS SON TUS DATOS ESTÁTICOS ---
const MOCK_AREAS: Area[] = [
  // ... (tus áreas no cambian)
  {
    id: "ing",
    nombre: "Área Ingenierías",
    cuposTotales: 50,
    cuposOcupados: 22,
    status: "OPEN",
    mensaje: "",
    puertas: [
      { id: "ing_pauc", nombre: "Puerta Paucarpata", status: "OPEN" },
      { id: "ing_inde", nombre: "Puerta Independencia", status: "OPEN" },
      { id: "ing_vene", nombre: "Puerta Venezuela", status: "MAINTENANCE" }
    ]
  },
  {
    id: "soc",
    nombre: "Área Sociales",
    cuposTotales: 50,
    cuposOcupados: 48,
    status: "OPEN",
    mensaje: "Pocos cupos disponibles",
    puertas: [
      { id: "soc_vene", nombre: "Puerta Venezuela", status: "OPEN" }
    ]
  },
  {
    id: "bio",
    nombre: "Área Biomédicas",
    cuposTotales: 50,
    cuposOcupados: 0,
    status: "CLOSED",
    mensaje: "Cerrado por domingo",
    puertas: [
      { id: "bio_virg", nombre: "Puerta Virgen del Pilar", status: "CLOSED" },
      { id: "bio_alc", nombre: "Puerta Daniel Alcides", status: "CLOSED" }
    ]
  }
];
// --- FIN DE DATOS ESTÁTICOS ---


// --- 2. AÑADIMOS DATOS FALSOS DE HISTORIAL ---
const MOCK_HISTORY: HistoryItem[] = [
  {
    id: "1",
    area: "Ingenierías",
    puerta: "Puerta Paucarpata",
    placa: "V1X-234",
    fechaEntrada: "2025-11-10 08:30",
    fechaSalida: "2025-11-10 14:45",
  },
  {
    id: "2",
    area: "Sociales",
    puerta: "Puerta Venezuela",
    placa: "V1X-234",
    fechaEntrada: "2025-11-09 09:15",
    fechaSalida: "2025-11-09 16:20",
  },
  {
    id: "3",
    area: "Biomédicas",
    puerta: "Puerta Virgen del Pilar",
    placa: "V1X-234",
    fechaEntrada: "2025-11-08 07:45",
    fechaSalida: "2025-11-08 13:30",
  }
];
// --- FIN DE DATOS DE HISTORIAL ---

// --- 2. AÑADIMOS DATOS FALSOS DE PERFIL ---
const MOCK_USER_PROFILE: UserProfile = {
  id: "u1",
  nombreCompleto: "Juan Pérez García",
  dni: "12345678", // Coincide con el login
  tipoUsuario: "Estudiante",
  codigo: "2020-12345",
  escuela: "Ingeniería de Sistemas",
  vehiculos: [
    { placa: "V1X-234", modelo: "Toyota Corolla" },
    { placa: "A9B-567", modelo: "Honda Civic" }
  ]
};
// --- FIN DE DATOS DE PERFIL ---

/**
 * Obtiene el estado de todos los estacionamientos.
 * Finge una llamada a la API.
 */
const getParkingStatus = (): Promise<ParkingStatusResponse> => {
  // ... (código no cambia)
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ areas: MOCK_AREAS });
    }, 500);
  });
};

/**
 * Simula una llamada a la API de autenticación.
 */
const login = (dni: string, password: string): Promise<boolean> => {
  // ... (código no cambia)
  return new Promise(resolve => {
    setTimeout(() => {
      const loginExitoso = (dni === "12345678" && password === "admin");
      resolve(loginExitoso);
    }, 1000);
  });
};


// --- 3. AÑADIMOS LA NUEVA FUNCIÓN ---
/**
 * Simula la obtención del historial de un usuario.
 */
const getUserHistory = (): Promise<HistoryItem[]> => {
  return new Promise(resolve => {
    // Simulamos un retraso de 700ms
    setTimeout(() => {
      resolve(MOCK_HISTORY);
    }, 700);
  });
};
// --- FIN DE NUEVA FUNCIÓN ---

/**
 * Simula la obtención del perfil del usuario.
 */
const getUserProfile = (): Promise<UserProfile> => {
  return new Promise(resolve => {
    // Simulamos un retraso corto (los datos del perfil suelen ser rápidos)
    setTimeout(() => {
      resolve(MOCK_USER_PROFILE);
    }, 300);
  });
};

// Exportamos un objeto con todas las funciones del servicio
const ParkingService = {
  getParkingStatus,
  login,
  getUserHistory,
  getUserProfile, // <-- 4. Añadimos la función a la exportación
};

export default ParkingService;