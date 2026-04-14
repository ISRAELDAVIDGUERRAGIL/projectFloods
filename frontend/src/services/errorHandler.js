// Servicio de Manejo de Errores
// frontend/src/services/errorHandler.js

import axios from 'axios';

class ErrorHandler {
  /**
   * Tipos de errores
   */
  static ERROR_TYPES = {
    NETWORK: 'NETWORK_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    AUTHENTICATION: 'AUTHENTICATION_ERROR',
    AUTHORIZATION: 'AUTHORIZATION_ERROR',
    NOT_FOUND: 'NOT_FOUND_ERROR',
    CONFLICT: 'CONFLICT_ERROR',
    SERVER: 'SERVER_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
  };

  /**
   * Mensajes amigables para errores
   */
  static FRIENDLY_MESSAGES = {
    NETWORK_ERROR: 'No hay conexión con el servidor. Verifica tu conexión a Internet.',
    VALIDATION_ERROR: 'Por favor verifica los datos ingresados.',
    AUTHENTICATION_ERROR: 'Usuario o contraseña incorrectos.',
    AUTHORIZATION_ERROR: 'No tienes permiso para realizar esta acción.',
    NOT_FOUND_ERROR: 'El recurso solicitado no fue encontrado.',
    CONFLICT_ERROR: 'Este registro ya existe.',
    SERVER_ERROR: 'Error del servidor. Intenta más tarde.',
    UNKNOWN_ERROR: 'Ocurrió un error inesperado.'
  };

  /**
   * Analizar y clasificar error
   */
  static analyze(error) {
    let errorData = {
      type: this.ERROR_TYPES.UNKNOWN,
      status: 500,
      message: 'Ocurrió un error inesperado',
      details: [],
      originalError: error
    };

    // Error de red
    if (!error.response) {
      if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
        errorData.type = this.ERROR_TYPES.NETWORK;
        errorData.status = 0;
        errorData.message = 'Error de conexión con el servidor';
      }
      return errorData;
    }

    const { status, data } = error.response;

    errorData.status = status;

    // Clasificar por código de estado
    switch (status) {
      case 400:
        errorData.type = this.ERROR_TYPES.VALIDATION;
        errorData.message = data.error || 'Datos inválidos';
        errorData.details = data.details || [];
        break;

      case 401:
        errorData.type = this.ERROR_TYPES.AUTHENTICATION;
        errorData.message = data.error || 'La sesión ha expirado. Por favor inicia sesión nuevamente.';
        break;

      case 403:
        errorData.type = this.ERROR_TYPES.AUTHORIZATION;
        errorData.message = data.error || 'No tienes permiso para realizar esta acción';
        break;

      case 404:
        errorData.type = this.ERROR_TYPES.NOT_FOUND;
        errorData.message = data.error || 'El recurso no fue encontrado';
        break;

      case 409:
        errorData.type = this.ERROR_TYPES.CONFLICT;
        errorData.message = data.error || 'Este registro ya existe';
        break;

      case 500:
      case 503:
        errorData.type = this.ERROR_TYPES.SERVER;
        errorData.message = data.error || 'Error del servidor';
        break;

      default:
        errorData.message = data.error || data.message || 'Error desconocido';
    }

    return errorData;
  }

  /**
   * Obtener mensaje amigable
   */
  static getFriendlyMessage(errorType) {
    return this.FRIENDLY_MESSAGES[errorType] || this.FRIENDLY_MESSAGES.UNKNOWN_ERROR;
  }

  /**
   * Verificar si es error de validación
   */
  static isValidationError(error) {
    const analyzed = this.analyze(error);
    return analyzed.type === this.ERROR_TYPES.VALIDATION;
  }

  /**
   * Verificar si es error de autenticación
   */
  static isAuthenticationError(error) {
    const analyzed = this.analyze(error);
    return analyzed.type === this.ERROR_TYPES.AUTHENTICATION;
  }

  /**
   * Obtener detalles de validación
   */
  static getValidationDetails(error) {
    const analyzed = this.analyze(error);
    if (analyzed.type !== this.ERROR_TYPES.VALIDATION) {
      return [];
    }
    return analyzed.details;
  }

  /**
   * Formatear error para mostrar
   */
  static format(error) {
    const analyzed = this.analyze(error);

    return {
      ...analyzed,
      friendlyMessage: this.getFriendlyMessage(analyzed.type),
      isRetryable: analyzed.type === this.ERROR_TYPES.NETWORK || 
                   analyzed.type === this.ERROR_TYPES.SERVER,
      isAuthError: analyzed.type === this.ERROR_TYPES.AUTHENTICATION
    };
  }

  /**
   * Log de error
   */
  static log(error, context = '') {
    const formatted = this.format(error);
    
    console.error('❌ Error:', {
      context,
      type: formatted.type,
      status: formatted.status,
      message: formatted.message,
      details: formatted.details,
      timestamp: new Date().toISOString()
    });

    // En desarrollo, mostrar error original
    if (process.env.NODE_ENV === 'development') {
      console.error('Stack:', formatted.originalError);
    }
  }

  /**
   * Validar respuesta API
   */
  static validateApiResponse(response) {
    if (!response.data) {
      throw new Error('Respuesta vacía del servidor');
    }

    if (response.data.success === false) {
      const error = new Error(response.data.error || 'Error en la API');
      error.response = response;
      throw error;
    }

    return response.data;
  }
}

/**
 * Interceptor de axios para manejo de errores
 */
export const setupErrorInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      const analyzed = ErrorHandler.analyze(error);
      
      // Log de error
      ErrorHandler.log(error, 'API Response Error');

      // Error de autenticación
      if (analyzed.type === ErrorHandler.ERROR_TYPES.AUTHENTICATION) {
        // Limpiar token y redirigir a login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }

      return Promise.reject(error);
    }
  );
};

export default ErrorHandler;
