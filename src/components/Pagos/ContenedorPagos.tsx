import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Prestamo, Pago, DatosPago } from '../../types';
import { MONEDA, TITULOS_PAGO } from '../../constants';
import { 
  calcularPorcentajeRestante,
  calcularMontoRestante,
  ajustarPorcentajes,
  ajustarMontos
} from '../../utils/calculos';
import { 
  validarPuedeEditarPago,
  validarPuedePagar,
  hayPorcentajeDisponible,
  validarPuedeEliminarPago
} from '../../utils/validaciones';
import { obtenerFechaHoy } from '../../utils/formateo';
import TarjetaPago from './TarjetaPago';
import BotonAgregarPago from './BotonAgregarPago';
import LineaTiempo from './LineaTiempo';
import ModalEditarPago from './ModalEditarPago';
import Button from '../UI/Button';

interface ContenedorPagosProps {
  /** Préstamo con sus pagos */
  prestamo: Prestamo;
  
  /** Función para actualizar el préstamo */
  onActualizarPrestamo: (prestamo: Prestamo) => void;
}

/**
 * Generador de IDs únicos
 */
const generarId = (): string => {
  return `pago_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Componente ContenedorPagos
 * Orquesta toda la lógica de gestión de pagos
 * 
 * Por qué este componente es el "cerebro":
 * - Maneja toda la lógica de creación, edición y eliminación
 * - Coordina las interacciones entre componentes
 * - Mantiene la integridad de los datos (siempre 100%)
 * - Aplica todas las reglas de negocio
 */
const ContenedorPagos: React.FC<ContenedorPagosProps> = ({
  prestamo,
  onActualizarPrestamo,
}) => {
  // Estados locales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pagoEditando, setPagoEditando] = useState<Pago | null>(null);
  const [posicionInsercion, setPosicionInsercion] = useState<number | null>(null);
  
  const pagos = prestamo.pagos;
  const tienePagos = pagos.length > 0;
  
  /**
   * Crea el primer pago (anticipo) cuando no hay pagos
   */
  const crearPagoInicial = () => {
    const pagoInicial: Pago = {
      id: generarId(),
      titulo: TITULOS_PAGO.ANTICIPO,
      monto: prestamo.montoTotal,
      porcentaje: 100,
      estado: 'pendiente',
      fechaPago: obtenerFechaHoy(),
      fechaCreacion: new Date().toISOString(),
    };
    
    onActualizarPrestamo({
      ...prestamo,
      pagos: [pagoInicial],
    });
    
    // @todo: api post para crear pago inicial
  };
  
  /**
   * Abre el modal para editar un pago existente
   */
  const abrirModalEditar = (pago: Pago) => {
    const validacion = validarPuedeEditarPago(pago);
    if (!validacion.valido) {
      alert(validacion.mensaje);
      return;
    }
    
    setPagoEditando(pago);
    setPosicionInsercion(null);
    setModalAbierto(true);
  };
  
  /**
   * Abre el modal para crear un nuevo pago en una posición
   */
  const abrirModalNuevo = (posicion: number) => {
    if (!hayPorcentajeDisponible(pagos)) {
      alert('No hay porcentaje disponible. Ya se alcanzó el 100%.');
      return;
    }
    
    setPagoEditando(null);
    setPosicionInsercion(posicion);
    setModalAbierto(true);
  };
  
  /**
   * Guarda los cambios de un pago (editar o crear)
   * 
   * Por qué esta lógica es compleja:
   * - Debe mantener siempre el 100%
   * - Ajustar todos los pagos si es necesario
   * - Validar que no se rompa el orden de fechas
   * - Actualizar correctamente el estado
   */
  const guardarPago = (datosPago: DatosPago) => {
    let pagosActualizados = [...pagos];
    
    if (pagoEditando) {
      // MODO EDICIÓN: actualizar pago existente
      const indice = pagosActualizados.findIndex(p => p.id === pagoEditando.id);
      
      if (indice >= 0) {
        pagosActualizados[indice] = {
          ...pagosActualizados[indice],
          ...datosPago,
        };
      }
    } else if (posicionInsercion !== null) {
      // MODO INSERCIÓN: crear nuevo pago en posición específica
      const nuevoPago: Pago = {
        id: generarId(),
        titulo: datosPago.titulo,
        monto: datosPago.monto,
        porcentaje: datosPago.porcentaje,
        estado: 'pendiente',
        fechaPago: datosPago.fechaPago,
        fechaCreacion: new Date().toISOString(),
      };
      
      pagosActualizados.splice(posicionInsercion, 0, nuevoPago);
    }
    
    // Ajustar porcentajes y montos para garantizar 100%
    pagosActualizados = ajustarPorcentajes(pagosActualizados, prestamo.montoTotal);
    pagosActualizados = ajustarMontos(pagosActualizados, prestamo.montoTotal);
    
    onActualizarPrestamo({
      ...prestamo,
      pagos: pagosActualizados,
    });
    
    // @todo: api put para actualizar todos los pagos del préstamo
  };
  
  /**
   * Elimina un pago y redistribuye su monto
   * 
   * Por qué redistribuimos:
   * - Debemos mantener el 100% siempre
   * - El monto eliminado se suma al siguiente o anterior pago pendiente
   * - Si no hay pendientes, no se puede eliminar
   */
  const eliminarPago = (idPago: string) => {
    const indice = pagos.findIndex(p => p.id === idPago);
    if (indice < 0) return;
    
    const pago = pagos[indice];
    
    // Validar que se pueda eliminar
    const validacion = validarPuedeEliminarPago(pago, pagos.length);
    if (!validacion.valido) {
      alert(validacion.mensaje);
      return;
    }
    
    if (!confirm(`¿Eliminar "${pago.titulo}"?\nSu monto se redistribuirá a otros pagos.`)) {
      return;
    }
    
    let pagosActualizados = [...pagos];
    const pagoAEliminar = pagosActualizados[indice];
    
    // Buscar pago pendiente para transferir el monto
    let indiceDestinatario = -1;
    
    // Buscar primero hacia adelante
    for (let i = indice + 1; i < pagosActualizados.length; i++) {
      if (pagosActualizados[i].estado === 'pendiente') {
        indiceDestinatario = i;
        break;
      }
    }
    
    // Si no encontró adelante, buscar hacia atrás
    if (indiceDestinatario === -1) {
      for (let i = indice - 1; i >= 0; i--) {
        if (pagosActualizados[i].estado === 'pendiente') {
          indiceDestinatario = i;
          break;
        }
      }
    }
    
    // Transferir monto y porcentaje al destinatario
    if (indiceDestinatario >= 0) {
      pagosActualizados[indiceDestinatario] = {
        ...pagosActualizados[indiceDestinatario],
        monto: pagosActualizados[indiceDestinatario].monto + pagoAEliminar.monto,
        porcentaje: pagosActualizados[indiceDestinatario].porcentaje + pagoAEliminar.porcentaje,
      };
    }
    
    // Eliminar el pago
    pagosActualizados.splice(indice, 1);
    
    // Ajustar por si acaso
    pagosActualizados = ajustarPorcentajes(pagosActualizados, prestamo.montoTotal);
    
    onActualizarPrestamo({
      ...prestamo,
      pagos: pagosActualizados,
    });
    
    // @todo: api delete para eliminar pago
  };
  
  /**
   * Marca un pago como pagado
   */
  const marcarComoPagado = (idPago: string) => {
    const indice = pagos.findIndex(p => p.id === idPago);
    if (indice < 0) return;
    
    // Validar que se pueda pagar
    const validacion = validarPuedePagar(indice, pagos);
    if (!validacion.valido) {
      alert(validacion.mensaje);
      return;
    }
    
    const pagosActualizados = [...pagos];
    pagosActualizados[indice] = {
      ...pagosActualizados[indice],
      estado: 'pagado',
      fechaPagado: new Date().toISOString(),
    };
    
    onActualizarPrestamo({
      ...prestamo,
      pagos: pagosActualizados,
    });
    
    // @todo: api put para marcar pago como pagado
  };
  
  /**
   * Actualiza la fecha de un pago
   */
  const actualizarFecha = (idPago: string, nuevaFecha: string) => {
    const indice = pagos.findIndex(p => p.id === idPago);
    if (indice < 0) return;
    
    const pagosActualizados = [...pagos];
    pagosActualizados[indice] = {
      ...pagosActualizados[indice],
      fechaPago: nuevaFecha,
    };
    
    onActualizarPrestamo({
      ...prestamo,
      pagos: pagosActualizados,
    });
  };
  
  /**
   * Calcula la fecha mínima para un pago según su posición
   */
  const obtenerFechaMinimaParaPago = (indice: number): string => {
    if (indice === 0) return obtenerFechaHoy();
    return pagos[indice - 1].fechaPago;
  };
  
  // Calcular disponibilidad para nuevo pago
  const montoDisponible = calcularMontoRestante(pagos, prestamo.montoTotal);
  const porcentajeDisponible = calcularPorcentajeRestante(pagos);
  const hayDisponible = hayPorcentajeDisponible(pagos);
  
  // Vista inicial sin pagos
  if (!tienePagos) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vista inicial</h2>
        </div>
        
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <span className="text-sm text-gray-600">Pagos</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Por cobrar</span>
            <span className="text-xl font-semibold text-gray-800">
              {prestamo.montoTotal} {MONEDA}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-6 py-8">
          <button
            onClick={crearPagoInicial}
            className="w-20 h-20 rounded-full border-4 border-red-400 hover:border-red-500 transition-colors flex items-center justify-center"
          >
            <Plus className="w-10 h-10 text-red-400" />
          </button>
          
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-800 mb-1">
              {TITULOS_PAGO.ANTICIPO}
            </p>
            <p className="text-gray-600">
              {prestamo.montoTotal} {MONEDA} <span className="text-sm">(100%)</span>
            </p>
          </div>
          
          <Button
            onClick={crearPagoInicial}
            variante="primario"
            iconoInicio={<Plus className="w-5 h-5" />}
          >
            Crear Primer Pago
          </Button>
        </div>
      </div>
    );
  }
  
  // Vista con pagos
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <span className="text-sm text-gray-600 font-medium">Pagos</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Por cobrar</span>
          <span className="text-xl font-semibold text-gray-800">
            {prestamo.montoTotal} {MONEDA}
          </span>
        </div>
      </div>
      
      {/* Línea de tiempo con pagos */}
      <div className="relative">
        <div className="flex items-start justify-between gap-4 relative overflow-x-auto pb-4">
          <LineaTiempo cantidadPagos={pagos.length} />
          
          {pagos.map((pago, indice) => (
            <React.Fragment key={pago.id}>
              {/* Botón para agregar pago antes (no en el primero) */}
              {indice > 0 && (
                <BotonAgregarPago
                  posicion={indice}
                  onClick={() => abrirModalNuevo(indice)}
                  deshabilitado={!hayDisponible}
                  mensajeDeshabilitado="Ya se alcanzó el 100%"
                />
              )}
              
              {/* Tarjeta del pago */}
              <TarjetaPago
                pago={pago}
                indice={indice}
                montoTotal={prestamo.montoTotal}
                esPrimero={indice === 0}
                esUltimo={indice === pagos.length - 1}
                puedeEditar={pago.estado === 'pendiente'}
                puedeMarcarPagado={
                  pago.estado === 'pendiente' &&
                  (indice === 0 || pagos[indice - 1].estado === 'pagado')
                }
                fechaMinima={obtenerFechaMinimaParaPago(indice)}
                onEditar={() => abrirModalEditar(pago)}
                onMarcarPagado={() => marcarComoPagado(pago.id)}
                onEliminar={() => eliminarPago(pago.id)}
                onActualizarFecha={(fecha) => actualizarFecha(pago.id, fecha)}
              />
            </React.Fragment>
          ))}
          
          {/* Botón para agregar al final */}
          <BotonAgregarPago
            posicion={pagos.length}
            onClick={() => abrirModalNuevo(pagos.length)}
            deshabilitado={!hayDisponible}
            mensajeDeshabilitado="Ya se alcanzó el 100%"
          />
        </div>
      </div>
      
      {/* Información de disponibilidad */}
      {hayDisponible && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Disponible para nuevos pagos:</span>{' '}
            {montoDisponible.toFixed(2)} {MONEDA} ({porcentajeDisponible.toFixed(2)}%)
          </p>
        </div>
      )}
      
      {/* Modal de edición */}
      <ModalEditarPago
        pago={pagoEditando}
        abierto={modalAbierto}
        montoTotal={prestamo.montoTotal}
        montoDisponible={montoDisponible}
        porcentajeDisponible={porcentajeDisponible}
        fechaMinima={
          posicionInsercion !== null && posicionInsercion > 0
            ? obtenerFechaMinimaParaPago(posicionInsercion)
            : obtenerFechaHoy()
        }
        onCerrar={() => setModalAbierto(false)}
        onGuardar={guardarPago}
      />
    </div>
  );
};

export default ContenedorPagos;