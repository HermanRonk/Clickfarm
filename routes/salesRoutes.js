const express = require('express');
const router = express.Router();
const { saveSale } = require('../controllers/salesSqlfunctions');
const Joi = require('joi');

router.post('/', async (req, res) => {
    const { id, type, amount, profit } = req.body;
    const uuidValidation = Joi.string().pattern(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    if (uuidValidation.validate(id).error) {
      res.status(400).send('Invalid user ID');
      return;
    }

    try {
        await saveSale(id, type, amount, profit);
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
