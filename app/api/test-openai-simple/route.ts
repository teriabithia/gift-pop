import { NextRequest, NextResponse } from 'next/server'
import { openai } from '@/lib/openai'

export async function GET() {
  try {
    console.log('🧪 简单OpenAI API测试...')
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是一个测试助手。只返回JSON格式。'
        },
        {
          role: 'user',
          content: '返回一个简单的JSON对象：{"test": "success", "message": "Hello"}'
        }
      ],
      temperature: 0.1,
      max_tokens: 100,
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    console.log('OpenAI响应内容:', content)

    if (!content) {
      return NextResponse.json({ error: 'OpenAI返回空响应' }, { status: 500 })
    }

    try {
      const parsed = JSON.parse(content)
      console.log('✅ JSON解析成功:', parsed)
      return NextResponse.json({ 
        success: true, 
        message: 'OpenAI API调用成功',
        response: parsed,
        rawContent: content
      })
    } catch (parseError) {
      console.error('❌ JSON解析失败:', parseError)
      return NextResponse.json({ 
        error: 'JSON解析失败', 
        parseError: parseError instanceof Error ? parseError.message : '未知错误',
        rawContent: content
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('❌ OpenAI API调用失败:', error)
    return NextResponse.json({ 
      error: 'OpenAI API调用失败', 
      details: error.message || '未知错误'
    }, { status: 500 })
  }
}

