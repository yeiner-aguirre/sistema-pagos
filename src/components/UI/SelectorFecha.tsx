import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { formatearFecha, obtenerFechaHoy } from '../../utils/formateo';
import { validarFechaSecuencial } from '../../utils/validaciones';

interface SelectorFechaProps {
  /** Fecha actual en formato YYYY-MM-DD */
  fecha: string;
  
  /** Función que se ejecuta cuando cambia la fecha */
  onChange: (fecha: string) => void;
  
  /** Fecha mínima permitida en formato YYYY-MM-DD */
  fechaMinima?: string;
  
  /** Fecha máxima permitida en formato YYYY-MM-DD */
  fechaMaxima?: string;
  
  /** Indica si el selector está deshabilitado */
  deshabilitado?: boolean;
  
  /** Etiqueta descriptiva */
  etiqueta?: string;
  
  /** Mostrar como botón compacto o input completo */
  compacto?: boolean;
}

/**
 * Componente SelectorFecha con validaciones del negocio
 * 
 * Por qué un componente separado para fechas:
 * - Las fechas tienen validaciones específicas del negocio
 * - Necesitamos asegurar que mantengan orden cronológico
 * - Mejor UX con formato visual claro
 * - Validación integrada de fechas mínimas/máximas
 */
const SelectorFecha: React.FC<SelectorFechaProps> = ({
  fecha,
  onChange,
  fechaMinima,
  fechaMaxima,
  deshabilitado = false,
  etiqueta,
  compacto = false,
}) => {
  const [mostrarCalendario, setMostrarCalendario] = useState(false);
  const [error, setError] = useState<string>('');
  
  /**
   * Maneja el cambio de fecha con validación
   * 
   * Por qué validamos aquí:
   * - Feedback inmediato al usuario
   * - Evitamos estados inválidos
   * - Mantenemos la integridad de los datos
   */
  const manejarCambio = (nuevaFecha: string) => {
    // Validar fecha mínima si existe
    if (fechaMinima) {
      const validacion = validarFechaSecuencial(nuevaFecha, fechaMinima);
      if (!validacion.valido) {
        setError(validacion.mensaje || 'Fecha inválida');
        return;
      }
    }
    
    // Limpiar error y actualizar
    setError('');
    onChange(nuevaFecha);
    setMostrarCalendario(false);
  };
  
  /**
   * Modo compacto: botón con fecha formateada
   */
  if (compacto) {
    return (
      <div className="relative">
        <button
          onClick={() => !deshabilitado && setMostrarCalendario(!mostrarCalendario)}
          disabled={deshabilitado}
          className={`
            flex items-center gap-1 text-xs px-2 py-1 rounded
            ${deshabilitado 
              ? 'text-gray-400 cursor-not-allowed' 
              : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
            }
          `}
          type="button"
        >
          <Calendar className="w-3 h-3" />
          <span>{formatearFecha(fecha)}</span>
        </button>
        
        {/* Calendario desplegable */}
        {mostrarCalendario && !deshabilitado && (
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
            <input
              type="date"
              value={fecha}
              onChange={(e) => manejarCambio(e.target.value)}
              min={fechaMinima}
              max={fechaMaxima}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            />
            {error && (
              <p className="text-xs text-red-600 mt-1">{error}</p>
            )}
          </div>
        )}
      </div>
    );
  }
  
  /**
   * Modo completo: input de fecha normal
   */
  return (
    <div className="w-full">
      {etiqueta && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {etiqueta}
        </label>
      )}
      
      <div className="relative">
        <input
          type="date"
          value={fecha}
          onChange={(e) => manejarCambio(e.target.value)}
          min={fechaMinima || obtenerFechaHoy()}
          max={fechaMaxima}
          disabled={deshabilitado}
          className={`
            w-full px-3 py-2 border-2 rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${deshabilitado ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
          `}
        />
        
        <Calendar 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" 
        />
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {fechaMinima && !error && (
        <p className="mt-1 text-xs text-gray-500">
          Fecha mínima: {formatearFecha(fechaMinima)}
        </p>
      )}
    </div>
  );
};

export default SelectorFecha;