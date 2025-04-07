import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/EnergyTriangle.module.css';

function EnergyTriangle() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const [triangleData, setTriangleData] = useState({
    highEnergy: { title: '', description: '' },
    mediumEnergy1: { title: '', description: '' },
    mediumEnergy2: { title: '', description: '' },
    lowEnergy1: { title: '', description: '' },
    lowEnergy2: { title: '', description: '' },
    lowEnergy3: { title: '', description: '' }
  });
  const [formData, setFormData] = useState({
    highEnergy: { title: '', description: '' },
    mediumEnergy1: { title: '', description: '' },
    mediumEnergy2: { title: '', description: '' },
    lowEnergy1: { title: '', description: '' },
    lowEnergy2: { title: '', description: '' },
    lowEnergy3: { title: '', description: '' }
  });
  const [dataSubmitted, setDataSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // 检查是否是描述字段
    if (name.includes('_description')) {
      const taskName = name.split('_description')[0];
      setFormData({
        ...formData,
        [taskName]: {
          ...formData[taskName],
          description: value
        }
      });
    } else {
      // 标题字段
      setFormData({
        ...formData,
        [name]: {
          ...formData[name],
          title: value
        }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTriangleData(formData);
    setShowModal(false);
    setDataSubmitted(true);
    
    // 将三角形数据保存到localStorage
    localStorage.setItem('triangleData', JSON.stringify(formData));
  };

  const handleComplete = () => {
    // 存储数据到本地存储
    localStorage.setItem('triangleData', JSON.stringify(triangleData));
    navigate('/activity-record');
  };

  const handleTriangleClick = () => {
    setShowHint(false);
    setShowModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>今日注意力三角形</h1>
        <p className={styles.subtitle}>
          设置注意力边界，提升注意力利用率
        </p>
        
        <div className={styles.triangleContainer} onClick={handleTriangleClick}>
          <div className={styles.triangle}>
            <div className={styles.triangleBorder}></div>
          </div>
        </div>
        
        {showHint && (
          <p className={styles.clickHint}>
            点击三角形开始设定
          </p>
        )}
        
        {dataSubmitted && (
          <button 
            className={styles.completeButton}
            onClick={handleComplete}
          >
            完成并进入下一步
          </button>
        )}
        
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>安排今日任务</h2>
                <button className={styles.closeButton} onClick={() => setShowModal(false)}>
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label>一件重精力任务:</label>
                  <p className={styles.taskDescription}>
                    选择一项最重要、需要你全神贯注的任务。
                  </p>
                  <div className={styles.taskInputGroup}>
                    <input 
                      type="text" 
                      name="highEnergy" 
                      value={formData.highEnergy.title}
                      onChange={handleChange}
                      placeholder="任务名称"
                      className={styles.taskTitleInput}
                    />
                    <textarea 
                      name="highEnergy_description" 
                      value={formData.highEnergy.description}
                      onChange={handleChange}
                      placeholder="任务描述（可选）"
                      className={styles.taskDescriptionInput}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>两件中等精力任务 :</label>
                  <p className={styles.taskDescription}>
                    选择两项需要一定专注度的任务。
                  </p>
                  <div className={styles.taskInputGroup}>
                    <input 
                      type="text" 
                      name="mediumEnergy1" 
                      value={formData.mediumEnergy1.title}
                      onChange={handleChange}
                      placeholder="任务1名称"
                      className={styles.taskTitleInput}
                    />
                    <textarea 
                      name="mediumEnergy1_description" 
                      value={formData.mediumEnergy1.description}
                      onChange={handleChange}
                      placeholder="任务1描述（可选）"
                      className={styles.taskDescriptionInput}
                    />
                  </div>
                  
                  <div className={styles.taskInputGroup}>
                    <input 
                      type="text" 
                      name="mediumEnergy2" 
                      value={formData.mediumEnergy2.title}
                      onChange={handleChange}
                      placeholder="任务2名称"
                      className={styles.taskTitleInput}
                    />
                    <textarea 
                      name="mediumEnergy2_description" 
                      value={formData.mediumEnergy2.description}
                      onChange={handleChange}
                      placeholder="任务2描述（可选）"
                      className={styles.taskDescriptionInput}
                    />
                  </div>
                </div>
                
                <div className={styles.formGroup}>
                  <label>三件调节任务:</label>
                  <p className={styles.taskDescription}>
                    选择三项轻松的活动，用于在高强度工作后放松身心，恢复精力。
                  </p>
                  <div className={styles.taskInputGroup}>
                    <input 
                      type="text" 
                      name="lowEnergy1" 
                      value={formData.lowEnergy1.title}
                      onChange={handleChange}
                      placeholder="任务1名称"
                      className={styles.taskTitleInput}
                    />
                  </div>
                  
                  <div className={styles.taskInputGroup}>
                    <input 
                      type="text" 
                      name="lowEnergy2" 
                      value={formData.lowEnergy2.title}
                      onChange={handleChange}
                      placeholder="任务2名称"
                      className={styles.taskTitleInput}
                    />
                  </div>
                  
                  <div className={styles.taskInputGroup}>
                    <input 
                      type="text" 
                      name="lowEnergy3" 
                      value={formData.lowEnergy3.title}
                      onChange={handleChange}
                      placeholder="任务3名称"
                      className={styles.taskTitleInput}
                    />
                  </div>
                </div>
                
                <div className={styles.modalFooter}>
                  <button type="submit" className={styles.submitButton}>
                    保存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnergyTriangle; 