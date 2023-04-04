import bcrypt from 'bcrypt';
import UserModel from '../models/User.js';

import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const doc = new UserModel({
      email: req.body.email,
      passwordHash: hash,
      avatarUrl: req.body.avatarUrl,
      fullName: req.body.fullName,
    });
    const user = await doc.save();
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );
    const { passwordHash, ...userData } = user._doc;
    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to finish registration',
    });
  }
};
export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({
        message: 'Incorrect email or passwords1',
      });
    }
    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash);
    if (!isValidPass) {
      return res.status(404).json({
        message: 'Incorrect email or password',
      });
    }
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      },
    );
    const { passwordHash, ...userData } = user._doc;
    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Unable to login',
    });
  }
};

export const me = async (req, res) => {
  //checkAuth je middleware f-ja koja prvo mora da se odradi pa tek onda ostatak koda
  try {
    const user = await UserModel.findById(req.userId); //trazimo user po id koji smo uzeli iz tokena
    if (!user) {
      return res.status(404).json({
        message: 'Cant find a user',
      });
    }

    const { passwordHash, ...userData } = user._doc; //odvajamo iz user doc passwordhash da ne bi vracali sifrovani pass nego samo userData
    res.json({
      ...userData,
    });
  } catch (err) {
    res.status(500).json({
      message: '/me dont have access',
    });
  }
};
