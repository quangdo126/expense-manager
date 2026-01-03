import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
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
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    type: {
        type: String,
        enum: ['stock', 'crypto', 'gold', 'savings', 'realestate', 'other'],
        default: 'other'
    },
    investedAmount: {
        type: Number,
        required: true,
        min: 0
    },
    currentValue: {
        type: Number,
        required: true,
        min: 0
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    },
    note: {
        type: String,
        maxlength: 500
    },
    history: [{
        value: Number,
        date: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Calculate profit/loss
investmentSchema.virtual('profit').get(function () {
    return this.currentValue - this.investedAmount;
});

investmentSchema.virtual('profitPercent').get(function () {
    if (this.investedAmount === 0) return 0;
    return ((this.currentValue - this.investedAmount) / this.investedAmount) * 100;
});

investmentSchema.set('toJSON', { virtuals: true });

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;
