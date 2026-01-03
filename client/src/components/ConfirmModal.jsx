import { useState, useEffect } from 'react';

/**
 * Confirm Modal - Replace web confirm() with custom modal
 */
export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = 'Xác nhận',
    message,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    type = 'danger' // 'danger' | 'warning' | 'info'
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const confirmBtnClass = type === 'danger' ? 'btn-danger' :
        type === 'warning' ? 'btn-warning' : 'btn-primary';

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={e => e.stopPropagation()}
                style={{ maxWidth: '340px', margin: '0 auto' }}
            >
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <div style={{
                        fontSize: '3rem',
                        marginBottom: '16px'
                    }}>
                        {type === 'danger' ? '⚠️' : type === 'warning' ? '❓' : 'ℹ️'}
                    </div>
                    <h3 style={{
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        marginBottom: '8px'
                    }}>
                        {title}
                    </h3>
                    <p style={{
                        color: 'var(--text-secondary)',
                        fontSize: '0.875rem'
                    }}>
                        {message}
                    </p>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '16px'
                }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onClose}
                        style={{ flex: 1 }}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${confirmBtnClass}`}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={{ flex: 1 }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
