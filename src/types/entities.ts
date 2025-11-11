// Define los posibles estados para evitar errores de tipeo
export type PuertaStatus = "OPEN" | "CLOSED" | "MAINTENANCE";
export type AreaStatus = "OPEN" | "CLOSED" | "FULL" | "EVENT";

export interface Puerta {
  id: string;
  nombre: string;
  status: PuertaStatus;
}

export interface Area {
  id: string;
  nombre: string;
  cuposTotales: number;
  cuposOcupados: number;
  status: AreaStatus;
  mensaje: string; // Ej: "Cerrado por domingo", "Lleno", o ""
  puertas: Puerta[];
}

// Esta es la forma de la respuesta que esperamos de nuestra "API"
export interface ParkingStatusResponse {
  areas: Area[];
}