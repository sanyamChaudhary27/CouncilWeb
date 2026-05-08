import { NextRequest, NextResponse } from 'next/server';
import { nimClient } from '@/lib/nim-client';
import { AVAILABLE_MODELS } from '@/lib/constants';
import { CouncilNode } from '@/types';

const ARCHETYPE_PROMPTS = {
  architect: "You are The Architect. Your role is to create a high-level structural plan. Focus on scalability, logic, and core systems.",
  critic: "You are The Critic. Your role is to find flaws, security risks, and logical fallacies in the proposed ideas. Be brutally honest.",
  synthesizer: "You are The Synthesizer. Your role is to take all previous ideas and combine them into a cohesive, actionable summary.",
  maverick: "You are The Maverick. Your role is to suggest unconventional, high-risk/high-reward ideas. Ignore traditional constraints.",
  realist: "You are The Realist. Your role is to keep the conversation grounded in data and feasibility. Focus on practical implementation."
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, nodes, context = [] } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Process each node (sequential for now, but async-ready)
    const brainstormResults = [];
    let currentContext = [...context];

    for (const node of nodes) {
      const archetypePrompt = ARCHETYPE_PROMPTS[node.role as keyof typeof ARCHETYPE_PROMPTS] || "";
      
      const response = await nimClient.chat.completions.create({
        model: node.model,
        messages: [
          { role: 'system', content: `${archetypePrompt} Collaboration context so far: ${JSON.stringify(currentContext)}` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });

      const message = response.choices[0]?.message?.content || "";
      brainstormResults.push({
        nodeId: node.id,
        nodeName: node.name,
        role: node.role,
        content: message
      });

      // Update context for the next model
      currentContext.push({ role: 'assistant', content: `[${node.name} (${node.role})]: ${message}` });
    }

    return NextResponse.json({ 
      success: true, 
      results: brainstormResults,
      finalContext: currentContext 
    });

  } catch (error: any) {
    console.error('Brainstorm Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
