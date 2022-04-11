const boom = require('@hapi/boom');
const { default: axios } = require('axios');
const Address = require('../models/Address');
const validate = require('./validators/addressValidator');

exports.createAddress = async (req) => {
  try {
    const problems = validate(req);
    if (problems) {
      return problems;
    }
    const addressParam = `${req.street}, ${req.number}, ${req.neighborhood}, ${req.city}, ${req.state}`;
    const { data } = await axios.get(process.env.GOOGLE_MAPS_URL, {
      params: {
        key: process.env.GOOGLE_MAPS_API,
        address: addressParam
      }
    });
    if (data.status === "OK") {
      req.coords = {
        coordinates: [data.results[0].geometry.location.lat, data.results[0].geometry.location.lng]
      };
    }
    else {
      return;
    }
    const result = await Address.create(req);
    return { ...result._doc, _id: result.id };
  } catch (error) {
    console.log(error)
    return error;
  }
}

exports.updateAddress = async (id, address) => {
  try {
    const problems = validate(address);
    if (problems) {
      return problems;
    }
    const oldAddress = await Address.findById(id);
    if (address.street !== oldAddress.street || address.number !== oldAddress.number ||
      address.neighborhood !== oldAddress.neighborhood || address.city !== oldAddress.city ||
      address.state !== oldAddress.state) {
      const addressParam = `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city}, ${address.state}`;
      const { data } = await axios.get(process.env.GOOGLE_MAPS_URL, {
        params: {
          key: process.env.GOOGLE_MAPS_API,
          address: addressParam
        }
      });
      if (data.status === "OK") {
        address.coords = {
          type: 'Point',
          coordinates: [data.results[0].geometry.location.lat, data.results[0].geometry.location.lng]
        }
      }
      else {
        return "address not found"
      }
    }
    const { __v, coords, ...result } = await Address.findByIdAndUpdate(id, address, { new: true }).lean();
    return result;
  } catch (error) {
    console.log(error)
    return error;
  }
}

exports.deleteAddress = async (req) => {
  try {
    const address = await Address.findByIdAndDelete(req);
    return address;
  } catch (error) {
    console.log(error)
    return error;
  }
}

exports.createAddressFromLatLng = async (latLng) => {
  try {
    const payload = `${latLng.latitude},${latLng.longitude}`
    const { data } = await axios.get(process.env.GOOGLE_MAPS_URL, {
      params: {
        key: process.env.GOOGLE_MAPS_API,
        latlng: payload,
        language: 'pt-BR',
      }
    });
    const street = data.results[0].address_components
      .find(ac => ac.types.includes('route')).long_name;
    const number = data.results[0].address_components
      .find(ac => ac.types.includes('street_number')).long_name;
    const neighborhood = data.results[0].address_components
      .find(ac => ac.types.includes('sublocality_level_1')).long_name;
    const city = data.results[0].address_components
      .find(ac => ac.types.includes('administrative_area_level_2')).long_name;
    const state = data.results[0].address_components
      .find(ac => ac.types.includes('administrative_area_level_1')).long_name;
    const cep = data.results[0].address_components
      .find(ac => ac.types.includes('postal_code')).long_name;
    return await Address.create({
      street,
      number,
      neighborhood,
      city,
      state,
      cep,
      coords: {
        type: 'Point',
        coordinates: [latLng.latitude, latLng.longitude]
      }
    });
  } catch (error) {
    console.log(error);
  }
}