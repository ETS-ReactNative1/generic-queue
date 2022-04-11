const UserRoles = require('../models/enums/UserRoles');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const addressController = require('./addressController');
const { createAddress } = require('./addressController');
const { createValidate, updateValidate } = require('./validators/userValidator');
const bcrypt = require('bcrypt');
const OrderStatus = require('../models/enums/OrderStatus');
const orderContoller = require('./orderController');

exports.getUserFromId = async id => {
  try {
    const user = await User.findById(id, '-password -role -__v').populate('address', '-__v -coords');
    return user;
  } catch (error) {
    console.log(error)
    return;
  }
}

exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await this.getUserFromId(id);
    if (!user) {
      return res
        .code(404)
        .send('usuario nao encontrado')
    }
    return res
      .code(200)
      .send(user)
  } catch (error) {
    return res
      .code(500)
      .send(error)
  }
}

const validateExistence = async user => {
  try {
    const problems = await createValidate(user);
    if (problems) {
      return problems;
    }
  } catch (error) {
    console.log(error)
    return error;
  }
}

exports.createUserHandle = async (user) => {
  try {
    const problems = await validateExistence(user);
    if (problems) {
      return problems;
    }
    const address = await createAddress(user.address);
    if (!address) {
      return "Erro ao criar Endereço"
    }
    if (address._id) {
      user.address = address;
    }
    const result = await User.create(user);
    return { ...result._doc, password: null, _id: result.id, coords: address.coords.coordinates };
  } catch (error) {
    if (user.address && user.address._id) {
      await addressController.deleteAddress(user.address._id);
    }
    console.log(error)
    return error;
  }
}

// only called by mobile, creating costumer
exports.createUser = async (req, res) => {
  try {
    req.body.role = UserRoles.COSTUMER;
    const result = await this.createUserHandle(req.body);
    if (result._id) {
      const token = jwt.sign(
        {
          userId: result._id,
          role: 'COSTUMER'
        },
        process.env.JWT_TOKEN);
      return res
        .code(200)
        .send({
          userId: result._id,
          username: result.name,
          coords: result.coords,
          token: token
        });
    }
    else if (typeof result === 'string') {
      return res
        .code(400)
        .send(result)
    }
    else {
      return res
        .code(500)
        .send(result)
    }
  } catch (error) {
    return res
      .code(500)
      .send(error);
  }
}

exports.validateUser = async (req, res) => {
  try {
    const user = req.body;
    user.role = UserRoles.COSTUMER;
    const problems = await validateExistence(user);
    if (problems) {
      return res
        .code(400)
        .send(problems);
    }
    return res
      .code(200)
      .send();
  } catch (error) {
    console.log(error)
    return res
      .code(500)
      .send(error);
  }
}

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const payload = {
      costumer: id,
      status: OrderStatus.PROCESSING,
    }
    const hasOrders = await orderContoller.hasActiveOrderFromUser(payload);
    if (hasOrders) {
      return res
        .code(404)
        .send('existem pedidos sendo processados');
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res
        .code(404)
        .send('usuario nao encontrado');
    }
    if (res) {
      return res
        .code(204)
        .send();
    }
  } catch (error) {
    if (res) {
      return res
        .code(500)
        .send(error);
    }
  }
}

//called alone by storeController
exports.handleUpdateUser = async (id, payload) => {
  try {
    if (payload.oldPassword && payload.newPassword) {
      const oldUser = await User.findById(id);
      const isEqual = await bcrypt.compare(payload.oldPassword, oldUser.password);
      if (!isEqual) {
        return {
          code: 400,
          message: 'Senha incorreta'
        }
      }
      delete payload.oldPassword;
      payload.password = payload.newPassword.slice();
      delete payload.newPassword;
    }
    let newAddress;
    if (payload.address && Object.keys(payload.address).length) {
      let { _id: addressId, ...address } = payload.address;
      newAddress = await addressController.updateAddress(addressId, address);
    }
    const userPromise = User.findOneAndUpdate({ _id: id }, payload, { new: true }).lean();
    let user;
    if (!newAddress) {
      user = await userPromise.populate('address', '-__v -coords');
    }
    else {
      user = await userPromise;
      user.address = newAddress;
    }
    const { password, role, __v, ..._user } = user;
    return {
      code: 200,
      message: _user
    }
  } catch (error) {
    console.log(error);
    return {
      code: 500,
      message: 'Erro ao atualizar usuario'
    }
  }
}

//called on route (always mobile)
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const problems = await updateValidate({
      ...req.body,
      _id: id,
      role: UserRoles.COSTUMER
    });
    if (problems) {
      return res
        .code(400)
        .send(problems);
    }
    const response = await this.handleUpdateUser(id, req.body);
    if (response.code !== 200) {
      return res
        .code(response.code)
        .send(response.message);
    }
    return res
      .code(response.code)
      .send(response.message);
  } catch (error) {
    return res
      .code(500)
      .send(error);
  }
}

exports.getUserAddress = async (userId) => {
  const user = await User.findById(userId).populate('address', '-__v').lean();
  return user.address;
}