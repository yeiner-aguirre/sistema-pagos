import React, { useState, useEffect } from 'react';
import type { Pago, DatosPago } from '../../types';
import { MONEDA } from '../../constants';
import { 
  calcularPorcentaje, 
  calcularMonto 
} from '../../utils/calculos';
import { 
  validarPagoCompleto 
} from '../../utils/validaciones';
import { formatearNumero } from '../../utils/formateo';
import Modal from '../UI/Modal';
import Input from '../UI/Input';
import Button from '../UI/Button';
import SelectorFecha from '../UI/SelectorFecha';

interface ModalEditarPagoProps {
  /** Pago a editar (null si es nuevo) */
  pago: Pago | null;
  
  /** Indica si el modal está abierto */
  abierto: boolean;
  
  /** Monto total del préstamo */
  montoTotal: number;
  
  /** Monto disponible para este pago */
  montoDisponible: number;
  
  /** Porcentaje disponible para este pago */
  porcentajeDisponible: number;
  
  /** Fecha mínima permitida */
  fechaMinima: string;
  
  /** Función para cerrar el modal */
  onCerrar: () => void;
  
  /** Función para guardar los cambios */
  onGuardar: (datosPago: DatosPago) => void;
}

/**
 * Componente ModalEditarPago
 * Modal para editar monto, porcentaje y fecha de un pago
 * 
 * Por qué este componente es tan complejo:
 * - Maneja sincronización monto ↔ porcentaje
 * - Validación en tiempo real
 * - Múltiples estados y modos de edición
 * - Feedback visual inmediato al usuario
 */
