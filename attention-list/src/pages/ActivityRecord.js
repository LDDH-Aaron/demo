import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import styles from '../styles/ActivityRecord.module.css';
import { analyzeRecord } from '../services/aiService';
import { sendChatMessage } from '../services/chatService';
import ClearStorage from './ClearStorage';
import { useNavigate } from 'react-router-dom';

function ActivityRecord() {
  const [records, setRecords] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showTriangleData, setShowTriangleData] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "你好！我是AI注意力管家，我可以帮你规划任务、解答疑惑和提供情感支持。有什么我能帮到你的吗？", isUser: false }
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [formData, setFormData] = useState({
    timeRange: '',
    attentionDirection: '',
    selfEvaluation: ''
  });
  // 添加时间选择状态
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [currentDate] = useState(new Date());
  const [triangleData, setTriangleData] = useState({
    highEnergy: { title: '重点任务示例', description: '这是一个示例高精力任务' },
    mediumEnergy1: { title: '中等任务示例1', description: '这是第一个中等精力任务示例' },
    mediumEnergy2: { title: '中等任务示例2', description: '这是第二个中等精力任务示例' },
    lowEnergy1: { title: '调节任务1', description: '' },
    lowEnergy2: { title: '调节任务2', description: '' },
    lowEnergy3: { title: '调节任务3', description: '' }
  });
  // 添加编辑状态
  const [editingRecord, setEditingRecord] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  
  const triangleRef = useRef(null);
  const chatEndRef = useRef(null);
  
  const navigate = useNavigate();
  
  // 滚动到最新消息
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);
  
  // 从本地存储加载注意力三角形数据
  useEffect(() => {
    // 从localStorage加载数据
    const savedData = localStorage.getItem('triangleData');
    if (savedData) {
      setTriangleData(JSON.parse(savedData));
    }
    
    // 尝试从localStorage加载记录数据
    const savedRecords = localStorage.getItem('attentionRecords');
    if (savedRecords) {
      let parsedRecords = JSON.parse(savedRecords);
      
      // 移除任何可能存在的triangleImpact字段
      parsedRecords = parsedRecords.map(record => {
        const { triangleImpact, ...restRecord } = record;
        return restRecord;
      });
      
      // 加载后排序
      setRecords(sortRecordsByTime(parsedRecords));
    } else {
      // 如果没有存储的记录，加载示例记录
      const exampleRecords = [
        {
          id: 1,
          timeRange: '09:00 - 10:30',
          attentionDirection: '专注于重点任务',
          selfEvaluation: '感觉非常专注，完成了预期目标',
          aiScore: 95,
          aiSuggestion: '继续保持这种专注状态，可以考虑采用番茄工作法来提高效率。',
          timestamp: new Date().setHours(10, 30)
        },
        {
          id: 2,
          timeRange: '11:00 - 12:00',
          attentionDirection: '处理邮件和会议',
          selfEvaluation: '有些分心，但基本完成了任务',
          aiScore: 75,
          aiSuggestion: '建议在处理邮件时设置专门的时间段，减少切换任务的频率。',
          timestamp: new Date().setHours(12, 0)
        }
      ];
      setRecords(sortRecordsByTime(exampleRecords));
    }
  }, []);

  // 按开始时间排序记录
  const sortRecordsByTime = (recordsToSort) => {
    return [...recordsToSort].sort((a, b) => {
      // 解析时间字符串，提取开始时间
      const aStartTime = getStartTimeMinutes(a.timeRange);
      const bStartTime = getStartTimeMinutes(b.timeRange);
      
      return aStartTime - bStartTime;
    });
  };
  
  // 将时间字符串转换为分钟数以便于比较
  const getStartTimeMinutes = (timeRange) => {
    if (!timeRange) return 0;
    
    const startTime = timeRange.split(' - ')[0];
    if (!startTime) return 0;
    
    const [hours, minutes] = startTime.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 保存记录到localStorage
  useEffect(() => {
    if (records.length > 0) {
      // 确保保存前移除triangleImpact字段
      const recordsToSave = records.map(record => {
        const { triangleImpact, ...restRecord } = record;
        return restRecord;
      });
      localStorage.setItem('attentionRecords', JSON.stringify(recordsToSave));
    }
  }, [records]);
  
  // 存储聊天记录到 localStorage
  useEffect(() => {
    if (chatMessages.length > 1) { // 有初始消息，所以检查长度 > 1
      localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);
  
  // 从 localStorage 加载聊天记录
  useEffect(() => {
    const savedChatMessages = localStorage.getItem('chatMessages');
    if (savedChatMessages) {
      setChatMessages(JSON.parse(savedChatMessages));
    }
  }, []);
  
  // 处理表单变化
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // 时间更新后更新表单数据
  useEffect(() => {
    setFormData({
      ...formData,
      timeRange: `${startHour}:${startMinute} - ${endHour}:${endMinute}`
    });
  }, [startHour, startMinute, endHour, endMinute]);

  // 生成时间选项
  const generateTimeOptions = (max) => {
    const options = [];
    for (let i = 0; i < max; i++) {
      options.push(i.toString().padStart(2, '0'));
    }
    return options;
  };

  const hourOptions = generateTimeOptions(24);
  const minuteOptions = generateTimeOptions(60);

  // 处理提交表单
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.attentionDirection || !formData.selfEvaluation) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      console.log("准备提交记录...", formData);
      
      // 获取三角形数据
      const triangleData = JSON.parse(localStorage.getItem('triangleData') || '{}');
      
      // 将时间范围更新到formData
      const updatedFormData = {
        ...formData,
        timeRange: `${startHour}:${startMinute} - ${endHour}:${endMinute}`,
        id: isEditing && editingRecord ? editingRecord.id : Date.now().toString()
      };
      
      console.log("开始AI分析...", updatedFormData);
      
      // 调用AI分析
      const analysis = await analyzeRecord(triangleData, records, updatedFormData);
      
      console.log("分析结果:", analysis);
      
      // 创建新记录或更新现有记录
      const recordWithAnalysis = {
        ...updatedFormData,
        timestamp: new Date().getTime(), // 用于排序
        score: analysis.score,
        aiScore: analysis.score, // 保持与现有记录兼容
        aiSuggestion: analysis.suggestions[0], // 保持与现有记录兼容
        suggestions: analysis.suggestions,
        analysis: analysis.analysis
      };

      let updatedRecords;
      
      if (isEditing && editingRecord) {
        // 更新现有记录
        updatedRecords = records.map(record => 
          record.id === editingRecord.id ? recordWithAnalysis : record
        );
        setIsEditing(false);
        setEditingRecord(null);
      } else {
        // 添加新记录
        updatedRecords = [...records, recordWithAnalysis];
      }

      // 更新记录列表
      const sortedRecords = sortRecordsByTime(updatedRecords);
      setRecords(sortedRecords);
      localStorage.setItem('attentionRecords', JSON.stringify(sortedRecords));
      
      // 重置表单
      setFormData({
        timeRange: '',
        attentionDirection: '',
        selfEvaluation: ''
      });
      setShowAddForm(false);
      
      console.log("记录添加/更新成功");
    } catch (error) {
      console.error('记录分析错误:', error);
      setAnalysisError('分析记录时出错，请稍后重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 为表单添加任务选择
  const handleSelectTask = (title) => {
    setFormData({
      ...formData,
      attentionDirection: title
    });
  };
  
  // 处理编辑记录
  const handleEditRecord = (e, record) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    // 解析时间范围，填充时间选择器
    const timeRangeParts = record.timeRange.split(' - ');
    if (timeRangeParts.length === 2) {
      const startTime = timeRangeParts[0].split(':');
      const endTime = timeRangeParts[1].split(':');
      
      if (startTime.length === 2 && endTime.length === 2) {
        setStartHour(startTime[0]);
        setStartMinute(startTime[1]);
        setEndHour(endTime[0]);
        setEndMinute(endTime[1]);
      }
    }
    
    // 设置表单数据
    setFormData({
      timeRange: record.timeRange,
      attentionDirection: record.attentionDirection,
      selfEvaluation: record.selfEvaluation
    });
    
    // 设置编辑状态
    setEditingRecord(record);
    setIsEditing(true);
    setShowAddForm(true);
  };
  
  // 处理删除记录
  const handleDeleteRecord = (e, id) => {
    e.stopPropagation(); // 阻止事件冒泡
    
    if (window.confirm('确定要删除这条记录吗？')) {
      const updatedRecords = records.filter(record => record.id !== id);
      // 删除后不需要重新排序，因为顺序不会变
      setRecords(updatedRecords);
      localStorage.setItem('attentionRecords', JSON.stringify(updatedRecords));
    }
  };

  // 展开/折叠记录详情
  const [expandedRecord, setExpandedRecord] = useState(null);
  
  const toggleRecordExpand = (id) => {
    if (expandedRecord === id) {
      setExpandedRecord(null);
    } else {
      setExpandedRecord(id);
    }
  };
  
  // 处理聊天消息发送
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      text: messageInput,
      isUser: true
    };
    
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setMessageInput('');
    setIsLoadingChat(true);
    
    try {
      // 获取注意力三角形数据
      const triangleData = JSON.parse(localStorage.getItem('triangleData') || JSON.stringify({
        highEnergy: { title: '重点任务示例', description: '这是一个示例高精力任务' },
        mediumEnergy1: { title: '中等任务示例1', description: '这是第一个中等精力任务示例' },
        mediumEnergy2: { title: '中等任务示例2', description: '这是第二个中等精力任务示例' },
        lowEnergy1: { title: '调节任务1', description: '' },
        lowEnergy2: { title: '调节任务2', description: '' },
        lowEnergy3: { title: '调节任务3', description: '' }
      }));
      
      // 调用AI聊天服务
      const aiResponse = await sendChatMessage(
        triangleData,
        updatedMessages,
        records,
        messageInput
      );
      
      // 添加AI回复
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false
      };
      
      setChatMessages([...updatedMessages, aiMessage]);
    } catch (error) {
      console.error('聊天消息处理错误:', error);
      
      // 添加错误消息
      const errorMessage = {
        id: Date.now() + 1,
        text: "抱歉，我遇到了一些问题。请稍后再试，或者换个方式提问。",
        isUser: false
      };
      
      setChatMessages([...updatedMessages, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };
  
  // 添加清除聊天记录的功能
  const handleClearChat = () => {
    if (window.confirm('确定要清除所有聊天记录吗？')) {
      setChatMessages([
        { id: 1, text: "你好！我是AI注意力管家，我可以帮你规划任务、解答疑惑和提供情感支持。有什么我能帮到你的吗？", isUser: false }
      ]);
      localStorage.removeItem('chatMessages');
    }
  };
  
  const handleEndDay = () => {
    // 确保数据已经保存
    if (records.length > 0) {
      localStorage.setItem('attentionRecords', JSON.stringify(records));
    }
    
    // 获取完整的注意力三角形数据
    const triangleData = {
      tasks: [
        localStorage.getItem('task1') || '',
        localStorage.getItem('task2') || '',
        localStorage.getItem('task3') || ''
      ],
      highEnergy: {
        title: localStorage.getItem('highEnergyTask') || '',
        description: localStorage.getItem('highEnergyDesc') || ''
      },
      mediumEnergy1: {
        title: localStorage.getItem('mediumEnergy1') || '',
        description: localStorage.getItem('mediumEnergy1Desc') || '' 
      },
      mediumEnergy2: {
        title: localStorage.getItem('mediumEnergy2') || '',
        description: localStorage.getItem('mediumEnergy2Desc') || ''
      },
      lowEnergy1: localStorage.getItem('lowEnergy1') || '',
      lowEnergy2: localStorage.getItem('lowEnergy2') || '',
      lowEnergy3: localStorage.getItem('lowEnergy3') || ''
    };
    
    console.log('准备生成报告，三角形数据:', triangleData);
    console.log('今日记录数据:', records);
    
    localStorage.setItem('attentionTriangle', JSON.stringify(triangleData));
    navigate('/daily-report');
  };
  
  return (
    <div className={styles.container}>
      <ClearStorage />
      
      <div 
        className={styles.triangleIndicator}
        onClick={() => setShowTriangleData(!showTriangleData)}
        ref={triangleRef}
      >
        <div className={`${styles.miniTriangle} ${showTriangleData ? styles.rotated : ''}`}></div>
      </div>
      
      <div 
        className={styles.aiChatIndicator}
        onClick={() => setShowChatPanel(!showChatPanel)}
      >
        <div className={`${styles.robotIcon} ${showChatPanel ? styles.active : ''}`}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="7" y="11" width="22" height="18" rx="2" fill="#333" />
            <circle cx="13" cy="17" r="2" fill="white" />
            <circle cx="23" cy="17" r="2" fill="white" />
            <rect x="13" y="22" width="10" height="2" rx="1" fill="white" />
            <rect x="16" y="4" width="4" height="7" fill="#333" />
            <circle cx="18" cy="4" r="2" fill="#333" />
            <rect x="4" y="16" width="3" height="8" fill="#333" />
            <rect x="29" y="16" width="3" height="8" fill="#333" />
          </svg>
        </div>
      </div>
      
      {showChatPanel && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <h3>AI 注意力管家</h3>
            <div className={styles.chatHeaderActions}>
              <button 
                className={styles.clearChatButton}
                onClick={handleClearChat}
                title="清除聊天记录"
              >
                🗑️
              </button>
              <button 
                className={styles.closeChatButton}
                onClick={() => setShowChatPanel(false)}
              >
                ×
              </button>
            </div>
          </div>
          
          <div className={styles.chatMessages}>
            {chatMessages.map(message => (
              <div 
                key={message.id} 
                className={`${styles.chatMessage} ${message.isUser ? styles.userMessage : styles.aiMessage}`}
              >
                <div className={styles.messageContent}>
                  {message.text}
                </div>
              </div>
            ))}
            {isLoadingChat && (
              <div className={`${styles.chatMessage} ${styles.aiMessage}`}>
                <div className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>
          
          <form onSubmit={handleSendMessage} className={styles.chatForm}>
            <input 
              type="text" 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="输入你的问题..."
              className={styles.chatInput}
              disabled={isLoadingChat}
            />
            <button 
              type="submit" 
              className={styles.sendButton}
              disabled={isLoadingChat || !messageInput.trim()}
            >
              发送
            </button>
          </form>
        </div>
      )}
      
      {showTriangleData && (
        <div className={styles.triangleDataPanel}>
          <h3 className={styles.panelTitle}>今日注意力三角形</h3>
          
          <div className={styles.taskSection}>
            <h4>重精力任务</h4>
            <div className={styles.task}>
              <div className={styles.taskTitle}>{triangleData.highEnergy.title}</div>
              {triangleData.highEnergy.description && (
                <div className={styles.taskDescription}>{triangleData.highEnergy.description}</div>
              )}
            </div>
          </div>
          
          <div className={styles.taskSection}>
            <h4>中等精力任务</h4>
            <div className={styles.task}>
              <div className={styles.taskTitle}>{triangleData.mediumEnergy1.title}</div>
              {triangleData.mediumEnergy1.description && (
                <div className={styles.taskDescription}>{triangleData.mediumEnergy1.description}</div>
              )}
            </div>
            <div className={styles.task}>
              <div className={styles.taskTitle}>{triangleData.mediumEnergy2.title}</div>
              {triangleData.mediumEnergy2.description && (
                <div className={styles.taskDescription}>{triangleData.mediumEnergy2.description}</div>
              )}
            </div>
          </div>
          
          <div className={styles.taskSection}>
            <h4>调节任务</h4>
            <div className={styles.lowEnergyTasks}>
              <span className={styles.lowTask}>{triangleData.lowEnergy1.title}</span>
              <span className={styles.lowTask}>{triangleData.lowEnergy2.title}</span>
              <span className={styles.lowTask}>{triangleData.lowEnergy3.title}</span>
            </div>
          </div>
        </div>
      )}
      
      <main className={styles.content}>
        <h1 className={styles.title}>注意力随手记</h1>
        <p className={styles.date}>{format(currentDate, 'yyyy年MM月dd日 EEEE', { locale: zhCN })}</p>
        
        <div className={styles.recordsList}>
          {records.map(record => (
            <div 
              key={record.id} 
              className={`${styles.recordItem} ${expandedRecord === record.id ? styles.expanded : ''}`}
              onClick={() => toggleRecordExpand(record.id)}
            >
              <div className={styles.recordHeader}>
                <span className={styles.recordTime}>{record.timeRange}</span>
                <span className={styles.recordDirection}>{record.attentionDirection}</span>
                <div className={styles.recordScore}>
                  <span className={styles.scoreLabel}>AI评分</span>
                  <span className={styles.scoreValue} style={{ 
                    color: record.aiScore >= 90 ? '#4CAF50' : record.aiScore >= 70 ? '#FFC107' : '#F44336' 
                  }}>
                    {record.aiScore}
                  </span>
                </div>
                <div className={styles.actionButtons}>
                  <button 
                    className={styles.editButton} 
                    onClick={(e) => handleEditRecord(e, record)}
                    aria-label="编辑"
                  >
                    ✏️
                  </button>
                  <button 
                    className={styles.deleteButton} 
                    onClick={(e) => handleDeleteRecord(e, record.id)}
                    aria-label="删除"
                  >
                    🗑️
                  </button>
                </div>
                <span className={styles.expandIcon}>
                  {expandedRecord === record.id ? '−' : '+'}
                </span>
              </div>
              
              {expandedRecord === record.id && (
                <div className={styles.recordDetails}>
                  <div className={styles.evaluationSection}>
                    <h4 className={styles.evaluationTitle}>自我评价</h4>
                    <p className={styles.evaluationText}>{record.selfEvaluation}</p>
                  </div>
                  
                  <div className={styles.aiAnalysis}>
                    {record.aiSuggestion && !record.suggestions && (
                      <div className={styles.aiSuggestion}>
                        <h4 className={styles.suggestionTitle}>AI建议</h4>
                        <p className={styles.suggestionText}>{record.aiSuggestion}</p>
                      </div>
                    )}
                    
                    {record.suggestions && (
                      <div className={styles.suggestions}>
                        <h4 className={styles.suggestionTitle}>AI建议</h4>
                        <ul className={styles.suggestionList}>
                          {record.suggestions.map((suggestion, index) => (
                            <li key={index} className={styles.suggestionItem}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {record.analysis && (
                      <div className={styles.detailedAnalysis}>
                        <h4 className={styles.analysisTitle}>详细分析</h4>
                        <div className={styles.analysisItems}>
                          <p><strong>三角形匹配度:</strong> {record.analysis.triangleMatch}</p>
                          <p><strong>时间安排合理性:</strong> {record.analysis.timeRationality}</p>
                          <p><strong>用户体验与感受:</strong> {record.analysis.userExperience || record.analysis.historicalComparison}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <button 
          className={styles.addButton}
          onClick={() => {
            setIsEditing(false);
            setEditingRecord(null);
            setFormData({
              timeRange: '',
              attentionDirection: '',
              selfEvaluation: ''
            });
            setStartHour('09');
            setStartMinute('00');
            setEndHour('10');
            setEndMinute('00');
            setShowAddForm(true);
          }}
        >
          +
        </button>
      </main>
      
      {showAddForm && (
        <div className={styles.formOverlay}>
          <div className={styles.addForm}>
            <div className={styles.formHeader}>
              <h3>{isEditing ? '编辑注意力记录' : '添加注意力记录'}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowAddForm(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit}>
              <div className={styles.formGroup}>
                <label>时间段</label>
                <div className={styles.timePickerContainer}>
                  <div className={styles.timePicker}>
                    <select 
                      value={startHour} 
                      onChange={(e) => setStartHour(e.target.value)}
                      className={styles.timeSelect}
                    >
                      {hourOptions.map(hour => (
                        <option key={`start-hour-${hour}`} value={hour}>{hour}</option>
                      ))}
                    </select>
                    <span>:</span>
                    <select 
                      value={startMinute} 
                      onChange={(e) => setStartMinute(e.target.value)}
                      className={styles.timeSelect}
                    >
                      {minuteOptions.map(minute => (
                        <option key={`start-minute-${minute}`} value={minute}>{minute}</option>
                      ))}
                    </select>
                  </div>
                  <span className={styles.timeSeparator}>至</span>
                  <div className={styles.timePicker}>
                    <select 
                      value={endHour} 
                      onChange={(e) => setEndHour(e.target.value)}
                      className={styles.timeSelect}
                    >
                      {hourOptions.map(hour => (
                        <option key={`end-hour-${hour}`} value={hour}>{hour}</option>
                      ))}
                    </select>
                    <span>:</span>
                    <select 
                      value={endMinute} 
                      onChange={(e) => setEndMinute(e.target.value)}
                      className={styles.timeSelect}
                    >
                      {minuteOptions.map(minute => (
                        <option key={`end-minute-${minute}`} value={minute}>{minute}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>注意力方向</label>
                <input 
                  type="text" 
                  name="attentionDirection" 
                  value={formData.attentionDirection}
                  onChange={handleFormChange} 
                  placeholder="你在做什么?"
                  required
                />
                
                <div className={styles.taskSelectionArea}>
                  <p className={styles.taskSelectionHint}>从今日三角形任务中选择:</p>
                  <div className={styles.taskOptions}>
                    {triangleData.highEnergy.title && (
                      <button 
                        type="button" 
                        className={styles.taskOption} 
                        onClick={() => handleSelectTask(triangleData.highEnergy.title)}
                      >
                        {triangleData.highEnergy.title}
                      </button>
                    )}
                    {triangleData.mediumEnergy1.title && (
                      <button 
                        type="button" 
                        className={styles.taskOption} 
                        onClick={() => handleSelectTask(triangleData.mediumEnergy1.title)}
                      >
                        {triangleData.mediumEnergy1.title}
                      </button>
                    )}
                    {triangleData.mediumEnergy2.title && (
                      <button 
                        type="button" 
                        className={styles.taskOption} 
                        onClick={() => handleSelectTask(triangleData.mediumEnergy2.title)}
                      >
                        {triangleData.mediumEnergy2.title}
                      </button>
                    )}
                    {triangleData.lowEnergy1.title && (
                      <button 
                        type="button" 
                        className={styles.taskOption} 
                        onClick={() => handleSelectTask(triangleData.lowEnergy1.title)}
                      >
                        {triangleData.lowEnergy1.title}
                      </button>
                    )}
                    {triangleData.lowEnergy2.title && (
                      <button 
                        type="button" 
                        className={styles.taskOption} 
                        onClick={() => handleSelectTask(triangleData.lowEnergy2.title)}
                      >
                        {triangleData.lowEnergy2.title}
                      </button>
                    )}
                    {triangleData.lowEnergy3.title && (
                      <button 
                        type="button" 
                        className={styles.taskOption} 
                        onClick={() => handleSelectTask(triangleData.lowEnergy3.title)}
                      >
                        {triangleData.lowEnergy3.title}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>自我评价</label>
                <textarea 
                  name="selfEvaluation" 
                  value={formData.selfEvaluation}
                  onChange={handleFormChange} 
                  placeholder="简单描述你的注意力状态和收获"
                  required
                />
              </div>
              
              <div className={styles.formFooter}>
                <button type="submit" className={styles.submitButton} disabled={isAnalyzing}>
                  {isAnalyzing ? '分析中...' : (isEditing ? '保存修改' : '添加记录')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <button
        className={styles.endDayButton}
        onClick={handleEndDay}
      >
        结束今日记录
      </button>
    </div>
  );
}

export default ActivityRecord; 