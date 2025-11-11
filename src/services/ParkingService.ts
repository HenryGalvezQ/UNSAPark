import {
  ParkingStatusResponse,
  Area,
  HistoryItem,
  UserProfile,
  Vehiculo
} from '../types/entities';

// --- ESTOS SON TUS DATOS ESTÁTICOS ---
const MOCK_AREAS: Area[] = [
  {
    id: "ing",
    nombre: "Área Ingenierías",
    status: "OPEN",
    mensaje: "",
    latitude: -16.404767,
    longitude: -71.525237,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
    puertas: [
      { id: "ing_pauc", nombre: "Puerta Paucarpata", status: "OPEN", latitude: -16.404937, longitude: -71.526682, cuposTotales: 30, cuposOcupados: 12 },
      { id: "ing_inde", nombre: "Puerta Independencia", status: "OPEN", latitude: -16.403070, longitude: -71.525817, cuposTotales: 30, cuposOcupados: 28 }, // Casi llena
      { id: "ing_vene", nombre: "Puerta Venezuela", status: "MAINTENANCE", latitude: -16.406396, longitude: -71.523213, cuposTotales: 30, cuposOcupados: 0 } // Cerrada
    ]
  },
  {
    id: "soc",
    nombre: "Área Sociales",
    status: "OPEN",
    mensaje: "Pocos cupos disponibles",
    latitude: -16.405293,
    longitude: -71.520728,
    latitudeDelta: 0.003,
    longitudeDelta: 0.003,
    puertas: [
      { id: "soc_virg", nombre: "Puerta Virgen del Pilar", status: "OPEN", latitude: -16.405293, longitude: -71.520728, cuposTotales: 30, cuposOcupados: 30 } // Llena
    ]
  },
  {
    id: "bio",
    nombre: "Área Biomédicas",
    status: "CLOSED",
    mensaje: "Cerrado por domingo",
    latitude: -16.413125,
    longitude: -71.534364,
    latitudeDelta: 0.004,
    longitudeDelta: 0.004,
    puertas: [
      { id: "bio_virg", nombre: "Puerta Virgen del Pilar", status: "CLOSED", latitude: -16.411713, longitude: -71.534411, cuposTotales: 30, cuposOcupados: 0 },
      { id: "bio_alc", nombre: "Puerta Daniel Alcides", status: "CLOSED", latitude: -16.414537, longitude: -71.534316, cuposTotales: 30, cuposOcupados: 0 }
    ]
  }
];
// --- FIN DE DATOS ESTÁTICOS ---

// --- MOCK HISTORIAL ---
const ALL_MOCK_HISTORY: HistoryItem[] = [
  { id: "1", area: "Ingenierías", puerta: "Puerta Paucarpata", placa: "V1X-234", fechaEntrada: "2025-11-11 14:30", fechaSalida: null },
  { id: "2", area: "Sociales", puerta: "Virgen del Pilar", placa: "V1X-234", fechaEntrada: "2025-11-10 09:15", fechaSalida: "2025-11-10 11:20" },
  { id: "3", area: "Biomédicas", puerta: "Daniel Alcides", placa: "A9B-567", fechaEntrada: "2025-11-09 11:00", fechaSalida: "2025-11-09 13:00" },
  { id: "4", area: "Ingenierías", puerta: "Independencia", placa: "V1X-234", fechaEntrada: "2025-11-09 08:00", fechaSalida: "2025-11-09 10:30" },
  { id: "5", area: "Ingenierías", puerta: "Paucarpata", placa: "V1X-234", fechaEntrada: "2025-11-07 10:00", fechaSalida: "2025-11-07 12:00" },
  { id: "6", area: "Sociales", puerta: "Virgen del Pilar", placa: "A9B-567", fechaEntrada: "2025-11-07 09:30", fechaSalida: "2025-11-07 11:30" },
  { id: "7", area: "Biomédicas", puerta: "Virgen del Pilar", placa: "V1X-234", fechaEntrada: "2025-11-05 15:00", fechaSalida: "2025-11-05 17:00" },
  { id: "8", area: "Ingenierías", puerta: "Venezuela", placa: "V1X-234", fechaEntrada: "2025-11-05 10:10", fechaSalida: "2025-11-05 12:00" },
  { id: "9", area: "Sociales", puerta: "Virgen del Pilar", placa: "A9B-567", fechaEntrada: "2025-11-04 09:00", fechaSalida: "2025-11-04 18:00" },
  { id: "10", area: "Ingenierías", puerta: "Paucarpata", placa: "V1X-234", fechaEntrada: "2025-11-01 10:00", fechaSalida: "2025-11-01 12:00" },
];

