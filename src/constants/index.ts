/**
 * Moneda utilizada en la aplicación
 * Cambiar este valor actualizará toda la UI
 * Ejemplos: 'USD', 'COP', 'EUR', 'MXN'
 */
export const MONEDA = 'USD';

/**
 * Monto total inicial por defecto para nuevos préstamos
 * Este valor puede ser sobrescrito al crear un préstamo
 */
export const MONTO_TOTAL_INICIAL = 182;

/**
 * Porcentaje total que debe sumar todos los pagos
 * Este valor es fijo y no debe cambiar (siempre 100%)
 */
export const PORCENTAJE_TOTAL = 100;

/**
 * Clave para almacenar los préstamos en localStorage
 */
export const CLAVE_STORAGE_PRESTAMOS = 'sistema_pagos_prestamos_v2';

/**
 * Clave para almacenar el ID del préstamo seleccionado
 */
export const CLAVE_STORAGE_PRESTAMO_SELECCIONADO = 'sistema_pagos_prestamo_seleccionado';

/**
 * Número máximo de decimales a mostrar en la UI
 */
export const DECIMALES_VISUALES = 1;

/**
 * Precisión interna para cálculos (más decimales = más precisión)
 */
export const PRECISION_CALCULOS = 10;

/**
 * Margen de error permitido para validar que los porcentajes sumen 100%
 * Se usa para evitar problemas de precisión con números flotantes
 */
export const MARGEN_ERROR_PORCENTAJE = 0.01;

/**
 * Títulos por defecto para los pagos
 */
export const TITULOS_PAGO = {
  ANTICIPO: 'Anticipo',
  PAGO_INICIAL: 'Pago 1',
  PAGO_FINAL: 'Pago Final',
  NUEVO: 'Nuevo',
} as const;

/**
 * Mensajes de validación
 */
export const MENSAJES_VALIDACION = {
  SUMA_INCORRECTA: 'La suma de los pagos debe ser exactamente 100%',
  FECHA_ANTERIOR: 'La fecha no puede ser anterior al pago previo',
  MONTO_INVALIDO: 'El monto debe ser mayor a 0',
  PORCENTAJE_INVALIDO: 'El porcentaje debe estar entre 0 y 100',
  PORCENTAJE_EXCEDIDO: 'No hay suficiente porcentaje disponible',
  NO_PUEDE_PAGAR: 'Debes pagar el pago anterior primero',
  NO_PUEDE_EDITAR: 'No puedes editar un pago que ya está pagado',
  FECHA_REQUERIDA: 'La fecha es requerida',
} as const;

/**
 * Colores para los estados de pago
 */
export const COLORES_ESTADO = {
  PENDIENTE: {
    border: 'border-red-400',
    bg: 'bg-white',
    hover: 'hover:border-red-500',
    text: 'text-red-600',
  },
  PAGADO: {
    border: 'border-green-600',
    bg: 'bg-green-500',
    hover: '',
    text: 'text-green-600',
  },
} as const;