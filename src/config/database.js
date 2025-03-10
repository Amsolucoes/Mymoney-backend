const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const url = process.env.MONGO_URI;

mongoose
  .connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log(`✅ Conectado ao MongoDB: ${url.includes("localhost") ? "Local" : "Azure Cosmos DB"}`))
  .catch((err) => console.error("❌ Erro ao conectar no MongoDB:", err));

mongoose.Error.messages.general.required = "O atributo '{PATH}' é obrigatório.";
mongoose.Error.messages.Number.min = "O '{VALUE}' informado é menor que o limite mínimo de '{MIN}'.";
mongoose.Error.messages.Number.max = "O '{VALUE}' informado é maior que o limite máximo de '{MAX}'.";
mongoose.Error.messages.String.enum = "O '{VALUE}' não é válido para o atributo '{PATH}'.";

module.exports = mongoose;