(function () {
    document.addEventListener("DOMContentLoaded", () => {

        const apiKey = "7QJjrY4Zf8mu8ystXrvHBO7atrL6u3cZZjkObF5a"
        const apiUrl = 'https://api.nasa.gov/planetary/apod'
        const datePicker = document.getElementById('dateSelect')
        const scroller = document.getElementById("scroller")
        const bufferImg = document.getElementById('bufferImg')
        const loadMoreButton = document.getElementById('loadMore')
        const errorToast = document.getElementById('errorToast')
        const errorMessage = document.getElementById('errorMessage')
        const email = document.getElementById('userName').value
        const logoutButton = document.getElementById('logoutButton')


        // Show an element
        const show = (elem) => {
            elem.classList.remove('d-none');
        };
        // Hide an element
        const hide = (elem) => {
            elem.classList.add('d-none');
        };

        /**
         * checks the status of response
         * @param response
         * @returns {Promise<never>|Promise<unknown>}
         */
        function status(response) {
            if (response.status >= 200 && response.status <= 201) {
                return Promise.resolve(response)
            } else if (response.status === 204) {
                return Promise.reject(response)
            } else if (response.status === 401) {
                response.json().then(error => {
                    location.href = error.url
                })
            } else {
                return Promise.reject(response)
            }
        }

        /**
         * a module to handle all the data in the page
         * @type {{loadMoreData: loadMoreData, getData: getData}}
         */
        const dataHandler = (function () {
            let updatableStartDate
            const maxDays = 3
            const refreshTime = 15000
            const ERROR = 'unknown error occurred'
            const CONNECTION_ERROR = 'connection to server unavailable'
            const userName = email.split("@")[0]



            const clearPage = () => {
                scroller.innerHTML = ""
            }
            const getSelectedDate = () => datePicker.value
            /**
             * calculates the start date
             * @param date
             * @returns {string}
             */
            const calcStartDate = function (date) {
                let endDate = new Date(date)
                endDate.setDate(endDate.getDate() - maxDays)
                return new Date(endDate).toISOString().slice(0, 10)
            }
            /**
             * builds a comment object and send it to the server by post method.
             * @param event
             */
            const postComment = function (event) {
                event.preventDefault()

                const id = event.target.name
                const text = document.getElementById(`${id}input`).value.trim()
                const commentId = new Date().getTime() + userName.replace(/[^a-zA-Z0-9]/g, "") + id
                document.getElementById(`${id}input`).value = ""

                const comment = {
                    'postId': id,
                    'userName': userName,
                    'comment': text,
                    'commentId': commentId
                }

                fetch("/api/post-comment", {
                    method: "POST",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(comment)
                }).then(status)
                    .then(() => {
                        getComments(id)
                    }).catch(err => {
                        restApiErrorHandler(err)
                })
            }
            /**
             * asks the server for all the comments for specific post
             * if server return valid response the comments added to the dom.
             * @param postId
             */
            const getComments = function (postId) {
                fetch(`/api/get-comments/${postId}`)
                    .then(status)
                    .then(function (response) {
                        return response.json()
                    }).then(function (data) {
                        insertComments(data, postId)
                    }).catch(err => {
                        restApiErrorHandler(err)
                    })
            }
            /**
             * asks the server for updated comments (if any) for specific post
             * if server return valid response the comments added to the dom instead of the old ones.
             * @param postId
             */
            const getNewComments = function (postId) {
                fetch(`/api/get-new-comments/${postId}`)
                    .then(status)
                    .then(function (response) {
                        return response.json()
                    }).then(function (data) {
                        insertComments(data, postId)
                })
                    .catch(err => {
                        restApiErrorHandler(err)
                    })
            }
            /**
             * inserts comment to the dom
             * @param comments
             */
            const insertComments = function (comments, postId) {

                const commentSection = document.getElementById(`${postId}comments`)
                if (commentSection)
                    commentSection.innerHTML = ""

                comments.forEach((commentObj) => {
                    commentSection.appendChild(buildComment(commentObj, postId))
                })
            }
            /**
             * builds a comment (HTML) element to be inserted to the dom
             * @param commentObj
             * @param postId
             * @returns {HTMLDivElement}
             */
            const buildComment = function (commentObj, postId) {

                const rowDiv = elementBuilder.rowDiv()

                const nameColDiv = document.createElement('div')
                nameColDiv.classList.add('col-auto')

                const textColDiv = document.createElement('div')
                textColDiv.setAttribute('class', 'col-xs-12 col-md bg-light card p-1 my-1')

                const commentElem = document.createElement('div')
                commentElem.setAttribute('class', 'card card-body mt-1')
                commentElem.id = commentObj.commentId

                const name = document.createElement('div')
                name.setAttribute('class', 'badge bg-dark text-wrap my-1')
                name.setAttribute('style', 'font-size: 18px;')
                name.innerHTML = `@${commentObj.userName}`

                const comment = document.createElement('div')
                comment.style.width = '500px'
                comment.classList.add('img-fluid')
                comment.innerHTML = commentObj.comment

                nameColDiv.appendChild(name)
                textColDiv.appendChild(comment)

                rowDiv.appendChild(nameColDiv)
                rowDiv.appendChild(textColDiv)

                if (commentObj.userName === userName) {
                    const deleteColDiv = document.createElement('div')
                    deleteColDiv.classList.add('col-auto')
                    deleteColDiv.classList.add('my-1')
                    const deleteButton = elementBuilder.button(commentObj.commentId, 'btn btn-danger', 'Delete', 'button')
                    deleteButton.addEventListener('click', () => {
                        deleteComment(postId, commentObj.commentId)
                    })
                    deleteColDiv.appendChild(deleteButton)
                    rowDiv.appendChild(deleteColDiv)
                }

                commentElem.appendChild(rowDiv)

                return commentElem
            }
            /**
             * sends a delete request to the server, to delete a specific comment from specific post.
             * @param postId
             * @param commentId
             */
            const deleteComment = function (postId, commentId) {

                fetch(`/api/delete-comment/${commentId}/${postId}`, {
                    method: "DELETE"
                }).then(status)
                    .then(() => {
                        getComments(postId)
                    }).catch(err => {
                        restApiErrorHandler(err)
                })
            }
            /**
             * builds a comments section for the posts
             * @param postId
             * @returns {HTMLDivElement}
             */
            const commentsSection = function (postId) {

                const inputElem = document.createElement('input')
                inputElem.type = 'text'
                inputElem.id = `${postId}input`
                inputElem.classList.add('form-control')
                inputElem.classList.add('bg-light')
                inputElem.placeholder = "Write a comment..."

                const inputColElem = document.createElement('div')
                inputColElem.classList.add('col')
                inputColElem.appendChild(inputElem)

                const submitButtonElem = elementBuilder.button('id', 'btn btn-primary', 'Post', 'submit')
                submitButtonElem.name = postId
                submitButtonElem.addEventListener('click', postComment)

                const buttonColElem = document.createElement('div')
                buttonColElem.classList.add('col-auto')
                buttonColElem.appendChild(submitButtonElem)

                const rowElem = document.createElement('div')
                rowElem.classList.add('row')
                rowElem.appendChild(inputColElem)
                rowElem.appendChild(buttonColElem)

                const formElem = document.createElement('form')
                formElem.appendChild(rowElem)

                const commentsCardElem = document.createElement('div')
                commentsCardElem.setAttribute('class', 'card card-body mt-2')
                commentsCardElem.appendChild(formElem)

                return commentsCardElem
            }
            /**
             * builds the post (HTML) element and inserts it to the dom.
             * @param post
             */
            const buildPost = function (post) {

                const textarea = document.createElement('textarea');
                textarea.setAttribute('class', 'form-control my-2')
                textarea.rows = 5
                textarea.style = "resize:none"
                textarea.innerHTML = post.explanation

                const titleElem = document.createElement('h4')
                titleElem.classList.add('mt-2')
                titleElem.style.textDecoration = 'underline'
                titleElem.innerHTML = post.title

                const dateElem = document.createElement('div')
                dateElem.classList.add('text-muted')
                dateElem.innerHTML = post.date

                const copyRightElem = document.createElement('div')
                copyRightElem.classList.add('text-muted')
                copyRightElem.innerHTML = `Copyright: ${post.copyright || 'Unknown'}`

                const mediaElem = elementBuilder.mediaElem(post)
                const leftColElem = elementBuilder.colDiv()
                leftColElem.classList.remove('col')
                leftColElem.classList.add('col-xs-12')
                leftColElem.classList.add('col-md-6')
                leftColElem.appendChild(mediaElem)

                const rightColElem = elementBuilder.colDiv()
                rightColElem.appendChild(titleElem)
                rightColElem.appendChild(dateElem)
                rightColElem.appendChild(copyRightElem)
                rightColElem.appendChild(textarea)

                const rowElem = elementBuilder.rowDiv()
                rowElem.appendChild(leftColElem)
                rowElem.appendChild(rightColElem)

                const cardTop = document.createElement('div')
                cardTop.setAttribute('class', 'card-header mb-2')
                cardTop.appendChild(rowElem)

                const collapseId = elementBuilder.generateId(post)

                const commentsElem = document.createElement('div')
                const comments = document.createElement('div')
                commentsElem.id = collapseId
                commentsElem.classList.add('collapse')
                comments.id = `${collapseId}comments`
                commentsElem.appendChild(commentsSection(collapseId))
                commentsElem.appendChild(comments)

                const commentsButton = elementBuilder.button('commentButton', 'btn btn-dark', 'Comments', 'button')
                commentsButton.setAttribute('data-bs-toggle', 'collapse')
                commentsButton.setAttribute('data-bs-target', '#' + collapseId)
                let intervalId
                commentsButton.addEventListener('click', () => {
                    // Get the value of the aria-expanded attribute
                    const ariaExpanded = commentsButton.getAttribute('aria-expanded');

                    // Check if the aria-expanded attribute is true
                    if (ariaExpanded === 'true') {
                        getComments(collapseId)
                        intervalId = setInterval(() => getNewComments(collapseId), refreshTime);
                    } else {
                        clearInterval(intervalId)
                    }
                })

                const cardBody = document.createElement('div')
                cardBody.classList.add('card-body')
                cardBody.appendChild(commentsButton)
                cardBody.appendChild(commentsElem)

                const cardElem = document.createElement('div')
                cardElem.setAttribute('class', 'card my-3')
                cardElem.appendChild(cardTop)
                cardElem.appendChild(cardBody)

                scroller.appendChild(cardElem)
            }
            /**
             * gets the data from NASA's API
             * @param startDate
             * @param endDate
             */
            const loadData = function (startDate, endDate) {

                const apiString = `${apiUrl}?api_key=${apiKey}&start_date=${startDate}&end_date=${endDate}`
                hide(loadMoreButton)
                show(bufferImg)

                fetch(apiString)
                    .then(status)
                    .then(res => res.json())
                    .then(json => {
                        json.reverse()
                        json.forEach((object) => {
                            buildPost(object)
                            show(loadMoreButton)
                        })
                    })
                    .catch(err => {
                        nasaApiErrorHandler(err)
                    }).finally(() => hide(bufferImg))

            }
            /**
             * calculate a new range of dates and gets more data from NASA's API
             */
            const loadMoreData = function () {

                // the new endDate will be the previous startDate minus one day
                let endDate = new Date(updatableStartDate)
                endDate.setDate(endDate.getDate() - 1)

                // convert to dd-mm-yyyy format
                let endDateFormat = new Date(endDate).toISOString().slice(0, 10);

                // the new start date will be the previous end date minus maxDays = 3
                updatableStartDate = calcStartDate(endDate)

                loadData(updatableStartDate, endDateFormat)
            }
            /**
             * checks if the date is not empty and gets the first stream of data from NASA's API.
             */
            const getData = function () {

                clearPage()
                hide(loadMoreButton)
                const endDate = getSelectedDate()

                if (endDate !== "") {
                    updatableStartDate = calcStartDate(endDate)
                    loadData(updatableStartDate, endDate)
                } else {
                    scroller.innerHTML = "Please select a date"
                }
            }

            const nasaApiErrorHandler = function (error) {

                if (!error.headers) {
                    scroller.innerHTML += CONNECTION_ERROR
                    return
                }

                try {
                    error.json().then(json => {
                        if (json.msg)
                            scroller.innerHTML += `<br>${json.msg}`
                        else if (json.error.message)
                            scroller.innerHTML += `<br>${json.error.message}`
                        else
                            scroller.innerHTML += ERROR


                    })
                } catch (e) {
                    scroller.innerHTML += ERROR
                }
            }

            const restApiErrorHandler = function (error) {

                if (!error) {
                    displayError(ERROR)
                } else if (!error.headers) {
                    displayError(CONNECTION_ERROR)
                } else if (error.status === 204) {
                    // no updates for post, do nothing
                } else {
                    error.json().then(json => {
                        console.log(json)
                        displayError(json.message)
                    })
                }
            }

            const displayError = function (msg) {
                errorMessage.innerHTML = msg
                const toast = new bootstrap.Toast(errorToast)
                toast.show()
            }

            return {
                getData,
                loadMoreData,
                restApiErrorHandler
            }

        })()

        const elementBuilder = (function () {
            const videoWidth = "480"
            const videoHeight = "360"
            /**
             * generic button builder
             * @param id
             * @param classList
             * @param name
             * @param type
             * @returns {HTMLButtonElement}
             */
            const button = function (id, classList, name, type) {
                const button = document.createElement('button')
                button.id = id
                button.setAttribute('class', classList)
                button.type = type
                button.innerHTML = name

                return button
            }
            /**
             * generic div of type row builder
             * @returns {HTMLDivElement}
             */
            const rowDiv = function () {
                const rowElem = document.createElement('div')
                rowElem.classList.add('row')
                return rowElem
            }
            /**
             * generic div of type column builder
             * @returns {HTMLDivElement}
             */
            const colDiv = function () {
                const rowElem = document.createElement('div')
                rowElem.classList.add('col')
                return rowElem
            }
            /**
             * depends on the media type builds an image/video element.
             * @param object
             * @returns {HTMLElement}
             */
            const mediaElem = function (object) {
                if (object.media_type === 'image') {
                    const imgElem = document.createElement('img')
                    imgElem.src = object.url
                    imgElem.classList.add("img-fluid")
                    imgElem.width = 400
                    return imgElem
                } else if (object.media_type === 'video') {
                    const videoElem = document.createElement('iframe')
                    videoElem.classList.add("img-fluid")
                    videoElem.src = object.url
                    videoElem.width = videoWidth
                    videoElem.height = videoHeight
                    return videoElem
                }
            }
            /**
             * generates a uniq ID
             * @param post
             * @returns {string}
             */
            const generateId = function (post) {
                let date = ''
                if (post.date)
                    date = post.date.replace(/[^a-zA-Z0-9]/g, "")
                return 'post' + date
            }

            return {
                button,
                rowDiv,
                colDiv,
                mediaElem,
                generateId
            }
        })()

        document.querySelector('#getDate').addEventListener('click', dataHandler.getData)
        document.getElementById('dateSelect').valueAsDate = new Date()
        loadMoreButton.addEventListener('click', dataHandler.loadMoreData)
        logoutButton.addEventListener('click', () => {

            fetch('/logout')
                .then(status)
                .then(res => res.json())
                .then(json => {
                    location.href = json.url
                })
                .catch(err => {
                    dataHandler.restApiErrorHandler(err)
                })
        })
    });
})();