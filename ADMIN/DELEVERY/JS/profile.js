/* =========================================================
   FARMNEST DELIVERY
   DELIVERY PROFILE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const profileForm =
        document.getElementById("profileForm");

    const fullName =
        document.getElementById("fullName");

    const email =
        document.getElementById("email");

    const phone =
        document.getElementById("phone");

    const profileName =
        document.getElementById("profileName");

    const profileEmail =
        document.getElementById("profileEmail");

    const deliveryName =
        document.getElementById("deliveryName");

    const deliveryId =
        document.getElementById("deliveryId");

    const vehicle =
        document.getElementById("vehicle");

    const vehicleNumber =
        document.getElementById("vehicleNumber");

    const serviceArea =
        document.getElementById("serviceArea");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const headerAvatar =
        document.getElementById("headerAvatar");

    const totalDeliveries =
        document.getElementById(
            "profileTotalDeliveries"
        );

    const successfulDeliveries =
        document.getElementById(
            "profileSuccessfulDeliveries"
        );

    const logoutBtn =
        document.getElementById("logoutBtn");

    const menuBtn =
        document.getElementById("menuBtn");

    const sidebar =
        document.querySelector(
            ".delivery-sidebar"
        );


    /* =====================================================
       GET DELIVERY USER
    ===================================================== */

    let deliveryUser =
        JSON.parse(
            localStorage.getItem(
                "deliveryUser"
            )
        );


    /*
       If deliveryUser does not exist,
       try normal user storage.
    */

    if (!deliveryUser) {

        deliveryUser =
            JSON.parse(
                localStorage.getItem("user")
            );

    }


    /*
       Default delivery profile
    */

    if (!deliveryUser) {

        deliveryUser = {

            name: "Delivery Partner",

            email: "delivery@farmnest.com",

            phone: "",

            deliveryId: "FN-DEL-001",

            vehicle: "Delivery Bike",

            vehicleNumber: "MH-00-XX-0000",

            serviceArea: "Local Delivery"

        };

    }


    /* =====================================================
       LOAD PROFILE DATA
    ===================================================== */

    function loadProfile() {

        const name =
            deliveryUser.name ||
            deliveryUser.fullName ||
            deliveryUser.username ||
            "Delivery Partner";


        const userEmail =
            deliveryUser.email ||
            "delivery@farmnest.com";


        const userPhone =
            deliveryUser.phone ||
            deliveryUser.mobile ||
            "";


        const id =
            deliveryUser.deliveryId ||
            deliveryUser.id ||
            "FN-DEL-001";


        const userVehicle =
            deliveryUser.vehicle ||
            "Delivery Bike";


        const userVehicleNumber =
            deliveryUser.vehicleNumber ||
            "MH-00-XX-0000";


        const area =
            deliveryUser.serviceArea ||
            "Local Delivery";


        /* FORM */

        if (fullName) {

            fullName.value =
                name;

        }


        if (email) {

            email.value =
                userEmail;

        }


        if (phone) {

            phone.value =
                userPhone;

        }


        /* HEADER */

        if (deliveryName) {

            deliveryName.textContent =
                name;

        }


        if (profileName) {

            profileName.textContent =
                name;

        }


        if (profileEmail) {

            profileEmail.textContent =
                userEmail;

        }


        /* DELIVERY DETAILS */

        if (deliveryId) {

            deliveryId.textContent =
                id;

        }


        if (vehicle) {

            vehicle.textContent =
                userVehicle;

        }


        if (vehicleNumber) {

            vehicleNumber.textContent =
                userVehicleNumber;

        }


        if (serviceArea) {

            serviceArea.textContent =
                area;

        }

    }


    loadProfile();


    /* =====================================================
       GET DELIVERY ORDERS
    ===================================================== */

    function getOrders() {

        return JSON.parse(
            localStorage.getItem(
                "deliveryOrders"
            )
        ) || [];

    }


    /* =====================================================
       DELIVERY STATISTICS
    ===================================================== */

    function loadStatistics() {

        const orders =
            getOrders();


        const deliveredOrders =
            orders.filter(order =>

                order.status &&

                order.status
                    .toLowerCase() ===
                    "delivered"

            );


        if (totalDeliveries) {

            totalDeliveries.textContent =
                orders.length;

        }


        if (successfulDeliveries) {

            successfulDeliveries.textContent =
                deliveredOrders.length;

        }

    }


    loadStatistics();


    /* =====================================================
       PROFILE AVATAR
    ===================================================== */

    function updateAvatar() {

        const name =
            deliveryUser.name ||
            deliveryUser.fullName ||
            "Delivery Partner";


        /*
           Use first letter of name
           instead of emoji if desired.
        */

        const firstLetter =
            name
                .trim()
                .charAt(0)
                .toUpperCase();


        if (
            profileAvatar &&
            firstLetter
        ) {

            profileAvatar.textContent =
                firstLetter;

        }


        if (
            headerAvatar &&
            firstLetter
        ) {

            headerAvatar.textContent =
                firstLetter;

        }

    }


    updateAvatar();


    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const name =
                    fullName.value.trim();

                const userEmail =
                    email.value.trim();

                const userPhone =
                    phone.value.trim();


                /* VALIDATION */

                if (!name) {

                    alert(
                        "Please enter your full name."
                    );

                    fullName.focus();

                    return;

                }


                if (!userEmail) {

                    alert(
                        "Please enter your email address."
                    );

                    email.focus();

                    return;

                }


                if (
                    userPhone &&
                    !/^[0-9]{10}$/.test(
                        userPhone
                    )
                ) {

                    alert(
                        "Please enter a valid 10-digit phone number."
                    );

                    phone.focus();

                    return;

                }


                /* UPDATE OBJECT */

                deliveryUser.name =
                    name;

                deliveryUser.fullName =
                    name;

                deliveryUser.email =
                    userEmail;

                deliveryUser.phone =
                    userPhone;


                /*
                   Save delivery profile
                */

                localStorage.setItem(
                    "deliveryUser",
                    JSON.stringify(
                        deliveryUser
                    )
                );


                /*
                   Also update normal user
                   if it exists.
                */

                const normalUser =
                    JSON.parse(
                        localStorage.getItem(
                            "user"
                        )
                    );


                if (normalUser) {

                    normalUser.name =
                        name;

                    normalUser.email =
                        userEmail;

                    normalUser.phone =
                        userPhone;


                    localStorage.setItem(
                        "user",
                        JSON.stringify(
                            normalUser
                        )
                    );

                }


                /* UPDATE UI */

                if (profileName) {

                    profileName.textContent =
                        name;

                }


                if (profileEmail) {

                    profileEmail.textContent =
                        userEmail;

                }


                if (deliveryName) {

                    deliveryName.textContent =
                        name;

                }


                updateAvatar();


                alert(
                    "Profile updated successfully! ✅"
                );

            }
        );

    }


    /* =====================================================
       PHONE NUMBER VALIDATION
    ===================================================== */

    if (phone) {

        phone.addEventListener(
            "input",
            () => {

                phone.value =
                    phone.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

            }
        );

    }


    /* =====================================================
       MOBILE MENU
    ===================================================== */

    if (
        menuBtn &&
        sidebar
    ) {

        menuBtn.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "show"
                );

            }
        );

    }


    /* =====================================================
       CLOSE MOBILE SIDEBAR
    ===================================================== */

    document.addEventListener(
        "click",
        event => {

            if (
                window.innerWidth <= 768 &&
                sidebar &&
                sidebar.classList.contains(
                    "show"
                ) &&
                !sidebar.contains(
                    event.target
                ) &&
                !menuBtn.contains(
                    event.target
                )
            ) {

                sidebar.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =====================================================
       LOGOUT
    ===================================================== */

    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            () => {

                const confirmLogout =
                    confirm(
                        "Are you sure you want to logout?"
                    );


                if (!confirmLogout) {

                    return;

                }


                localStorage.removeItem(
                    "deliveryUser"
                );

                localStorage.removeItem(
                    "deliveryToken"
                );


                window.location.href =
                    "../login.html";

            }
        );

    }


});
