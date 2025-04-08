const AI_API_KEY = process.env.REACT_APP_AI_API_KEY;
const AI_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 构建分析提示词
const buildAnalysisPrompt = (triangleData, historyRecords, newRecord) => {
  // 从三角形数据中提取任务信息和描述
  const highEnergyTask = triangleData.highEnergy?.title || '未设置高精力任务';
  const highEnergyDesc = triangleData.highEnergy?.description || '';
  
  const mediumEnergy1 = triangleData.mediumEnergy1?.title || '未设置中等精力任务1';
  const mediumEnergy1Desc = triangleData.mediumEnergy1?.description || '';
  
  const mediumEnergy2 = triangleData.mediumEnergy2?.title || '未设置中等精力任务2';
  const mediumEnergy2Desc = triangleData.mediumEnergy2?.description || '';
  
  const lowEnergy1 = triangleData.lowEnergy1?.title || '未设置低精力任务1';
  const lowEnergy2 = triangleData.lowEnergy2?.title || '未设置低精力任务2';
  const lowEnergy3 = triangleData.lowEnergy3?.title || '未设置低精力任务3';

  // 获取今天的日期（YYYY-MM-DD格式）
  const today = new Date().toISOString().split('T')[0];
  
  // 过滤出今天的记录
  const todayRecords = historyRecords.filter(record => {
    // 尝试从record.timestamp或其他可能的日期字段获取日期
    const recordDate = record.timestamp 
      ? new Date(record.timestamp).toISOString().split('T')[0]
      : record.date || ''; // 备用日期字段
    
    return recordDate === today;
  });

  return `你是一个温暖鼓励的注意力管理助手，负责分析用户的注意力记录并提供积极的评分和建议。

关于注意力三角形：
注意力三角形是一个时间管理和精力分配工具，帮助用户平衡三个维度：
1. 精力值：表示用户执行任务时的精力投入水平
2. 注意力值：表示用户专注度和注意力集中程度
3. 时间值：表示用户时间管理和时间感知的有效性

根据注意力三角形，用户会安排不同精力水平的任务：
- 高精力任务：需要高度专注和充沛精力的重要任务（如学习、重要工作）
- 中等精力任务：需要适中精力的常规任务（如例行工作、家务等）
- 低精力任务：用于调节和休息的轻松任务（如娱乐、社交活动）

用户当前的注意力三角形任务安排：

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

用户今天的所有记录（按时间顺序）：
${todayRecords.length > 0 
  ? todayRecords.map((record, index) => `
记录${index + 1}:
时间：${record.timeRange || ''}
注意力方向：${record.attentionDirection || ''}
内容：${record.selfEvaluation || ''}
${record.score ? `评分：${record.score}` : ''}
`).join('\n') 
  : '今天还没有其他记录'}

最近的历史记录（按时间倒序，最多3条）：
${historyRecords.slice(0, 3).map(record => `
时间：${record.timeRange || ''}
注意力方向：${record.attentionDirection || ''}
内容：${record.selfEvaluation || ''}
${record.score ? `评分：${record.score}` : ''}
`).join('\n')}

新的记录内容：
时间：${newRecord.timeRange || ''}
注意力方向：${newRecord.attentionDirection || ''}
内容：${newRecord.selfEvaluation || ''}

分析依据：
1. 任务匹配 - 检查记录的活动是否与用户设定的任务（高/中/低精力）相符
2. 时间安排 - 评估时间选择的合理性：
   - 高精力任务适合在精力充沛时段（如上午9-12点）
   - 复杂决策适合在上午，创意工作适合在下午
   - 低精力任务适合在精力低谷期（如午后、晚上、做完高精力任务后）
3. 连续性评估 - 分析今天的所有记录，看是否形成了良好的活动序列
4. 用户体验 - 从用户描述中提取主观感受，评估满意度和效果

请基于以下维度进行分析：
1. 与三角形匹配度：记录的活动是否符合用户的能量分配策略，是否与用户设定的任务相符
2. 时间安排合理性：记录的时间选择是否有效且适合该类型活动，是否与当天其他活动形成合理序列
3. 用户感受与收获：从用户的描述中评估其主观体验和实际收获

评分时请保持积极和鼓励性，给予合理的分数（60-95分之间）

请以JSON格式返回分析结果，格式如下：
{
  "score": 分数（70-95的整数）,
  "suggestions": [
    "一句积极鼓励的话，但也要适当指出问题（不超过20字）",
    "一句具体的下一步建议（不超过25字）"
  ],
  "analysis": {
    "triangleMatch": "与三角形匹配度分析（不超过30字，给出依据）",
    "timeRationality": "时间安排合理性分析（不超过30字，给出依据）",
    "userExperience": "用户感受分析（不超过30字，给出依据）"
  }
}`;
};

// 调用AI API进行分析
export const analyzeRecord = async (triangleData, historyRecords, newRecord) => {
  console.log("开始AI分析...", { triangleData, newRecord });
  const prompt = buildAnalysisPrompt(triangleData, historyRecords, newRecord);
  
  try {
    console.log("正在调用API...");
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
            content: "你是一个温暖友善的注意力管理助手，负责分析用户的注意力记录并提供积极的评分和建议。请确保返回格式严格的JSON，并保持乐观和鼓励的语气。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("API响应不成功:", response.status, errorData);
      throw new Error(`API请求失败: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    console.log("API响应:", data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error("API响应格式不正确:", data);
      throw new Error("API响应格式不正确");
    }
    
    const result = parseResponse(data.choices[0].message.content);
    console.log("解析后的结果:", result);
    return result;
  } catch (error) {
    console.error('AI分析错误:', error);
    // 为了防止整个流程中断，返回一个默认值
    return {
      score: 85,
      suggestions: [
        "你今天的努力非常值得肯定！",
        "继续保持，可以尝试更精确地安排活动时间"
      ],
      analysis: {
        triangleMatch: "活动与能量分配策略相符",
        timeRationality: "时间安排合理有序",
        userExperience: "体验积极，达成了预期目标"
      }
    };
  }
};

// 解析API返回结果
const parseResponse = (responseText) => {
  try {
    console.log("尝试解析响应:", responseText);
    
    // 尝试从文本中提取JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const jsonStr = jsonMatch[0];
      console.log("提取的JSON字符串:", jsonStr);
      
      const result = JSON.parse(jsonStr);
      console.log("解析的JSON对象:", result);
      
      // 验证必要字段
      if (!result.score || !result.suggestions || !result.analysis) {
        console.error("返回结果缺少必要字段:", result);
        throw new Error('返回结果缺少必要字段');
      }
      
      return result;
    }
    
    console.error("无法在响应中找到JSON:", responseText);
    throw new Error('无法解析AI响应');
  } catch (error) {
    console.error('响应解析错误:', error);
    // 返回一个默认值
    return {
      score: 82,
      suggestions: [
        "今天的安排非常棒！",
        "下次可以尝试更聚焦于单一任务"
      ],
      analysis: {
        triangleMatch: "活动与三角形策略基本一致",
        timeRationality: "时间分配符合任务性质",
        userExperience: "感受积极，获得了预期成果"
      }
    };
  }
}; 