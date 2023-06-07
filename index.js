const express = require("express");
const resourceRoutes = require("./routes/resourceRoutes");
const salesRoutes = require("./routes/salesRoutes");
const baseRoutes = require("./routes/route");
const sqlFunctions = require("./controllers/resourceSqlunctions");
const maint = require("./controllers/maint");
const cors = require("cors");
const app = express();
const path = require("path");

// Set EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Enable CORS
const allowedOrigins =
  process.env.ALLOWED_ORIGINS || `http://localhost:${port}`;
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(express.json());
app.use("/", baseRoutes);
app.use("/resources/", resourceRoutes);
app.use("/sales/", salesRoutes);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

const port = process.env.PORT || 13900;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// add a loop that updates the prices of the resources every 10 seconds
setInterval(async () => {
  sqlFunctions.sqlPriceUpdate();
}, 10000);

// add a loop that calls the deleteOldSaves() function every hour
setInterval(async () => {
  maint.deleteOldSaves();
  maint.consolidateSales();
}, 3600000);
