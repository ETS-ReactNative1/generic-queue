const Store = require('../models/Store');
const { createValidate, updateValidate } = require('./validators/storeValidator');
const userController = require('./userController');
const addressController = require('./addressController');
const orderStatusController = require('./orderStatusController');
const orderController = require('./orderController');
const jwt = require('jsonwebtoken');
const imageHandler = require('../utils/imageHandler');
const UserRoles = require('../models/enums/UserRoles');
const async = require('async');
const ObjectId = require('mongodb').ObjectID;


exports.createStore = async (req, res) => {
  req.body.manager.role = UserRoles.MANAGER;
  const problems = await createValidate(req.body);
  if (problems) {
    return res
      .code(400)
      .send(problems);
  }
  const { manager, store } = req.body;
  let filename;
  try {
    store.manager = await userController.createUserHandle(manager);
    store.address = await addressController.createAddress(store.address);
    const b64Image = store.photoUri;
    filename = imageHandler.save(b64Image, 'store');
    store.photoUri = filename;
    store.status = await orderStatusController.createManyOrderStatus(store.status);
    const storeDb = await Store.create(store);

    const token = jwt.sign(
      {
        userId: manager._id,
        storeId: storeDb._id,
        role: UserRoles.MANAGER
      },
      process.env.JWT_TOKEN,
      { expiresIn: '12h' });
    return res
      .code(200)
      .send({
        userId: manager._id,
        storeId: storeDb._id,
        username: manager.name,
        token: token
      });
  } catch (error) {
    if (filename) {
      imageHandler.delete(filename);
    }
    if (store.manager && store.manager._id) {
      try {
        await userController.deleteUser(store.manager._id);
        await addressController.deleteAddress(store.address._id);
      } catch (err) {
        return res
          .code(500)
          .send(error)
      }
    }
    return res
      .code(500)
      .send(error)
  }
}

exports.searchStore = async (req, res) => {
  const { name } = req.query;
  const perPage = Number(req.query.perPage);
  const page = Number(req.query.page);
  const query = name ? `.*${name}.*` : '.*';
  const findStores = (callback) => Store.find({ name: { $regex: query, $options: 'i' } })
    .skip((page - 1) * perPage)
    .limit(perPage)
    .select({ photoUri: 1, name: 1, address: 1, phoneNumber: 1 })
    .populate('address', '-__v')
    .lean()
    .exec((error, doc) => {
      if (error) { callback(error, []); }
      callback(null, doc);
    })
  const countTotal = (callback) => Store.countDocuments({ name: { $regex: query, $options: 'i' } }, (error, doc) => {
    if (error) { callback(error, 0); }
    callback(null, doc);
  });

  async.parallel([countTotal, findStores], (error, results) => {
    if (error) {
      return res
        .code(500)
        .send(error);
    }
    const stores = results[1];
    let statusCode = stores.length ? 200 : 404;
    stores.forEach(store => {
      store.photoUri = imageHandler.get(store.photoUri);
    });
    return res
      .code(statusCode)
      .send({
        data: stores,
        perPage: perPage,
        page: page,
        total: results[0]
      });
  });
}

// used on frontend
exports.getStoreInfo = async (req, res) => {
  const { id } = req.params;
  try {
    const store = await Store.findById(id, { __v: 0, orders: 0 })
      .populate({
        path: 'manager',
        select: '-__v -password -role',
        populate: {
          path: 'address',
          select: '-__v -coords'
        }
      })
      .populate('address', '-__v -coords')
      .populate('status', '-__v')
      .lean();
    if (store) {
      store.photoUri = imageHandler.get(store.photoUri);
      return res
        .code(200)
        .send(store);
    }
    return res
      .code(404)
      .send('Store not found')
  } catch (error) {
    console.log(error)
    return res
      .code(500)
      .send(error);
  }

}

// used on mobile
exports.getStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id);
    if (store) {
      return res
        .code(200)
        .send(store);
    }
    return res
      .code(404)
      .send('Store not found')

  } catch (error) {
    return res
      .code(500)
      .send(error);
  }
}


