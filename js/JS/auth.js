/* =========================================
   FARMNEST AUTHENTICATION JAVASCRIPT
   Backend + JWT Version
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* ================================
       API
    ================================= */

    const API_URL = "http://localhost:5000/api/auth";


    /* ================================
       GET ELEMENTS
    ================================= */

    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");

    const loginTab = document.getElementById("loginTab");
    const registerTab = document.getElementById("registerTab");

    const message = document.getElementById("message");


    /* ================================
       SWITCH LOGIN / REGISTER
    ================================= */

    window.showForm = function (type) {

        hideMessage();

        if (type === "login") {

            loginForm.classList.add("active");
            registerForm.classList.remove("active");

            loginTab.classList.add("active");
            registerTab.classList.remove("active");

        } else {

            registerForm.classList.add("active");
            loginForm.classList.remove("active");

            registerTab.classList.add("active");
            loginTab.classList.remove("active");
        }
    };


    /* ================================
       PASSWORD SHOW / HIDE
    ================================= */

    window.togglePassword = function (inputId, button) {

        const input = document.getElementById(inputId);

        if (input.type === "password") {

            input.type = "text";
            button.textContent = "🙈";

        } else {

            input.type = "password";
            button.textContent = "👁️";
        }
    };


    /* ================================
       REGISTER USER
    ================================= */

    window.registerUser = async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("registerName").value.trim();

        const email =
            document.getElementById("registerEmail").value
            .trim()
            .toLowerCase();

        const role =
            document.getElementById("registerRole").value;

        const password =
            document.getElementById("registerPassword").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        /* Validate Name */

        if (name.length < 2) {

            showMessage(
                "Please enter a valid full name.",
                "error"
            );

            return;
        }


        /* Validate Email */

        if (!validateEmail(email)) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }


        /* Validate Role */

        if (!role) {

            showMessage(
                "Please select Customer or Farmer.",
                "error"
            );

            return;
        }


        /* Validate Password */

        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;
        }


        /* Confirm Password */

        if (password !== confirmPassword) {

            showMessage(
                "Passwords do not match.",
                "error"
            );

            return;
        }


        /* ================================
           BACKEND REGISTER
        ================================= */

        try {

            showMessage(
                "Creating your account...",
                "success"
            );


            const response = await fetch(
                `${API_URL}/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        name,
                        email,
                        password,
                        role
                    })
                }
            );


            const data = await response.json();


            if (!response.ok) {

                showMessage(
                    data.message || "Registration failed.",
                    "error"
                );

                return;
            }


            /* Success */

            showMessage(
                "Account created successfully! Please login.",
                "success"
            );


            registerForm.reset();


            /* Switch to Login */

            setTimeout(function () {

                showForm("login");

                document.getElementById("loginEmail").value =
                    email;

            }, 1000);


        } catch (error) {

            console.error("Register Error:", error);

            showMessage(
                "Cannot connect to FarmNest server. Make sure backend is running.",
                "error"
            );
        }
    };


    /* ================================
       LOGIN USER
    ================================= */

    window.loginUser = async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value
            .trim()
            .toLowerCase();

        const password =
            document.getElementById("loginPassword").value;


        /* Validate Email */

        if (!validateEmail(email)) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }


        /* Validate Password */

        if (!password) {

            showMessage(
                "Please enter your password.",
                "error"
            );

            return;
        }


        /* ================================
           BACKEND LOGIN
        ================================= */

        try {

            showMessage(
                "Logging in...",
                "success"
            );


            const response = await fetch(
                `${API_URL}/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            const data = await response.json();


            /* Login failed */

            if (!response.ok) {

                showMessage(
                    data.message || "Invalid email or password.",
                    "error"
                );

                return;
            }


            /* ================================
               SAVE JWT TOKEN
            ================================= */

            localStorage.setItem(
                "token",
                data.token
            );


            /* ================================
               SAVE USER
            ================================= */

            localStorage.setItem(
                "farmnestCurrentUser",
                JSON.stringify(data.user)
            );


            /* ================================
               REMEMBER ME
            ================================= */

            const rememberMe =
                document.getElementById("rememberMe");


            if (rememberMe && rememberMe.checked) {

                localStorage.setItem(
                    "farmnestRemember",
                    "true"
                );

            } else {

                localStorage.removeItem(
                    "farmnestRemember"
                );
            }


            /* ================================
               SUCCESS
            ================================= */

            showMessage(
                `Welcome ${data.user.name}! Redirecting...`,
                "success"
            );


            /* ================================
               REDIRECT
            ================================= */

            setTimeout(function () {

                redirectUser(data.user);

            }, 800);


        } catch (error) {

            console.error("Login Error:", error);

            showMessage(
                "Cannot connect to FarmNest server. Make sure backend is running.",
                "error"
            );
        }
    };


    /* ================================
       REDIRECT USER
    ================================= */

    function redirectUser(user) {

        if (user.role === "farmer") {

            window.location.href =
                "../farmer/dashboard.html";

        }

        else if (user.role === "admin") {

            window.location.href =
                "../admin/dashboard.html";

        }

        else {

            window.location.href =
                "index.html";
        }
    }


    /* ================================
       FORGOT PASSWORD
    ================================= */

    window.forgotPassword = function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value
            .trim()
            .toLowerCase();


        if (!email) {

            showMessage(
                "Please enter your email first.",
                "error"
            );

            document.getElementById("loginEmail").focus();

            return;
        }


        if (!validateEmail(email)) {

            showMessage(
                "Please enter a valid email.",
                "error"
            );

            return;
        }


        showMessage(
            "Password reset feature will be connected later.",
            "success"
        );
    };


    /* ================================
       EMAIL VALIDATION
    ================================= */

    function validateEmail(email) {

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailPattern.test(email);
    }


    /* ================================
       SHOW MESSAGE
    ================================= */

    function showMessage(text, type) {

        if (!message) return;

        message.textContent = text;

        message.className =
            "message " + type;
    }


    /* ================================
       HIDE MESSAGE
    ================================= */

    function hideMessage() {

        if (!message) return;

        message.textContent = "";

        message.className = "message";
    }


    /* ================================
       EXISTING SESSION
    ================================= */

    const token =
        localStorage.getItem("token");

    const currentUser =
        localStorage.getItem("farmnestCurrentUser");


    if (token && currentUser) {

        try {

            const user =
                JSON.parse(currentUser);

            console.log(
                "FarmNest JWT session active:",
                user.name
            );

        } catch (error) {

            localStorage.removeItem("token");

            localStorage.removeItem(
                "farmnestCurrentUser"
            );
        }
    }

});