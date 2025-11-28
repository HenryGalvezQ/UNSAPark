export type PuertaStatus = "OPEN" | "CLOSED" | "MAINTENANCE";
export type AreaStatus = "OPEN" | "CLOSED" | "FULL" | "EVENT";

export interface Puerta {
  id: string;
  nombre: string;
  status: PuertaStatus;
  latitude: number;
  longitude: number;
  cuposTotales: number;  
  cuposOcupados: number; 
}

export interface Area {
  id: string;
  nombre: string;
  status: AreaStatus;
  mensaje: string; 
  puertas: Puerta[];
  
  // --- cuposTotales y cuposOcupados se han ELIMINADO de aquí ---
  
  // Coordenadas para centrar el mapa
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// ... (El resto del archivo: ParkingStatusResponse, HistoryItem, UserProfile, etc. no cambia)
export interface ParkingStatusResponse {
  areas: Area[];
}
export interface HistoryItem {
  id: string;
  area: string;
  puerta: string;
  placa: string;
  fechaEntrada: string;
  fechaSalida: string | null;
}
export interface Vehiculo {
  placa: string;
  modelo: string;
}
export interface UserProfile {
  id: string;
  nombreCompleto: string;
  email: string;
  dni: string;
  tipoUsuario: string;
  codigo: string;
  escuela: string;
  vehiculos: Vehiculo[];
}

// ... (Mantén tus tipos Puerta, Area, HistoryItem existentes)

export type CondicionLaboral = 'DOCENTE' | 'ADMINISTRATIVO' | 'CAS' | 'ESTUDIANTE' | 'OTRO';
export type StatusSolicitud = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

// Interfaz para el Registro y el Admin
export interface UserRequest {
  _id?: string;
  email: string;
  password?: string;
  nombreCompleto: string;
  dni: string;
  telefono: string;
  role?: 'USER' | 'ADMIN';
  datosPersonales: {
    dependencia: string;
    cargo: string;
    fechaIngreso: string; // En frontend usamos string para fechas
    condicionLaboral: CondicionLaboral;
  };

  vehiculo: {
    marca: string;
    modelo: string;
    placa: string;
    color: string;
  };

  documentos: {
    dniUrl: string;
    licenciaUrl: string;
  };

  statusSolicitud: StatusSolicitud;
}

// Interfaz corregida para la respuesta del Login
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    nombre: string;
    email: string;
    role: 'USER' | 'ADMIN'; // <--- NUEVO
    status: StatusSolicitud; // <--- CAMBIO AQUÍ: Se llama 'status', no 'statusSolicitud'
    vehiculo: any;
  };
  msg?: string;
}