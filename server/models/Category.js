import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    familyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50
    },
    type: {
        type: String,
        enum: ['expense', 'income'],
        required: true
    },
    icon: {
        type: String,
        default: '📝'
    },
    keywords: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    color: {
        type: String,
        default: '#6366f1'
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    isSystemDefault: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for family + name uniqueness
categorySchema.index({ familyId: 1, name: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

// Default categories to create for new families
export const defaultCategories = [
    // Expense categories
    {
        name: 'Ăn uống',
        type: 'expense',
        icon: '🍜',
        keywords: [
            'ăn', 'uống', 'cơm', 'phở', 'bún', 'cafe', 'cà phê', 'trà sữa', 'nhậu', 'bia', 'quán',
            'bánh', 'bánh mì', 'bánh ngọt', 'đồ ăn', 'thức ăn', 'nước ngọt', 'sữa', 'trà', 'cháo', 'mì',
            'lẩu', 'nướng', 'gà', 'heo', 'bò', 'cá', 'hải sản', 'rau', 'trái cây', 'kem', 'pizza',
            'hamburger', 'gỏi', 'nem', 'chả', 'xôi', 'cơm tấm', 'hủ tiếu', 'miến', 'bún bò', 'bún chả',
            'bún riêu', 'canh', 'súp', 'ốc', 'tôm', 'mực', 'cua', 'sò', 'nghêu', 'rượu', 'nước ép',
            'sinh tố', 'smoothie', 'yogurt', 'sữa chua', 'kfc', 'lotteria', 'mcdonalds', 'jollibee',
            'highlands', 'starbucks', 'phúc long', 'tocotoco', 'gongcha', 'koi', 'dingtea',
            'bữa sáng', 'bữa trưa', 'bữa tối', 'ăn sáng', 'ăn trưa', 'ăn tối', 'đi ăn', 'order đồ ăn',
            'grab food', 'shopee food', 'baemin', 'gofood', 'now', 'đặt đồ ăn', 'snack', 'đồ ăn vặt'
        ],
        color: '#6b7280'
    },
    {
        name: 'Xăng xe',
        type: 'expense',
        icon: '⛽',
        keywords: [
            'xăng', 'đổ xăng', 'petrol', 'dầu', 'nhiên liệu', 'xăng xe', 'đổ dầu', 'gas xe',
            'petrolimex', 'pvoil', 'shell', 'cây xăng', 'trạm xăng'
        ],
        color: '#6b7280'
    },
    {
        name: 'Mua sắm',
        type: 'expense',
        icon: '🛒',
        keywords: [
            'siêu thị', 'mua', 'shopping', 'chợ', 'bigc', 'coopmart', 'vinmart', 'lotte', 'mua đồ', 'sắm',
            'aeon', 'emart', 'mega market', 'mm mega', 'bách hóa xanh', 'winmart', 'go', 'tops market',
            'shopee', 'lazada', 'tiki', 'sendo', 'thế giới di động', 'điện máy xanh', 'fpt shop',
            'đồ gia dụng', 'nội thất', 'đồ dùng', 'tạp hóa', 'cửa hàng', 'mỹ phẩm', 'son', 'kem dưỡng',
            'guardian', 'watsons', 'hasaki', 'order', 'đặt hàng'
        ],
        color: '#6b7280'
    },
    {
        name: 'Điện nước',
        type: 'expense',
        icon: '💡',
        keywords: [
            'tiền điện', 'tiền nước', 'internet', 'wifi', 'gas', 'hóa đơn điện', 'hóa đơn nước',
            'evn', 'điện lực', 'nước máy', 'sawaco', 'fpt', 'viettel', 'vnpt', 'mobifone', 'sctv',
            'k+', 'truyền hình cáp', 'phí chung cư', 'phí quản lý', 'tiền nhà', 'thuê nhà',
            'tiền thuê', 'tiền phòng', 'điện thoại', 'cước điện thoại', 'data 4g', '5g'
        ],
        color: '#6b7280'
    },
    {
        name: 'Di chuyển',
        type: 'expense',
        icon: '🚗',
        keywords: [
            'grab', 'taxi', 'xe ôm', 'gửi xe', 'đậu xe', 'vé xe', 'tàu', 'máy bay', 'vé máy bay',
            'be', 'gojek', 'xanh sm', 'mai linh', 'vinasun', 'uber', 'vé tàu', 'xe buýt', 'bus',
            'metro', 'tàu điện', 'phà', 'canô', 'thuê xe', 'rửa xe', 'sửa xe', 'bảo dưỡng xe',
            'thay nhớt', 'thay lốp', 'vá xe', 'bơm xe', 'toll', 'phí cầu đường', 'cao tốc',
            'vietnam airlines', 'vietjet', 'bamboo', 'pacific airlines', 'booking', 'traveloka'
        ],
        color: '#6b7280'
    },
    {
        name: 'Y tế',
        type: 'expense',
        icon: '🏥',
        keywords: [
            'thuốc', 'khám', 'bệnh viện', 'doctor', 'y tế', 'nha khoa', 'bác sĩ', 'viện', 'phòng khám',
            'nhà thuốc', 'pharmacy', 'long châu', 'pharmacity', 'an khang', 'khám bệnh', 'xét nghiệm',
            'siêu âm', 'x-quang', 'chụp chiếu', 'tiêm', 'vaccine', 'bảo hiểm y tế', 'bhyt',
            'mắt', 'kính', 'răng', 'niềng răng', 'tẩy trắng', 'thẩm mỹ', 'da liễu', 'viện phí',
            'thuốc bổ', 'vitamin', 'thực phẩm chức năng'
        ],
        color: '#6b7280'
    },
    {
        name: 'Giải trí',
        type: 'expense',
        icon: '🎬',
        keywords: [
            'phim', 'game', 'karaoke', 'du lịch', 'chơi', 'giải trí', 'đi chơi', 'vui chơi', 'spa', 'massage',
            'rạp', 'cgv', 'lotte cinema', 'galaxy', 'bhd', 'beta', 'cinema', 'netflix', 'spotify', 'youtube',
            'subscription', 'đăng ký', 'thành viên', 'vip', 'premium', 'billiard', 'bowling', 'gym', 'fitness',
            'yoga', 'bơi', 'hồ bơi', 'công viên', 'khu vui chơi', 'bar', 'club', 'pub', 'nhạc sống',
            'concert', 'show', 'biểu diễn', 'triển lãm', 'bảo tàng', 'sở thú', 'vinpearl', 'đầm sen',
            'suối tiên', 'escape room', 'team building', 'picnic', 'cắm trại', 'camping'
        ],
        color: '#6b7280'
    },
    {
        name: 'Học tập',
        type: 'expense',
        icon: '📚',
        keywords: [
            'học', 'sách', 'khóa học', 'học phí', 'trường', 'lớp học', 'học viện', 'đại học', 'cao đẳng',
            'trung tâm', 'gia sư', 'kèm', 'tiếng anh', 'tiếng nhật', 'tiếng hàn', 'tiếng trung', 'ngoại ngữ',
            'ielts', 'toeic', 'toefl', 'chứng chỉ', 'bằng cấp', 'udemy', 'coursera', 'skillshare',
            'văn phòng phẩm', 'bút', 'vở', 'giấy', 'máy tính', 'laptop', 'tablet', 'ipad',
            'edx', 'linkedin learning', 'duolingo', 'elsa', 'ôn thi'
        ],
        color: '#6b7280'
    },
    {
        name: 'Quần áo',
        type: 'expense',
        icon: '👕',
        keywords: [
            'quần', 'áo', 'giày', 'dép', 'túi xách', 'thời trang', 'mũ', 'nón', 'kính mát',
            'đầm', 'váy', 'vest', 'sơ mi', 'áo thun', 'quần jean', 'quần tây', 'đồ ngủ',
            'đồ lót', 'bikini', 'đồ bơi', 'uniqlo', 'zara', 'h&m', 'canifa', 'hnm',
            'nike', 'adidas', 'puma', 'converse', 'vans', 'gucci', 'chanel', 'louis vuitton',
            'balo', 'ví', 'thắt lưng', 'dây nịt', 'đồng hồ', 'trang sức', 'nhẫn', 'vòng', 'dây chuyền'
        ],
        color: '#6b7280'
    },
    {
        name: 'Con cái',
        type: 'expense',
        icon: '👶',
        keywords: [
            'con', 'bé', 'em bé', 'sữa', 'bỉm', 'tã', 'đồ chơi', 'đồ sơ sinh', 'quần áo trẻ em',
            'học phí con', 'trường con', 'nhà trẻ', 'mẫu giáo', 'mầm non', 'tiểu học', 'trung học',
            'tiền tiêu con', 'cho con', 'mua cho con', 'đồ dùng học tập'
        ],
        color: '#6b7280'
    },
    {
        name: 'Thú cưng',
        type: 'expense',
        icon: '🐕',
        keywords: [
            'chó', 'mèo', 'thú cưng', 'pet', 'thức ăn thú cưng', 'pet shop', 'thú y', 'tiêm phòng',
            'tắm chó', 'grooming', 'cắt lông', 'lồng', 'chuồng', 'đồ chơi thú cưng'
        ],
        color: '#6b7280'
    },
    {
        name: 'Làm đẹp',
        type: 'expense',
        icon: '💅',
        keywords: [
            'cắt tóc', 'nhuộm', 'uốn', 'duỗi', 'làm nail', 'nail', 'mi', 'lông mi', 'phun xăm',
            'tattoo', 'spa mặt', 'chăm sóc da', 'facial', 'tẩy lông', 'triệt lông', 'hair salon',
            '30shine', 'tóc đẹp', 'làm tóc'
        ],
        color: '#6b7280'
    },
    { name: 'Khác', type: 'expense', icon: '📦', keywords: [], color: '#6b7280', isDefault: true },

    // Income categories
    {
        name: 'Lương',
        type: 'income',
        icon: '💰',
        keywords: [
            'lương', 'salary', 'lương tháng', 'nhận lương', 'lĩnh lương', 'chuyển lương',
            'lương cơ bản', 'lương net', 'lương gross', 'thu nhập chính', 'tiền công'
        ],
        color: '#6b7280'
    },
    {
        name: 'Thưởng',
        type: 'income',
        icon: '🎁',
        keywords: [
            'thưởng', 'bonus', 'kpi', 'hoa hồng', 'commission', 'thưởng tết', 'thưởng lễ',
            'thưởng dự án', 'thưởng cuối năm', '13 tháng', 'tháng 13', 'incentive'
        ],
        color: '#6b7280'
    },
    {
        name: 'Đầu tư',
        type: 'income',
        icon: '📈',
        keywords: [
            'cổ phiếu', 'lãi', 'đầu tư', 'crypto', 'bitcoin', 'lãi suất', 'cổ tức', 'dividend',
            'chứng khoán', 'trái phiếu', 'quỹ', 'fund', 'vnindex', 'eth', 'btc', 'usdt',
            'lãi tiết kiệm', 'lãi gửi', 'lãi ngân hàng'
        ],
        color: '#6b7280'
    },
    {
        name: 'Kinh doanh',
        type: 'income',
        icon: '🏪',
        keywords: [
            'bán hàng', 'kinh doanh', 'doanh thu', 'thu bán', 'bán', 'shop', 'cửa hàng',
            'online', 'shopee thu', 'lazada thu', 'tiki thu', 'khách trả', 'thu tiền hàng'
        ],
        color: '#6b7280'
    },
    {
        name: 'Freelance',
        type: 'income',
        icon: '💻',
        keywords: [
            'freelance', 'project', 'dự án', 'làm thêm', 'part time', 'hợp đồng', 'contract',
            'client', 'khách hàng', 'thu dự án', 'freelancer'
        ],
        color: '#6b7280'
    },
    {
        name: 'Cho thuê',
        type: 'income',
        icon: '🏠',
        keywords: [
            'cho thuê', 'thuê nhà', 'tiền thuê', 'thu thuê', 'phòng trọ', 'thuê phòng',
            'rental', 'căn hộ cho thuê', 'mặt bằng'
        ],
        color: '#6b7280'
    },
    {
        name: 'Thu nhập khác',
        type: 'income',
        icon: '💵',
        keywords: ['thu nhập', 'nhận tiền', 'cho', 'được cho', 'quà', 'mừng', 'lì xì', 'tiền mừng'],
        color: '#6b7280',
        isDefault: true
    }
];

export default Category;
