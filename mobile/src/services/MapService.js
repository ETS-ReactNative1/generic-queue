import { MAPBOX_TOKEN } from '@env';
import axios from 'axios';
import GenericService from './GenericService';

export const getLocalMapBox = async (local) => {
  return await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${local}.json?${MAPBOX_TOKEN}`);
}

// paginate stores based on local and zoom
export const getStoreByRegion = async (params) => {
  return await GenericService("/store/region", "POST", params);
}