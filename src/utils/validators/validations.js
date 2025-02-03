import {query} from 'express-validator';

export const queryValidation = [
  query('term').notEmpty().withMessage('Search term is required'),
];
