

/**
 * errors for user
 * @type {string}
 */
const NOT_FOUNDED = 'Page Not Found',
    ERROR = 'Internal server error'


/**
 * displays the ERROR page when a user tries to access an invalid url
 * @param req
 * @param res
 */
exports.get404 = (req, res) => {
    res.status(404).render('error', { title : NOT_FOUNDED });
};

/**
 * displays the ERROR page when there is a problem with the database
 * @param req
 * @param res
 */
exports.get500 = (req, res) => {
    res.status(404).render('error', { title : ERROR });
};