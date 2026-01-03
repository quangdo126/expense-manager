import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    type: {
        type: String,
        enum: ['expense', 'income'],
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        trim: true,
        maxlength: 200,
        default: ''
    },
    rawInput: {
        type: String,
        trim: true,
        maxlength: 200
    },
    date: {
        type: Date,
        default: Date.now,
        index: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound indexes for common queries
transactionSchema.index({ familyId: 1, date: -1 });
transactionSchema.index({ familyId: 1, userId: 1, date: -1 });
transactionSchema.index({ familyId: 1, categoryId: 1, date: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;
