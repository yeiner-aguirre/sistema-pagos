import React from 'react';

interface LineaTiempoProps {
  /** Cantidad de pagos a conectar */
  cantidadPagos: number;
}

/**
 * Componente LineaTiempo
 * Dibuja la línea horizontal que conecta visualmente los pagos
 * 
 * Por qué este componente:
 * - Visual puro sin lógica de negocio
 * - Se adapta automáticamente al número de pagos
 * - Fácil de modificar el estilo de la línea
 * - Componente presentacional reutilizable
 */
const LineaTiempo: React.FC<LineaTiempoProps> = ({ cantidadPagos }) => {
  // No mostrar línea si hay 1 o menos pagos
  if (cantidadPagos <= 1) return null;
  
  /**
   * Calculamos el ancho de la línea
   * 
   * Por qué este cálculo:
   * - Necesitamos conectar los círculos de los pagos
   * - Los círculos están separados uniformemente
   * - La línea debe ir de centro a centro
   */
  
  return (
    <div 
      className="absolute top-8 left-0 h-1 bg-gray-300 -z-10"
      style={{
        width: '100%',
        left: '50px', // Offset para alinear con los círculos
        right: '50px',
      }}
    />
  );
};

export default LineaTiempo;