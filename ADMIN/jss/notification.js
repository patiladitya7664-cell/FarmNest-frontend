/* ==========================================
   FARMNEST ADMIN - NOTIFICATIONS.JS
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    // ===========================
    // Elements
    // ===========================

    const searchInput = document.getElementById("searchNotification");
    const filter = document.getElementById("notificationFilter");
    const tableRows = document.querySelectorAll("#notificationTable tbody tr");

    const modal = document.getElementById("notificationModal");
    const closeModal = document.querySelector(".close-modal");
    const closeBtn = document.querySelector(".close-btn");

    const notifyType = document.getElementById("notifyType");
    const notifyTitle = document.getElementById("notifyTitle");
    const notifyMessage = document.getElementById("notifyMessage");
    const notifyDate = document.getElementById("notifyDate");
    const notifyStatus = document.getElementById("notifyStatus");

    // ===========================
    // Search
    // ===========================

    if (searchInput) {

        searchInput.addEventListener("keyup", () => {

            const value = searchInput.value.toLowerCase();

            tableRows.forEach(row => {

                row.style.display =
                    row.innerText.toLowerCase().includes(value)
                        ? ""
                        : "none";

            });

        });

    }

    // ===========================
    // Filter
    // ===========================

    if (filter) {

        filter.addEventListener("change", () => {

            const selected = filter.value.toLowerCase();

            tableRows.forEach(row => {

                const type = row.cells[0].innerText.toLowerCase();

                if (selected === "all") {

                    row.style.display = "";

                } else {

                    row.style.display =
                        type.includes(selected)
                            ? ""
                            : "none";

                }

            });

        });

    }

    // ===========================
    // View Notification
    // ===========================

    document.querySelectorAll(".view-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const row = btn.closest("tr");

            notifyType.textContent =
                row.cells[0].innerText;

            notifyTitle.textContent =
                row.cells[1].innerText;

            notifyMessage.textContent =
                row.cells[2].innerText;

            notifyDate.textContent =
                row.cells[3].innerText;

            notifyStatus.textContent =
                row.cells[4].innerText;

            notifyStatus.className =
                row.querySelector(".status").className;

            modal.style.display = "flex";

        });

    });

    // ===========================
    // Close Modal
    // ===========================

    function hideModal() {

        modal.style.display = "none";

    }

    if (closeModal) {

        closeModal.onclick = hideModal;

    }

    if (closeBtn) {

        closeBtn.onclick = hideModal;

    }

    window.onclick = (e) => {

        if (e.target === modal) {

            hideModal();

        }

    };

    // ===========================
    // Mark Read
    // ===========================

    document.querySelectorAll(".read-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const badge =
                btn.closest("tr")
                   .querySelector(".status");

            badge.textContent = "Read";

            badge.classList.remove("pending");

            badge.classList.add("success");

        });

    });

    const modalRead =
        document.querySelector(".mark-read-btn");

    if (modalRead) {

        modalRead.addEventListener("click", () => {

            notifyStatus.textContent = "Read";

            notifyStatus.classList.remove("pending");

            notifyStatus.classList.add("success");

            alert("Notification marked as read.");

        });

    }

    // ===========================
    // Delete Notification
    // ===========================

    document.querySelectorAll(".delete-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            if (confirm("Delete this notification?")) {

                btn.closest("tr").remove();

            }

        });

    });

    // ===========================
    // Clear All
    // ===========================

    const clearBtn = document.querySelector(".clear-btn");

    if (clearBtn) {

        clearBtn.addEventListener("click", () => {

            if (confirm("Clear all notifications?")) {

                document
                    .querySelector("#notificationTable tbody")
                    .innerHTML = "";

            }

        });

    }

});