import {
  ParkingStatusResponse,
  Area,
  HistoryItem,
  UserProfile,
  UserRequest,
  AuthResponse
} from '../types/entities';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ParkingService: comunicación con backend.
 * - Guarda token + user en AsyncStorage al login.
 * - getUserProfile lee el user guardado en AsyncStorage (porque no hay /auth/profile).
 * - getLatestMovement / getUserHistory usan la placa del user.
 */

const API_URL = 'https://decapodous-daniela-sidlingly.ngrok-free.dev/api';

// --- MOCK ÁREAS (se mantiene para el mapa si backend no provee) ---
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
      { id: "ing_inde", nombre: "Puerta Independencia", status: "OPEN", latitude: -16.403070, longitude: -71.525817, cuposTotales: 30, cuposOcupados: 28 },
      { id: "ing_vene", nombre: "Puerta Venezuela", status: "MAINTENANCE", latitude: -16.406396, longitude: -71.523213, cuposTotales: 30, cuposOcupados: 0 }
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
      { id: "soc_virg", nombre: "Puerta Virgen del Pilar", status: "OPEN", latitude: -16.405293, longitude: -71.520728, cuposTotales: 30, cuposOcupados: 30 }
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

// -------------------- Auth / Profile utilities --------------------
const STORAGE_TOKEN_KEY = '@unsapark_token';
const STORAGE_USER_KEY = '@unsapark_user';

/**
 * Guarda token y user en AsyncStorage (por login).
 */
const saveAuthToStorage = async (token: string, user: any) => {
  try {
    await AsyncStorage.setItem(STORAGE_TOKEN_KEY, token);
    await AsyncStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.warn("Error saving auth to storage:", e);
  }
};

/**
 * Borra auth (por si quieres logout).
 */
const clearAuthStorage = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_TOKEN_KEY);
    await AsyncStorage.removeItem(STORAGE_USER_KEY);
  } catch (e) {
    console.warn("Error clearing storage:", e);
  }
};

/**
 * Devuelve token si está.
 */
const getTokenFromStorage = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(STORAGE_TOKEN_KEY);
  } catch {
    return null;
  }
};

/**
 * Devuelve el user guardado (o null).
 */
const getUserFromStorage = async (): Promise<UserProfile | null> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Normalizamos a UserProfile shape si hace falta (backend tiene "vehiculo")
    const profile: UserProfile = {
      id: parsed.id || parsed._id || 'u1',
      nombreCompleto: parsed.nombre || parsed.nombreCompleto || '',
      email: parsed.email || '',
      dni: parsed.dni || '',
      tipoUsuario: parsed.role || parsed.tipoUsuario || '',
      codigo: parsed.codigo || '',
      escuela: parsed.escuela || '',
      // Si backend usa "vehiculo" en singular, lo adaptamos a array para la interfaz
      vehiculos: parsed.vehiculo ? [{ placa: parsed.vehiculo.placa || '' , modelo: parsed.vehiculo.modelo || '' }] :
                parsed.vehiculos || []
    };
    return profile;
  } catch (e) {
    console.warn("Error reading user from storage:", e);
    return null;
  }
};

// -------------------- Endpoints --------------------

// LOGIN real: guarda token + user en AsyncStorage
const login = async (email: string, pass: string): Promise<AuthResponse> => {
  try {
    const resp = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await resp.json();
    if (!resp.ok) return { success: false, msg: data?.msg || 'Credenciales inválidas' };

    // backend devuelve user.vehiculo con placa -> guardamos ese user
    await saveAuthToStorage(data.token, data.user);
    return { success: true, token: data.token, user: data.user };

  } catch (e) {
    console.warn("Login error:", e);
    return { success: false, msg: 'No se pudo conectar al servidor' };
  }
};

// REGISTER real (igual que antes)
const register = async (userData: UserRequest): Promise<{ success: boolean; msg?: string }> => {
  try {
    const resp = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const d = await resp.json();
    return resp.ok ? { success: true } : { success: false, msg: d.msg || 'Error' };
  } catch (e) {
    console.warn("Register error:", e);
    return { success: false, msg: 'Error de conexión' };
  }
};

// Obtener perfil desde AsyncStorage (porque no hay /auth/profile)
const getUserProfile = async (): Promise<UserProfile | null> => {
  return await getUserFromStorage();
};

// getParkingStatus (usa mock areas)
const getParkingStatus = async (): Promise<ParkingStatusResponse> => {
  return { areas: MOCK_AREAS };
};

// Último movimiento real: GET /history/latest/:placa
// Si falla o no hay datos -> devuelve null
const getLatestMovement = async (placa: string): Promise<HistoryItem | null> => {
  if (!placa) return null;
  try {
    const token = await getTokenFromStorage();
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${API_URL}/history/latest/${placa}`, { headers });
    if (!resp.ok) {
      // 404 o 204 -> no hay movimiento
      return null;
    }
    const data = await resp.json();
    // Data puede venir con estructura { estacionado: true, ... } o directamente HistoryItem
    // Asumimos que si no está vacío y tiene fechaEntrada, es válido.
    if (!data || Object.keys(data).length === 0) return null;
    // Si backend envía { estacionado: true, item: {...} } manejamos ambos casos
    if (data.item) return data.item;
    return data;
  } catch (e) {
    console.warn("getLatestMovement error:", e);
    return null;
  }
};

// Historial real paginado: GET /history/vehicle/:placa?page=X
const getUserHistory = async (placa: string, page: number = 1): Promise<HistoryItem[]> => {
  if (!placa) return [];
  try {
    const token = await getTokenFromStorage();
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const resp = await fetch(`${API_URL}/history/vehicle/${placa}?page=${page}`, {
      headers,
    });

    if (!resp.ok) {
      console.warn("History response not OK:", resp.status);
      return [];
    }

    const data = await resp.json();

    // backend devolviendo { page, total, totalPages, data: [] }
    if (Array.isArray(data.data)) return data.data;

    // backend devolviendo directamente el array
    if (Array.isArray(data)) return data;

    return [];

  } catch (e) {
    console.warn("getUserHistory error:", e);
    return [];
  }
};

// Admin (sin cambios importantes)
const getPendingRequests = async (): Promise<UserRequest[]> => {
  try {
    const resp = await fetch(`${API_URL}/admin/pending`);
    const d = await resp.json();
    return Array.isArray(d) ? d : [];
  } catch {
    return [];
  }
};

const approveRequest = async (id: string, status: 'APROBADO' | 'RECHAZADO'): Promise<boolean> => {
  try {
    const resp = await fetch(`${API_URL}/admin/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    return resp.ok;
  } catch {
    return false;
  }
};

const ParkingService = {
  login,
  register,
  getUserProfile,
  getParkingStatus,
  getLatestMovement,
  getUserHistory,
  getPendingRequests,
  approveRequest,
  // util:
  clearAuthStorage,
  saveAuthToStorage
};

export default ParkingService;
