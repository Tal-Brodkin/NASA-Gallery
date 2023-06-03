(function () {
    document.addEventListener("DOMContentLoaded", () => {

        const formElem = document.getElementById('register')
        const emailElem = document.getElementById('email')
        const firstNameElem = document.getElementById('firstName')
        const lastNameElem = document.getElementById('lastName')

        const nameRegex = /^[A-Za-z0-9 ]{3,32}$/;
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

        formElem.addEventListener('submit', register)
        emailElem.addEventListener('change', emailValidation)
        firstNameElem.addEventListener('change', firstNameValidation)
        lastNameElem.addEventListener('change', lastNameValidation)

        /**
         * validation for register
         */
        function register(event){
            event.preventDefault()

            if (emailValidation() && firstNameValidation() && lastNameValidation()) {
                event.target.submit()
            }
        }

        /**
         * email validation
         * @returns {boolean}
         */
        function emailValidation(){

            const emailElem = document.getElementById("email")
            const email = emailElem.value.toLowerCase().trim()

            if (!email.match(emailRegex)){
                // show validation div
                emailElem.classList.add("is-invalid");
                return false
            }else{
                // hide validation div
                emailElem.classList.remove("is-invalid");
                emailElem.classList.add("is-valid");
                return true
            }
        }

        /**
         * first name validation
         * @returns {boolean}
         */
        function firstNameValidation(){


            const firstNameElem = document.getElementById("firstName")
            const firstName = firstNameElem.value.trim()

            if(!firstName.match(nameRegex)){
                firstNameElem.classList.add("is-invalid");
                return false
            }else{
                // hide validation div
                firstNameElem.classList.remove("is-invalid");
                firstNameElem.classList.add("is-valid");
                return true
            }
        }

        /**
         * last name validation
         * @returns {boolean}
         */
        function lastNameValidation(){

            const lastNameElem = document.getElementById("lastName")
            const lastName = lastNameElem.value.trim()

            if(!lastName.match(nameRegex)){
                lastNameElem.classList.add("is-invalid");
                return false
            }else{
                // hide validation div
                lastNameElem.classList.remove("is-invalid");
                lastNameElem.classList.add("is-valid");
                return true
            }
        }

    });
})();