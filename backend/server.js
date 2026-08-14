const express = require("express");

const app = express();

const PORT = 5000;

app.get("/", (req, res) => {
    res.send("FarmNest Backend is Running Successfully! 🌱");
});

app.listen(PORT, () => {
    console.log(`FarmNest Server running on http://localhost:${PORT}`);
});