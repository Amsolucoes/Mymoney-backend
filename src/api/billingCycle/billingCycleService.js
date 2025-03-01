const express = require("express");
const BillingCycle = require("./billingCycle"); // Modelo do Mongoose
const mongoose = require("mongoose");

const router = express.Router();

// Rota para buscar o resumo de créditos e débitos
router.get("/summary", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId é obrigatório" });
    }

    const result = await BillingCycle.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } }, // Converter para ObjectId
      { $unwind: "$credits" },
      {
        $group: {
          _id: null,
          totalCredit: { $sum: "$credits.value" },
          totalDebt: { $sum: { $sum: "$debts.value" } }
        }
      }
    ]);

    const summary = result.length > 0 ? result[0] : { totalCredit: 0, totalDebt: 0 };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar resumo de pagamentos" });
  }
});

// Buscar todos os ciclos de pagamento
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId;

    if (!userId) {
      console.error("❌ Erro: userId não fornecido!");
      return res.status(400).json({ error: "UserId não fornecido" });
    }

    // ✅ Verificando se o userId é um ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "UserId inválido" });
    }

    // ✅ Convertendo para ObjectId
    const objectId = new mongoose.Types.ObjectId(userId);

    // ✅ Buscando os ciclos de pagamento
    const billingCycles = await BillingCycle.find({ userId: objectId });

    res.json(billingCycles);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar ciclos de pagamento", details: error.message });
  }
});

// Criar um novo ciclo de pagamento
router.post("/", async (req, res) => {
  try {
    console.log("🔹 Recebendo dados:", req.body); // Log para debug

    const userId = req.body.userId; // Obtém o ID do usuário autenticado

    if (mongoose.Types.ObjectId.isValid(req.body.userId)) {
      req.body.userId = new mongoose.Types.ObjectId(req.body.userId);
    } else {
      console.error("❌ userId inválido:", req.body.userId);
      return res.status(400).json({ error: "userId inválido!" });
    }

    if (req.body.debts && Array.isArray(req.body.debts)) {
      req.body.debts = req.body.debts.map(debt => ({
        ...debt,
        vencimento: new Date(debt.vencimento) // Converte a string para Date
      }));
    }

    const newBillingCycle = new BillingCycle({ ...req.body, userId});

    await newBillingCycle.save();
    res.status(201).json(newBillingCycle);
  } catch (error) {
    console.error("❌ Erro ao criar ciclo de pagamento:", error);
    res.status(400).json({ error: "Erro ao criar ciclo de pagamento" });
  }
});

// Buscar um ciclo de pagamento por ID
router.get("/:id", async (req, res) => {
  try {
    const billingCycle = await BillingCycle.findById(req.params.id);
    if (!billingCycle) {
      return res.status(404).json({ error: "Ciclo de pagamento não encontrado" });
    }
    res.json(billingCycle);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar ciclo de pagamento" });
  }
});

// Atualizar um ciclo de pagamento por ID
router.put("/:id", async (req, res) => {
  try {
    console.log("Recebendo no PUT:", req.body); // Debug

    const { id } = req.params;
    const updateData = { ...req.body };

    // Converter `vencimento` dentro de `debts` para Date
    updateData.debts = updateData.debts.map(debt => ({
    ...debt,
    vencimento: new Date(debt.vencimento) // Converte a string para Date
    }));

    console.log("Dados corrigidos antes do update:", updateData);

    // Remover _id do corpo para evitar erro
    delete updateData._id;
    delete updateData.__v; // Remover __v também, pois não é necessário

    const updatedBillingCycle = await BillingCycle.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedBillingCycle) {
      return res.status(404).json({ error: "Ciclo de pagamento não encontrado" });
    }
    res.json(updatedBillingCycle);
  } catch (error) {
    res.status(400).json({ error: "Erro ao atualizar ciclo de pagamento" });
  }
});

// Deletar um ciclo de pagamento por ID
router.delete("/:id", async (req, res) => {
  try {
    const deletedBillingCycle = await BillingCycle.findByIdAndDelete(req.params.id);
    if (!deletedBillingCycle) {
      return res.status(404).json({ error: "Ciclo de pagamento não encontrado" });
    }
    res.json({ message: "Ciclo de pagamento removido com sucesso!" });
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar ciclo de pagamento" });
  }
});

module.exports = router;