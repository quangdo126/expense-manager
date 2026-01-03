import mongoose from 'mongoose';

const savingsGoalSchema = new mongoose.Schema({
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    deadline: {
        type: Date,
        default: null
    },
    icon: {
        type: String,
        default: '🎯'
    },
    color: {
        type: String,
        default: '#6366f1'
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    contributions: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: Number,
        date: { type: Date, default: Date.now },
        note: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-complete when target reached
savingsGoalSchema.pre('save', function (next) {
    if (this.currentAmount >= this.targetAmount) {
        this.status = 'completed';
    }
    next();
});

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);

export default SavingsGoal;
