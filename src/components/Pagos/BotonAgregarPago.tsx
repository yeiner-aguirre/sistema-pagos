import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface BotonAgregarPagoProps {
  /** Posición donde se insertará el nuevo pago */
  posicion: number;
  
  /** Función que se ejecuta al hacer clic */
  onClick: () => void;
  
  /** Indica si el botón está deshabilitado */
  deshabilitado?: boolean;
  
  /** Mensaje de tooltip cuando está deshabilitado */
  mensajeDeshabilitado?: string;
}

/**
 * Componente BotonAgregarPago
 * Botón "+" que aparece entre dos pagos para insertar uno nuevo
 * 
 * Por qué este componente separado:
 * - Funcionalidad específica: insertar entre pagos
 * - UI diferente al botón de agregar al final
 * - Tooltip y estados propios
 * - Animaciones específicas
 */
const BotonAgregarPago: React.FC<BotonAgregarPagoProps> = ({
  posicion,
  onClick,
  deshabilitado = false,
  mensajeDeshabilitado = 'No hay porcentaje disponible',
}) => {
  const [mostrarTooltip, setMostrarTooltip] = useState(false);
  
  /**
   * Maneja el hover para mostrar tooltip
   */
  const manejarMouseEnter = () => {
    if (deshabilitado) {
      setMostrarTooltip(true);
    }
  };
  
  const manejarMouseLeave = () => {
    setMostrarTooltip(false);
  };
  
  return (
    <div className="relative flex items-center justify-center">
      <button
        onClick={onClick}
        disabled={deshabilitado}
        onMouseEnter={manejarMouseEnter}
        onMouseLeave={manejarMouseLeave}
        className={`
          w-10 h-10 rounded-full border-2 border-dashed
          flex items-center justify-center
          transition-all duration-300
          ${deshabilitado
            ? 'border-gray-200 text-gray-300 cursor-not-allowed'
            : 'border-gray-400 text-gray-500 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 cursor-pointer hover:scale-110'
          }
        `}
        title={deshabilitado ? mensajeDeshabilitado : 'Agregar pago aquí'}
      >
        <Plus className="w-5 h-5" />
      </button>
      
      {/* Tooltip cuando está deshabilitado */}
      {mostrarTooltip && deshabilitado && (
        <div className="absolute top-full mt-2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          {mensajeDeshabilitado}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-900" />
        </div>
      )}
    </div>
  );
};

export default BotonAgregarPago;