let express = require('express');
let router = express.Router();

const usersController = require('../controllers/usersController');
const middleware = require("../controllers/middlewares");


router.use('/*', middleware.preventCashing)

router.route(['/', '/register', '/register-password']).get(middleware.checkSession)

router.get('/', usersController.loginPage)

router.get('/register', usersController.registerPage)

router.post('/register', usersController.checkRegistration)

router.get('/register-password', usersController.passwordPage)

router.post('/register-password', usersController.checkPassword)

router.get('/home', usersController.homePage)

router.post('/checkUser', usersController.checkLogin)

router.get('/logout', usersController.logout)



module.exports = router;
