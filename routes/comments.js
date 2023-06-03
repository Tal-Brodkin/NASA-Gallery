let express = require('express');
let router = express.Router();

const commentsController = require('../controllers/commentsController');
const middleware = require('../controllers/middlewares');
const errorController = require("../controllers/errorController");


router.use('/*', middleware.validateSession)

router.post('/post-comment', commentsController.postComment)

router.get('/get-comments/:id', commentsController.getComments)

router.get('/get-new-comments/:id', commentsController.getNewComments)

router.delete('/delete-comment/:commentId/:postId', commentsController.deleteComment)


module.exports = router;
