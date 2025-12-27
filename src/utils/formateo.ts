import { DECIMALES_VISUALES } from '../constants';

/**
 * Formatea un número para mostrar en la UI
 * Reglas:
 * - Si es entero (30.0): muestra sin decimales → "30"
 * - Si tiene decimales (46.16): muestra con 1 decimal → "46.2"
 * - Mantiene precisión interna pero limpia la visualización
 * 
 * @param numero - Número a formatear
 * @returns String formateado para visualización
 * 
 * @example
 * formatearNumero(30.0)  // "30"
 * formatearNumero(46.16) // "46.2"
 * formatearNumero(32.1)  // "32.1"
 */
export const formatearNumero = (numero: number): string => {
  // Redondear al número de decimales visuales definido
  const redondeado = Math.round(numero * Math.pow(10, DECIMALES_VISUALES)) / Math.pow(10, DECIMALES_VISUALES);
  
  // Si es un número entero, no mostrar decimales
  if (Number.isInteger(redondeado)) {
    return redondeado.toString();
  }
  
  // Mostrar con el número de decimales definido
  return redondeado.toFixed(DECIMALES_VISUALES);
};

/**
 * Formatea una fecha de formato ISO o YYYY-MM-DD a formato DD/MM/YYYY
 * 
 * @param fecha - Fecha en formato ISO o YYYY-MM-DD
 * @returns Fecha formateada como DD/MM/YYYY
 * 
 * @example
 * formatearFecha("2024-01-15") // "15/01/2024"
 * formatearFecha("2024-12-31") // "31/12/2024"
 */
export const formatearFecha = (fecha: string): string => {
  const date = new Date(fecha + 'T00:00:00'); // Agregar hora para evitar problemas de zona horaria
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const anio = date.getFullYear();
  
  return `${dia}/${mes}/${anio}`;
};

/**
 * Formatea un monto con la moneda
 * 
 * @param monto - Cantidad a formatear
 * @param moneda - Código de la moneda (USD, COP, EUR, etc)
 * @returns String con monto formateado y moneda
 * 
 * @example
 * formatearMoneda(182, "USD")     // "182 USD"
 * formatearMoneda(46.16, "USD")   // "46.2 USD"
 * formatearMoneda(1000, "COP")    // "1000 COP"
 */
export const formatearMoneda = (monto: number, moneda: string): string => {
  return `${formatearNumero(monto)} ${moneda}`;
};

/**
 * Formatea un porcentaje para visualización
 * 
 * @param porcentaje - Número del 0 al 100
 * @returns String con porcentaje formateado
 * 
 * @example
 * formatearPorcentaje(30)      // "30%"
 * formatearPorcentaje(46.16)   // "46.2%"
 * formatearPorcentaje(100)     // "100%"
 */
export const formatearPorcentaje = (porcentaje: number): string => {
  return `${formatearNumero(porcentaje)}%`;
};

/**
 * Convierte una fecha de DD/MM/YYYY a YYYY-MM-DD (para inputs tipo date)
 * 
 * @param fechaFormateada - Fecha en formato DD/MM/YYYY
 * @returns Fecha en formato YYYY-MM-DD
 * 
 * @example
 * convertirFechaAInput("15/01/2024") // "2024-01-15"
 */
export const convertirFechaAInput = (fechaFormateada: string): string => {
  const [dia, mes, anio] = fechaFormateada.split('/');
  return `${anio}-${mes}-${dia}`;
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD
 * 
 * @returns Fecha actual en formato para input date
 */
export const obtenerFechaHoy = (): string => {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  
  return `${anio}-${mes}-${dia}`;
};

/**
 * Formatea un nombre de mes a partir de su número
 * 
 * @param mes - Número del mes (1-12)
 * @returns Nombre del mes en español
 */
export const formatearNombreMes = (mes: number): string => {
  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return meses[mes - 1] || '';
};

/**
 * Trunca un texto si excede la longitud máxima
 * 
 * @param texto - Texto a truncar
 * @param longitudMaxima - Longitud máxima permitida
 * @returns Texto truncado con "..." si es necesario
 */
export const truncarTexto = (texto: string, longitudMaxima: number): string => {
  if (texto.length <= longitudMaxima) {
    return texto;
  }
  
  return texto.substring(0, longitudMaxima - 3) + '...';
};