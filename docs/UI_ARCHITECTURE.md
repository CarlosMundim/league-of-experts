# League of Experts — Cross-Platform UI Architecture

**Version:** 1.0
**Status:** Design Phase
**Target Platforms:** Windows, macOS, Linux

---

## 1. Technology Stack Decision

### Option A: Electron + React (Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ELECTRON APPLICATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    REACT FRONTEND                        │   │
│   │                                                          │   │
│   │   • TypeScript for type safety                           │   │
│   │   • Tailwind CSS for styling                             │   │
│   │   • React Query for API state                            │   │
│   │   • Zustand for local state                              │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    NODE.JS BACKEND                       │   │
│   │                                                          │   │
│   │   • Express/Fastify API server                           │   │
│   │   • SQLite for local storage                             │   │
│   │   • OpenRouter API integration                           │   │
│   │   • File system access for memory                        │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- Single codebase for all platforms
- Rich ecosystem (npm packages)
- Web technologies (familiar to most developers)
- Easy to update and distribute

**Cons:**
- Large bundle size (~150-200MB)
- Higher memory usage
- Not truly "native" feel

### Option B: Tauri + React (Lighter Alternative)

```
┌─────────────────────────────────────────────────────────────────┐
│                     TAURI APPLICATION                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    REACT FRONTEND                        │   │
│   │           (Same as Electron version)                     │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                    RUST BACKEND                          │   │
│   │                                                          │   │
│   │   • Smaller binary size (~10-20MB)                       │   │
│   │   • Lower memory usage                                   │   │
│   │   • Native system integration                            │   │
│   │   • Better security model                                │   │
│   │                                                          │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Pros:**
- 10x smaller bundle size
- Lower memory usage
- Better performance
- More secure

**Cons:**
- Rust learning curve
- Smaller ecosystem
- Newer (less mature)

### Recommendation: Start with Electron, migrate to Tauri later

---

## 2. Application Structure

```
league-of-experts-ui/
├── package.json
├── electron/
│   ├── main.ts                 # Electron main process
│   ├── preload.ts              # Preload scripts
│   └── ipc/                    # IPC handlers
│       ├── llm-router.ts
│       ├── memory.ts
│       └── settings.ts
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   │   ├── QueryInput/
│   │   │   ├── QueryInput.tsx
│   │   │   └── VoiceInput.tsx
│   │   ├── ExpertPanel/
│   │   │   ├── ExpertCard.tsx
│   │   │   ├── ExpertGrid.tsx
│   │   │   └── ResponseView.tsx
│   │   ├── KatanaMode/
│   │   │   ├── CritiquePanel.tsx
│   │   │   └── WarningBadge.tsx
│   │   ├── Synthesis/
│   │   │   ├── FinalAnswer.tsx
│   │   │   ├── ConfidenceBar.tsx
│   │   │   └── ActionItems.tsx
│   │   ├── Memory/
│   │   │   ├── HistoryPanel.tsx
│   │   │   └── ContextViewer.tsx
│   │   └── Settings/
│   │       ├── ModelConfig.tsx
│   │       ├── ApiKeys.tsx
│   │       └── Preferences.tsx
│   ├── hooks/
│   │   ├── useExpertQuery.ts
│   │   ├── useMemory.ts
│   │   └── useSettings.ts
│   ├── stores/
│   │   ├── queryStore.ts
│   │   ├── memoryStore.ts
│   │   └── settingsStore.ts
│   ├── services/
│   │   ├── openrouter.ts       # API integration
│   │   ├── synthesis.ts        # Arbiter logic
│   │   └── katana.ts           # Devil's advocate
│   └── types/
│       ├── expert.ts
│       ├── query.ts
│       └── memory.ts
├── public/
│   └── icons/
└── build/
    ├── win/
    ├── mac/
    └── linux/
```

---

## 3. Core Components

### 3.1 Query Input

```tsx
// components/QueryInput/QueryInput.tsx

interface QueryInputProps {
  onSubmit: (query: string, options: QueryOptions) => void;
  isLoading: boolean;
}

export function QueryInput({ onSubmit, isLoading }: QueryInputProps) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<'fast' | 'balanced' | 'deep'>('balanced');

  return (
    <div className="query-input">
      <textarea
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask the League of Experts..."
        className="w-full p-4 border rounded-lg"
      />

      <div className="flex justify-between mt-2">
        <ModeSelector value={mode} onChange={setMode} />
        <VoiceInput onTranscript={setQuery} />
        <button
          onClick={() => onSubmit(query, { mode })}
          disabled={isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded"
        >
          {isLoading ? 'Consulting Experts...' : 'Ask'}
        </button>
      </div>
    </div>
  );
}
```

### 3.2 Expert Grid

```tsx
// components/ExpertPanel/ExpertGrid.tsx

interface ExpertGridProps {
  responses: ExpertResponse[];
  isLoading: boolean;
}

export function ExpertGrid({ responses, isLoading }: ExpertGridProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {EXPERTS.map((expert) => {
        const response = responses.find(r => r.model === expert.id);
        return (
          <ExpertCard
            key={expert.id}
            expert={expert}
            response={response}
            isLoading={isLoading && !response}
          />
        );
      })}
    </div>
  );
}
```

### 3.3 Katana Mode Panel

```tsx
// components/KatanaMode/CritiquePanel.tsx

interface CritiquePanelProps {
  critiques: Critique[];
}

