import type { Prestamo } from '../types';
import { 
  CLAVE_STORAGE_PRESTAMOS, 
  CLAVE_STORAGE_PRESTAMO_SELECCIONADO 
} from '../constants';

/**
 * Guarda todos los préstamos en localStorage
 * 
 * @param prestamos - Array de préstamos a guardar
 * 
 * Por qué manejamos errores:
 * - localStorage puede estar deshabilitado
 * - Puede estar lleno (límite de ~5-10MB)
 * - Puede fallar por restricciones del navegador
 */
export const guardarPrestamos = (prestamos: Prestamo[]): void => {
  try {
    const datosJSON = JSON.stringify(prestamos);
    localStorage.setItem(CLAVE_STORAGE_PRESTAMOS, datosJSON);
  } catch (error) {
    console.error('Error al guardar préstamos en localStorage:', error);
    // @todo: Mostrar notificación al usuario de que no se pudo guardar
  }
};

/**
 * Carga todos los préstamos desde localStorage
 * 
 * @returns Array de préstamos o array vacío si no hay datos
 */
export const cargarPrestamos = (): Prestamo[] => {
  try {
    const datosJSON = localStorage.getItem(CLAVE_STORAGE_PRESTAMOS);
    
    if (!datosJSON) {
      return [];
    }
    
    const prestamos = JSON.parse(datosJSON) as Prestamo[];
    return prestamos;
  } catch (error) {
    console.error('Error al cargar préstamos desde localStorage:', error);
    return [];
  }
};

/**
 * Guarda un préstamo individual (actualiza o agrega)
 * 
 * @param prestamo - Préstamo a guardar
 * 
 * Por qué actualizamos todo el array:
 * - localStorage solo guarda strings
 * - Necesitamos serializar todo el array completo
 * - Es la forma más simple y confiable
 */
export const guardarPrestamo = (prestamo: Prestamo): void => {
  try {
    const prestamosExistentes = cargarPrestamos();
    const indice = prestamosExistentes.findIndex(p => p.id === prestamo.id);
    
    if (indice >= 0) {
      // Actualizar préstamo existente
      prestamosExistentes[indice] = prestamo;
    } else {
      // Agregar nuevo préstamo
      prestamosExistentes.push(prestamo);
    }
    
    guardarPrestamos(prestamosExistentes);
    // @todo: api post/put para guardar préstamo en el servidor
  } catch (error) {
    console.error('Error al guardar préstamo:', error);
  }
};

/**
 * Elimina un préstamo del almacenamiento
 * 
 * @param idPrestamo - ID del préstamo a eliminar
 * @returns true si se eliminó, false si no se encontró
 */
export const eliminarPrestamo = (idPrestamo: string): boolean => {
  try {
    const prestamosExistentes = cargarPrestamos();
    const prestamosActualizados = prestamosExistentes.filter(p => p.id !== idPrestamo);
    
    if (prestamosActualizados.length === prestamosExistentes.length) {
      // No se encontró el préstamo
      return false;
    }
    
    guardarPrestamos(prestamosActualizados);
    // @todo: api delete para eliminar préstamo del servidor
    return true;
  } catch (error) {
    console.error('Error al eliminar préstamo:', error);
    return false;
  }
};

/**
 * Guarda el ID del préstamo seleccionado actualmente
 * 
 * @param idPrestamo - ID del préstamo seleccionado
 * 
 * Por qué guardamos esto por separado:
 * - Queremos recordar qué préstamo estaba viendo el usuario
 * - Al recargar la página, volver a mostrar el mismo préstamo
 */
export const guardarPrestamoSeleccionado = (idPrestamo: string): void => {
  try {
    localStorage.setItem(CLAVE_STORAGE_PRESTAMO_SELECCIONADO, idPrestamo);
  } catch (error) {
    console.error('Error al guardar préstamo seleccionado:', error);
  }
};

/**
 * Carga el ID del préstamo seleccionado
 * 
 * @returns ID del préstamo o null si no hay ninguno guardado
 */
export const cargarPrestamoSeleccionado = (): string | null => {
  try {
    return localStorage.getItem(CLAVE_STORAGE_PRESTAMO_SELECCIONADO);
  } catch (error) {
    console.error('Error al cargar préstamo seleccionado:', error);
    return null;
  }
};

/**
 * Limpia todos los datos del almacenamiento
 * Útil para resetear la aplicación o en caso de errores
 */
export const limpiarAlmacenamiento = (): void => {
  try {
    localStorage.removeItem(CLAVE_STORAGE_PRESTAMOS);
    localStorage.removeItem(CLAVE_STORAGE_PRESTAMO_SELECCIONADO);
  } catch (error) {
    console.error('Error al limpiar almacenamiento:', error);
  }
};

/**
 * Verifica si localStorage está disponible
 * 
 * @returns true si está disponible, false si no
 * 
 * Por qué verificamos esto:
 * - Algunos navegadores pueden deshabilitarlo
 * - Modo incógnito puede tener restricciones
 * - Mejor verificar antes de intentar usar
 */
export const esAlmacenamientoDisponible = (): boolean => {
  try {
    const test = '__test_storage__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Obtiene un préstamo específico por su ID
 * 
 * @param idPrestamo - ID del préstamo a buscar
 * @returns Préstamo encontrado o null si no existe
 */
export const obtenerPrestamoPorId = (idPrestamo: string): Prestamo | null => {
  try {
    const prestamos = cargarPrestamos();
    return prestamos.find(p => p.id === idPrestamo) || null;
  } catch (error) {
    console.error('Error al obtener préstamo por ID:', error);
    return null;
  }
};