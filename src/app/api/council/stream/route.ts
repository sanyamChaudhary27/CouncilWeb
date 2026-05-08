import { NextRequest } from 'next/server';
import { CouncilNode } from '@/types';
import { nimClient } from '@/lib/nim-client';
import { mcpManager } from '@/lib/mcp-manager';
import { createClient } from '@/lib/supabase';

const ARCHETYPE_PROMPTS = {
  architect: "You are The Architect. Propose high-level structure and logic. Be precise and structural. Use tools if you need technical data.",
  critic: "You are The Critic. Find flaws, risks, and logical fallacies in the current proposal. Be rigorous. Use tools to verify claims.",
  synthesizer: "You are The Synthesizer. Combine previous ideas into a cohesive, polished final plan. Resolve conflicts.",
  maverick: "You are The Maverick. Suggest unconventional, high-risk/high-reward ideas. Think outside the box.",
  realist: "You are The Realist. Keep the conversation grounded in data and practical execution constraints. Use tools to check feasibility."
};

async function callOllamaStream(model: string, messages: any[], tools: any[] | null, onToken: (token: string) => void, onToolCall?: (name: string, args: any) => Promise<string>) {
  // Simplified Ollama tool support (if model supports it)
  // For this prototype, we'll focus on NIM for tool use, but keep Ollama for chat.
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      messages: messages,
      stream: true,
      tools: tools || undefined
    })
  });
  
  if (!response.ok) {
    throw new Error(`Ollama error: ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let fullContent = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const data = JSON.parse(line);
        if (data.message?.content) {
          const content = data.message.content;
          fullContent += content;
          onToken(content);
        }
        // Simplified tool handling for Ollama...
      } catch (e) { }
    }
  }
  return fullContent;
}

export async function POST(req: NextRequest) {
  const encoder = new TextEncoder();
  const supabase = createClient();
  const { prompt, nodes, sessionSummary: localSummary, sessionId, persistMemory } = await req.json();

  let incomingSummary = localSummary;

  if (persistMemory && sessionId) {
    const { data: sessionData } = await supabase
      .from('sessions')
      .select('summary')
      .eq('id', sessionId)
      .maybeSingle();
    
    if (sessionData?.summary) {
      incomingSummary = sessionData.summary;
    }
  }

  if (!prompt || !nodes || nodes.length === 0) {
    return new Response('Invalid request', { status: 400 });
  }

  const customReadable = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const context: any[] = [];
        const activeNodes = nodes as CouncilNode[];

        const runNode = async (node: CouncilNode, customPrompt?: string, maxTokens: number = 1024) => {
          sendEvent('node_start', { nodeId: node.id });
          
          const archetypeSystem = ARCHETYPE_PROMPTS[node.role] || "You are a council member.";
          
          const messages = [
            { 
              role: 'system', 
              content: `${archetypeSystem}\n\n` + 
                       `STRICT RULE: YOU MUST RESPOND ONLY IN ENGLISH. DO NOT USE ANY OTHER LANGUAGE.\n\n` +
                       (incomingSummary ? `CURRENT SESSION SUMMARY:\n${incomingSummary}\n\n` : '') +
                       `PRIMARY OBJECTIVE: ${prompt}\n\n` +
                       `RECENT CONTEXT:\n${JSON.stringify(context.slice(-3))}` 
            },
            { role: 'user', content: customPrompt || prompt }
          ];

          let content = "";
          const onToken = (token: string) => {
            sendEvent('token', { nodeId: node.id, token });
          };

          try {
            if (node.provider === 'nvidia') {
              // NIM supports tool calling natively
              const response = await nimClient.chat.completions.create({
                model: node.model,
                messages: messages as any,
                tools: mcpManager.tools as any,
                tool_choice: 'auto',
                temperature: 0.7,
                max_tokens: maxTokens,
                stream: false, 
              });

              const message = response.choices[0].message;
              
              if (message.tool_calls) {
                for (const toolCall of message.tool_calls) {
                  // Type guard for function-based tool calls
                  if ('function' in toolCall && toolCall.function) {
                    const name = toolCall.function.name;
                    const args = JSON.parse(toolCall.function.arguments);
                    
                    sendEvent('tool_start', { nodeId: node.id, tool: name, args });
                    const toolResult = await mcpManager.executeTool(name, args);
                    sendEvent('tool_end', { nodeId: node.id, tool: name, result: toolResult });
                    
                    messages.push(message as any);
                    messages.push({
                      role: 'tool',
                      tool_call_id: toolCall.id,
                      content: toolResult
                    } as any);
                  }
                }
                
                // Final response after tools
                const finalResponse = await nimClient.chat.completions.create({
                    model: node.model,
                    messages: messages as any,
                    temperature: 0.7,
                    max_tokens: maxTokens,
                    stream: true
                });

                for await (const chunk of finalResponse) {
                    const text = chunk.choices[0]?.delta?.content || "";
                    content += text;
                    onToken(text);
                }
              } else {
                content = message.content || "";
                onToken(content);
              }
            } else {
              content = await callOllamaStream(node.model, messages, null, onToken);
            }
          } catch (modelErr: any) {
            content = `[SYSTEM ERROR: Model ${node.model} failed to respond. ${modelErr.message}]`;
            onToken(content);
          }

          sendEvent('message_done', {
            nodeId: node.id,
            nodeName: node.name,
            role: node.role,
            content: content,
            timestamp: Date.now()
          });

          context.push({ role: 'assistant', content: `[${node.name}]: ${content}` });
          sendEvent('node_end', { nodeId: node.id });
          return content;
        };

        // Phase 1: Ideation (Architect & Maverick)
        const ideators = activeNodes.filter(n => n.role === 'architect' || n.role === 'maverick');
        if (ideators.length > 0) await Promise.all(ideators.map(n => runNode(n)));

        // Phase 2: Others & Critique (Critic & Realist)
        const critics = activeNodes.filter(n => n.role === 'critic' || n.role === 'realist');
        const others = activeNodes.filter(n => !['architect', 'maverick', 'critic', 'realist', 'synthesizer'].includes(n.role));
        if (others.length > 0) await Promise.all(others.map(n => runNode(n)));
        if (critics.length > 0) await Promise.all(critics.map(n => runNode(n)));

        // Phase 3: Synthesis
        const synthesizers = activeNodes.filter(n => n.role === 'synthesizer');
        if (synthesizers.length > 0) {
          // Increase token limit for synthesis as per user recommendation
          await Promise.all(synthesizers.map(n => runNode(n, "Synthesize the drafts and critiques into a definitive final response. Output ONLY the finalized code/math and a brief explanation.", 1500)));
        }

        // Phase 4: Consensus (Voting)
        sendEvent('consensus_start', {});
        const voters = activeNodes.filter(n => n.role !== 'synthesizer');
        const votes = await Promise.all(voters.map(async (voter) => {
            const votePrompt = "Review the final synthesis provided by The Synthesizer. Give a 'Satisfaction Score' between 0 and 100 and a brief justification. Format: SCORE: [value] REASON: [text]";
            const response = await runNode(voter, votePrompt);
            const scoreMatch = response.match(/SCORE:\s*(\d+)/i);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
            sendEvent('node_vote', { nodeId: voter.id, score });
            return score;
        }));

        const avgScore = votes.reduce((a, b) => a + b, 0) / votes.length;
        sendEvent('consensus_done', { score: avgScore });

        // Phase 5: Session Summarization (Hidden from feed, but updates memory)
        if (context.length > 0) {
          try {
            const summaryResp = await nimClient.chat.completions.create({
              model: 'mistralai/mistral-large-3-675b-instruct-2512',
              messages: [
                { role: 'system', content: 'You are a professional session recorder. Summarize complex technical deliberations into high-density, actionable summaries. Focus on: 1. Core architecture decisions. 2. Mathematical breakthroughs. 3. Unresolved risks.' },
                { role: 'user', content: `DELIBERATION LOG:\n${JSON.stringify(context.slice(-10))}\n\nProvide a 2-paragraph summary.` }
              ],
              max_tokens: 400
            });
            const summary = summaryResp.choices[0].message.content || '';
            
            // Save to Supabase if sessionId exists
            if (sessionId) {
              await supabase
                .from('sessions')
                .update({ summary })
                .eq('id', sessionId);
            }

            // We use a custom event to notify the frontend to update its store
            sendEvent('session_update', { summary });
          } catch (sumErr) {
            console.error("Summarization failed", sumErr);
          }
        }

        sendEvent('done', { success: true, score: avgScore });
        controller.close();
      } catch (err: any) {
        sendEvent('error', { message: err.message });
        controller.close();
      }
    }
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
