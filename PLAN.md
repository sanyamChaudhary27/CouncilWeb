# Synergy: The Autonomous Model Council
## Project Vision: "The Hive Mind of Specialized Intelligence"

Synergy is a next-generation agentic orchestration platform where multiple LLMs from diverse providers (NVIDIA, OpenRouter, AWS, Bedrock, etc.) collaborate within a dynamic, 3D-visualized workspace to solve complex problems autonomously.

Unlike traditional linear chat interfaces, Synergy treats models as specialized **Council Members** organized in fluid topologies—hierarchies, swarms, or peer-led committees—that evolve until a user-defined or self-determined "Point of Satisfaction" is reached.

---

## 1. Core Architecture (The 100x Upgrade)

### A. The 3D Neural Canvas
- **Immersive Interface**: A Three.js/React-Three-Fiber powered environment.
- **Node-Link Topologies**: Users drag-and-drop models into 3D space. Linking nodes creates "Communication Synapses."
- **Visual Logic Flow**: Glowing pulses represent data packets moving between models. Colors change based on the sentiment (e.g., Green for agreement, Red for critique).
- **Hierarchical Depth**: Create "Levels of Authority" where higher-order nodes can override or redirect the tasks of lower-order nodes.

### B. The "Consensus Engine"
- **Self-Termination Logic**: Instead of running forever, the council employs a "Consensus Protocol." Nodes vote on the quality of the final output. The run only stops when a 75% (configurable) satisfaction threshold is met.
- **Moderator Roles**: Special nodes assigned as "The Architect" (planning), "The Critic" (safety/logic), and "The Synthesizer" (final output).
- **Infinite Loop Protection**: An "Observer" module monitors for circular reasoning and automatically injects a "Reality Check" prompt or pauses the run.

### C. Resource Multiplexing & Scaling
- **Universal Key Bridge**: Users input keys once. The system intelligently routes requests across Nvidia NIM, OpenRouter, Bedrock, etc.
- **Async Concurrency**: If a user needs 10 nodes but only has 1 API key, the system manages an asynchronous task queue, multiplexing the key to handle all 10 nodes with optimized rate-limit handling.
- **Dynamic Node Spawning**: The Council can "decide" to spawn sub-nodes. If a task is too complex, a node can create a "Sub-Committee" of specialized models to handle a specific sub-problem.
- **Provider Failover**: If OpenRouter is slow, the system can automatically switch a node's backend to a backup provider (e.g., Nvidia NIM) without interrupting the 3D session.

### D. Reality Anchoring (MCP 2.0)
- **Shared Tool-Belt**: A global MCP registry. Every model in the council can access a shared pool of tools (Search, Code Execution, File System, Database).
- **Model-Specific Tools**: Assign specific tools to specific models (e.g., Only "The Researcher" can use Google Search; only "The Engineer" can run Python code).

---

## 2. Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), Vanilla CSS (Custom Design System) |
| **3D Engine** | Three.js + React Three Fiber + Cannon.js (Physics) |
| **Orchestration** | Custom Graph-based State Machine (XState-inspired) |
| **Integrations** | Model Context Protocol (MCP) SDK |
| **AI Providers** | Nvidia NIM, OpenRouter, AWS Bedrock, Anthropic, OpenAI |
| **Database** | Supabase (for saving Council Topologies and Session Logs) |

---

## 3. The "Premium" Feature Set

### 1. Neural Archetypes
Users don't just pick "GPT-4" or "Llama-3". They assign **Archetypes**:
- **The Devil’s Advocate**: Forced to find flaws in any proposed plan.
- **The Creative Maverick**: Ignores constraints to find "outside the box" solutions.
- **The Realist**: Constrains the conversation based on provided data/MCP tool feedback.

### 2. Time-Travel Debugging
A 3D timeline slider. Users can scrub back to see the exact moment a council member went off-track, edit the prompt at that "branch," and re-simulate from there.

### 3. API Key Vault
A secure, client-side encrypted vault where users store keys for different providers. Synergy acts as a unified bridge, normalizing different API formats into a single internal stream.

### 4. Satisfaction Heatmaps
A visual overlay on the 3D nodes showing how "confident" each model is in the current draft of the solution.

### 5. The "War Room" Dashboard
A real-time HUD (Heads-Up Display) overlaying the 3D canvas showing:
- **Token Velocity**: Live counter of tokens per second across all nodes.
- **Cost/Budget Guardrails**: Real-time estimation of spend (for OpenRouter/Bedrock).
- **Latency Visualization**: Nodes that are taking longer to respond "dim" or "glitch" visually in the 3D space to indicate bottlenecks.

---

## 4. Implementation Roadmap

### Phase 1: The Foundation (Week 1-2)
- [ ] Initialize Next.js project with a custom CSS design system.
- [ ] Setup the **Unified Model Bridge** (OpenRouter/NIM/Bedrock integration).
- [ ] Implement basic MCP tool execution (e.g., `web_search`).

### Phase 2: The 3D Canvas (Week 3-4)
- [ ] Build the 3D environment with interactive nodes (Add/Delete/Link).
- [ ] Implement "Drag-and-Drop" hierarchy management.
- [ ] Visualizing "Thinking" states through GLSL shaders and light pulses.

### Phase 3: The Council Intelligence (Week 5-6)
- [ ] Develop the **Consensus Protocol** (Voting/Refinement loops).
- [ ] Implement **Archetype Prompts** (The Critic, The Architect, etc.).
- [ ] Add the "Auto-Satisfaction" exit logic.

### Phase 4: Polish & Launch (Week 7+)
- [ ] Reality Check: Full MCP tool suite integration.
- [ ] Session persistence (Save your Council setups).
- [ ] Cyberpunk "Mission Control" UI polish.

---

## 5. Design Philosophy
- **Aesthetic**: Dark Mode, Neon Accents (Cyan/Magenta), Glassmorphism, and Orbital Typography.
- **Experience**: It should feel like you are commanding a sci-fi tactical bridge, not typing into a chat box.
