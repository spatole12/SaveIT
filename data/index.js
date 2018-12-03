const goalRoutes = require("./goals");
const userRoutes = require("./users");
const metadataRoutes = require("./metadata");

let constructorMethod = app => {
  app.use("/goal", goalRoutes);
  app.use("/user", userRoutes);
  app.use("/metadata", metadataRoutes);
};

module.exports = {
  users: require("./users"),
  goals: require("./goals"),
  metadata: require("./metadata")
};
