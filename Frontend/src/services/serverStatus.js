/**
 * serverStatus.js
 * Pequeño módulo para mantener y difundir el estado de disponibilidad de los servidores
 */

let crudUrl = null;
let businessUrl = null;

const state = {
  crud: true,
  business: true,
};

const subscribers = new Set();

const notify = () => {
  const snapshot = { ...state };
  subscribers.forEach((cb) => cb(snapshot));
};

export const initServerStatus = (crud, business) => {
  crudUrl = crud;
  businessUrl = business;
};

export const getServerStatus = () => ({ ...state });

export const setServerStatus = (server, isUp) => {
  if (!['crud', 'business'].includes(server)) return;
  if (state[server] === isUp) return;
  state[server] = Boolean(isUp);
  notify();
};

export const subscribeServerStatus = (cb) => {
  subscribers.add(cb);
  // enviar estado inicial
  cb({ ...state });
  return () => subscribers.delete(cb);
};

export const checkServers = async (timeout = 3000) => {
  const ping = async (url) => {
    if (!url) return false;
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      // Quitar /dishdash de la URL para hacer ping a la raíz del servidor
      const baseUrl = url.replace('/dishdash', '');
      
      const res = await fetch(baseUrl, { 
        method: 'GET', 
        signal: controller.signal 
      });
      clearTimeout(id);
      
      // Si el servidor responde (cualquier status code < 600), está UP
      return res && res.status < 600;
    } catch (err) {
      // Error de red = servidor DOWN
      return false;
    }
  };

  const [crudOk, businessOk] = await Promise.all([ping(crudUrl), ping(businessUrl)]);
  setServerStatus('crud', crudOk);
  setServerStatus('business', businessOk);
  return { crud: crudOk, business: businessOk };
};

export default {
  initServerStatus,
  getServerStatus,
  setServerStatus,
  subscribeServerStatus,
  checkServers,
};