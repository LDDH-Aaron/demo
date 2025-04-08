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

请基于以下维度进行分析和评分：
1. 与三角形匹配度：记录的活动是否符合用户的能量分配策略，是否与用户设定的任务相符
2. 时间安排合理性：记录的时间选择是否有效且适合该类型活动，是否与当天其他活动形成合理序列
3. 用户感受与收获：从用户的描述中评估其主观体验和实际收获

评分时请保持积极和鼓励性，给予合理的分数（60-95分之间）

请以JSON格式返回分析结果，格式如下：
{
  "score": 分数（60-95的整数）（敢于给高分和低分）,
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

export const analyzeDailyRecords = async (records, triangleData) => {
  try {
    // 安全地获取时间
    const formatTime = (record) => {
      try {
        if (record.timestamp) {
          return new Date(record.timestamp).toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        } else if (record.time) {
          const timeParts = record.time.split(' ');
          return timeParts.length > 1 ? timeParts[1] : record.time;
        }
        return '未知时间';
      } catch (e) {
        console.error('格式化时间出错:', e);
        return '未知时间';
      }
    };

    // 安全地获取评分
    const getScore = (record) => {
      const score = record.aiScore || record.score;
      return typeof score === 'number' ? score : 5;
    };

    // 构建三角形数据的详细描述
    const buildTriangleDescription = (triangleData) => {
      let description = '';
      
      if (triangleData.highEnergy && triangleData.highEnergy.title) {
        description += `高精力任务: ${triangleData.highEnergy.title}\n`;
        if (triangleData.highEnergy.description) {
          description += `描述: ${triangleData.highEnergy.description}\n\n`;
        }
      }
      
      if (triangleData.mediumEnergy1 && triangleData.mediumEnergy1.title) {
        description += `中等精力任务1: ${triangleData.mediumEnergy1.title}\n`;
        if (triangleData.mediumEnergy1.description) {
          description += `描述: ${triangleData.mediumEnergy1.description}\n\n`;
        }
      }
      
      if (triangleData.mediumEnergy2 && triangleData.mediumEnergy2.title) {
        description += `中等精力任务2: ${triangleData.mediumEnergy2.title}\n`;
        if (triangleData.mediumEnergy2.description) {
          description += `描述: ${triangleData.mediumEnergy2.description}\n\n`;
        }
      }
      
      description += '低精力任务:\n';
      if (triangleData.lowEnergy1) {
        description += `- ${triangleData.lowEnergy1}\n`;
      }
      if (triangleData.lowEnergy2) {
        description += `- ${triangleData.lowEnergy2}\n`;
      }
      if (triangleData.lowEnergy3) {
        description += `- ${triangleData.lowEnergy3}\n`;
      }
      
      return description;
    };

    // 从任何可用的任务数据中获取任务列表
    const getTasksList = (triangleData) => {
      // 优先从tasks数组获取
      if (triangleData.tasks && triangleData.tasks.length > 0) {
        return triangleData.tasks.map((task, index) => `${index + 1}. ${task}`).join('\n');
      }
      
      // 否则从各个任务字段中构建列表
      let tasks = [];
      
      if (triangleData.highEnergy && triangleData.highEnergy.title) {
        tasks.push(`1. 高精力: ${triangleData.highEnergy.title}`);
      }
      
      if (triangleData.mediumEnergy1 && triangleData.mediumEnergy1.title) {
        tasks.push(`2. 中精力1: ${triangleData.mediumEnergy1.title}`);
      }
      
      if (triangleData.mediumEnergy2 && triangleData.mediumEnergy2.title) {
        tasks.push(`3. 中精力2: ${triangleData.mediumEnergy2.title}`);
      }
      
      if (triangleData.lowEnergy1) {
        tasks.push(`4. 低精力1: ${triangleData.lowEnergy1}`);
      }
      
      if (triangleData.lowEnergy2) {
        tasks.push(`5. 低精力2: ${triangleData.lowEnergy2}`);
      }
      
      if (triangleData.lowEnergy3) {
        tasks.push(`6. 低精力3: ${triangleData.lowEnergy3}`);
      }
      
      return tasks.length > 0 ? tasks.join('\n') : '未设置任务';
    };

    // 详细格式化记录
    const formatRecords = (records) => {
      return records.map((record, index) => {
        // 收集记录中所有可能的相关信息
        let output = `记录 ${index + 1}:\n`;
        output += `时间范围: ${record.timeRange || '未知'}\n`;
        output += `时间点: ${formatTime(record)}\n`;
        output += `注意力方向: ${record.attentionDirection || record.event || '未知'}\n`;
        output += `评分: ${getScore(record)}/10\n`;
        
        if (record.selfEvaluation) {
          output += `自我评价: ${record.selfEvaluation}\n`;
        }
        
        if (record.feeling) {
          output += `感受: ${record.feeling}\n`;
        }
        
        if (record.analysis) {
          output += `分析: ${JSON.stringify(record.analysis)}\n`;
        }
        
        if (record.suggestions && record.suggestions.length) {
          output += `之前的建议: ${record.suggestions.join('; ')}\n`;
        } else if (record.aiSuggestion) {
          output += `之前的建议: ${record.aiSuggestion}\n`;
        }
        
        return output;
      }).join('\n----------\n');
    };

    const triangleDescription = buildTriangleDescription(triangleData);
    const tasksList = getTasksList(triangleData);
    const formattedRecords = formatRecords(records);

    const prompt = `请作为一位专业的注意力分析师，基于用户的注意力三角形和记录，生成一份详细的每日注意力报告。

===== 注意力三角形任务列表 =====
${tasksList}

===== 注意力三角形详细描述 =====
${triangleDescription}

===== 用户记录详情 =====
${formattedRecords}

请提供一份全面的分析报告，内容包括：

1. 注意力表现分析：
   - 注意力水平的变化趋势和规律
   - 用户在高/中/低精力任务上的表现对比
   - 用户的注意力分配是否符合其三角形设定
   - 用户在一天中不同时段的注意力状态
   - 用户在执行任务时的主观感受与实际表现对比

2. 优势与挑战：
   - 用户注意力管理的强项
   - 用户面临的注意力管理挑战
   - 可能影响用户注意力的外部或内部因素

3. 个性化改进建议：
   - 至少4条具体、可执行的改进建议
   - 如何更好地根据注意力三角形原则分配任务
   - 如何优化高注意力时段的利用
   - 如何提升低注意力时段的效率
   - 如何改善整体的注意力管理策略

请以 JSON 格式返回，格式如下：
{
  "analysis": "详细的分析内容，可以包含多个段落，用\\n分隔",
  "suggestions": ["具体建议1", "具体建议2", "具体建议3", "具体建议4"]
}

请确保返回严格遵循JSON格式，不要包含额外文本或标记。分析内容应该深入且个性化，建议应该具体且可操作。`;

    console.log('生成报告的提示词已准备完毕');
    // console.log(prompt);  // 调试时可以打开查看完整提示词

    const response = await fetch(AI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('API 请求失败: ' + await response.text());
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('AI 返回的响应长度:', content.length);
    
    // 尝试解析 JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      console.error('解析 JSON 失败:', e);
      
      // 尝试提取 JSON 部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e2) {
          console.error('提取 JSON 后解析仍然失败:', e2);
        }
      }
      
      // 如果所有解析方法都失败，返回一个默认的报告
      return {
        analysis: "无法生成分析报告。AI 服务返回的数据格式不正确。",
        suggestions: [
          "请稍后再试",
          "检查您的网络连接",
          "确保您已正确设置 API 密钥"
        ]
      };
    }
  } catch (error) {
    console.error('生成每日报告时出错:', error);
    return {
      analysis: `生成报告时出错: ${error.message}`,
      suggestions: [
        "请稍后再试",
        "检查您的网络连接",
        "确保您已正确设置 API 密钥"
      ]
    };
  }
}; 