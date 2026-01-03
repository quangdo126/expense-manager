import webpush from 'web-push';

// Configure VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        process.env.VAPID_EMAIL || 'mailto:admin@example.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
}

/**
 * Send push notification to a user
 * @param {Object} subscription - Push subscription object
 * @param {Object} payload - Notification payload
 * @returns {Promise}
 */
export async function sendPushNotification(subscription, payload) {
    if (!subscription) {
        console.log('No subscription provided');
        return null;
    }

    try {
        const result = await webpush.sendNotification(
            subscription,
            JSON.stringify(payload)
        );
        return result;
    } catch (error) {
        console.error('Push notification error:', error);

        // If subscription is expired or invalid, return error code
        if (error.statusCode === 410 || error.statusCode === 404) {
            return { expired: true };
        }

        throw error;
    }
}

/**
 * Send notification to all family members except the sender
 * @param {Array} users - Array of user objects with pushSubscription
 * @param {string} excludeUserId - User ID to exclude (sender)
 * @param {Object} notification - Notification data
 */
export async function notifyFamilyMembers(users, excludeUserId, notification) {
    const results = [];

    for (const user of users) {
        // Skip the sender
        if (user._id.toString() === excludeUserId.toString()) {
            continue;
        }

        // Skip users without push subscription
        if (!user.pushSubscription) {
            continue;
        }

        try {
            const result = await sendPushNotification(user.pushSubscription, notification);
            results.push({ userId: user._id, success: true, result });
        } catch (error) {
            results.push({ userId: user._id, success: false, error: error.message });
        }
    }

    return results;
}

/**
 * Create transaction notification payload
 * @param {Object} transaction - Transaction data
 * @param {Object} user - User who created the transaction
 * @param {Object} category - Category of the transaction
 * @returns {Object} - Notification payload
 */
export function createTransactionNotification(transaction, user, category) {
    const typeText = transaction.type === 'expense' ? 'Chi tiêu' : 'Thu nhập';
    const formattedAmount = new Intl.NumberFormat('vi-VN').format(transaction.amount);

    return {
        title: `${typeText} mới: ${formattedAmount}đ`,
        body: `${user.displayName} - ${category.name}`,
        icon: category.icon || '💰',
        tag: `transaction-${transaction._id}`,
        data: {
            type: 'transaction',
            transactionId: transaction._id,
            url: '/transactions'
        }
    };
}

export default {
    sendPushNotification,
    notifyFamilyMembers,
    createTransactionNotification
};
