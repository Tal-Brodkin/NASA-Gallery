let express = require('express');
let router = express.Router();

const errorController = require('../controllers/errorController');


router.get('/not-found', errorController.get404)

router.get('/error', errorController.get500)

module.exports = router;