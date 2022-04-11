const userController = require('./userController');
const itemController = require('./itemController');
const addressController = require('./addressController');
const storeController = require('./storeController');
const Order = require('../models/Order');
const validate = require('./validators/orderValidator');
const async = require('async');
const orderTypeValidation = require('../models/enums/orderTypeValidation');
const imageHandler = require('../utils/imageHandler');

exports.createOrder = async (req, res) => {
  try {
    const problems = validate(orderTypeValidation.CREATE, req.body);
    if (problems) {
      return problems;
    }
    let { cart, deliveryAddress, userId, description } = req.body;
    const { storeId } = req.params;
    const typeOfAddress = typeof deliveryAddress;
    if (typeOfAddress === 'string') {
      deliveryAddress = await userController.getUserAddress(userId);
    }
    else if (typeOfAddress === 'object') {
      deliveryAddress = await addressController.createAddressFromLatLng(deliveryAddress);
    }
    await itemController.populateItens(cart);
    let total = 0;
    cart.forEach(({ item, optionsId }) => {
      total += item.price;
      optionsId.forEach(opt => {
        total += item.options.find(option => option._id.toString() === opt).price
      });
    });
    total = total.toFixed(2);
    const initialStatus = await storeController.getInitialStatus(storeId);
    const order = await Order.create({
      costumer: userId,
      store: storeId,
      status: initialStatus,
      cart,
      total,
      deliveryAddress,
      description,
    });
    return res
      .code(200)
      .send('Pedido criado')
  } catch (error) {
    console.log(error)
    return res
      .code(500)
      .send(error)
  }
}

exports.getUserOrders = async (req, res) => {
  try {
    const filter = {
      query: {
        costumer: req.params.id
      },
      page: Number(req.query.page),
      perPage: Number(req.query.perPage)
    };
    const { statusCode, body } = await paginatedOrder(filter);
    return res
      .code(statusCode)
      .send(body);
  } catch (error) {
    return res
      .code(500)
      .send(error);
  }
}

exports.getStoreOrders = async (req, res) => {
  try {
    const filter = {
      query: {
        store: req.params.id,
      },
      page: Number(req.query.page),
      perPage: Number(req.query.perPage),
    };
    const { statusCode, body } = await paginatedOrder(filter);
    if (statusCode === 200) {
      for (let orderIdx = 0; orderIdx < body.data.length; orderIdx++) {
        const order = body.data[orderIdx];
        for (let itemIdx = 0; itemIdx < order.cart.length; itemIdx++) {
          const { item, optionsId } = order.cart[itemIdx];
          body.data[orderIdx].cart[itemIdx].optionsId =
            await itemController.getOptions(item._id, optionsId);
        }
      }
    }
    return res
      .code(statusCode)
      .send(body);
  } catch (error) {
    return res
      .code(500)
      .send(error);
  }
}

exports.userUpdateOrder = async (req, res) => {
  try {
    const problems = validate(orderTypeValidation.USER_UPDATE, req.body);
    if (problems) {
      return problems;
    }
    const { id } = req.params;
    await Order.findByIdAndUpdate(id, req.body);
    return res
      .code(200)
      .send('OK');
  } catch (error) {
    console.log(error)
    return res
      .code(500)
      .send(error);
  }
}

exports.storeUpdateOrder = async (req, res) => {
  try {
    const problems = validate(orderTypeValidation.STORE_UPDATE, req.body);
    if (problems) {
      return problems;
    }
    const { id } = req.params;
    await Order.findByIdAndUpdate(id, req.body);
    return res
      .code(200)
      .send('OK');
  } catch (error) {
    console.log(error)
    return res
      .code(500)
      .send(error);
  }
}

exports.getOrderDetails = async (req, res) => {
  try {
    const cart = req.body;
    for (let idx = 0; idx < cart.length; idx++) {
      const { photoUri, optionsId, itemId } = cart[idx];
      cart[idx].photoUri = imageHandler.get(photoUri);
      cart[idx].optionsId = await itemController.getOptions(itemId, optionsId);
    }
    return res
      .code(200)
      .send(cart);
  } catch (error) {
    console.log(error);
    return res
      .code(500)
      .send(error)
  }
}

exports.hasActiveOrderFromUser = async ({ costumer, status }) => {
  try {
    const order = await Order.findOne({
      costumer: { $eq: costumer },
      status: { $eq: status }
    });
    return order !== null;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const paginatedOrder = async ({ page, perPage, query }) => {
  if (page <= 0 || perPage <= 0) {
    return {
      statusCode: 400,
      body: 'page e perPage precisam ser maiores que 0'
    }
  }
  const findOrders = (callback) => Order.find(query)
    .skip((page - 1) * perPage)
    .limit(perPage)
    .select('-__v')
    .sort([['updatedAt', -1]])
    .populate(query.costumer ? 'store' : 'costumer', 'name phoneNumber _id')
    .populate('cart.item', 'name photoUri')
    .populate('status', 'value')
    .populate('deliveryAddress', '-__v')
    .lean()
    .exec((error, doc) => {
      if (error) { callback(error, null); }
      callback(null, doc);
    })
  const countTotal = (callback) => Order.countDocuments(query, (error, doc) => {
    if (error) { callback(error, null); }
    callback(null, doc);
  });
  try {
    const results = await async.parallel([countTotal, findOrders]);
    const orders = results[1];
    const statusCode = orders.length ? 200 : 404;
    return {
      statusCode,
      body: {
        data: orders,
        perPage: perPage,
        page: page,
        total: results[0]
      }
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: error
    };
  }
}

exports.hasOrderInStatus = async (storeId, statusId) => {
  try {
    return await Order.countDocuments({ store: storeId, status: statusId });
  } catch (error) {
    return;
  }
}