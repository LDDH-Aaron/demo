import React, { createContext, useState, useEffect, useContext } from 'react';

// 创建上下文
const UserContext = createContext();

// 创建提供者组件
export function UserProvider({ children }) {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    // 从localStorage获取用户名
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
    }
  }, []);

  // 更新用户名并保存到localStorage
  const updateUserName = (name) => {
    if (name && name.trim()) {
      const trimmedName = name.trim();
      localStorage.setItem('userName', trimmedName);
      setUserName(trimmedName);
    }
  };

  return (
    <UserContext.Provider value={{ userName, updateUserName }}>
      {children}
    </UserContext.Provider>
  );
}

// 自定义钩子，方便使用上下文
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser必须在UserProvider内部使用');
  }
  return context;
}

export default UserContext; 