import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyzeDailyRecords } from '../services/aiService';
import styles from '../styles/DailyReport.module.css';

const DailyReport = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const generateReport = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const savedRecords = localStorage.getItem('attentionRecords');
        const savedTriangle = localStorage.getItem('attentionTriangle');
        
        // 调试信息
        const debug = {
          date: today,
          hasRecords: !!savedRecords,
          hasTriangle: !!savedTriangle,
          recordsCount: savedRecords ? JSON.parse(savedRecords).length : 0,
          triangleData: savedTriangle ? JSON.parse(savedTriangle) : null
        };
        setDebugInfo(debug);
        console.log('调试信息:', debug);
        
        if (!savedRecords || !savedTriangle) {
          setError('没有找到今日记录或注意力三角形数据');
          setLoading(false);
          return;
        }

        const records = JSON.parse(savedRecords);
        const triangleData = JSON.parse(savedTriangle);
        
        // 过滤出今天的记录
        const todayRecords = records.filter(record => {
          try {
            // 处理不同可能的日期格式
            let recordDate = null;
            if (record.timestamp) {
              recordDate = new Date(record.timestamp).toISOString().split('T')[0];
            } else if (record.time && record.time.includes(' ')) {
              recordDate = record.time.split(' ')[0];
            } else if (record.time && record.time.includes('T')) {
              recordDate = record.time.split('T')[0];
            } else if (record.date) {
              recordDate = record.date;
            }
            
            // 如果没有找到任何日期，包含所有记录
            if (!recordDate) return true;
            
            return recordDate === today;
          } catch (e) {
            console.error('处理记录日期时出错:', e, record);
            // 如果处理出错，默认包含该记录
            return true;
          }
        });

        console.log('今日记录:', todayRecords);
        
        // 如果没有今日记录，使用最近5条
        if (todayRecords.length === 0) {
          console.log('没有今日记录，使用最近记录');
          // 按时间排序，取最近5条
          const sortedRecords = [...records].sort((a, b) => {
            const getTime = (r) => r.timestamp || (r.time ? new Date(r.time).getTime() : 0);
            return getTime(b) - getTime(a);
          }).slice(0, 5);
          
          if (sortedRecords.length === 0) {
            setError('没有任何记录可供分析');
            setLoading(false);
            return;
          }
          
          const analysis = await analyzeDailyRecords(sortedRecords, triangleData);
          setReport(analysis);
        } else {
          // 分析今日记录
          const analysis = await analyzeDailyRecords(todayRecords, triangleData);
          setReport(analysis);
        }
      } catch (err) {
        console.error('生成报告时出错:', err);
        setError('生成报告时出错：' + err.message);
      } finally {
        setLoading(false);
      }
    };

    generateReport();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>正在生成注意力报告...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
        {debugInfo && (
          <div className={styles.debugInfo}>
            <h3>调试信息</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
        <button 
          className={styles.backButton}
          onClick={() => navigate('/activity-record')}
        >
          返回记录页面
        </button>
      </div>
    );
  }

  // 如果没有成功获取报告
  if (!report || (!report.analysis && !report.suggestions)) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>无法生成报告，返回数据格式不正确</div>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/activity-record')}
        >
          返回记录页面
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>注意力分析报告</h1>
      
      <div className={styles.section}>
        <h2>注意力表现分析</h2>
        <div className={styles.analysis}>
          {report.analysis && typeof report.analysis === 'string'
            ? report.analysis.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            : <p>无分析内容</p>
          }
        </div>
      </div>

      <div className={styles.section}>
        <h2>改进建议</h2>
        <div className={styles.suggestions}>
          {report.suggestions && Array.isArray(report.suggestions)
            ? report.suggestions.map((suggestion, index) => (
                <div key={index} className={styles.suggestionItem}>
                  <span className={styles.suggestionNumber}>{index + 1}</span>
                  <p>{suggestion}</p>
                </div>
              ))
            : <p>无建议内容</p>
          }
        </div>
      </div>

      <button 
        className={styles.backButton}
        onClick={() => navigate('/activity-record')}
      >
        返回记录页面
      </button>
    </div>
  );
};

export default DailyReport; 