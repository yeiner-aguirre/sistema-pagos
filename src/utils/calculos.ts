import type { Pago } from '../types';
import { PORCENTAJE_TOTAL, PRECISION_CALCULOS } from '../constants';

/**
 * Redondea un número a la precisión especificada
 * Se usa para evitar problemas con números flotantes
 * 
 * @param numero - Número a redondear
 * @param precision - Cantidad de decimales
 * @returns Número redondeado
 * 
 * @example
 * redondear(46.123456, 2) // 46.12
 * redondear(30.999999, 0) // 31
 */
const redondear = (numero: number, precision: number = PRECISION_CALCULOS): number => {
  const multiplicador = Math.pow(10, precision);
  return Math.round(numero * multiplicador) / multiplicador;
};

/**
 * Calcula el porcentaje que representa un monto del total
 * 
 * @param monto - Cantidad en la moneda
 * @param total - Monto total del préstamo
 * @returns Porcentaje (0-100)
 * 
 * @example
 * calcularPorcentaje(50, 200) // 25
 * calcularPorcentaje(91, 182) // 50
 */
export const calcularPorcentaje = (monto: number, total: number): number => {
  if (total === 0) return 0;
  return redondear((monto / total) * PORCENTAJE_TOTAL);
};

/**
 * Calcula el monto a partir de un porcentaje del total
 * 
 * @param porcentaje - Porcentaje (0-100)
 * @param total - Monto total del préstamo
 * @returns Monto en la moneda
 * 
 * @example
 * calcularMonto(25, 200) // 50
 * calcularMonto(50, 182) // 91
 */
export const calcularMonto = (porcentaje: number, total: number): number => {
  return redondear((porcentaje / PORCENTAJE_TOTAL) * total);
};

/**
 * Calcula el monto total de todos los pagos
 * 
 * @param pagos - Array de pagos
 * @returns Suma de todos los montos
 */
export const calcularMontoTotal = (pagos: Pago[]): number => {
  return redondear(pagos.reduce((suma, pago) => suma + pago.monto, 0));
};

/**
 * Calcula el porcentaje total de todos los pagos
 * 
 * @param pagos - Array de pagos
 * @returns Suma de todos los porcentajes
 */
export const calcularPorcentajeTotal = (pagos: Pago[]): number => {
  return redondear(pagos.reduce((suma, pago) => suma + pago.porcentaje, 0));
};

/**
 * Calcula el monto restante para llegar al total
 * 
 * @param pagos - Array de pagos existentes
 * @param montoTotalPrestamo - Monto total del préstamo
 * @returns Monto disponible
 */
export const calcularMontoRestante = (pagos: Pago[], montoTotalPrestamo: number): number => {
  const montoUsado = calcularMontoTotal(pagos);
  return redondear(montoTotalPrestamo - montoUsado);
};

/**
 * Calcula el porcentaje restante para llegar al 100%
 * 
 * @param pagos - Array de pagos existentes
 * @returns Porcentaje disponible (0-100)
 */
export const calcularPorcentajeRestante = (pagos: Pago[]): number => {
  const porcentajeUsado = calcularPorcentajeTotal(pagos);
  return redondear(PORCENTAJE_TOTAL - porcentajeUsado);
};

/**
 * Ajusta los porcentajes de los pagos para que sumen exactamente 100%
 * Distribuye cualquier diferencia (por redondeos) en el último pago
 * 
 * @param pagos - Array de pagos a ajustar
 * @param montoTotal - Monto total del préstamo
 * @returns Array de pagos con porcentajes ajustados
 * 
 * Por qué hacemos esto:
 * - Los redondeos pueden causar que la suma no sea exactamente 100%
 * - Esta función garantiza que siempre sume 100% exacto
 * - El ajuste se hace en el último pago para minimizar el impacto visual
 */
