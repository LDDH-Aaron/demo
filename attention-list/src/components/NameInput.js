import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import styles from '../styles/NameInput.module.css';

const NameInput = () => {
  const [name, setName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { userName, updateUserName } = useUser();
  
  useEffect(() => {
    // 如果没有用户名，则显示弹窗
    if (!userName) {
      setShowModal(true);
    }
  }, [userName]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      updateUserName(name);
      setShowModal(false);
    }
  };
  
  if (!showModal) return null;
  
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>欢迎使用注意力清单</h2>
        <p className={styles.subtitle}>请输入您的姓名，开始您的注意力管理之旅</p>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="请输入您的姓名"
            className={styles.input}
            autoFocus
          />
          <button type="submit" className={styles.button} disabled={!name.trim()}>
            开始使用
          </button>
        </form>
      </div>
    </div>
  );
};

export default NameInput; 