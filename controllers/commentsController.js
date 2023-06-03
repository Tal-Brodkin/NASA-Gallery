const dataBase = require('../models');
const Sequelize = require('sequelize');

/**
 * errors for user
 * @type {string}
 */
const CODE_400 = 'Bad request',
    CODE_404 = 'Comment not founded (perhaps it has already been deleted)',
    CODE_500 = 'Internal server error'

/**
 * adding a new comment to the comments table and updating the posts table about the change
 * @param req
 * @param res
 */
exports.postComment = (req, res) => {

    const { userName, comment, commentId, postId } = req.body;
    console.log(userName)

    // add the comment to the comments table
    dataBase.CommentsTable.create({
        userName: userName,
        postId: postId,
        commentId: commentId,
        comment: comment

    }).then(() => {
        // check if this is a first time comment for this post
        dataBase.PostsTable.findOne({
            where : { postId: postId }
        }).then(user => {
            // if the post already exist - update it
            if (user){
                dataBase.PostsTable.update(
                    { lastTimeModified : new Date() },
                    { where : { postId : postId }
                    }).then( () => {
                        res.status(200).end()
                    }).catch( () => {
                        res.status(500).send({ message: CODE_500})
                    })
            }
            // if it doesn't exist - create it
            else{
                dataBase.PostsTable.create({
                    postId: postId,
                    lastTimeModified : new Date()
                }).then(() => {
                    res.status(200).end()
                }).catch( err => {
                    if (err instanceof Sequelize.ValidationError) {
                        res.status(400).send({message: CODE_400})
                    }
                    else
                        res.status(500).send({ message: CODE_500})
                })
            }
        }).catch( () => {
            res.status(500).send({ message: CODE_500})
        })

    }).catch( err => {
        if (err instanceof Sequelize.ValidationError) {
            res.status(400).send({message: CODE_400})
        }
        else
            res.status(500).send({ message: CODE_500})
        })
}

/**
 * gets all the comments for a specific post
 * @param req
 * @param res
 */
exports.getComments = (req, res) => {

    dataBase.CommentsTable.findAll({
        where : { postId: req.params.id }

    }).then(comments => {
        res.status(200).json(comments)
    }).catch(() => {
        res.status(500).send({ message: CODE_500})
    })
}

/**
 * gets all the comments for a specific post only if there were a change for the post (a comments added or deleted)
 * @param req
 * @param res
 */
exports.getNewComments = (req, res) => {

    const postId = req.params.id;

    dataBase.PostsTable.findOne({
        where : { postId : postId }
    }).then(data => {

        // couldn't find the post = there were never comments for this post
        if (!data) {
            return res.status(204).end()
        }

        const modified = data.dataValues.lastTimeModified
        const current = new Date()

        // the post is founded = lets check when was the last update
        if (current - modified < 15000){

            // there was an update in the last 15 seconds
            // look for the comments on the comments table
            dataBase.CommentsTable.findAll({
                where : { postId: postId }

            }).then(comments => {
                // return comments to client - maybe empty
                res.status(200).json(comments)
            }).catch( () => {
                res.status(500).send({ message: CODE_500})
            })
        }
        // there wasn't an update in the last 15 seconds
        else{
            res.status(204).end()
        }
    }).catch(() => {
        res.status(500).send({ message: CODE_500})
    })
}

/**
 * deletes a comment from the comments table and updating the posts table about the change
 * @param req
 * @param res
 */
exports.deleteComment = (req, res) => {

    const commentId = req.params.commentId;
    const postId = req.params.postId;

    dataBase.CommentsTable.destroy({
        where : { commentId : commentId }

    }).then(() => {
        dataBase.PostsTable.update(
            { lastTimeModified : new Date() },
            { where : { postId : postId }

            }).then( updated => {
                if (!updated.includes(0))
                    res.status(200).end()
                else
                    res.status(404).send({ message: CODE_404 })
            }).catch(() => {
                res.status(500).send({ message: CODE_500})
            })

    }).catch(() => {
        res.status(500).send({ message: CODE_500})
    })
}