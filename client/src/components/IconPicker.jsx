import { useState, useRef, useEffect } from 'react';

/**
 * Icon Picker - Simple emoji input
 * Uses native emoji keyboard or text input
 */
export default function IconPicker({ value, onChange, onClose }) {
    const [inputValue, setInputValue] = useState(value || '');
    const inputRef = useRef(null);

    useEffect(() => {
        // Focus input when opened
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleChange = (e) => {
        const newValue = e.target.value;
        // Take only the last character/emoji entered
        if (newValue.length > 0) {
            // Get the last emoji (can be multiple code points)
            const emojis = [...newValue];
            const lastEmoji = emojis[emojis.length - 1];
            setInputValue(lastEmoji);
            onChange(lastEmoji);
        } else {
            setInputValue('');
        }
    };

    const handleSubmit = () => {
        if (inputValue) {
            onChange(inputValue);
        }
        onClose();
    };

    // Common emojis for quick selection - compatible with both Android & iOS
    const quickEmojis = [
        // Food & Drink
        '🍚', '🍜', '🍔', '🍕', '🍞', '🥗', '🍰', '☕', '🍺', '🥤',
        // Transport & Travel
        '🚗', '🚕', '🚌', '🚲', '✈️', '🚄', '⛽', '🅿️', '🛵', '🚁',
        // Shopping & Money
        '🛒', '🛍️', '💰', '💵', '💳', '🏧', '📦', '🎁', '🏪', '🏬',
        // Home & Utilities
        '🏠', '💡', '🔌', '📱', '💻', '📺', '🛏️', '🚿', '🧹', '🔑',
        // Health & Beauty
        '💊', '🏥', '💉', '🩺', '💅', '💇', '🧴', '🪥', '🧼', '👓',
        // Entertainment
        '🎬', '🎮', '🎵', '📚', '🎨', '🏋️', '⚽', '🎾', '🏊', '🎤',
        // Work & Education
        '💼', '📝', '📊', '🎓', '📖', '✏️', '📎', '📁', '🖨️', '📅',
        // Family & Pets
        '👶', '👨', '👩', '👴', '👵', '🐕', '🐈', '🐟', '🌱', '💐',
        // Other
        '🎯', '⭐', '❤️', '🔄', '📞', '✅', '🔔', '⚙️', '🔒', '📌'
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
            >
                <div className="modal-header">
                    <h3 className="modal-title">Chọn icon</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {/* Main input - shows current emoji large */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '20px'
                }}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={handleChange}
                        placeholder="📝"
                        style={{
                            width: '80px',
                            height: '80px',
                            fontSize: '3rem',
                            textAlign: 'center',
                            background: 'var(--bg-tertiary)',
                            border: '2px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            cursor: 'text'
                        }}
                    />
                    <p style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginTop: '8px'
                    }}>
                        Nhấn vào ô để mở bàn phím emoji
                    </p>
                </div>

                {/* Quick emoji grid */}
                <div style={{ marginBottom: '16px' }}>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        marginBottom: '8px'
                    }}>
                        Emoji phổ biến:
                    </div>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(10, 1fr)',
                        gap: '4px'
                    }}>
                        {quickEmojis.map((emoji, idx) => (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                    setInputValue(emoji);
                                    onChange(emoji);
                                }}
                                style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    fontSize: '1.25rem',
                                    background: inputValue === emoji ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className="btn btn-primary btn-block"
                    onClick={handleSubmit}
                >
                    Chọn
                </button>
            </div>
        </div>
    );
}
