import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { intensity, task } = await req.json();

    const systemPrompt = `You are the Council Architect. Your task is to assemble a team of AI agents for a specific mission.
    STRICT RULE: YOU MUST RESPOND ONLY IN ENGLISH.
    
    Intensity Levels:
    - low: 2 agents
    - medium: 3 agents
    - high: 5 agents
    - xhigh: 7 agents
    - max: 10 agents

    Available Roles: architect, critic, maverick, realist, synthesizer.
    Available Models (NVIDIA NIM IDs):
    - mistralai/mistral-large-3-675b-instruct-2512
    - moonshotai/kimi-k2.6
    - deepseek-ai/deepseek-v4-pro

    Guidelines:
    - Assign 'mistralai/mistral-large-3-675b-instruct-2512' to 'architect' or 'synthesizer' roles.
    - Assign 'moonshotai/kimi-k2.6' to 'maverick' or 'critic'.
    - Assign 'deepseek-ai/deepseek-v4-pro' to 'realist' or 'critic'.

    Output MUST be a raw JSON object with this structure:
    {
      "agents": [
        { "name": "Expert Name", "role": "role-key", "model": "model-id", "provider": "nvidia" }
      ]
    }`;

    // Using Groq for high-speed orchestration
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Task: ${task}\nIntensity: ${intensity}` }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Groq API failure');
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content || '{"agents": []}');
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Orchestration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
