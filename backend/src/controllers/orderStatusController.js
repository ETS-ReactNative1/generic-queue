const OrderStatus = require('../models/OrderStatus');

exports.createOrUpdateStatus = async (toCreateSts, toUpdateSts) => {
  try {
    const newSts = await OrderStatus.insertMany(toCreateSts, { lean: true });
    toUpdateSts.forEach(async sts => {
      const { _id, ..._sts } = sts;
      const updatedSts = await OrderStatus.findByIdAndUpdate(_id, _sts, { lean: true });
      newSts.push(updatedSts);
    });
    return newSts;
  } catch (error) {
    console.log(error)
    return;
  }
}

exports.createManyOrderStatus = async (status) => {
  try {
    return await OrderStatus.insertMany(status);
  } catch (error) {
    return;
  }
}

exports.deleteAllFromStore = async (statusObjs) => {
  try {
    const statusIds = statusObjs.map(sts => sts._id);
    return await OrderStatus.deleteMany({ _id: { $in: statusIds } });
  } catch (error) {
    return;
  }
}

exports.deleteMany = async (statusIds) => {
  try {
    return await OrderStatus.deleteMany({ _id: { $in: statusIds } });
  } catch (error) {
    return;
  }
}