const mongoose = require("mongoose");

const creditSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, min: 0, required: true }
});

const debtSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: Number, min: 0, required: [true, 'Informe o valor do débito!'] },
    status: { type: String, required: false, uppercase: true, enum: ["PAGO", "PENDENTE", "AGENDADO"] },
    vencimento: { 
        type: Date, 
        required: false,
        set: (value) => {
            if (value instanceof Date) return value;
            const [day, month, year] = value.split("/");
            return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
        },
        get: (value) => {
            if (!value) return "";
            return new Date(value).toLocaleDateString("pt-BR");
        }
    },
    category: { type: String, required: false, enum: ["Contas Fixas", "Alimentacao", "Casa", "Banco"] },
    parcela: {type: Number, min: 0, required: false , enum: [1,2,3,4,5,6,7,8,9,10,11,12] },
    totalParcelas: {type: Number, min: 0, required: false , enum: [1,2,3,4,5,6,7,8,9,10,11,12] }
});

const billingCycleSchema = new mongoose.Schema({
    name: { type: String, required: true },
    month: { type: Number, min: 1, max: 12, required: true },
    year: { type: Number, min: 1970, max: 2100, required: true },
    credits: [creditSchema],
    debts: [debtSchema],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("BillingCycle", billingCycleSchema);