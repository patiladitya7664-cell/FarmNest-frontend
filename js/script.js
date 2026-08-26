/*
==========================================================
   FARMNEST JAVASCRIPT
   COMMON FRONTEND FUNCTIONALITY
==========================================================
*/

document.addEventListener("DOMContentLoaded", () => {
  /* =====================================================
       LOADER
    ===================================================== */

  const loader = document.querySelector(".loader");

  window.addEventListener("load", () => {
    setTimeout(() => {
      if (loader) {
        loader.style.opacity = "0";
        loader.style.visibility = "hidden";
      }
    }, 1000);
  });

  /* =====================================================
       MOBILE MENU
    ===================================================== */

  const menuBtn = document.querySelector(".menu-btn");
  const nav = document.querySelector("nav");

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
      nav.classList.toggle("showMenu");
    });
  }

  /* =====================================================
       STICKY HEADER
    ===================================================== */

  const header = document.querySelector("header");

  if (header) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 80) {
        header.classList.add("sticky");
      } else {
        header.classList.remove("sticky");
      }
    });
  }

  /* =====================================================
       ACTIVE NAVIGATION
    ===================================================== */

  const links = document.querySelectorAll("nav a");

  links.forEach((link) => {
    try {
      const linkURL = new URL(link.href, window.location.href);

      const currentURL = new URL(window.location.href);

      if (
        linkURL.pathname === currentURL.pathname &&
        linkURL.pathname !== "/"
      ) {
        link.classList.add("active");
      }
    } catch (error) {
      console.warn("Navigation URL error:", error);
    }
  });

  /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");

      if (!targetId || targetId === "#") {
        return;
      }

      const target = document.querySelector(targetId);

      if (target) {
        e.preventDefault();

        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });

  /* =====================================================
       ABOUT PAGE - COUNTER ANIMATION
    ===================================================== */

  const counters = document.querySelectorAll(".stats h2");

  counters.forEach((counter) => {
    const originalText = counter.innerText;

    const number = parseInt(originalText.replace(/[^0-9]/g, ""), 10);

    if (isNaN(number)) {
      return;
    }

    const suffix = originalText.replace(/[0-9]/g, "");

    let count = 0;

    const speed = Math.max(number / 100, 1);

    const updateCounter = () => {
      if (count < number) {
        count += speed;

        counter.innerText = Math.ceil(count) + suffix;

        setTimeout(updateCounter, 20);
      } else {
        counter.innerText = number + suffix;
      }
    };

    updateCounter();
  });

  /* =====================================================
       ABOUT PAGE - SCROLL REVEAL
    ===================================================== */

  const revealElements = document.querySelectorAll(
    ".mission-card, .farmer-card, .why-grid div, .team-card, .gallery-grid img",
  );

  revealElements.forEach((element) => {
    element.style.opacity = "0";

    element.style.transform = "translateY(40px)";

    element.style.transition = "opacity 0.8s ease, transform 0.8s ease";
  });

  const revealOnScroll = () => {
    revealElements.forEach((element) => {
      const position = element.getBoundingClientRect().top;

      const screen = window.innerHeight - 100;

      if (position < screen) {
        element.style.opacity = "1";

        element.style.transform = "translateY(0)";
      }
    });
  };

  if (revealElements.length > 0) {
    window.addEventListener("scroll", revealOnScroll);

    revealOnScroll();
  }

  /* =====================================================
       FARMER DASHBOARD - SECTION SWITCHING
    ===================================================== */

  window.showSection = function (sectionId) {
    const sections = document.querySelectorAll(".farmer-section");

    sections.forEach((section) => {
      section.classList.remove("active");
    });

    const selected = document.getElementById(sectionId);

    if (selected) {
      selected.classList.add("active");
    }
  };

  /* =====================================================
       FARMER DASHBOARD - LOAD USER
    ===================================================== */

  const farmerDashboard = document.querySelector(".farmer-dashboard");

  if (farmerDashboard) {
    let user = null;

    try {
      user = JSON.parse(localStorage.getItem("farmnestCurrentUser"));

      /*
       * Compatibility with existing
       * Farmer Dashboard
       */

      if (!user) {
        user = JSON.parse(localStorage.getItem("user"));
      }
    } catch (error) {
      console.warn("Unable to read logged-in user data.");
    }

    /* =============================================
           FARMER NAME
        ============================================= */

    const farmerName = document.querySelector(".farmer-profile");

    if (user && farmerName) {
      farmerName.innerHTML = `
                <i class="fa-solid fa-user"></i>
                ${user.name || "Farmer"}
            `;
    }

    /* =============================================
           DEFAULT DASHBOARD
        ============================================= */

    if (document.getElementById("dashboard")) {
      window.showSection("dashboard");
    }
  }

  /* =====================================================
       CUSTOMER ACCOUNT HEADER
       
       Uses JWT session data saved by auth.js
    ===================================================== */

  const guestAccount = document.getElementById("guestAccount");

  const customerAccount = document.getElementById("customerAccount");

  const customerName = document.getElementById("customerName");

  const logoutBtn = document.getElementById("logoutBtn");

  if (guestAccount && customerAccount) {
    let currentUser = null;

    try {
      currentUser = JSON.parse(localStorage.getItem("farmnestCurrentUser"));
    } catch (error) {
      console.warn("Invalid FarmNest user session.");
    }

    /* =============================================
           CUSTOMER LOGGED IN
        ============================================= */

    if (currentUser && currentUser.role === "customer") {
      guestAccount.style.display = "none";

      customerAccount.style.display = "flex";

      if (customerName) {
        customerName.textContent = currentUser.name || "Customer";
      }
    } else {

    /* =============================================
           FARMER / ADMIN / GUEST
        ============================================= */
      guestAccount.style.display = "flex";

      customerAccount.style.display = "none";
    }
  }

  /* =====================================================
       CUSTOMER LOGOUT
    ===================================================== */

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      /* Remove JWT session */

      localStorage.removeItem("token");

      /* Remove current user */

      localStorage.removeItem("farmnestCurrentUser");

      /* Remove compatibility user */

      localStorage.removeItem("user");

      /* Remove remember flag */

      localStorage.removeItem("farmnestRemember");

      /* Go to Home */

      window.location.href = "index.html";
    });
  }
});
