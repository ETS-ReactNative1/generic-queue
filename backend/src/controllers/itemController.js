const validate = require('./validators/itemValidator');
const Item = require('../models/Item');
const imageHandler = require('../utils/imageHandler');
const async = require('async');

exports.createItem = async (req, res) => {
  let filename;
  try {
    const { storeId } = req.params;
    const problems = validate.createValidation(req.body);
    if (problems) {
      return res
        .code(400)
        .send(problems)
    }
    const payload = { ...req.body, store: storeId }
    const b64Image = payload.photoUri;
    filename = imageHandler.save(b64Image, 'item');
    payload.photoUri = filename;
    const item = await Item.create(payload);
    item.photoUri = b64Image;
    return res
      .code(200)
      .send(item);
  } catch (error) {
    if (filename) {
      imageHandler.delete(filename);
    }
    console.log(error)
    return res
      .code(500)
      .send(error);
  }
}

exports.getItens = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { name } = req.query
    const perPage = Number(req.query.perPage);
    const page = Number(req.query.page);
    if (page <= 0 || perPage <= 0) {
      return res
        .code(400)
        .send('page e perPage precisam ser maiores que 0')
    }
    const query = name ? `.*${name}.*` : '.*';
    const filter = {
      store: storeId,
      name: { $regex: query, $options: 'i' }
    };
    const findItens = (callback) => Item.find(filter)
      .skip((page - 1) * perPage)
      .limit(perPage)
      .select('-__v')
      .sort([['updatedAt', -1]])
      .lean()
      .exec((error, doc) => {
        if (error) { callback(error, null); }
        callback(null, doc);
      })
    const countTotal = (callback) => Item.countDocuments(filter, (error, doc) => {
      if (error) { callback(error, null); }
      callback(null, doc);
    });

    async.parallel([countTotal, findItens], (error, results) => {
      if (error) {
        return res
          .code(500)
          .send(error);
      }
      const itens = results[1];
      let statusCode = itens.length ? 200 : 404;
      itens.forEach(item => {
        item.photoUri = imageHandler.get(item.photoUri);
      });
      return res
        .code(statusCode)
        .send({
          data: itens,
          perPage: perPage,
          page: page,
          total: results[0]
        });
    });
  } catch (error) {
    return res
      .code(500)
      .send(error);
  }
}

exports.updateItem = async (req, res) => {
  const item = req.body;
  const { id } = req.params;
  const problems = validate.updateValidation(item);
  if (problems) {
    return res
      .code(400)
      .send(problems)
  }
  try {
    const b64Image = item.photoUri;
    const oldItem = await Item.findById(id, 'photoUri');
    if (b64Image) {
      if (oldItem.photoUri) {
        item.photoUri = imageHandler.update(b64Image, 'item', oldItem.photoUri);
      }
      else {
        item.photoUri = imageHandler.save(b64Image, 'item');
      }
    }
    const newItem = await Item.findOneAndUpdate({ _id: id }, item, {
      new: true
    });
    newItem.photoUri = b64Image || imageHandler.get(newItem.photoUri);
    return res
      .code(200)
      .send(newItem);
  } catch (error) {
    console.log(error);
    return res
      .code(500)
      .send(error);
  }
}

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByIdAndDelete(id);
    imageHandler.delete(item.photoUri);
    return res
      .code(200)
      .send(item);
  } catch (error) {
    return res
      .code(500)
      .send(error);
  }
}

exports.getItensImage = async (req, res) => {
  try {
    const images = req.body;
    const imagesFile = images.map(image => imageHandler.get(image));
    return res
      .code(200)
      .send(imagesFile);
  } catch (error) {
    return res
      .code(500)
      .send(error);
  }
}

exports.populateItens = async (cart) => {
  for (let idx = 0; idx < cart.length; idx++) {
    cart[idx].item = await Item.findById(cart[idx].item);
  }
}

exports.getOptions = async (itemId, optionsId) => {
  try {
    const { options } = await Item.findById(itemId).populate({
      path: 'options',
    }).lean();
    return options.filter(opt => optionsId.indexOf(opt._id.toString()) > -1);
  } catch (error) {
    console.log(error);
    return;
  }
}