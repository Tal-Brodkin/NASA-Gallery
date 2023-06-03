const Cookies = require('cookies');
const keys = ['keyboard cat']
const dataBase = require('../models');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');

/**
 * Messages to user
 * @type {string}
 */
const REGISTRATION_SUCCESS = 'The registration process was successful, you can log in now',
    LOGIN_FAIL = 'Incorrect login information',
    FAIL_STYLE = 'text-danger',
    SUCCESS_STYLE = 'text-success',
    COOKIE_EXPIRED = 'Registration process is expired, please start again',
    EMAIL_TAKE = 'Email in use. Please try another one'

/**
 * View pages
 * @type {string}
 */
const LOGIN_PAGE = 'login',
    REGISTER_PAGE = 'register',
    PASSWORD_PAGE = 'register-password',
    HOME_PAGE = 'home',
    CODE_400 = 'Bad request',
    CODE_500 = 'Internal server error'

/**
 * hush salt & cookies time
 * @type {number}
 */
const saltRounds = 10,
    COOKIES_MAX_AGE_10_SEC = 10 * 1000,
    COOKIES_MAX_AGE_30_SEC = 30 * 1000

/**
 * checks if the parameters aren't empty
 * @param params
 * @returns {boolean}
 */
function checkParams(...params){
    for (let param of params){
        if (!param) {
            return false
        }
    }
    return true
}

/**
 * handling the get request for the login page
 * @param req
 * @param res
 * @returns {*}
 */
exports.loginPage = (req, res) => {

    const cookies = new Cookies(req, res, { keys: keys })
    const registered = cookies.get('registered', { signed: true })
    const error = cookies.get('error', { signed: true })
    const expired = cookies.get('sessionExpired', { signed: true })
    const code_400 = cookies.get('CODE_400', { signed: true })

    if (expired) {
        cookies.set('sessionExpired', { signed: true, maxAge: 0 });
        res.render(LOGIN_PAGE, {title: expired, style: FAIL_STYLE});
    }
    else if (registered) {
        cookies.set('registered', { signed: true, maxAge: 0 });
        res.render(LOGIN_PAGE, {title: REGISTRATION_SUCCESS, style: SUCCESS_STYLE});
    }
    else if (code_400){
        cookies.set('CODE_400', { signed: true, maxAge: 0 });
        res.render(LOGIN_PAGE, { title: CODE_400, style: FAIL_STYLE });
    }
    else if (error) {
        cookies.set('error', { signed: true, maxAge: 0 });
        res.render(LOGIN_PAGE, { title : LOGIN_FAIL, style : FAIL_STYLE });
    }
    else
        res.render(LOGIN_PAGE);
}

/**
 * handling the get request for the register page
 * @param req
 * @param res
 * @returns {*}
 */
exports.registerPage = (req, res) => {

    const cookies = new Cookies(req, res, { keys: keys })

    const error = cookies.get('error', { signed: true })
    const expired = cookies.get('expired', { signed: true })
    const newUser = cookies.get('newUser', { signed: true })
    const code_400 = cookies.get('CODE_400', { signed: true })

    if (expired){
        cookies.set('expired', { signed: true, maxAge: 0 });
        res.render(REGISTER_PAGE, { title: COOKIE_EXPIRED });
    }
    else if (error){
        const userData = JSON.parse(error)
        cookies.set('error', { signed: true, maxAge: 0 });
        res.render(REGISTER_PAGE, { title: EMAIL_TAKE, email: userData.email, firstName: userData.firstName, lastName: userData.lastName});
    }
    else if (code_400){
        cookies.set('CODE_400', { signed: true, maxAge: 0 });
        res.render(REGISTER_PAGE, { title: CODE_400 });
    }
    else if(newUser){
        const userData = JSON.parse(newUser)
        res.render(REGISTER_PAGE, { email: userData.email, firstName: userData.firstName, lastName: userData.lastName});
    }
    else{
        res.render(REGISTER_PAGE);
    }
}

/**
 * handling the post request for the register page - checks the registration info
 * @param req
 * @param res
 */
exports.checkRegistration = (req, res) => {

    const { email, firstName, lastName } = req.body;
    const cookies = new Cookies(req, res, { keys: keys })

    if (!checkParams(email, firstName, lastName)){
        cookies.set('CODE_400', CODE_400, { signed: true, maxAge: COOKIES_MAX_AGE_10_SEC });
        res.redirect('/register')
    }
    else {
        const userData = {
            email: email.toLowerCase(),
            firstName: firstName,
            lastName: lastName
        }

        cookies.set('newUser', JSON.stringify(userData), {signed: true, maxAge: COOKIES_MAX_AGE_30_SEC });

        dataBase.UsersTable.findOne({
            where: {email: req.body.email}
        }).then(user => {

            if (user) {
                cookies.set('error', JSON.stringify(userData), {signed: true, maxAge: COOKIES_MAX_AGE_10_SEC });
                res.redirect('/register')
            } else {
                res.redirect('/register-password')
            }
        }).catch(() => {
            res.status(404).redirect('/error')
        })
    }
}

