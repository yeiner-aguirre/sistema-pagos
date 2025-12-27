import type { Pago, ResultadoValidacion } from '../types';
import { 
  PORCENTAJE_TOTAL, 
  MARGEN_ERROR_PORCENTAJE,
  MENSAJES_VALIDACION 
} from '../constants';
import { calcularPorcentajeTotal } from './calculos';

/**
 * Valida que la suma de porcentajes de todos los pagos sea exactamente 100%
 * Usa un margen de error para compensar problemas de precisión con flotantes
 * 
 * @param pagos - Array de pagos a validar
 * @returns true si la suma es 100% (con margen de error), false si no
 * 
 * Por qué usamos margen de error:
 * - Los números flotantes pueden tener imprecisiones
 * - 0.1 + 0.2 no siempre da exactamente 0.3 en JavaScript
 * - El margen de error nos protege de estos problemas
 */
export const validarSumaPorcentajes = (pagos: Pago[]): boolean => {
  const sumaTotal = calcularPorcentajeTotal(pagos);
  const diferencia = Math.abs(sumaTotal - PORCENTAJE_TOTAL);
  
  return diferencia <= MARGEN_ERROR_PORCENTAJE;
};

/**
 * Valida que una fecha no sea anterior a otra fecha
 * Se usa para asegurar que los pagos mantengan orden cronológico
 * 
 * @param fecha - Fecha a validar (formato YYYY-MM-DD)
 * @param fechaMinima - Fecha mínima permitida (formato YYYY-MM-DD)
 * @returns ResultadoValidacion con el resultado y mensaje
 */
export const validarFechaSecuencial = (
  fecha: string, 
  fechaMinima: string
): ResultadoValidacion => {
  const fechaDate = new Date(fecha + 'T00:00:00');
  const fechaMinimaDate = new Date(fechaMinima + 'T00:00:00');
  
  if (fechaDate < fechaMinimaDate) {
    return {
      valido: false,
      mensaje: MENSAJES_VALIDACION.FECHA_ANTERIOR
    };
  }
  
  return { valido: true };
};

/**
 * Valida si un pago puede ser marcado como pagado
 * Regla: Solo se puede pagar si el pago anterior ya está pagado
 * 
 * @param indice - Índice del pago en el array
 * @param pagos - Array completo de pagos
 * @returns ResultadoValidacion con el resultado y mensaje
 */
export const validarPuedePagar = (
  indice: number, 
  pagos: Pago[]
): ResultadoValidacion => {
  // El primer pago siempre se puede pagar
  if (indice === 0) {
    return { valido: true };
  }
  
  // Verificar que el pago anterior esté pagado
  const pagoAnterior = pagos[indice - 1];
  
  if (pagoAnterior.estado === 'pendiente') {
    return {
      valido: false,
      mensaje: MENSAJES_VALIDACION.NO_PUEDE_PAGAR
    };
  }
  
  return { valido: true };
};

/**
 * Valida si un pago puede ser editado
 * Regla: No se pueden editar pagos que ya están pagados
 * 
 * @param pago - Pago a validar
 * @returns ResultadoValidacion con el resultado y mensaje
 */
export const validarPuedeEditarPago = (pago: Pago): ResultadoValidacion => {
  if (pago.estado === 'pagado') {
    return {
      valido: false,
      mensaje: MENSAJES_VALIDACION.NO_PUEDE_EDITAR
    };
  }
  
  return { valido: true };
};

/**
 * Valida que un monto sea válido
 * Reglas: Debe ser mayor a 0 y no exceder el total disponible
 * 
 * @param monto - Monto a validar
 * @param montoDisponible - Monto máximo disponible
 * @returns ResultadoValidacion con el resultado y mensaje
 */
export const validarMontoValido = (
  monto: number,
  montoDisponible: number
): ResultadoValidacion => {
  if (monto <= 0) {
    return {
      valido: false,
      mensaje: MENSAJES_VALIDACION.MONTO_INVALIDO
    };
  }
  
  if (monto > montoDisponible) {
    return {
      valido: false,
      mensaje: `El monto no puede exceder ${montoDisponible}`
    };
  }
  
  return { valido: true };
};

