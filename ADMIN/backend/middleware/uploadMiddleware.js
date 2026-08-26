const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =====================================================
// CREATE UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(__dirname, "../uploads/profile");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

console.log("========================================");
console.log("PROFILE UPLOAD DIRECTORY:");
console.log(uploadDir);
console.log("========================================");

// =====================================================
// STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("Saving profile image to:");
    console.log(uploadDir);

    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    const fileName = "farmer-" + req.user.id + "-" + Date.now() + ext;

    console.log("Generated filename:");
    console.log(fileName);

    cb(null, fileName);
  },
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter = function (req, file, cb) {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const ext = path.extname(file.originalname).toLowerCase();

  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  if (
    allowedExtensions.includes(ext) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
    return;
  }

  if (
    allowedExtensions.includes(ext) &&
    file.mimetype === "application/octet-stream"
  ) {
    cb(null, true);
    return;
  }

  cb(new Error("Only JPG, JPEG, PNG and WEBP image files are allowed."));
};

// =====================================================
// MULTER
// =====================================================

const upload = multer({
  storage: storage,

  fileFilter: fileFilter,

  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});

module.exports = upload;
