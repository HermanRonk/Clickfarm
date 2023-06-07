const express = require('express');
const router = express.Router();
const connectorController = require('../controllers/connectorController.js');

// add get route that displays the index.ejs view
router.get('/', (req, res) => {
    res.render('index');
});

router.post('/connector', (req, res) => {
    connectorController.handleRequest(req, res)
});

router.post('/restore', async (req, res) => {
    const result = await connectorController.handleRestore(req.body.id)
    res.status(200).json(result) 
})

router.post('/saveinit', async (req, res) => {
    const result = await connectorController.handleSaveInit(req.body.id, req.body.savegame)
    res.status(200).json(result) 
})

router.post('/savepers', async (req, res) => {
    const result = await connectorController.handleSavePers(req.body.id, req.body.savegame)
    res.status(200).json(result) 
})

router.post('/save', async (req, res) => {
    const result = await connectorController.handleSavePers(req.body.id, req.body.savegame)
    res.status(200).json(result) 
})

module.exports = router;
