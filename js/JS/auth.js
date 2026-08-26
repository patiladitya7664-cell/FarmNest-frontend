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

            if (loginForm) {
                loginForm.classList.add("active");
            }

            if (registerForm) {
                registerForm.classList.remove("active");
            }

            if (loginTab) {
                loginTab.classList.add("active");
            }

            if (registerTab) {
                registerTab.classList.remove("active");
            }

        } else {

            if (registerForm) {
                registerForm.classList.add("active");
            }

            if (loginForm) {
                loginForm.classList.remove("active");
            }

            if (registerTab) {
                registerTab.classList.add("active");
            }

            if (loginTab) {
                loginTab.classList.remove("active");
            }
        }
    };


    /* ================================
       PASSWORD SHOW / HIDE
    ================================= */

    window.togglePassword = function (inputId, button) {

        const input = document.getElementById(inputId);

        if (!input) return;

        if (input.type === "password") {

            input.type = "text";

            if (button) {
                button.textContent = "🙈";
            }

        } else {

            input.type = "password";

            if (button) {
                button.textContent = "👁️";
            }
        }
    };


    /* ================================
       REGISTER USER
    ================================= */

    window.registerUser = async function (event) {

        event.preventDefault();


        /* ================================
           GET REGISTER VALUES
        ================================= */

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


        /* ================================
           VALIDATE NAME
        ================================= */

        if (name.length < 2) {

            showMessage(
                "Please enter a valid full name.",
                "error"
            );

            return;
        }


        /* ================================
           VALIDATE EMAIL
        ================================= */

        if (!validateEmail(email)) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }


        /* ================================
           VALIDATE ROLE
        ================================= */

        if (!role) {

            showMessage(
                "Please select Customer or Farmer.",
                "error"
            );

            return;
        }


        /* ================================
           VALIDATE PASSWORD
        ================================= */

        if (password.length < 6) {

            showMessage(
                "Password must contain at least 6 characters.",
                "error"
            );

            return;
        }


        /* ================================
           CONFIRM PASSWORD
        ================================= */

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


            /* ================================
               REGISTER FAILED
            ================================= */

            if (!response.ok) {

                showMessage(
                    data.message || "Registration failed.",
                    "error"
                );

                return;
            }


            /* ================================
               REGISTER SUCCESS
            ================================= */

            showMessage(
                "Account created successfully! Please login.",
                "success"
            );


            /* Reset form */

            if (registerForm) {
                registerForm.reset();
            }


            /* ================================
               SWITCH TO LOGIN
            ================================= */

            setTimeout(function () {

                showForm("login");

                const loginEmail =
                    document.getElementById("loginEmail");

                if (loginEmail) {
                    loginEmail.value = email;
                }

            }, 1000);


        } catch (error) {

            console.error(
                "Register Error:",
                error
            );

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


        /* ================================
           GET LOGIN VALUES
        ================================= */

        const email =
            document.getElementById("loginEmail").value
            .trim()
            .toLowerCase();

        const password =
            document.getElementById("loginPassword").value;


        /* ================================
           VALIDATE EMAIL
        ================================= */

        if (!validateEmail(email)) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }


        /* ================================
           VALIDATE PASSWORD
        ================================= */

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


            /* ================================
               LOGIN FAILED
            ================================= */

            if (!response.ok) {

                showMessage(
                    data.message || "Invalid email or password.",
                    "error"
                );

                return;
            }


            /* ================================
               CHECK RESPONSE
            ================================= */

            if (!data.token || !data.user) {

                showMessage(
                    "Invalid response from FarmNest server.",
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
               SAVE CURRENT USER
            ================================= */

            localStorage.setItem(
                "farmnestCurrentUser",
                JSON.stringify(data.user)
            );


            /*
               Compatibility:
               Existing Farmer Dashboard
               currently uses "user".
            */

            localStorage.setItem(
                "user",
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
               SUCCESS MESSAGE
            ================================= */

            showMessage(
                `Welcome ${data.user.name}! Redirecting...`,
                "success"
            );


            /* ================================
               ROLE BASED REDIRECT
            ================================= */

            setTimeout(function () {

                redirectUser(data.user);

            }, 800);


        } catch (error) {

            console.error(
                "Login Error:",
                error
            );

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

        if (!user || !user.role) {

            showMessage(
                "User role not found.",
                "error"
            );

            return;
        }


        /* ================================
           FARMER
        ================================= */

        if (user.role === "farmer") {

            window.location.href =
                "../Farmer/farmer-dashboard.html";

            return;
        }


        /* ================================
           ADMIN
        ================================= */

        if (user.role === "admin") {

            window.location.href =
                "../ADMIN/dashboard.html";

            return;
        }


        /* ================================
           CUSTOMER
        ================================= */

        if (user.role === "customer") {

            window.location.href =
                "index.html";

            return;
        }


        /* ================================
           UNKNOWN ROLE
        ================================= */

        showMessage(
            "Invalid user role.",
            "error"
        );
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

            document.getElementById(
                "loginEmail"
            ).focus();

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
                user.name,
                "| Role:",
                user.role
            );

        } catch (error) {

            console.error(
                "Invalid saved session:",
                error
            );

            localStorage.removeItem("token");

            localStorage.removeItem(
                "farmnestCurrentUser"
            );

            localStorage.removeItem(
                "user"
            );
        }
    }

});