// ===============================
// FARMNEST ADMIN ANALYTICS
// ===============================

document.addEventListener("DOMContentLoaded", () => {

    // ===============================
    // Animated Counters
    // ===============================

    const counters = document.querySelectorAll(".stat-card h2");

    counters.forEach(counter => {

        const target = parseInt(counter.innerText.replace(/[^0-9]/g, ""));
        let count = 0;

        const speed = target / 80;

        const updateCounter = () => {

            if (count < target) {

                count += speed;

                counter.innerText = Math.floor(count).toLocaleString();

                requestAnimationFrame(updateCounter);

            } else {

                counter.innerText = target.toLocaleString();

            }

        };

        updateCounter();

    });

    // ===============================
    // Revenue Chart
    // ===============================

    new Chart(document.getElementById("revenueChart"), {

        type: "line",

        data: {

            labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul"],

            datasets: [{

                label: "Revenue",

                data: [220,280,350,420,510,620,780],

                borderColor: "#2e7d32",

                backgroundColor: "rgba(46,125,50,.15)",

                fill: true,

                tension: .4

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

    // ===============================
    // Orders Chart
    // ===============================

    new Chart(document.getElementById("orderChart"), {

        type: "bar",

        data: {

            labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],

            datasets: [{

                label: "Orders",

                data: [120,160,210,190,240,280,320],

                backgroundColor: "#43a047"

            }]

        },

        options: {

            responsive: true,

            plugins: {

                legend: {

                    display: false

                }

            }

        }

    });

    // ===============================
    // Category Chart
    // ===============================

    new Chart(document.getElementById("categoryChart"), {

        type: "pie",

        data: {

            labels: [

                "Rice",

                "Wheat",

                "Vegetables",

                "Fruits",

                "Pulses"

            ],

            datasets: [{

                data: [30,20,18,17,15],

                backgroundColor: [

                    "#2e7d32",

                    "#43a047",

                    "#66bb6a",

                    "#81c784",

                    "#a5d6a7"

                ]

            }]

        },

        options: {

            responsive: true

        }

    });

    // ===============================
    // Farmer Growth
    // ===============================

    new Chart(document.getElementById("farmerChart"), {

        type: "line",

        data: {

            labels: [

                "2021",

                "2022",

                "2023",

                "2024",

                "2025",

                "2026"

            ],

            datasets: [{

                label: "Farmers",

                data: [120,240,390,540,700,920],

                borderColor: "#1b5e20",

                fill: false,

                tension: .3

            }]

        },

        options: {

            responsive: true

        }

    });

});