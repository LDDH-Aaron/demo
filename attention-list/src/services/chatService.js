const AI_API_KEY = process.env.REACT_APP_AI_API_KEY;
const AI_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * 构建聊天提示词
 * @param {Object} triangleData - 用户的注意力三角形数据
 * @param {Array} chatHistory - 聊天历史记录
 * @param {Array} records - 用户的注意力记录
 * @param {String} userMessage - 用户当前的消息
 * @returns {String} - 构建好的提示词
 */
const buildChatPrompt = (triangleData, chatHistory, records, userMessage) => {
  // 从三角形数据中提取任务信息
  const highEnergyTask = triangleData.highEnergy?.title || '未设置高精力任务';
  const highEnergyDesc = triangleData.highEnergy?.description || '';
  
  const mediumEnergy1 = triangleData.mediumEnergy1?.title || '未设置中等精力任务1';
  const mediumEnergy1Desc = triangleData.mediumEnergy1?.description || '';
  
  const mediumEnergy2 = triangleData.mediumEnergy2?.title || '未设置中等精力任务2';
  const mediumEnergy2Desc = triangleData.mediumEnergy2?.description || '';
  
  const lowEnergy1 = triangleData.lowEnergy1?.title || '未设置低精力任务1';
  const lowEnergy2 = triangleData.lowEnergy2?.title || '未设置低精力任务2';
  const lowEnergy3 = triangleData.lowEnergy3?.title || '未设置低精力任务3';

  // 获取今天的日期
  const today = new Date();
  const formattedDate = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
  
  // 过滤出今天的记录
  const todayRecords = records.filter(record => {
    // 检查记录的时间戳是否是今天
    if (!record.timestamp) return false;
    
    const recordDate = new Date(record.timestamp);
    return recordDate.toDateString() === today.toDateString();
  });

  // 获取最近的聊天历史（最多4轮对话）
  const recentChatHistory = chatHistory.slice(-8); // 取最后4轮（8条消息，每轮2条）

  return `你是一个专业、友善且富有同理心的注意力管理助手，名叫"AI注意力管家"。你的目标是帮助用户管理注意力、规划任务、提供情感支持和解答疑惑。

今天是${formattedDate}，用户正在使用注意力管理应用。

===用户今日的注意力三角形===
【注意力三角形是用户的精力分配计划工具，帮助用户根据精力水平安排不同类型的任务】

高精力任务: ${highEnergyTask}
${highEnergyDesc ? `描述: ${highEnergyDesc}` : ''}

中等精力任务1: ${mediumEnergy1}
${mediumEnergy1Desc ? `描述: ${mediumEnergy1Desc}` : ''}

中等精力任务2: ${mediumEnergy2}
${mediumEnergy2Desc ? `描述: ${mediumEnergy2Desc}` : ''}

低精力任务:
- ${lowEnergy1}
- ${lowEnergy2}
- ${lowEnergy3}

===用户今日的注意力记录===
${todayRecords.length > 0 
  ? todayRecords.map(record => `
时间：${record.timeRange || ''}
注意力方向：${record.attentionDirection || ''}
内容：${record.selfEvaluation || ''}
${record.score ? `AI评分：${record.score}` : ''}
`).join('\n')
  : '今天还没有注意力记录'}

===最近的对话历史===
${recentChatHistory.map(msg => 
  `${msg.isUser ? '用户' : 'AI'}：${msg.text}`
).join('\n')}

用户的新消息：${userMessage}

作为注意力管理助手，请根据用户的消息提供帮助：
1. 规划 - 帮助用户根据他们的注意力三角形合理安排任务和时间
2. 解答 - 解答用户关于注意力管理和时间管理的问题
3. 情感支持 - 倾听用户的困扰，提供鼓励和积极反馈
4. 建议 - 提供具体、可操作的建议来帮助用户提高专注力

请以温暖、个性化的方式回复，回应长度控制在100-200字之间，保持简洁实用。确保你的回复考虑了用户的注意力三角形数据和今日记录，并与之前的对话保持连贯性。
`;
};

/**
 * 发送聊天消息并获取AI回复
 * @param {Object} triangleData - 用户的注意力三角形数据
 * @param {Array} chatHistory - 聊天历史记录
 * @param {Array} records - 用户的注意力记录
 * @param {String} userMessage - 用户当前的消息
 * @returns {Promise<String>} - 返回AI的回复
 */
export const sendChatMessage = async (triangleData, chatHistory, records, userMessage) => {
  console.log("开始AI聊天...", { triangleData, userMessage });
  const prompt = buildChatPrompt(triangleData, chatHistory, records, userMessage);
  
  try {
    console.log("正在调用聊天API...");
    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个友善专业的注意力管理助手，名叫'AI注意力管家'。你会根据用户的注意力记录和三角形任务提供个性化的帮助。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("聊天API响应不成功:", response.status, errorData);
      throw new Error(`API请求失败: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log("聊天API响应:", data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("聊天API响应格式不正确:", data);
      throw new Error("API响应格式不正确");
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI聊天错误:', error);
    return "抱歉，我遇到了一些问题。请稍后再试，或者尝试用不同的方式提问。";
  }
}; 