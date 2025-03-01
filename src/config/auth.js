require("dotenv").config(); 
const { verify } = require("jsonwebtoken");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    next();
  } else {

    // Removendo "Bearer " do token antes de validar
    let token = req.headers["authorization"];

    if (token) {
      token = token.split(",")[0].trim().replace("Bearer ", "");  // Apenas remove duplicações, sem mexer no "Bearer"
    }
        
    if (!token) {
      return res.status(403).send({ errors: ["No token provided."] });
    }

    // Pegando a chave do .env
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      console.error("Erro: AUTH_SECRET não está definido no .env!");
      return res.status(500).send({ errors: ["Internal server error."] });
    }

    verify(token, secret, function (err, decoded) {
      if (err) {
        return res.status(403).send({ errors: ["Failed to authenticate token."] });
      } else {
        req.decoded = decoded;
        next();
      }
    });
  }
};