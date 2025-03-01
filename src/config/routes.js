const express = require("express");
const auth = require("./auth");
const billingCycleRoutes = require("../api/billingCycle/billingCycleService");

module.exports = function (server) {
  /*
   * Rotas protegidas por Token JWT
   */
  const protectedApi = express.Router();
  server.use("/api", protectedApi);

  protectedApi.use(auth);
  protectedApi.use("/billingCycles", billingCycleRoutes);

  /*
   * Rotas abertas (sem autenticação)
   */
  const openApi = express.Router();
  server.use("/oapi", openApi);

  const AuthService = require("../api/user/authService");
  openApi.post("/login", AuthService.login);
  openApi.post("/signup", AuthService.signup);
  openApi.post("/validateToken", AuthService.validateToken);
};