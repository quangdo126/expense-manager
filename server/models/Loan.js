import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
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
    type: {
        type: String,
        enum: ['borrow', 'lend'],
        required: true
    },
    personName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    remainingAmount: {
        type: Number,
        required: true,
        min: 0
    },
    interestRate: {
        type: Number,
        default: 0,
        min: 0
    },
    dueDate: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'overdue'],
        default: 'active'
    },
    note: {
        type: String,
        maxlength: 500
    },
    payments: [{
        amount: Number,
        date: { type: Date, default: Date.now },
        note: String
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Auto-update status based on remaining amount and due date
loanSchema.pre('save', function (next) {
    if (this.remainingAmount <= 0) {
        this.status = 'completed';
    } else if (this.dueDate && new Date() > this.dueDate) {
        this.status = 'overdue';
    }
    next();
});

const Loan = mongoose.model('Loan', loanSchema);

export default Loan;
