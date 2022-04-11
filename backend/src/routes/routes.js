const storeController = require('../controllers/storeController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const itemController = require('../controllers/itemController');
const orderController = require('../controllers/orderController');

module.exports = [
  // STORE ROUTES
  {
    method: 'POST',
    url: '/store',
    handler: storeController.createStore
  },
  {
    method: 'POST',
    url: '/store/region',
    handler: storeController.getStoreByRegion,
    protected: true
  },
  {
    method: 'GET',
    url: '/store',
    handler: storeController.searchStore,
    protected: true
  },
  {
    method: 'GET',
    url: '/store/:id/details',
    handler: storeController.getStoreInfo,
    protected: true
  },
  {
    method: 'GET',
    url: '/store/:id',
    handler: storeController.getStore,
    protected: true
  },
  {
    method: 'PUT',
    url: '/store/:id',
    handler: storeController.updateStore,
    protected: true
  },
  {
    method: 'DELETE',
    url: '/store/:id',
    handler: storeController.deleteStore,
    protected: true
  },
  {
    method: 'GET',
    url: '/store/:id/status',
    handler: storeController.getStoreStatus,
    protected: true
  },

  // ITEMS ROUTES

  {
    method: 'POST',
    url: '/store/:storeId/item',
    handler: itemController.createItem,
    protected: true
  },
  {
    method: 'GET',
    url: '/store/:storeId/item',
    handler: itemController.getItens,
    protected: true
  },
  {
    method: 'PUT',
    url: '/item/:id',
    handler: itemController.updateItem,
    protected: true
  },
  {
    method: 'DELETE',
    url: '/item/:id',
    handler: itemController.deleteItem,
    protected: true
  },
  {
    method: 'POST',
    url: '/item/images',
    handler: itemController.getItensImage,
    protected: true
  },

  // ORDER ROUTES

  {
    method: 'POST',
    url: '/store/:storeId/order',
    handler: orderController.createOrder,
    protected: true
  },
  {
    method: 'GET',
    url: '/store/:id/order',
    handler: orderController.getStoreOrders,
    protected: true
  },
  {
    method: 'GET',
    url: '/user/:id/order',
    handler: orderController.getUserOrders,
    protected: true
  },
  {
    method: 'PUT',
    url: '/user/order/:id',
    handler: orderController.userUpdateOrder,
    protected: true
  },
  {
    method: 'POST',
    url: '/order/details',
    handler: orderController.getOrderDetails,
    protected: true
  },
  {
    method: 'PUT',
    url: '/store/order/:id',
    handler: orderController.storeUpdateOrder,
    protected: true
  },
  // USER ROUTES
  {
    method: 'POST',
    url: '/user',
    handler: userController.createUser
  },
  {
    method: 'GET',
    url: '/user/:id',
    handler: userController.getUser
  },
  {
    method: 'POST',
    url: '/validate-user',
    handler: userController.validateUser
  },
  {
    method: 'DELETE',
    url: '/user/:id',
    handler: userController.deleteUser,
    protected: true
  },
  {
    method: 'PUT',
    url: '/user/:id',
    handler: userController.updateUser,
    protected: true
  },

  // AUTH ROUTES
  {
    method: 'POST',
    url: '/login',
    handler: authController.login
  },
]