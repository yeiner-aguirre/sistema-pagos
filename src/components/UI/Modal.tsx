import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  /** Indica si el modal está abierto */
  abierto: boolean;
  
  /** Función que se ejecuta al cerrar el modal */
  onCerrar: () => void;
  
  /** Título del modal */
  titulo?: string;
  
  /** Contenido del modal */
  children: React.ReactNode;
  
  /** Tamaño del modal */
  tamano?: 'pequeno' | 'mediano' | 'grande';
  
  /** Permite cerrar al hacer clic fuera */
  cerrarAlClickFuera?: boolean;
  
  /** Muestra el botón de cerrar (X) */
  mostrarBotonCerrar?: boolean;
}

/**
 * Componente Modal genérico y reutilizable
 * 
 * Por qué creamos este componente:
 * - Necesitamos mostrar formularios y diálogos
 * - Manejo centralizado de overlays y backdrop
 * - Accesibilidad (ESC para cerrar, trap focus)
 * - Estilos consistentes
 */
const Modal: React.FC<ModalProps> = ({
  abierto,
  onCerrar,
  titulo,
  children,
  tamano = 'mediano',
  cerrarAlClickFuera = true,
  mostrarBotonCerrar = true,
}) => {
  /**
   * Maneja el cierre del modal al presionar ESC
   * 
   * Por qué usar efecto para esto:
   * - Necesitamos agregar/remover el event listener
   * - Solo debe estar activo cuando el modal está abierto
   * - Cleanup automático al desmontar
   */
  useEffect(() => {
    const manejarTeclaESC = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && abierto) {
        onCerrar();
      }
    };
    
    if (abierto) {
      document.addEventListener('keydown', manejarTeclaESC);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', manejarTeclaESC);
      document.body.style.overflow = 'unset';
    };
  }, [abierto, onCerrar]);
  
  /**
   * Maneja el clic en el backdrop
   */
  const manejarClickBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    // Solo cerrar si se hace clic directamente en el backdrop
    if (e.target === e.currentTarget && cerrarAlClickFuera) {
      onCerrar();
    }
  };
  
  /**
   * Obtiene el ancho según el tamaño
   */
  const obtenerClasesAncho = (): string => {
    const clases = {
      pequeno: 'max-w-md',
      mediano: 'max-w-lg',
      grande: 'max-w-2xl',
    };
    
    return clases[tamano];
  };
  
  // No renderizar nada si el modal está cerrado
  if (!abierto) return null;
  
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={manejarClickBackdrop}
    >
      {/* Backdrop oscuro */}
      <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      {/* Contenedor del modal */}
      <div
        className={`
          relative bg-white rounded-lg shadow-xl
          ${obtenerClasesAncho()}
          w-full max-h-[90vh] overflow-hidden
          flex flex-col
          animate-in fade-in slide-in-from-bottom-4
          duration-300
        `}
      >
        {/* Header del modal */}
        {(titulo || mostrarBotonCerrar) && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {titulo && (
              <h2 className="text-xl font-semibold text-gray-900">
                {titulo}
              </h2>
            )}
            
            {mostrarBotonCerrar && (
              <button
                onClick={onCerrar}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}
        
        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;