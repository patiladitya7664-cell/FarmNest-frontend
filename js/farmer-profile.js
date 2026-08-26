document.addEventListener("DOMContentLoaded", () => {
  /* ==========================================================
     FARMNEST - FARMER PROFILE JS
  ========================================================== */

  const profileForm = document.getElementById("profileForm");

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const farmNameInput = document.getElementById("farmName");
  const locationInput = document.getElementById("location");
  const farmSizeInput = document.getElementById("farmSize");
  const addressInput = document.getElementById("address");
  const bioInput = document.getElementById("bio");

  /* ==========================================================
     LOAD SAVED PROFILE
  ========================================================== */

  const savedProfile = JSON.parse(
    localStorage.getItem("farmerProfile")
  );

  if (savedProfile) {
    nameInput.value = savedProfile.name || "";
    emailInput.value = savedProfile.email || "";
    phoneInput.value = savedProfile.phone || "";
    farmNameInput.value = savedProfile.farmName || "";
    locationInput.value = savedProfile.location || "";
    farmSizeInput.value = savedProfile.farmSize || "";
    addressInput.value = savedProfile.address || "";
    bioInput.value = savedProfile.bio || "";
  }

  /* ==========================================================
     SAVE PROFILE
  ========================================================== */

  profileForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const profileData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      farmName: farmNameInput.value.trim(),
      location: locationInput.value.trim(),
      farmSize: farmSizeInput.value.trim(),
      address: addressInput.value.trim(),
      bio: bioInput.value.trim()
    };

    /* Basic validation */

    if (!profileData.name) {
      alert("Please enter your full name.");
      nameInput.focus();
      return;
    }

    if (!profileData.email) {
      alert("Please enter your email address.");
      emailInput.focus();
      return;
    }

    if (!profileData.phone) {
      alert("Please enter your mobile number.");
      phoneInput.focus();
      return;
    }

    /* Save locally */

    localStorage.setItem(
      "farmerProfile",
      JSON.stringify(profileData)
    );

    /* Update header name */

    const headerProfileName = document.querySelector(
      ".profile span"
    );

    if (headerProfileName) {
      headerProfileName.textContent = profileData.name;
    }

    /* Update profile card name */

    const profileCardName = document.querySelector(
      ".profile-card h2"
    );

    if (profileCardName) {
      profileCardName.textContent = profileData.name;
    }

    alert("Profile updated successfully! 🌱");
  });

  /* ==========================================================
     RESET PROFILE
  ========================================================== */

  const resetButton = document.querySelector(
    ".cancel-btn"
  );

  if (resetButton) {
    resetButton.addEventListener("click", () => {
      const confirmReset = confirm(
        "Are you sure you want to reset the profile?"
      );

      if (!confirmReset) {
        return;
      }

      localStorage.removeItem("farmerProfile");

      location.reload();
    });
  }
});
/* =========================================
   FARMER PROFILE IMAGE
========================================= */

document.addEventListener("DOMContentLoaded", function () {

  const profileUpload = document.getElementById("profileUpload");
  const profileImage = document.getElementById("profileImage");

  // Load saved profile image
  const savedImage = localStorage.getItem("farmerProfileImage");

  if (savedImage && profileImage) {
    profileImage.src = savedImage;
  }

  // Upload new image
  if (profileUpload) {

    profileUpload.addEventListener("change", function () {

      const file = this.files[0];

      if (!file) {
        return;
      }

      // Check image
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        return;
      }

      // File size limit: 2 MB
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2 MB.");
        return;
      }

      const reader = new FileReader();

      reader.onload = function (e) {

        // Show image
        profileImage.src = e.target.result;

        // Save image
        localStorage.setItem(
          "farmerProfileImage",
          e.target.result
        );

      };

      reader.readAsDataURL(file);

    });

  }

});
/* =========================================
   PROFILE IMAGE CHANGE
========================================= */

const profileUpload = document.getElementById("profileUpload");
const profileImage = document.getElementById("profileImage");

if (profileUpload && profileImage) {

    profileUpload.addEventListener("change", function () {

        const file = this.files[0];

        if (!file) {
            return;
        }

        // Check image type
        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image.");
            return;
        }

        // Check size - maximum 2 MB
        if (file.size > 2 * 1024 * 1024) {
            alert("Image size must be less than 2 MB.");
            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {

            // Show selected image immediately
            profileImage.src = event.target.result;

            // Save image in browser
            localStorage.setItem(
                "farmerProfileImage",
                event.target.result
            );

        };

        reader.readAsDataURL(file);
    });
}


/* =========================================
   LOAD SAVED PROFILE IMAGE
========================================= */

const savedProfileImage =
    localStorage.getItem("farmerProfileImage");

if (savedProfileImage && profileImage) {
    profileImage.src = savedProfileImage;
}