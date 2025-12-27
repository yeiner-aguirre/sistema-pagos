import React from 'react';
import { Check, Clock, Edit2, Trash2 } from 'lucide-react';
import type { Pago } from '../../types';
import { COLORES_ESTADO, MONEDA } from '../../constants';
import { formatearNumero, formatearFecha } from '../../utils/formateo';
import SelectorFecha from '../UI/SelectorFecha';

interface TarjetaPagoProps {
  /** Datos del pago */
  pago: Pago;
  
  /** Índice del pago en el array */
  indice: number;
  
  /** Monto total del préstamo */
  montoTotal: number;
  
  /** Indica si es el primer pago */
  esPrimero: boolean;
  
  /** Indica si es el último pago */
  esUltimo: boolean;
  
  /** Indica si se puede editar este pago */
  puedeEditar: boolean;
  
  /** Indica si se puede marcar como pagado */
  puedeMarcarPagado: boolean;
  
  /** Fecha mínima permitida para este pago */
  fechaMinima?: string;
  
  /** Función para editar el pago */
  onEditar: () => void;
  
  /** Función para marcar como pagado */
  onMarcarPagado: () => void;
  
  /** Función para eliminar el pago */
  onEliminar: () => void;
  
  /** Función para actualizar la fecha */
  onActualizarFecha: (nuevaFecha: string) => void;
}

/**
 * Componente TarjetaPago
 * Representa un pago individual en la línea de tiempo
 * 
 * Por qué este componente:
 * - Encapsula toda la UI de un pago
 * - Maneja las interacciones específicas de cada pago
 * - Presenta el estado visual claramente
 * - Componente reutilizable para cada pago
 */
const TarjetaPago: React.FC<TarjetaPagoProps> = ({
  pago,
  indice,
  montoTotal,
  esPrimero,
  esUltimo,
  puedeEditar,
  puedeMarcarPagado,
  fechaMinima,
  onEditar,
  onMarcarPagado,
  onEliminar,
  onActualizarFecha,
}) => {
  const montoFormateado = formatearNumero(pago.monto);
  const porcentajeFormateado = formatearNumero(pago.porcentaje);
  
  const esPagado = pago.estado === 'pagado';
  const colores = esPagado ? COLORES_ESTADO.PAGADO : COLORES_ESTADO.PENDIENTE;
  
  /**
   * Maneja el clic en el círculo de estado
   * Solo permite marcar como pagado si cumple las condiciones
   */
  const manejarClickEstado = () => {
    if (!esPagado && puedeMarcarPagado) {
      onMarcarPagado();
    }
  };
  
  return (
    <div className="flex flex-col items-center relative group">
      {/* Círculo de estado */}
      <button
        onClick={manejarClickEstado}
        disabled={!puedeMarcarPagado || esPagado}
        className={`
          w-16 h-16 rounded-full border-4 flex items-center justify-center
          transition-all duration-300 relative
          ${colores.border}
          ${colores.bg}
          ${!esPagado && puedeMarcarPagado ? `${colores.hover} cursor-pointer` : ''}
          ${!puedeMarcarPagado && !esPagado ? 'cursor-not-allowed' : ''}
          ${esPagado ? 'cursor-default' : ''}
        `}
        title={
          esPagado 
            ? 'Pago completado' 
            : puedeMarcarPagado 
              ? 'Clic para marcar como pagado' 
              : 'Debes pagar el anterior primero'
        }
      >
        {esPagado && (
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        )}
      </button>
      
      {/* Información del pago */}
      <div className="mt-3 text-center min-w-[120px]">
        {/* Título */}
        <h3 className="font-semibold text-gray-800 text-sm mb-1">
          {pago.titulo}
        </h3>
        
        {/* Monto y moneda */}
        <p className="text-lg font-bold text-gray-900">
          {montoFormateado}{' '}
          <span className="text-sm font-normal text-gray-600">{MONEDA}</span>
        </p>
        
        {/* Porcentaje */}
        <p className="text-xs text-gray-500 mb-2">
          {porcentajeFormateado}%
        </p>
        
        {/* Selector de fecha */}
        <SelectorFecha
          fecha={pago.fechaPago}
          onChange={onActualizarFecha}
          fechaMinima={fechaMinima}
          deshabilitado={!puedeEditar}
          compacto
        />
        
        {/* Indicador de estado */}
        <div className="mt-2 flex items-center justify-center gap-1">
          {esPagado ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Pagado</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-600 font-medium">Pendiente</span>
            </>
          )}
        </div>
        
        {/* Botones de acción (solo visibles al hacer hover si puede editar) */}
        {puedeEditar && (
          <div className="mt-3 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {/* Botón editar */}
            <button
              onClick={onEditar}
              className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
              title="Editar monto y porcentaje"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            
            {/* Botón eliminar (no mostrar si es el primero) */}
            {!esPrimero && (
              <button
                onClick={onEliminar}
                className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                title="Eliminar pago"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
        
        {/* Mensaje si no puede pagar */}
        {!esPagado && !puedeMarcarPagado && (
          <p className="mt-2 text-xs text-gray-400 italic">
            Paga el anterior primero
          </p>
        )}
      </div>
    </div>
  );
};

export default TarjetaPago;