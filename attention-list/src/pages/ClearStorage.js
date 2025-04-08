import React from 'react';

const ClearStorage = () => {
  const handleClearRecords = () => {
    if (window.confirm('确定要清除所有记录吗？此操作不可恢复。')) {
      try {
        localStorage.removeItem('attentionRecords');
        localStorage.removeItem('chatMessages');
        alert('所有记录已清除，页面将刷新。');
        window.location.reload();
      } catch (error) {
        console.error('清除记录时出错:', error);
        alert('清除记录时出错，请重试。');
      }
    }
  };

  return (
    <button
      onClick={handleClearRecords}
      style={{
        position: 'fixed',
        bottom: '2rem',
        left: '2rem',
        padding: '0.75rem 1.5rem',
        backgroundColor: '#1a1a1a',
        color: 'white',
        border: 'none',
        borderRadius: '25px',
        cursor: 'pointer',
        fontSize: '14px',
        zIndex: 1000,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        fontWeight: 500
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#333';
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#1a1a1a';
        e.currentTarget.style.transform = 'scale(1)';
      }}
    >
      清除所有记录
    </button>
  );
};

export default ClearStorage; 