/**
 * Valida que un porcentaje sea válido
 * Reglas: Debe estar entre 0 y 100, y no exceder el porcentaje disponible
 * 
 * @param porcentaje - Porcentaje a validar (0-100)
 * @param porcentajeDisponible - Porcentaje máximo disponible
 * @returns ResultadoValidacion con el resultado y mensaje
 */
export const validarPorcentajeValido = (
  porcentaje: number,
  porcentajeDisponible: number
): ResultadoValidacion => {
  if (porcentaje <= 0 || porcentaje > PORCENTAJE_TOTAL) {
    return {
      valido: false,
      mensaje: MENSAJES_VALIDACION.PORCENTAJE_INVALIDO
    };
  }
  
  if (porcentaje > porcentajeDisponible) {
    return {
      valido: false,
      mensaje: MENSAJES_VALIDACION.PORCENTAJE_EXCEDIDO
    };
  }
  
  return { valido: true };
};

/**
 * Valida que una fecha no esté vacía
 * 
 * @param fecha - Fecha a validar
 * @returns ResultadoValidacion con el resultado y mensaje
 */
export const validarFechaRequerida = (fecha: string): ResultadoValidacion => {
  if (!fecha || fecha.trim() === '') {
    return {
      valido: false,
      mensaje: MENSAJES_VALIDACION.FECHA_REQUERIDA
    };
  }
  
  return { valido: true };
};

/**
 * Valida si hay porcentaje disponible para crear nuevos pagos
 * 
 * @param pagos - Array de pagos existentes
 * @returns true si hay porcentaje disponible, false si no
 */
export const hayPorcentajeDisponible = (pagos: Pago[]): boolean => {
  const sumaTotal = calcularPorcentajeTotal(pagos);
  return sumaTotal < PORCENTAJE_TOTAL - MARGEN_ERROR_PORCENTAJE;
};

/**
 * Valida si se puede eliminar un pago
 * Reglas: No se puede eliminar si es el único pago o si ya está pagado
 * 
 * @param pago - Pago a eliminar
 * @param totalPagos - Cantidad total de pagos
 * @returns ResultadoValidacion con el resultado y mensaje
 */
export const validarPuedeEliminarPago = (
  pago: Pago,
  totalPagos: number
): ResultadoValidacion => {
  if (totalPagos === 1) {
    return {
      valido: false,
      mensaje: 'No puedes eliminar el único pago'
    };
  }
  
  if (pago.estado === 'pagado') {
    return {
      valido: false,
      mensaje: 'No puedes eliminar un pago que ya está pagado'
    };
  }
  
  return { valido: true };
};

/**
 * Valida todos los aspectos de un pago antes de guardarlo
 * 
 * @param monto - Monto del pago
 * @param porcentaje - Porcentaje del pago
 * @param fecha - Fecha del pago
 * @param fechaMinima - Fecha mínima permitida
 * @param montoDisponible - Monto disponible
 * @param porcentajeDisponible - Porcentaje disponible
 * @returns ResultadoValidacion con el resultado y mensaje
 */
export const validarPagoCompleto = (
  monto: number,
  porcentaje: number,
  fecha: string,
  fechaMinima: string,
  montoDisponible: number,
  porcentajeDisponible: number
): ResultadoValidacion => {
  // Validar fecha requerida
  const validacionFecha = validarFechaRequerida(fecha);
  if (!validacionFecha.valido) return validacionFecha;
  
  // Validar fecha secuencial
  const validacionFechaSecuencial = validarFechaSecuencial(fecha, fechaMinima);
  if (!validacionFechaSecuencial.valido) return validacionFechaSecuencial;
  
  // Validar monto
  const validacionMonto = validarMontoValido(monto, montoDisponible);
  if (!validacionMonto.valido) return validacionMonto;
  
  // Validar porcentaje
  const validacionPorcentaje = validarPorcentajeValido(porcentaje, porcentajeDisponible);
  if (!validacionPorcentaje.valido) return validacionPorcentaje;
  
  return { valido: true };
};