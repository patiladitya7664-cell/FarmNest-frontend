/* =========================================
   FARMNEST AUTHENTICATION JAVASCRIPT
   Frontend Version
========================================= */

document.addEventListener("DOMContentLoaded", function () {

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

    window.registerUser = function (event) {

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


        /* Get Existing Users */

        let users =
            JSON.parse(
                localStorage.getItem("farmnestUsers")
            ) || [];


        /* Check Existing Email */

        const existingUser =
            users.find(
                user => user.email === email
            );


        if (existingUser) {

            showMessage(
                "An account with this email already exists.",
                "error"
            );

            return;
        }


        /* Create User */

        const newUser = {

            id: Date.now(),

            name: name,

            email: email,

            role: role,

            password: password,

            createdAt: new Date().toISOString()
        };


        /* Save User */

        users.push(newUser);

        localStorage.setItem(
            "farmnestUsers",
            JSON.stringify(users)
        );


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
    };


    /* ================================
       LOGIN USER
    ================================= */

    window.loginUser = function (event) {

        event.preventDefault();

        const email =
            document.getElementById("loginEmail").value
            .trim()
            .toLowerCase();

        const password =
            document.getElementById("loginPassword").value;


        /* Validate */

        if (!validateEmail(email)) {

            showMessage(
                "Please enter a valid email address.",
                "error"
            );

            return;
        }


        if (!password) {

            showMessage(
                "Please enter your password.",
                "error"
            );

            return;
        }


        /* Get Users */

        const users =
            JSON.parse(
                localStorage.getItem("farmnestUsers")
            ) || [];


        /* Find User */

        const user =
            users.find(
                user =>
                    user.email === email &&
                    user.password === password
            );


        /* Invalid Login */

        if (!user) {

            showMessage(
                "Invalid email or password.",
                "error"
            );

            return;
        }


        /* Save Current User */

        localStorage.setItem(
            "farmnestCurrentUser",
            JSON.stringify(user)
        );


        /* Remember Me */

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


        /* Login Success */

        showMessage(
            `Welcome ${user.name}! Redirecting...`,
            "success"
        );


        /* Redirect */

        setTimeout(function () {

            redirectUser(user);

        }, 800);
    };


    /* ================================
       REDIRECT USER
    ================================= */

    function redirectUser(user) {

        if (user.role === "farmer") {

            /*
              IMPORTANT:
              Change this path if your
              farmer dashboard has another name.
            */

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


        /*
          Frontend version only.
          Backend email reset will be added later.
        */

        showMessage(
            "Password reset feature will be connected with the backend.",
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
       AUTO LOGIN CHECK
    ================================= */

    const currentUser =
        localStorage.getItem(
            "farmnestCurrentUser"
        );

    const remember =
        localStorage.getItem(
            "farmnestRemember"
        );


    /*
      If Remember Me is enabled,
      keep the current login.
    */

    if (currentUser && remember === "true") {

        try {

            const user =
                JSON.parse(currentUser);

            console.log(
                "FarmNest user session active:",
                user.name
            );

        } catch (error) {

            localStorage.removeItem(
                "farmnestCurrentUser"
            );

            localStorage.removeItem(
                "farmnestRemember"
            );
        }
    }

});