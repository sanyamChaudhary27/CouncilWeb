import { NextRequest } from 'next/server';
import { CouncilNode } from '@/types';
import { nimClient } from '@/lib/nim-client';
import { mcpManager } from '@/lib/mcp-manager';
import { createClient } from '@/lib/supabase';

const ARCHETYPE_PROMPTS = {
  architect: "You are The Architect. Propose high-level structure and logic. Be precise, structural, and strictly technical. Avoid repetition. Use tools if you need technical data.",
  critic: "You are The Critic. Your task is to provide a rigorous, professional critique of the current proposal. Identify specific technical flaws, edge cases, and logical fallacies. DO NOT repeat yourself. DO NOT use gibberish. Be concise and sharp.",
  synthesizer: "You are The Synthesizer. Combine previous ideas into a cohesive, polished final plan. Resolve conflicts and output the definitive solution.",
  maverick: "You are The Maverick. Suggest unconventional, high-risk/high-reward ideas. Think outside the box but stay relevant.",
  realist: "You are The Realist. Keep the conversation grounded in data and practical execution constraints. Use tools to check feasibility."
};

async function callOllamaStream(model: string, messages: any[], tools: any[] | null, onToken: (token: string) => void) {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true, tools: tools || undefined })
  });
  if (!response.ok) throw new Error(`Ollama error: ${response.statusText}`);
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
    const { data: sessionData } = await supabase.from('sessions').select('summary').eq('id', sessionId).maybeSingle();
    if (sessionData?.summary) incomingSummary = sessionData.summary;
  }

  if (!prompt || !nodes || nodes.length === 0) return new Response('Invalid request', { status: 400 });

  const customReadable = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      try {
        const context: any[] = [];
        const activeNodes = nodes as CouncilNode[];
        const latencies: Record<string, number[]> = {};

        const runWithRetry = async (fn: () => Promise<any>, retries = 2) => {
          for (let i = 0; i <= retries; i++) {
            try {
              return await fn();
            } catch (err: any) {
              if (i === retries) throw err;
              if (err.status === 504 || err.status === 502 || err.status === 429) {
                await new Promise(r => setTimeout(r, 1000 * (i + 1)));
                continue;
              }
              throw err;
            }
          }
        };

        const runNode = async (node: CouncilNode, customPrompt?: string, maxTokens: number = 1024) => {
          const startTime = Date.now();
          sendEvent('node_start', { nodeId: node.id });
          const archetypeSystem = ARCHETYPE_PROMPTS[node.role] || "You are a council member.";
          const messages = [
            { 
              role: 'system', 
              content: `${archetypeSystem}\n\n` + 
                       `STRICT RULE: YOU MUST RESPOND ONLY IN ENGLISH.\n` +
                       `STRICT RULE: Use the provided functions ONLY when necessary. Use the standard OpenAI tool calling format. DO NOT use XML-style tags or <|DSML|>. Respond in plain text, then use the tool call feature.\n\n` +
                       (incomingSummary ? `SUMMARY:\n${incomingSummary}\n\n` : '') + 
                       `OBJECTIVE: ${prompt}\n\n` +
                       `CONTEXT:\n${JSON.stringify(context.slice(-4))}` 
            },
            { role: 'user', content: customPrompt || prompt }
          ];

          let content = "";
          const onToken = (token: string) => sendEvent('token', { nodeId: node.id, token });

          try {
            if (node.provider === 'nvidia') {
              const response = await runWithRetry(() => nimClient.chat.completions.create({
                model: node.model,
                messages: messages as any,
                tools: mcpManager.tools as any,
                tool_choice: 'auto',
                temperature: 0.4,
                max_tokens: 2048,
                stream: false, 
              }));

              const message = response.choices[0].message;
              if (message.tool_calls) {
                for (const toolCall of message.tool_calls) {
                  if ('function' in toolCall && toolCall.function) {
                    const name = toolCall.function.name;
                    let args = {};
                    try {
                      args = JSON.parse(toolCall.function.arguments);
                    } catch (jsonErr) {
                      console.error("Malformed tool arguments", toolCall.function.arguments);
                      continue;
                    }
                    
                    sendEvent('tool_start', { nodeId: node.id, tool: name, args });
                    const toolResult = await mcpManager.executeTool(name, args);
                    sendEvent('tool_end', { nodeId: node.id, tool: name, result: toolResult });
                    messages.push(message as any);
                    messages.push({ role: 'tool', tool_call_id: toolCall.id, content: toolResult } as any);
                  }
                }
                const finalResponse = await runWithRetry(() => nimClient.chat.completions.create({ 
                  model: node.model, 
                  messages: messages as any, 
                  temperature: 0.4, 
                  max_tokens: 2048, 
                  stream: true 
                }));
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
            content = `[ERROR: ${modelErr.message || 'Model failed'}]`;
            onToken(content);
          }

          const latency = Date.now() - startTime;
          if (!latencies[node.model]) latencies[node.model] = [];
          latencies[node.model].push(latency);

          sendEvent('message_done', { nodeId: node.id, nodeName: node.name, role: node.role, content, timestamp: Date.now() });
          context.push({ role: 'assistant', content: `[${node.name}]: ${content}` });
          sendEvent('node_end', { nodeId: node.id });
          return content;
        };

        // Phase 0: Topology Generation
        sendEvent('status', { message: 'Generating optimal deliberation topology...' });
        let topology = ["architect", "critic", "maverick", "realist", "synthesizer"];
        try {
          const topoResp = await nimClient.chat.completions.create({
            model: 'meta/llama-3.3-70b-instruct',
            messages: [
              { role: 'system', content: 'You are the Council Orchestrator. Analyze the user prompt and decide the optimal sequence of agent roles (architect, critic, maverick, realist, synthesizer) to solve it. Return ONLY JSON: {"sequence": ["role1", "role2"]}' },
              { role: 'user', content: `PROMPT: ${prompt}` }
            ],
            response_format: { type: 'json_object' } as any
          });
          const topoData = JSON.parse(topoResp.choices[0].message.content || '{"sequence": []}');
          if (topoData.sequence?.length > 0) topology = topoData.sequence;
        } catch (e) { console.error("Topology failed", e); }

        // Dynamic Execution
        for (const role of topology) {
          const agents = activeNodes.filter(n => n.role === role);
          if (agents.length > 0) await Promise.all(agents.map(n => runNode(n, role === 'synthesizer' ? "Synthesize final response." : undefined, role === 'synthesizer' ? 1500 : 1024)));
        }

        // Consensus
        sendEvent('consensus_start', {});
        const voters = activeNodes.filter(n => n.role !== 'synthesizer');
        const votes = await Promise.all(voters.map(async (voter) => {
            const response = await runNode(voter, "Score final synthesis (0-100). Format: SCORE: [val]");
            const scoreMatch = response.match(/SCORE:\s*(\d+)/i);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : 70;
            sendEvent('node_vote', { nodeId: voter.id, score });
            return score;
        }));
        const avgScore = votes.reduce((a, b) => a + b, 0) / votes.length;
        sendEvent('consensus_done', { score: avgScore });

        // Auditor Phase (Dynamic Selection)
        let fastestModel = 'meta/llama-3.3-70b-instruct';
        let minAvg = Infinity;
        for (const [model, times] of Object.entries(latencies)) {
          const avg = times.reduce((a, b) => a + b, 0) / times.length;
          if (avg < minAvg) { minAvg = avg; fastestModel = model; }
        }

        sendEvent('status', { message: `Summoning The Auditor (${fastestModel})...` });
        try {
          const auditorResp = await nimClient.chat.completions.create({
            model: fastestModel,
            messages: [
              { role: 'system', content: 'You are The Auditor. Analyze for logical fallacies and technical errors.' },
              { role: 'user', content: `LOG:\n${JSON.stringify(context.slice(-15))}` }
            ]
          });
          sendEvent('audit_report', { content: auditorResp.choices[0].message.content });
        } catch (e) { console.error("Auditor failed", e); }

        // Summarization
        if (context.length > 0) {
          try {
            const summaryResp = await nimClient.chat.completions.create({
              model: 'meta/llama-3.3-70b-instruct',
              messages: [
                { role: 'system', content: 'Summarize deliberation for future context.' },
                { role: 'user', content: `LOG:\n${JSON.stringify(context.slice(-10))}` }
              ],
              max_tokens: 400
            });
            const summary = summaryResp.choices[0].message.content || '';
            if (sessionId) await supabase.from('sessions').update({ summary }).eq('id', sessionId);
            sendEvent('session_update', { summary });
          } catch (e) { }
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
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  });
}
