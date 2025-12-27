export type EstadoPago = 'pendiente' | 'pagado';

/**
 * Modo de edición de un pago
 * - 'monto': el usuario edita el monto directamente
 * - 'porcentaje': el usuario edita el porcentaje
 */
export type ModoEdicion = 'monto' | 'porcentaje';

/**
 * Representa un pago individual dentro de un préstamo
 */
export interface Pago {
  /** Identificador único del pago */
  id: string;
  
  /** Título o nombre descriptivo del pago (ej: "Anticipo", "Pago 1") */
  titulo: string;
  
  /** Monto en la moneda especificada (sin redondear internamente) */
  monto: number;
  
  /** Porcentaje que representa del total (0-100, sin redondear internamente) */
  porcentaje: number;
  
  /** Estado actual del pago */
  estado: EstadoPago;
  
  /** Fecha de vencimiento o fecha en que se debe realizar el pago (formato: YYYY-MM-DD) */
  fechaPago: string;
  
  /** Fecha en que se creó este pago (formato ISO) */
  fechaCreacion: string;
  
  /** Fecha en que se marcó como pagado (opcional, formato ISO) */
  fechaPagado?: string;
}

/**
 * Representa un préstamo completo con sus pagos
 */
export interface Prestamo {
  /** Identificador único del préstamo */
  id: string;
  
  /** Nombre descriptivo del préstamo */
  nombre: string;
  
  /** Monto total del préstamo en la moneda especificada */
  montoTotal: number;
  
  /** Lista ordenada de pagos del préstamo */
  pagos: Pago[];
  
  /** Fecha de creación del préstamo (formato ISO) */
  fechaCreacion: string;
  
  /** Notas adicionales sobre el préstamo (opcional) */
  notas?: string;
}

/**
 * Resultado de una validación
 */
export interface ResultadoValidacion {
  /** Indica si la validación fue exitosa */
  valido: boolean;
  
  /** Mensaje de error si la validación falló */
  mensaje?: string;
}

/**
 * Datos necesarios para crear o actualizar un pago
 */
export interface DatosPago {
  /** Título del pago */
  titulo: string;
  
  /** Monto del pago */
  monto: number;
  
  /** Porcentaje del total */
  porcentaje: number;
  
  /** Fecha del pago */
  fechaPago: string;
}

/**
 * Opciones para insertar un nuevo pago
 */
export interface OpcionesInsercionPago {
  /** Posición donde insertar el pago (índice) */
  posicion: number;
  
  /** Datos del nuevo pago */
  datosPago: DatosPago;
}

/**
 * Información sobre el estado de los porcentajes
 */
export interface EstadoPorcentajes {
  /** Suma total de porcentajes de todos los pagos */
  sumaTotal: number;
  
  /** Porcentaje restante para llegar a 100 */
  restante: number;
  
  /** Indica si la suma es exactamente 100% */
  esValido: boolean;
  
  /** Indica si hay porcentaje disponible para crear nuevos pagos */
  hayDisponible: boolean;
}