import axios from 'axios';

const API_CRUD_URL = import.meta.env.VITE_API_CRUD_URL;
const API_BUSINESS_URL = import.meta.env.VITE_API_BUSINESS_URL;

const axiosInstance = axios.create({
  baseURL: API_CRUD_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosBusinessInstance = axios.create({
  baseURL: API_BUSINESS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

const responseSuccessInterceptor = (response) => response.data;

const responseErrorInterceptor = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    if (status === 403) {
      console.error('Access forbidden:', data && data.message ? data.message : data);
    }

    let responseData = {};
    if (data && typeof data === 'object') {
      responseData = data;
    } else {
      responseData = { raw: data };
    }

    const message = (responseData && responseData.message) ? responseData.message : (typeof data === 'string' ? data : 'An error occurred');

    return Promise.reject({
      status,
      message,
      ...responseData,
    });
  }

  if (error.request) {
    return Promise.reject({ message: 'No response from server' });
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
  },
};

export { axiosInstance, axiosBusinessInstance };
export default api;
