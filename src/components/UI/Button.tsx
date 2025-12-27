import React from 'react';

/**
 * Variantes visuales del botón
 */
type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma';

/**
 * Tamaños disponibles para el botón
 */
type TamanoBoton = 'pequeno' | 'mediano' | 'grande';

interface ButtonProps {
  /** Contenido del botón */
  children: React.ReactNode;
  
  /** Función a ejecutar al hacer clic */
  onClick?: () => void;
  
  /** Variante visual del botón */
  variante?: VarianteBoton;
  
  /** Tamaño del botón */
  tamano?: TamanoBoton;
  
  /** Indica si el botón está deshabilitado */
  deshabilitado?: boolean;
  
  /** Indica si el botón ocupa todo el ancho disponible */
  anchoCompleto?: boolean;
  
  /** Tipo del botón (button, submit, reset) */
  tipo?: 'button' | 'submit' | 'reset';
  
  /** Clases CSS adicionales */
  className?: string;
  
  /** Icono a mostrar antes del texto */
  iconoInicio?: React.ReactNode;
  
  /** Icono a mostrar después del texto */
  iconoFin?: React.ReactNode;
}

/**
 * Componente Button reutilizable
 * 
 * Por qué creamos este componente:
 * - Estilos consistentes en toda la aplicación
 * - Comportamiento estandarizado
 * - Fácil de mantener y actualizar
 * - Accesibilidad integrada
 */
const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variante = 'primario',
  tamano = 'mediano',
  deshabilitado = false,
  anchoCompleto = false,
  tipo = 'button',
  className = '',
  iconoInicio,
  iconoFin,
}) => {
  /**
   * Obtiene las clases CSS según la variante
   * 
   * Por qué separamos esto en una función:
   * - Mantiene el JSX limpio
   * - Fácil agregar nuevas variantes
   * - Lógica de estilos centralizada
   */
  const obtenerClasesVariante = (): string => {
    const clases = {
      primario: 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500',
      secundario: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
      peligro: 'bg-red-500 hover:bg-red-600 text-white border-red-500',
      fantasma: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
    };
    
    return clases[variante];
  };
  
  /**
   * Obtiene las clases CSS según el tamaño
   */
  const obtenerClasesTamano = (): string => {
    const clases = {
      pequeno: 'px-3 py-1.5 text-sm',
      mediano: 'px-4 py-2 text-base',
      grande: 'px-6 py-3 text-lg',
    };
    
    return clases[tamano];
  };
  
  /**
   * Clases base que siempre se aplican
   */
  const clasesBase = 'font-medium rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2';
  
  /**
   * Clases cuando está deshabilitado
   */
  const clasesDeshabilitado = 'opacity-50 cursor-not-allowed';
  
  /**
   * Clases para ancho completo
   */
  const clasesAncho = anchoCompleto ? 'w-full' : '';
  
  /**
   * Combinar todas las clases
   */
  const clasesFinales = `
    ${clasesBase}
    ${obtenerClasesVariante()}
    ${obtenerClasesTamano()}
    ${deshabilitado ? clasesDeshabilitado : 'cursor-pointer'}
    ${clasesAncho}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <button
      type={tipo}
      onClick={onClick}
      disabled={deshabilitado}
      className={clasesFinales}
    >
      {iconoInicio && <span className="flex items-center">{iconoInicio}</span>}
      {children}
      {iconoFin && <span className="flex items-center">{iconoFin}</span>}
    </button>
  );
};

export default Button;