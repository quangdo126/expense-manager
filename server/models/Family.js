import mongoose from 'mongoose';
import crypto from 'crypto';

const familySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    inviteCode: {
        type: String,
        unique: true,
        default: () => crypto.randomBytes(3).toString('hex').toUpperCase()
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Generate new invite code
familySchema.methods.regenerateInviteCode = function () {
    this.inviteCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    return this.save();
};

const Family = mongoose.model('Family', familySchema);

export default Family;
