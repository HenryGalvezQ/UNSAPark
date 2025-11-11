import { Area, Puerta } from './entities'; // Importamos el tipo 'Area'

/**
 * Esta es la lista de todas las pantallas en nuestro Stack.Navigator
 * y los parámetros que cada una espera.
 * * 'undefined' significa que no espera parámetros.
 */
export type RootStackParamList = {
  Login: undefined;
  MainApp: undefined; // Esta es la pantalla que contiene las PESTAÑAS
  AreaDetail: { area: Area }; // Esta pantalla REQUIERE un objeto 'area';
  RouteMap: { puerta: Puerta };
};