// --- MOCK PERFIL ---
const MOCK_USER_PROFILE: UserProfile = {
  id: "u1",
  nombreCompleto: "Juan Pérez García",
  email: "correo@gmail.com",
  dni: "12345678",
  tipoUsuario: "Estudiante",
  codigo: "2020-12345",
  escuela: "Ingeniería de Sistemas",
  vehiculos: [
    { placa: "V1X-234", modelo: "Toyota Corolla" },
    { placa: "A9B-567", modelo: "Honda Civic" }
  ]
};

// --- FUNCIONES DEL SERVICIO ---

const getParkingStatus = (): Promise<ParkingStatusResponse> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({ areas: MOCK_AREAS });
    }, 500);
  });
};

const login = (email: string, password: string): Promise<boolean> => {
  return new Promise(resolve => {
    setTimeout(() => {
      // Lógica de simulación actualizada:
      const loginExitoso = (
        email.toLowerCase() === "correo@gmail.com" && 
        password === "contraseña123"
      );
      resolve(loginExitoso);
    }, 1000);
  });
};

// Definimos los tipos de filtro
type HistoryFilter = 'today' | 'week' | 'month'| 'all';
// --- 2. ACTUALIZAMOS getUserHistory PARA PAGINACIÓN ---
const PAGE_SIZE = 5; // Diremos que nuestra API devuelve 5 items a la vez

/**
 * Simula la obtención del historial de un usuario, por páginas y con filtro.
 */
const getUserHistory = (
  page: number = 1,
  // El filtro puede ser un string o una fecha específica
  filter: HistoryFilter | Date = 'all'
): Promise<HistoryItem[]> => {
  
  return new Promise(resolve => {
    setTimeout(() => {
      // --- 1. Usamos la fecha real del sistema ---
      const now = new Date(); 
      // NOTA: Para probar con tus datos MOCK, temporalmente cambia 'now' por:
      // const now = new Date('2025-11-10T10:00:00');

      const filteredHistory = ALL_MOCK_HISTORY.filter(item => {
        const itemDate = new Date(item.fechaEntrada);
        
        // --- 2. Lógica de Filtro Actualizada ---
        if (filter === 'all') {
          return true; // No filtra nada, devuelve todos
        }
        if (filter instanceof Date) {
          // Filtro de calendario: compara solo el día
          return itemDate.toDateString() === filter.toDateString();
        }
        if (filter === 'today') {
          return itemDate.toDateString() === now.toDateString();
        }
        if (filter === 'week') {
          const lastWeek = new Date(now);
          lastWeek.setDate(now.getDate() - 7);
          // Aseguramos que solo cuente hasta "hoy"
          return itemDate >= lastWeek && itemDate <= now;
        }
        if (filter === 'month') {
          return itemDate.getMonth() === now.getMonth() && 
                 itemDate.getFullYear() === now.getFullYear();
        }
        return true;
      });
      // --- Fin Lógica de Filtro ---

      const start = (page - 1) * PAGE_SIZE;
      const end = page * PAGE_SIZE;
      resolve(filteredHistory.slice(start, end));
    }, 700);
  });
};

const getUserProfile = (): Promise<UserProfile> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(MOCK_USER_PROFILE);
    }, 300);
  });
};
// --- 2. NUEVA FUNCIÓN ---
/**
 * Simula la obtención del último movimiento (esté activo o finalizado)
 */
const getLatestMovement = (): Promise<HistoryItem | null> => {
  return new Promise(resolve => {
    // Retraso corto
    setTimeout(() => {
      if (ALL_MOCK_HISTORY.length > 0) {
        resolve(ALL_MOCK_HISTORY[0]); // Devuelve el item más reciente
      } else {
        resolve(null);
      }
    }, 400); 
  });
};
// --- FIN NUEVA FUNCIÓN ---

// --- EXPORTACIÓN ---
const ParkingService = {
  getParkingStatus,
  login,
  getUserHistory,
  getUserProfile,
  getLatestMovement,
};

export default ParkingService;