exports.updateStore = async (req, res) => {
  const isNotEmptyObject = (obj) => Object.keys(obj).length;
  try {
    let { manager, store } = req.body;
    const { id } = req.params;
    const [isNotEmptyStore, isNotEmptyManager] = [isNotEmptyObject(store), isNotEmptyObject(manager)]
    const problems = await updateValidate({
      ...req.body,
      store: isNotEmptyStore ? {
        ...req.body.store,
        _id: id
      } : {},
      manager: isNotEmptyManager ? {
        ...req.body.manager,
        role: UserRoles.MANAGER
      } : {},
    });
    if (problems) {
      return res
        .code(400)
        .send(problems);
    }

    if (isNotEmptyManager) {
      let { _id: managerId, ..._manager } = manager;
      manager = await userController.handleUpdateUser(managerId, _manager);
      if (manager.code !== 200) {
        return res
          .code(manager.code)
          .send(manager.message)
      }
      manager = manager.message
    }
    else {
      manager = await userController.getUserFromId(store.manager);
    }

    if (isNotEmptyStore) {
      const b64Image = store.photoUri;
      const oldStore = await Store.findById(id, 'photoUri status', { lean: true }).populate('status');

      let newStatusDb = [];
      if (store.status) {
        const newStatus = store.status;
        const oldStatus = oldStore.status;
        const toCreateSts = [];
        const toUpdateSts = [];
        const toPersistSts = [];
        const toDeleteStsIds = [];


        // toDeleteSts is what remain in oldStatus
        newStatus.forEach((newSts) => {
          // new status
          if (!newSts._id) {
            toCreateSts.push(newSts);
          }
          else {
            const idx = oldStatus.findIndex(sts => sts.value === newSts.value);
            if (oldStatus[idx].isCancelable !== newSts.isCancelable) {
              toUpdateSts.push(newSts);
            }
            else {
              toPersistSts.push(newSts);
            }
            // remove to then check if oldStatus have sts that newStatus doesn't (and then delete)
            oldStatus.splice(idx, 1);
          }
        });
        // have status to delete
        for (let oldSts of oldStatus) {
          const qtd = await orderController.hasOrderInStatus(id, oldSts._id);
          if (qtd) {
            return res
              .code(400)
              .send('Não foi possível atualizar loja: Não é possível deletar status com pedidos nesse estado');
          }
          else {
            toDeleteStsIds.push(oldSts._id);
          }
        }
        await orderStatusController.deleteMany(toDeleteStsIds);
        newStatusDb = await orderStatusController.createOrUpdateStatus(toCreateSts, toUpdateSts);
        newStatusDb.push(...toPersistSts);
        store.status = newStatusDb.map(sts => ObjectId(sts._id))
      }
      if (b64Image) {
        if (oldStore.photoUri) {
          store.photoUri = imageHandler.update(b64Image, 'store', oldStore.photoUri);
        }
        else {
          store.photoUri = imageHandler.save(b64Image, 'store');
        }
      }
      else {
        delete store.photoUri;
      }
      let newAddress;
      if (store.address && Object.keys(store.address).length) {
        let { _id: addressId, ...address } = store.address;
        newAddress = await addressController.updateAddress(addressId, address);
      }
      delete store._id;
      store = Store.findByIdAndUpdate(id, store, { new: true }, (err, doc) => {
        if (err) { throw new Error('Erro ao atualizar store') }
      }).lean();
      if (!newAddress) {
        store = store.populate('address', '-__v -coords');
      }
      if (!newStatusDb.length) {
        store = store.populate('status', '-__v');
      }
      store = await store;
      if (newAddress) {
        store.address = newAddress;
      }
      if (newStatusDb.length) {
        store.status = newStatusDb;
      }
      store.photoUri = b64Image ? b64Image :
        (oldStore.photoUri ? imageHandler.get(oldStore.photoUri) : '');
      if (isNotEmptyManager) {
        store.manager = manager;
      }
      else {
        store.manager = await userController.getUserFromId(store.manager)
      }
    }
    // IF STORE IS EMPTY
    else {
      store = await Store.findById(id).populate('address', '-__v -coords').populate('status').lean();
      store.manager = manager;
      store.photoUri = imageHandler.get(store.photoUri);
    }
    const { __v, orders, ...response } = store;
    return res
      .code(200)
      .send(response);
  } catch (error) {
    console.log(error)
    return res
      .code(500)
      .send(error);
  }
}

exports.deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findByIdAndDelete(id);
    return res
      .code(200)
      .send(store);
  } catch (error) {
    return res
      .code(500)
      .send(error);
  }
}

exports.getStoreByRegion = async (req, res) => {
  try {
    const { southWest, northEast } = req.body;
    const bottomLeft = [southWest.latitude, southWest.longitude];
    const topRight = [northEast.latitude, northEast.longitude];

    let stores = await Store.find()
      .populate({
        path: 'address',
        select: '-__v',
        match: {
          coords: {
            $geoWithin: { $box: [bottomLeft, topRight] }
          }
        }
      }).select('-__v -orders -manager -cnpj');
    stores = stores.filter(store => store.address);
    if (!stores) {
      return res
        .code(404)
        .send('stores not found')
    }
    stores.forEach(store => {
      store.photoUri = imageHandler.get(store.photoUri);
    });
    return res
      .code(200)
      .send(stores)
  } catch (error) {
    console.log(error)
    return res
      .code(500)
      .send('error on get store by region')
  }
}

exports.getStoreStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const store = await Store.findById(id).populate('status').lean();
    return res
      .code(200)
      .send(store.status);
  } catch (error) {
    return res
      .code(500)
      .send(error);
  }
}

exports.getInitialStatus = async (storeId) => {
  const store = await Store.findById(storeId).populate('status').lean()
  return store.status.find(sts => sts.value === 'AGENDADO');
}