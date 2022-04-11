import axios from "axios";
import { getToken, logout } from "./AuthService";
import { SERVER_IP } from '@env';

const URL = `http://${SERVER_IP || '192.168.1.3'}:3030/api/v1`;

const instance = axios.create({
  baseURL: URL,
  timeout: 30000
});

instance.interceptors.request.use(async config => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export default async (endpoint, metodo, body) => {
  console.log(`Executando: ${URL} ${endpoint}, metodo: ${metodo}, body: ${JSON.stringify(body)}`);
  try {
    const request = {
      url: endpoint,
      method: metodo,
    };
    if (metodo === "GET") {
      request.params = body;
    }
    else {
      request.data = body;
    }
    return await instance.request(request);
  } catch (error) {
    if (error.response.status === 401) {
      logout()
    }
    throw error;
  }
}