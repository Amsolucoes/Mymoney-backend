const _ = require("lodash");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./user");
require("dotenv").config();

const emailRegex = /\S+@\S+\.\S+/;
const passwordRegex =
  /((?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@*&#$%])[0-9a-zA-Z$*&@#]{6,12})/;

const sendErrorsFromDB = (res, dbErrors) => {
  const errors = [];
  _.forIn(dbErrors.errors, (error) => errors.push(error.message));
  return res.status(400).json({ errors });
};

const login = (req, res, next) => {
  console.log("🚀 Chegou uma requisição no /login!");
  console.log("📩 Corpo da requisição:", req.body);
  const email = req.body.email || "";
  const password = req.body.password || "";

  console.log("🔹 Tentando logar com:", email);

  User.findOne({ email }, (err, user) => {
    if (err) {
      console.error("❌ Erro ao buscar usuário no banco:", err);
      return sendErrorsFromDB(res, err);
    } else if (user && bcrypt.compareSync(password, user.password)) {
      const token = jwt.sign({ id: user._id, email: user.email }, process.env.AUTH_SECRET, {
        expiresIn: "1 day",
      });
      console.log("🔹 Token gerado no backend:", token);
      const { name, email } = user;
      res.json({ token, userId: user._id });
    } else {
      return res.status(400).send({ errors: ["Usuário/Senha inválidos"] });
    }
  });
};

const validateToken = (req, res, next) => {
  const token = req.body.token || "";
  jwt.verify(token, env.authSecret, function (err, decoded) {
    return res.status(200).send({ valid: !err });
  });
};

const signup = (req, res, next) => {
  const name = req.body.name || "";
  const email = req.body.email || "";
  const password = req.body.password || "";
  const confirmPassword = req.body.confirm_password || "";

  if (!email.match(emailRegex)) {
    return res
      .status(400)
      .send({ errors: ["O e-mail informado está inválido"] });
  }

  if (!password.match(passwordRegex)) {
    return res.status(400).send({
      errors: [
        "Senha precisar ter: uma letra maiúscula, uma letra minúscula, um número, uma caractere especial(@*&#$%) e tamanho entre 6-12.",
      ],
    });
  }

  const salt = bcrypt.genSaltSync();
  const passwordHash = bcrypt.hashSync(password, salt);
  if (password !== confirmPassword) {
    return res.status(400).send({ errors: ["Senhas não conferem."] });
  }

  User.findOne({ email }, (err, user) => {
    if (err) {
      return sendErrorsFromDB(res, err);
    } else if (user) {
      return res.status(400).send({ errors: ["Usuário já cadastrado."] });
    } else {
      const newUser = new User({ name, email, password: passwordHash });
      newUser.save((err) => {
        if (err) {
          return sendErrorsFromDB(res, err);
        } else {
          login(req, res, next);
        }
      });
    }
  });
};

module.exports = { login, signup, validateToken };
