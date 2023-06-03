(function () {
    document.addEventListener("DOMContentLoaded", () => {

        const passwordFormElem = document.getElementById('password-register')
        const password1 = document.getElementById('password')
        const password2 = document.getElementById('password2')


        passwordFormElem.addEventListener('submit', checkPasswords)
        password1.addEventListener('change', checkLength)

        /**
         * password validation
         * @param event
         */
        function checkPasswords(event){
            event.preventDefault()

            if (!checkLength())
                return

            if (password1.value !== password2.value) {
                password2.classList.add("is-invalid")
            }
            else{
                password2.classList.remove("is-invalid")
                password2.classList.add("is-valid");
                event.target.submit()
            }
        }

        /**
         * password length validation
         * @returns {boolean}
         */
        function checkLength(){
            if (password1.value.length < 3){
                password1.classList.add("is-invalid")
                return false
            }
            else{
                password1.classList.remove("is-invalid")
                return true
            }
        }
    });
})();