export function CritiquePanel({ critiques }: CritiquePanelProps) {
  return (
    <div className="katana-panel border-l-4 border-red-500 bg-red-50 p-4">
      <h3 className="font-bold text-red-700 flex items-center">
        <SwordIcon className="w-5 h-5 mr-2" />
        Katana Mode (Devil's Advocate)
      </h3>

      <ul className="mt-3 space-y-2">
        {critiques.map((critique, i) => (
          <li key={i} className="flex items-start">
            <WarningIcon className="w-4 h-4 mr-2 text-amber-500 mt-1" />
            <span>{critique.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### 3.4 Synthesis View

```tsx
// components/Synthesis/FinalAnswer.tsx

interface FinalAnswerProps {
  synthesis: SynthesisResult;
}

export function FinalAnswer({ synthesis }: FinalAnswerProps) {
  return (
    <div className="synthesis-panel bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-green-800">
          ✅ Final Synthesis
        </h3>
        <ConfidenceBar value={synthesis.confidence} />
      </div>

      <div className="prose max-w-none">
        <h4>Decision</h4>
        <p className="text-xl font-medium">{synthesis.decision}</p>

        <h4>Key Points</h4>
        <ul>
          {synthesis.keyPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>

        <h4>Recommended Actions</h4>
        <ActionItems items={synthesis.actions} />

        {synthesis.memoryNote && (
          <div className="bg-blue-50 p-3 rounded mt-4">
            <span className="text-blue-700">📚 Memory Note:</span>
            {synthesis.memoryNote}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 4. API Integration

### 4.1 OpenRouter Service

```typescript
// services/openrouter.ts

const OPENROUTER_API = 'https://openrouter.ai/api/v1';

interface ExpertQuery {
  query: string;
  model: string;
  systemPrompt: string;
}

export async function queryExpert(params: ExpertQuery): Promise<ExpertResponse> {
  const response = await fetch(`${OPENROUTER_API}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: params.model,
      messages: [
        { role: 'system', content: params.systemPrompt },
        { role: 'user', content: params.query },
      ],
    }),
  });

  return response.json();
}

export async function queryAllExperts(query: string): Promise<ExpertResponse[]> {
  const experts = getConfiguredExperts();

  const promises = experts.map(expert =>
    queryExpert({
      query,
      model: expert.modelId,
      systemPrompt: expert.systemPrompt,
    })
  );

  return Promise.all(promises);
}
```

### 4.2 Synthesis Service

```typescript
// services/synthesis.ts

export async function synthesize(
  query: string,
  expertResponses: ExpertResponse[],
  critiques: Critique[]
): Promise<SynthesisResult> {
  const synthesisPrompt = `
You are the Arbiter/Synthesizer in a League of Experts system.

CRITICAL RULES:
1. Do NOT add new facts - only synthesize what experts provided
2. Weigh expert outputs based on relevance and confidence
3. Resolve contradictions by noting them explicitly
4. Escalate high uncertainty to the user
5. Produce traceable reasoning

Original Query: ${query}

Expert Responses:
${formatExpertResponses(expertResponses)}

Devil's Advocate Critiques:
${formatCritiques(critiques)}

Produce a synthesis with:
1. Decision (1-2 sentences)
2. Confidence level (0-100%)
3. Key points from experts
4. Recommended actions
5. Any memory/historical notes
`;

  const response = await queryExpert({
    query: synthesisPrompt,
    model: 'anthropic/claude-3-opus',  // Chairman model
    systemPrompt: ARBITER_SYSTEM_PROMPT,
  });

  return parseSynthesis(response);
}
```

---

## 5. Build & Distribution

### 5.1 Windows

```bash
# electron-builder config
{
  "win": {
    "target": ["nsis", "portable"],
    "icon": "build/icons/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true
  }
}
```

### 5.2 macOS

```bash
{
  "mac": {
    "target": ["dmg", "zip"],
    "icon": "build/icons/icon.icns",
    "category": "public.app-category.productivity"
  }
}
```

### 5.3 Linux

```bash
{
  "linux": {
    "target": ["AppImage", "deb", "rpm"],
    "icon": "build/icons",
    "category": "Office"
  }
}
```

---

## 6. Development Phases

### Phase 1: MVP (4-6 weeks)
- [ ] Basic query input
- [ ] Single expert response view
- [ ] Simple synthesis display
- [ ] Settings for API keys
- [ ] Windows build only

### Phase 2: Full LoE (4-6 weeks)
- [ ] Multi-expert parallel queries
- [ ] Katana Mode implementation
- [ ] Full synthesis with confidence
- [ ] Mac/Linux builds
- [ ] Memory integration

### Phase 3: Advanced (4-6 weeks)
- [ ] Voice input/output
- [ ] Decision history
- [ ] Export to PDF/Markdown
- [ ] Team sharing features
- [ ] KODA integration

### Phase 4: Polish (2-4 weeks)
- [ ] Performance optimization
- [ ] Auto-updates
- [ ] Crash reporting
- [ ] User analytics (opt-in)
- [ ] Documentation

---

## 7. Security Considerations

### API Key Storage
- Use system keychain (macOS Keychain, Windows Credential Manager)
- Never store keys in plain text
- Encrypt local database

### Network Security
- All API calls over HTTPS
- Certificate pinning for OpenRouter
- Rate limiting to prevent abuse

### Local Data
- Encrypt conversation history
- Secure memory database
- Option to clear all data

---

## 8. Accessibility

- Keyboard navigation throughout
- Screen reader support
- High contrast mode
- Adjustable font sizes
- Voice input/output support

---

*Designed by KODA for Papai and The Board — December 28, 2025*
