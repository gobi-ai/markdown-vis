import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface VisualizationConfig {
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter' | 'composed';
  data: Array<Record<string, any>>;
  xAxisKey?: string;
  yAxisKey?: string;
  dataKey?: string;
  title: string;
  description?: string;
  colors?: string[];
}

export async function execute_llm(markdownContent: string): Promise<VisualizationConfig> {
  const prompt = `Analyze the following markdown content and generate a data visualization configuration in JSON format.

The markdown content:
${markdownContent}

Based on the content, determine:
1. What type of data visualization would best represent this information (line, bar, pie, area, scatter, or composed chart)
2. Extract any numeric data, trends, comparisons, or metrics
3. Structure the data appropriately for the chosen chart type

Return ONLY a valid JSON object with this exact structure:
{
  "chartType": "line" | "bar" | "pie" | "area" | "scatter" | "composed",
  "data": [array of data objects],
  "xAxisKey": "key name for x-axis (if applicable)",
  "yAxisKey": "key name for y-axis (if applicable)",
  "dataKey": "key name for data values (for pie charts)",
  "title": "Chart title",
  "description": "Brief description of what the chart shows",
  "colors": ["#8884d8", "#82ca9d", "#ffc658", ...] (optional array of hex colors)
}

For line/bar/area charts, data should be an array of objects like: [{"name": "Jan", "value": 100}, ...]
For pie charts, data should be an array of objects like: [{"name": "Category", "value": 30}, ...]
For composed charts, include multiple dataKeys.

If no clear data can be extracted, create a simple visualization based on the main topics or concepts mentioned.`;

  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    try {
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a data visualization expert. Analyze markdown content and return only valid JSON for chart configuration.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const config = JSON.parse(content) as VisualizationConfig;
        return config;
      } else {
        throw new Error('OpenAI API returned empty response');
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      // Fall through to Anthropic if available
      if (!process.env.ANTHROPIC_API_KEY) {
        throw error;
      }
    }
  }

  // Try Anthropic as fallback
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      const message = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: prompt + '\n\nReturn ONLY valid JSON, no markdown formatting or code blocks.',
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        // Extract JSON from response (remove markdown code blocks if present)
        let jsonText = content.text.trim();
        jsonText = jsonText.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
        const config = JSON.parse(jsonText) as VisualizationConfig;
        return config;
      } else {
        throw new Error('Anthropic API returned non-text response');
      }
    } catch (error) {
      console.error('Anthropic API error:', error);
      throw error;
    }
  }

  throw new Error('No LLM API key configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.');
}

