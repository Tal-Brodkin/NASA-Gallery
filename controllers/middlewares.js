const Cookies = require("cookies");
const keys = ['keyboard cat']


const SESSION_EXPIRED = 'session has been expired, please login'
const COOKIES_MAX_AGE_10_SEC = 10 * 1000


/**
 * a middleware to validate the session before each request to the REST API
 * @param req
 * @param res
 * @param next
 */
exports.validateSession = (req, res, next) => {
    if (!req.session.logedIn){
        const cookies = new Cookies(req, res, { keys: keys })
        cookies.set('sessionExpired', SESSION_EXPIRED, { signed: true, maxAge: COOKIES_MAX_AGE_10_SEC })
        res.status(401).send({ message : SESSION_EXPIRED, url : '/'})
    }
    else
        next()
}

/**
 * a middleware to check the session state before accessing the login/register pages
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
exports.checkSession = (req, res, next) => {

    if (req.session.logedIn)
        return res.redirect('/home')
    else
        next()
}

/**
 * a middleware to prevent the browser from using cached pages
 * @param req
 * @param res
 * @param next
 */
exports.preventCashing = (req, res, next) => {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.set('Pragma', 'no-cache');
    next()
}