export const ajustarPorcentajes = (pagos: Pago[], montoTotal: number): Pago[] => {
  if (pagos.length === 0) return pagos;
  
  // Recalcular porcentajes basados en los montos
  const pagosActualizados = pagos.map(pago => ({
    ...pago,
    porcentaje: calcularPorcentaje(pago.monto, montoTotal)
  }));
  
  // Calcular diferencia con 100%
  const sumaActual = calcularPorcentajeTotal(pagosActualizados);
  const diferencia = redondear(PORCENTAJE_TOTAL - sumaActual);
  
  // Si hay diferencia, ajustar el último pago
  if (Math.abs(diferencia) > 0.001) {
    const ultimoIndice = pagosActualizados.length - 1;
    pagosActualizados[ultimoIndice] = {
      ...pagosActualizados[ultimoIndice],
      porcentaje: redondear(pagosActualizados[ultimoIndice].porcentaje + diferencia)
    };
  }
  
  return pagosActualizados;
};

/**
 * Ajusta los montos de los pagos para que sumen exactamente el total
 * Distribuye cualquier diferencia (por redondeos) en el último pago
 * 
 * @param pagos - Array de pagos a ajustar
 * @param montoTotal - Monto total del préstamo
 * @returns Array de pagos con montos ajustados
 */
export const ajustarMontos = (pagos: Pago[], montoTotal: number): Pago[] => {
  if (pagos.length === 0) return pagos;
  
  // Recalcular montos basados en los porcentajes
  const pagosActualizados = pagos.map(pago => ({
    ...pago,
    monto: calcularMonto(pago.porcentaje, montoTotal)
  }));
  
  // Calcular diferencia con el total
  const sumaActual = calcularMontoTotal(pagosActualizados);
  const diferencia = redondear(montoTotal - sumaActual);
  
  // Si hay diferencia, ajustar el último pago
  if (Math.abs(diferencia) > 0.001) {
    const ultimoIndice = pagosActualizados.length - 1;
    pagosActualizados[ultimoIndice] = {
      ...pagosActualizados[ultimoIndice],
      monto: redondear(pagosActualizados[ultimoIndice].monto + diferencia)
    };
  }
  
  return pagosActualizados;
};

/**
 * Distribuye un monto entre varios pagos proporcionalmente
 * 
 * @param montoADistribuir - Monto total a distribuir
 * @param cantidadPagos - Número de pagos entre los que distribuir
 * @returns Array con los montos para cada pago
 * 
 * @example
 * distribuirMonto(100, 3) // [33.33, 33.33, 33.34]
 */
export const distribuirMonto = (montoADistribuir: number, cantidadPagos: number): number[] => {
  if (cantidadPagos === 0) return [];
  
  const montoPorPago = montoADistribuir / cantidadPagos;
  const montos = Array(cantidadPagos).fill(redondear(montoPorPago));
  
  // Ajustar el último para compensar redondeos
  const sumaActual = montos.reduce((a, b) => a + b, 0);
  const diferencia = redondear(montoADistribuir - sumaActual);
  montos[cantidadPagos - 1] = redondear(montos[cantidadPagos - 1] + diferencia);
  
  return montos;
};

/**
 * Calcula cuántos pagos ya están pagados
 * 
 * @param pagos - Array de pagos
 * @returns Cantidad de pagos con estado 'pagado'
 */
export const contarPagosPagados = (pagos: Pago[]): number => {
  return pagos.filter(pago => pago.estado === 'pagado').length;
};

/**
 * Calcula el monto total de pagos que ya fueron pagados
 * 
 * @param pagos - Array de pagos
 * @returns Suma de montos de pagos pagados
 */
export const calcularMontoPagado = (pagos: Pago[]): number => {
  return redondear(
    pagos
      .filter(pago => pago.estado === 'pagado')
      .reduce((suma, pago) => suma + pago.monto, 0)
  );
};

/**
 * Calcula el monto total de pagos pendientes
 * 
 * @param pagos - Array de pagos
 * @returns Suma de montos de pagos pendientes
 */
export const calcularMontoPendiente = (pagos: Pago[]): number => {
  return redondear(
    pagos
      .filter(pago => pago.estado === 'pendiente')
      .reduce((suma, pago) => suma + pago.monto, 0)
  );
};