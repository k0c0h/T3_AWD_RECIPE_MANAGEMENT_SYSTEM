import axios from 'axios';

const API_CRUD_URL = import.meta.env.VITE_API_CRUD_URL;
const API_BUSINESS_URL = import.meta.env.VITE_API_BUSINESS_URL;

import serverStatus from './serverStatus';

const axiosInstance = axios.create({
  baseURL: API_CRUD_URL,
});
axiosInstance.serverName = 'crud';

const axiosBusinessInstance = axios.create({
  baseURL: API_BUSINESS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
axiosBusinessInstance.serverName = 'business';

// Inicializar los endpoints para las comprobaciones
serverStatus.initServerStatus(API_CRUD_URL, API_BUSINESS_URL);

const requestInterceptor = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const requestErrorInterceptor = (error) => Promise.reject(error);

axiosInstance.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

axiosBusinessInstance.interceptors.request.use(
  requestInterceptor,
  requestErrorInterceptor
);

const responseSuccessInterceptor = (response) => {
  // Si la petición responde, marcamos su servidor como UP
  try {
    const server = response?.config?.baseURL === API_BUSINESS_URL ? 'business' : 'crud';
    serverStatus.setServerStatus(server, true);
  } catch (e) {
    // noop
  }
  return response.data;
};

const responseErrorInterceptor = (error) => {
  const config = error?.config || {};
  const requestUrl = config.url || '';
  // Consideramos rutas de auth como: /auth/...
  const isAuthRoute = requestUrl.startsWith('/auth') || requestUrl.includes('/auth/');

  // Si hay respuesta del servidor, tratamos el error como siempre
  if (error.response) {
    const { status, data } = error.response;

    // Ajustar responseData lo antes posible
    let responseData = {};
    if (data && typeof data === 'object') {
      responseData = data;
    } else {
      responseData = { raw: data };
    }

    // Si el servidor respondió (incluso con error), está UP
    try {
      const server = error?.config?.baseURL === API_BUSINESS_URL ? 'business' : 'crud';
      serverStatus.setServerStatus(server, true);
    } catch (e) {
      // noop
    }

    if (status === 401) {
      // No forzamos logout/redirect para rutas de auth (ej: login incorrecto)
      try {
        const messageLower = (responseData && responseData.message ? String(responseData.message).toLowerCase() : '');
        const tokenIssue = /token|jwt|expired|invalid|unauthorized/.test(messageLower);

        // Si es ruta de auth, no limpiamos token (login fallido, register, etc.)
        if (isAuthRoute) {
          // permitimos que la UI de login maneje el mensaje
        } else if (tokenIssue) {
          // Si el servidor indica explícitamente que el token es inválido/expiró, eliminamos credenciales y redirigimos
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        } else {
          // No eliminar token por 401 genérico. Logueamos para debug y devolvemos el error.
          console.warn('401 recibido pero no identificado como fallo de token:', messageLower, 'url:', requestUrl);
        }
      } catch (e) {
        console.error('Error procesando 401:', e);
      }
    }

    if (status === 403) {
      console.error('Access forbidden:', responseData && responseData.message ? responseData.message : responseData);
    }

    const message = (responseData && responseData.message) ? responseData.message : (typeof data === 'string' ? data : 'An error occurred');

    return Promise.reject({
      status,
      message,
      ...responseData,
    });
  }

  // No hay respuesta: posible caída o red
  if (error.request) {
    try {
      const server = error?.config?.baseURL === API_BUSINESS_URL ? 'business' : 'crud';
      serverStatus.setServerStatus(server, false);
    } catch (e) {
      serverStatus.setServerStatus('crud', false);
      serverStatus.setServerStatus('business', false);
    }

    return Promise.reject({ 
      message: 'No response from server',
      serverDown: true 
    });
  }

  return Promise.reject({
    message: error.message || 'Request error',
  });
};

axiosInstance.interceptors.response.use(
  responseSuccessInterceptor,
  responseErrorInterceptor
);

axiosBusinessInstance.interceptors.response.use(
  responseSuccessInterceptor,
  responseErrorInterceptor
);

const api = {
  auth: {
    login: (email, password) =>
      axiosBusinessInstance.post('/auth/login', { email, password }),

    register: (email, password, name) =>
      axiosBusinessInstance.post('/auth/register', {
        email,
        password,
        name,
      }),

    googleAuth: () => {
      window.location.href = `${API_BUSINESS_URL}/auth/google`;
    },

    verify: () => axiosBusinessInstance.get('/auth/verify'),

    // Google Calendar linking
    googleCalendarLink: () => {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please login again.');
      }
      // Enviamos el token como query parameter porque window.location no puede enviar headers
      window.location.href = `${API_BUSINESS_URL}/auth/google-calendar/link?token=${token}`;
    },

    checkGoogleCalendarStatus: () =>
      axiosBusinessInstance.get('/auth/google-calendar/status'),

    unlinkGoogleCalendar: () =>
      axiosBusinessInstance.delete('/auth/google-calendar/unlink'),
  },
};

export { axiosInstance, axiosBusinessInstance };
export default api;