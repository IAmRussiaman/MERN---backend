import { body } from 'express-validator';

export const registerValidation = [
  body('email').isEmail(),
  body('password').isLength({ min: 5 }),
  body('fullName', 'Username must have at least 3 characters').isLength({ min: 3 }),
  body('avatarUrl').optional().isURL(),
];

export const postCreateValidation = [
  body('title', 'Type a blog title').isLength({ min: 3 }).isString(),
  body('text', 'Type blog text').isLength({ min: 3 }).isString(),
  body('tags', 'Incorrect type of tags').optional().isArray(),
  body('imageUrl', 'Incorrect image URL').optional().isString(),
];
