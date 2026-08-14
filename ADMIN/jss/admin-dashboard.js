/* ==========================================
   FARMNEST ADMIN DASHBOARD JS
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ==========================
       Animated Counter
    ========================== */

    const counters = document.querySelectorAll(".card h2");

    counters.forEach(counter => {

        let text = counter.innerText;

        let target = parseInt(text.replace(/[^0-9]/g, ""));

        if (isNaN(target)) return;

        let current = 0;

        let increment = Math.ceil(target / 80);

        function updateCounter() {

            current += increment;

            if (current >= target) {

                current = target;

            }

            if (text.includes("₹")) {

                if (target >= 100000) {

                    counter.innerText = "₹" + (current / 100000).toFixed(1) + "L";

                } else {

                    counter.innerText = "₹" + current.toLocaleString();

                }

            } else {

                counter.innerText = current.toLocaleString();

            }

            if (current < target) {

                requestAnimationFrame(updateCounter);

            }

        }

        updateCounter();

    });


    /* ==========================
       Revenue Chart
    ========================== */

    const revenueCanvas = document.getElementById("revenueChart");

    if (revenueCanvas) {

        new Chart(revenueCanvas, {

            type: "line",

            data: {

                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],

                datasets: [{

                    label: "Revenue",

                    data: [2.5, 3.1, 4.0, 5.3, 6.4, 7.2, 8.1],

                    borderColor: "#2E7D32",

                    backgroundColor: "rgba(46,125,50,0.15)",

                    fill: true,

                    tension: 0.4,

                    borderWidth: 3

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });

    }


    /* ==========================
       Orders Chart
    ========================== */

    const ordersCanvas = document.getElementById("ordersChart");

    if (ordersCanvas) {

        new Chart(ordersCanvas, {

            type: "bar",

            data: {

                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

                datasets: [{

                    data: [40, 65, 55, 75, 90, 120, 110],

                    backgroundColor: [

                        "#2E7D32",

                        "#43A047",

                        "#66BB6A",

                        "#81C784",

                        "#A5D6A7",

                        "#43A047",

                        "#2E7D32"

                    ],

                    borderRadius: 10

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        display: false

                    }

                }

            }

        });

    }


    /* ==========================
       Notification Button
    ========================== */

    const bell = document.querySelector(".fa-bell");

    if (bell) {

        bell.addEventListener("click", function () {

            alert("🔔 No new notifications.");

        });

    }


    /* ==========================
       Message Button
    ========================== */

    const message = document.querySelector(".fa-envelope");

    if (message) {

        message.addEventListener("click", function () {

            alert("📩 No new messages.");

        });

    }


    /* ==========================
       Active Sidebar
    ========================== */

    const menuLinks = document.querySelectorAll(".menu li");

    menuLinks.forEach(link => {

        link.addEventListener("click", function () {

            menuLinks.forEach(item => item.classList.remove("active"));

            this.classList.add("active");

        });

    });


    /* ==========================
       Quick Action Buttons
    ========================== */

    const buttons = document.querySelectorAll(".quick-actions button");

    buttons.forEach(btn => {

        btn.addEventListener("mouseenter", function () {

            this.style.transform = "scale(1.03)";

        });

        btn.addEventListener("mouseleave", function () {

            this.style.transform = "scale(1)";

        });

    });

});