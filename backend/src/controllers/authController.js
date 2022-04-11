const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserRoles = require('../models/enums/UserRoles');
const Store = require('../models/Store');
const User = require('../models/User');


exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email, role: req.body.role });  
  if (!user)
    return res
      .code(400)
      .send('Usuário não cadastrado');
  const isEqual = await bcrypt.compare(req.body.password, user.password);
  if (!isEqual) {
    return res
      .code(400)
      .send('Senha incorreta');
  }
  if (user.role === UserRoles.MANAGER) {
    try {
      const store = await Store.findOne({ manager: { $eq: user._id } });
      const token = jwt.sign(
        {
          userId: user._id,
          storeId: store._id,
          role: UserRoles.MANAGER
        },
        process.env.JWT_TOKEN,
        { expiresIn: '12h' });
      return res
        .code(200)
        .send({
          userId: user._id,
          storeId: store._id,
          username: user.name,
          token: token
        });
    } catch (error) {
      console.log(error);
      return res
        .code(500)
        .send(error);
    }
  }
  const token = jwt.sign({
    userId: user.id,
    role: UserRoles.COSTUMER
  },
    process.env.JWT_TOKEN,
    { expiresIn: '12h' });
  return res
    .code(200)
    .send({ userId: user.id, username: user.name, token: token });
}