import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true,
        index: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    period: {
        type: String,
        enum: ['monthly', 'weekly'],
        default: 'monthly'
    },
    alertThreshold: {
        type: Number,
        default: 80,
        min: 0,
        max: 100
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Unique budget per category per family
budgetSchema.index({ familyId: 1, categoryId: 1 }, { unique: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
