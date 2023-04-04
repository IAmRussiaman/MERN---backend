import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { registerValidation, postCreateValidation } from './validations/auth.js';
import * as UserController from './controllers/UserController.js';
import checkAuth from './utils/checkAuth.js';
import * as PostController from './controllers/PostController.js';
import handleValidationErrors from './validations/handleValidationErrors.js';
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('DB is ok');
  })
  .catch((err) => {
    console.log('DB error', err);
  });
const app = express();
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    if (!fs.exystSync('uploads')) {
      fs.mkdirSync('uploads');
    }
    cb(null, 'uploads');
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));
app.post('/auth/login', handleValidationErrors, UserController.login);
app.post('/register', registerValidation, handleValidationErrors, UserController.register);
app.get('/me', checkAuth, UserController.me);
/////////////////////
app.post('/upload', checkAuth, upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});
app.get('/tags', PostController.getLastTags);
app.get('/posts', PostController.getAll);
app.get('/posts/popular', PostController.getByPopularity);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, handleValidationErrors, PostController.create);
app.delete('/posts/:id', checkAuth, PostController.remove);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update,
);
app.listen(process.env.PORT || 4444, (err) => {
  if (err) {
    return console.log(err);
  }
  console.log('Server OK');
});
