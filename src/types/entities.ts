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