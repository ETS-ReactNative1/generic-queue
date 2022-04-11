import axios from 'axios';
import { getToken, logout } from '../hooks/auth';

const instance = axios.create({
    baseURL: 'http://localhost:3030/api/v1',
    timeout: 30000
});

instance.interceptors.request.use(async config => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

const GenericService = async (endpoint, metodo, body) => {
  console.log(`Executando: ${URL} ${endpoint}, metodo: ${metodo}, body: ${JSON.stringify(body)}`);
  try {
    const request = {
      url: endpoint,
      method: metodo, 
    };
    if(metodo === "GET") {
      request.params = body;
    }
    else {
      request.data = body;
    }
    return await instance.request(request);
  } catch (error) {
    console.log(error.response.data)
    if(error.response.status === 401) {
      logout();
    }
    throw error;
  }
};

export default GenericService;