/**
 * handling the get request for the password page
 * @param req
 * @param res
 */
exports.passwordPage = (req, res) => {

    const cookies = new Cookies(req, res, { keys: keys })
    const cookie = cookies.get('newUser', { signed: true })

    if (cookie)
        res.render(PASSWORD_PAGE);
    else
        res.redirect('/register')
}

/**
 * handling the post request for the password page - checks the registration info
 * @param req
 * @param res
 */
exports.checkPassword = (req, res) => {

    const cookies = new Cookies(req, res, { keys: keys })
    const cookie = cookies.get('newUser', { signed: true })

    // first check if the cookie is not expired
    if (cookie) {
        const newUser = JSON.parse(cookie)

        const { email, firstName, lastName } = newUser;
        const password = req.body.password

        if (!checkParams(email, firstName, lastName, password)){
            cookies.set('CODE_400', CODE_400, { signed: true, maxAge: COOKIES_MAX_AGE_10_SEC });
            res.redirect('/register')
        }
        else {

            dataBase.UsersTable.findOne({
                where: {email: newUser.email}
            }).then(user => {
                // if the cookie not expired, check again if the email was not taken in the meantime
                // if it does - redirect to register page and tell the user to select another email
                if (user) {

                    const userData = {
                        email: newUser.email,
                        firstName: newUser.firstName,
                        lastName: newUser.lastName
                    }
                    cookies.set('error', JSON.stringify(userData), {signed: true, maxAge: COOKIES_MAX_AGE_10_SEC });
                    res.redirect('/register')
                }
                // if the email doesn't get taken we can add the new user
                // to the database and redirect the user to login page
                else {

                    bcrypt.hash(password, saltRounds)
                        .then(hash => {
                            dataBase.UsersTable.create({
                                firstName: newUser.firstName.trim(),
                                lastName: newUser.lastName.trim(),
                                email: newUser.email.trim(),
                                password: hash
                            }).then(() => {
                                cookies.set('newUser', {signed: true, maxAge: 0});
                                cookies.set('registered', 'registered', {signed: true, maxAge: COOKIES_MAX_AGE_10_SEC});
                                res.redirect('/')
                            }).catch(err => {
                                if (err instanceof Sequelize.ValidationError) {
                                    res.status(400).send({message: CODE_400})
                                } else
                                    res.status(500).send({message: CODE_500})
                            })
                        }).catch(() => {
                            res.status(404).redirect('/error')
                        })
                }
            }).catch(() => {
                res.status(404).redirect('/error')
            })
        }

    }
    // if the cookie is expired, redirect the user to register page to start over
    else{
        cookies.set('expired', 'expired', { signed: true, maxAge: COOKIES_MAX_AGE_10_SEC });
        res.redirect('/register')
    }
}

/**
 * handling the get request for the home page - checks if the session is active
 * @param req
 * @param res
 */
exports.homePage = (req, res) => {

    if (req.session.logedIn) {
        const email = req.session.username
        const userName = email.split("@")[0];
        res.render(HOME_PAGE, { title: userName, user: email})
    }
    else
        res.redirect('/')
}

/**
 * handling the post request for the login page - checks the login info
 * @param req
 * @param res
 */
exports.checkLogin = (req, res) => {

    const cookies = new Cookies(req, res, { keys: keys })
    const { email, password } = req.body;

    if (!checkParams(email, password)){
        cookies.set('CODE_400', CODE_400, { signed: true, maxAge: COOKIES_MAX_AGE_10_SEC });
        res.redirect('/')
    }
    else {
        dataBase.UsersTable.findOne({
            where: {email: req.body.email},
            attributes: ['password']
        }).then(user => {
            if (!user) {
                cookies.set('error', 'error', {signed: true, maxAge: COOKIES_MAX_AGE_10_SEC })
                res.redirect('/')
            } else {
                bcrypt.compare(req.body.password, user.dataValues.password)
                    .then(result => {
                        if (result) {
                            req.session.logedIn = true
                            req.session.username = req.body.email
                            res.redirect('/home')
                        } else {
                            cookies.set('error', 'error', {signed: true, maxAge: COOKIES_MAX_AGE_10_SEC })
                            res.redirect('/')
                        }
                    }).catch(() => {
                        res.status(404).redirect('/error')
                    })
            }
        }).catch(() => {
            res.status(404).redirect('/error')
        })
    }
}

/**
 * handling the logout request - deactivate the session and redirects to login page
 * @param req
 * @param res
 */
exports.logout = (req, res) => {
    req.session.logedIn = false
    res.status(200).send({ url : '/'})
}

