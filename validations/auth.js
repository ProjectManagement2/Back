import {body} from 'express-validator';

export const registerValidation = [
    body('surname').isLength({min: 1}),
    body('name').isLength({min: 1}),
    body('date').isLength({min: 10}),
    body('email').isEmail(),
    body('password').isLength({min: 8})
]