const authRoutes = require("./routes/authRoutes");

// ... después de app.use(express.json())
app.use("/api/auth", authRoutes);
