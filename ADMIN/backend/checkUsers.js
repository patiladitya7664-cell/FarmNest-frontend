require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function checkUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("\n===== FARMNEST USERS =====\n");

        const users = await User.find({})
            .select("name email role");

        console.table(users.map(user => ({
            name: user.name,
            email: user.email,
            role: user.role
        })));

        console.log("\nTotal Users:", users.length);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkUsers();