import React from 'react';

interface InputProps {
  /** Tipo de input */
  tipo?: 'text' | 'number' | 'date' | 'email' | 'password';
  
  /** Valor actual del input */
  valor: string | number;
  
  /** Función que se ejecuta cuando cambia el valor */
  onChange: (valor: string) => void;
  
  /** Etiqueta descriptiva del input */
  etiqueta?: string;
  
  /** Texto de placeholder */
  placeholder?: string;
  
  /** Mensaje de error a mostrar */
  error?: string;
  
  /** Indica si el input está deshabilitado */
  deshabilitado?: boolean;
  
  /** Indica si el campo es requerido */
  requerido?: boolean;
  
  /** Valor mínimo (para tipo number o date) */
  min?: string | number;
  
  /** Valor máximo (para tipo number o date) */
  max?: string | number;
  
  /** Incremento para tipo number */
  paso?: string | number;
  
  /** Texto de ayuda adicional */
  ayuda?: string;
  
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * Componente Input reutilizable con validación
 * 
 * Por qué creamos este componente:
 * - Estilos consistentes para todos los inputs
 * - Manejo de errores centralizado
 * - Accesibilidad integrada (labels, aria-describedby)
 * - Fácil de validar y mantener
 */
const Input: React.FC<InputProps> = ({
  tipo = 'text',
  valor,
  onChange,
  etiqueta,
  placeholder,
  error,
  deshabilitado = false,
  requerido = false,
  min,
  max,
  paso,
  ayuda,
  className = '',
}) => {
  /**
   * Maneja el cambio de valor del input
   * 
   * Por qué pasamos solo el valor y no el evento completo:
   * - Simplifica el manejo en el componente padre
   * - El padre no necesita saber de eventos del DOM
   * - Hace el componente más fácil de testear
   */
  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  /**
   * ID único para vincular label con input
   */
  const inputId = React.useId();
  const errorId = `${inputId}-error`;
  const ayudaId = `${inputId}-ayuda`;
  
  /**
   * Clases base del input
   */
  const clasesBase = `
    w-full px-3 py-2 border-2 rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
  `;
  
  /**
   * Clases según el estado
   */
  const clasesEstado = error
    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300';
  
  const clasesDeshabilitado = deshabilitado
    ? 'bg-gray-100 cursor-not-allowed opacity-60'
    : 'bg-white';
  
  const clasesFinales = `
    ${clasesBase}
    ${clasesEstado}
    ${clasesDeshabilitado}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <div className="w-full">
      {/* Etiqueta */}
      {etiqueta && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {etiqueta}
          {requerido && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      {/* Input */}
      <input
        id={inputId}
        type={tipo}
        value={valor}
        onChange={manejarCambio}
        placeholder={placeholder}
        disabled={deshabilitado}
        required={requerido}
        min={min}
        max={max}
        step={paso}
        className={clasesFinales}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : ayuda ? ayudaId : undefined}
      />
      
      {/* Texto de ayuda */}
      {ayuda && !error && (
        <p id={ayudaId} className="mt-1 text-sm text-gray-500">
          {ayuda}
        </p>
      )}
      
      {/* Mensaje de error */}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;