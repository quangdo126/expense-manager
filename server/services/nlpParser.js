/**
 * NLP Parser for Vietnamese expense/income messages
 * 
 * Examples:
 * - "xăng 50k" → { amount: 50000, keywords: ["xăng"] }
 * - "siêu thị 1tr2" → { amount: 1200000, keywords: ["siêu thị"] }
 * - "lương 15tr" → { amount: 15000000, keywords: ["lương"] }
 * - "cafe sáng 35 nghìn" → { amount: 35000, keywords: ["cafe", "sáng"] }
 */

// Amount patterns for Vietnamese currency
const amountPatterns = [
    // "1tr2", "1tr5", "2tr" - triệu with optional decimal
    { regex: /(\d+)tr(\d)?/gi, multiplier: 1000000, hasDecimal: true },
    // "1 triệu 2", "1 triệu", "15 triệu"
    { regex: /(\d+)\s*triệu\s*(\d)?/gi, multiplier: 1000000, hasDecimal: true },
    // "50k", "100k"
    { regex: /(\d+)k/gi, multiplier: 1000, hasDecimal: false },
    // "50 nghìn", "100 nghìn"
    { regex: /(\d+)\s*nghìn/gi, multiplier: 1000, hasDecimal: false },
    // "50 ngàn", "100 ngàn"
    { regex: /(\d+)\s*ngàn/gi, multiplier: 1000, hasDecimal: false },
    // "50000 đồng", "50000đ", "50,000"
    { regex: /(\d{1,3}(?:,\d{3})*|\d+)\s*(?:đồng|đ|vnd)?/gi, multiplier: 1, hasDecimal: false }
];

/**
 * Parse amount from Vietnamese text
 * @param {string} text - Input text
 * @returns {number|null} - Parsed amount or null
 */
export function parseAmount(text) {
    const normalizedText = text.toLowerCase().trim();

    for (const pattern of amountPatterns) {
        const matches = [...normalizedText.matchAll(pattern.regex)];

        for (const match of matches) {
            let amount = parseInt(match[1].replace(/,/g, ''));

            if (pattern.hasDecimal && match[2]) {
                // Handle decimal like "1tr2" = 1.2 million = 1,200,000
                const decimal = parseInt(match[2]) / 10;
                amount = (amount + decimal) * pattern.multiplier;
            } else {
                amount = amount * pattern.multiplier;
            }

            // Validate reasonable amount (100 VND to 1 billion VND)
            if (amount >= 100 && amount <= 1000000000) {
                return amount;
            }
        }
    }

    return null;
}

/**
 * Extract keywords from text (remove amount-related words)
 * @param {string} text - Input text
 * @returns {string[]} - Array of keywords
 */
export function extractKeywords(text) {
    let normalized = text.toLowerCase().trim();

    // Remove amount patterns
    normalized = normalized
        .replace(/\d+tr\d?/gi, '')
        .replace(/\d+\s*triệu\s*\d?/gi, '')
        .replace(/\d+k/gi, '')
        .replace(/\d+\s*nghìn/gi, '')
        .replace(/\d+\s*ngàn/gi, '')
        .replace(/\d{1,3}(?:,\d{3})*\s*(?:đồng|đ|vnd)?/gi, '')
        .replace(/\d+\s*(?:đồng|đ|vnd)/gi, '')
        .replace(/\d+/g, '');

    // Split into words and filter
    const words = normalized
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length >= 2);

    return words;
}

/**
 * Find matching category based on keywords
 * @param {string[]} keywords - Keywords from input
 * @param {Array} categories - Available categories
 * @returns {Object|null} - Matched category or null
 */
export function findCategory(keywords, categories) {
    if (!keywords.length || !categories.length) {
        return null;
    }

    // Score each category based on keyword matches
    let bestMatch = null;
    let bestScore = 0;

    for (const category of categories) {
        let score = 0;

        for (const keyword of keywords) {
            // Skip very short keywords (less than 2 chars) to avoid false matches
            if (keyword.length < 2) continue;

            // Check if keyword matches category name (exact match gets higher score)
            const catNameLower = category.name.toLowerCase();
            if (catNameLower === keyword) {
                score += 5; // Exact match with category name
            } else if (catNameLower.includes(keyword) && keyword.length >= 3) {
                score += 3;
            }

            // Check if keyword matches in category keywords
            for (const catKeyword of category.keywords || []) {
                // Exact match
                if (catKeyword === keyword) {
                    score += 4;
                }
                // Partial match - only if keyword is long enough (3+ chars)
                else if (keyword.length >= 3 && catKeyword.includes(keyword)) {
                    score += 2;
                }
                // Reverse partial - category keyword is in input keyword
                else if (catKeyword.length >= 3 && keyword.includes(catKeyword)) {
                    score += 2;
                }
            }
        }

        // Skip default categories unless no other match
        if (category.isDefault) {
            score = score > 0 ? score * 0.5 : 0;
        }

        if (score > bestScore) {
            bestScore = score;
            bestMatch = category;
        }
    }

    return bestMatch;
}

/**
 * Parse a chat message into transaction data
 * @param {string} input - Raw chat input
 * @param {Array} categories - Available categories
 * @returns {Object} - Parsed transaction data
 */
export function parseMessage(input, categories) {
    const amount = parseAmount(input);

    if (!amount) {
        return {
            success: false,
            error: 'Không thể nhận diện số tiền. Ví dụ đúng: "xăng 50k", "siêu thị 1tr2"'
        };
    }

    const keywords = extractKeywords(input);
    const matchedCategory = findCategory(keywords, categories);

    // If no category matched, try to determine type from keywords
    let suggestedType = 'expense'; // Default to expense
    const incomeKeywords = ['lương', 'thưởng', 'thu nhập', 'lãi', 'bán', 'nhận'];

    for (const keyword of keywords) {
        if (incomeKeywords.some(ik => keyword.includes(ik))) {
            suggestedType = 'income';
            break;
        }
    }

    return {
        success: true,
        amount,
        keywords,
        matchedCategory,
        suggestedType: matchedCategory ? matchedCategory.type : suggestedType,
        rawInput: input
    };
}

export default {
    parseAmount,
    extractKeywords,
    findCategory,
    parseMessage
};