const ModalEditarPago: React.FC<ModalEditarPagoProps> = ({
  pago,
  abierto,
  montoTotal,
  montoDisponible,
  porcentajeDisponible,
  fechaMinima,
  onCerrar,
  onGuardar,
}) => {
  // Estados locales del formulario
  const [titulo, setTitulo] = useState('');
  const [monto, setMonto] = useState('');
  const [porcentaje, setPorcentaje] = useState('');
  const [fecha, setFecha] = useState('');
  const [error, setError] = useState('');
  
  /**
   * Inicializar el formulario cuando se abre el modal
   * 
   * Por qué usar useEffect:
   * - Necesitamos actualizar cuando cambia el pago o se abre/cierra
   * - Valores iniciales dependen de props
   */
  useEffect(() => {
    if (abierto && pago) {
      setTitulo(pago.titulo);
      setMonto(pago.monto.toString());
      setPorcentaje(pago.porcentaje.toString());
      setFecha(pago.fechaPago);
      setError('');
    }
  }, [abierto, pago]);
  
  /**
   * Maneja el cambio de monto
   * Automáticamente calcula y actualiza el porcentaje
   * 
   * Por qué sincronizamos automáticamente:
   * - Evita inconsistencias entre monto y porcentaje
   * - Mejor UX: el usuario solo edita uno a la vez
   * - Garantiza que los cálculos sean correctos
   */
  const manejarCambioMonto = (nuevoMonto: string) => {
    setMonto(nuevoMonto);
    
    const montoNumero = parseFloat(nuevoMonto);
    if (!isNaN(montoNumero) && montoNumero > 0) {
      // Calcular el porcentaje correspondiente
      // Si estamos editando, consideramos el monto original del pago
      const montoOriginal = pago ? pago.monto : 0;
      const montoTotalDisponible = montoDisponible + montoOriginal;
      
      if (montoNumero <= montoTotalDisponible) {
        const nuevoPorcentaje = calcularPorcentaje(montoNumero, montoTotal);
        setPorcentaje(nuevoPorcentaje.toString());
        setError('');
      } else {
        setError(`El monto no puede exceder ${formatearNumero(montoTotalDisponible)} ${MONEDA}`);
      }
    }
  };
  
  /**
   * Maneja el cambio de porcentaje
   * Automáticamente calcula y actualiza el monto
   */
  const manejarCambioPorcentaje = (nuevoPorcentaje: string) => {
    setPorcentaje(nuevoPorcentaje);
    
    const porcentajeNumero = parseFloat(nuevoPorcentaje);
    if (!isNaN(porcentajeNumero) && porcentajeNumero > 0) {
      // Calcular el monto correspondiente
      const porcentajeOriginal = pago ? pago.porcentaje : 0;
      const porcentajeTotalDisponible = porcentajeDisponible + porcentajeOriginal;
      
      if (porcentajeNumero <= porcentajeTotalDisponible) {
        const nuevoMonto = calcularMonto(porcentajeNumero, montoTotal);
        setMonto(nuevoMonto.toString());
        setError('');
      } else {
        setError(`El porcentaje no puede exceder ${formatearNumero(porcentajeTotalDisponible)}%`);
      }
    }
  };
  
  /**
   * Maneja el guardado del formulario
   * Valida todos los campos antes de guardar
   */
  const manejarGuardar = () => {
    const montoNumero = parseFloat(monto);
    const porcentajeNumero = parseFloat(porcentaje);
    
    // Calcular disponible considerando el pago actual
    const montoOriginal = pago ? pago.monto : 0;
    const porcentajeOriginal = pago ? pago.porcentaje : 0;
    const montoTotalDisponible = montoDisponible + montoOriginal;
    const porcentajeTotalDisponible = porcentajeDisponible + porcentajeOriginal;
    
    // Validar todo
    const validacion = validarPagoCompleto(
      montoNumero,
      porcentajeNumero,
      fecha,
      fechaMinima,
      montoTotalDisponible,
      porcentajeTotalDisponible
    );
    
    if (!validacion.valido) {
      setError(validacion.mensaje || 'Error de validación');
      return;
    }
    
    // Guardar
    const datosPago: DatosPago = {
      titulo: titulo.trim() || (pago ? pago.titulo : 'Nuevo Pago'),
      monto: montoNumero,
      porcentaje: porcentajeNumero,
      fechaPago: fecha,
    };
    
    onGuardar(datosPago);
    onCerrar();
  };
  
  /**
   * Información visual sobre disponibilidad
   */
  const montoOriginal = pago ? pago.monto : 0;
  const porcentajeOriginal = pago ? pago.porcentaje : 0;
  const montoMaximo = montoDisponible + montoOriginal;
  const porcentajeMaximo = porcentajeDisponible + porcentajeOriginal;
  
  return (
    <Modal
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={pago ? 'Editar Pago' : 'Nuevo Pago'}
      tamano="mediano"
    >
      <div className="space-y-4">
        {/* Título del pago */}
        <Input
          tipo="text"
          valor={titulo}
          onChange={setTitulo}
          etiqueta="Título del pago"
          placeholder="Ej: Anticipo, Pago 1, etc."
        />
        
        {/* Información de disponibilidad */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Disponible:</span>{' '}
            {formatearNumero(montoMaximo)} {MONEDA} ({formatearNumero(porcentajeMaximo)}%)
          </p>
        </div>
        
        {/* Monto */}
        <Input
          tipo="number"
          valor={monto}
          onChange={manejarCambioMonto}
          etiqueta={`Monto (${MONEDA})`}
          placeholder="0.00"
          min={0}
          max={montoMaximo}
          paso="0.01"
          ayuda={`Máximo: ${formatearNumero(montoMaximo)} ${MONEDA}`}
          error={error && error.includes('monto') ? error : undefined}
        />
        
        {/* Porcentaje */}
        <Input
          tipo="number"
          valor={porcentaje}
          onChange={manejarCambioPorcentaje}
          etiqueta="Porcentaje (%)"
          placeholder="0"
          min={0}
          max={porcentajeMaximo}
          paso="0.1"
          ayuda={`Máximo: ${formatearNumero(porcentajeMaximo)}%`}
          error={error && error.includes('porcentaje') ? error : undefined}
        />
        
        {/* Sincronización visual */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-xs text-gray-600 text-center">
            💡 El monto y porcentaje se calculan automáticamente
          </p>
        </div>
        
        {/* Fecha */}
        <SelectorFecha
          fecha={fecha}
          onChange={setFecha}
          fechaMinima={fechaMinima}
          etiqueta="Fecha de pago"
        />
        
        {/* Error general */}
        {error && !error.includes('monto') && !error.includes('porcentaje') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        {/* Botones de acción */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={onCerrar}
            variante="secundario"
            anchoCompleto
          >
            Cancelar
          </Button>
          <Button
            onClick={manejarGuardar}
            variante="primario"
            anchoCompleto
          >
            Guardar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalEditarPago;