# HR Workflow Designer

A functional prototype for building and testing HR workflows with a visual drag-and-drop interface, built with React Flow, TypeScript, and a mock API layer.

## 🎯 Objective

Design and implement a mini HR Workflow Designer module where an HR admin can visually create and test internal workflows such as onboarding, leave approval, or document verification.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (MSW auto-starts)
npm run dev

# Build for production
npm run build
```

The application will be available at `http://localhost:5173`. The MSW service worker is automatically initialized in development mode.

## 📋 Features Implemented

### Core Functionality
- ✅ **Drag-and-drop workflow canvas** with React Flow
- ✅ **5 custom node types**: Start, Task, Approval, Automation, End
- ✅ **Node configuration forms** with type-specific fields and dynamic parameters
- ✅ **Workflow validation** (start node constraints, connection validation)
- ✅ **Mock API integration** (MSW) for automations and simulation
- ✅ **Workflow testing/sandbox** panel with step-by-step execution logs
- ✅ **Export workflow as JSON**
- ✅ **Dark/Light mode toggle**
- ✅ **Preview modal** showing workflow execution timeline

### UI/UX Enhancements
- Modern dark theme with gradient accents
- Responsive three-panel layout (sidebar, canvas, configuration)
- Visual node type differentiation with color-coded cards
- Interactive node selection and editing
- Connection lines between nodes with arrows
- Stats bar showing node/edge counts

## 🏗️ Architecture

### Tech Stack
- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7
- **Canvas Library**: React Flow 11
- **State Management**: Zustand 5
- **Mock API**: MSW 2
- **Icons**: Lucide React
- **Validation**: Custom validation utilities

### Project Structure

```
hr-workflow/
├── src/
│   ├── api/              # API client abstractions
│   │   ├── automations.ts
│   │   ├── simulate.ts
│   │   └── client.ts
│   ├── components/        # React components
│   │   ├── Canvas.tsx    # React Flow canvas with custom nodes
│   │   ├── Sidebar.tsx    # Node palette and actions
│   │   ├── NodeFormPanel.tsx  # Dynamic node configuration forms
│   │   └── SandboxPanel.tsx   # Workflow testing panel
│   ├── mocks/             # MSW handlers
│   │   ├── handlers.ts
│   │   └── browser.ts
│   ├── store/             # Zustand state management
│   │   └── workflowStore.ts
│   ├── types/             # TypeScript type definitions
│   │   └── workflow.ts
│   ├── utils/             # Utility functions
│   │   └── validation.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point with MSW setup
│   └── style.css          # Global styles with dark/light themes
├── public/
│   └── mockServiceWorker.js  # MSW service worker
└── README.md
```

### Design Decisions

#### 1. React Flow Proficiency

**Custom Nodes**: Implemented reusable `NodeCard` component that renders different node types with type-specific styling and data display. Nodes are registered in `nodeTypes` object and rendered by React Flow.

**Positioning**: Nodes use React Flow's built-in positioning system with `XYPosition`. Drag-and-drop from sidebar uses `project()` to convert screen coordinates to flow coordinates.

**Edge Management**: 
- Edges are managed through React Flow's `onConnect`, `onEdgesChange` callbacks
- Custom edge styling with arrows and gradient colors
- Automatic edge cleanup when nodes are deleted
- "Connect All" utility to chain nodes sequentially

**Key Implementation**:
```typescript
// Custom node rendering with type-specific data
const NodeCard = ({ data }: { data: WorkflowNode['data'] }) => {
  const nodeConfig = nodeTypeConfigs[data.type]
  return (
    <div className={`node-card node-${data.type}`}>
      {/* Type-specific rendering */}
    </div>
  )
}
```

#### 2. React Architecture

**Component Decomposition**:
- **Separation of Concerns**: Canvas logic separated from form logic, API logic abstracted into service layer
- **Reusable Components**: `NodeFormPanel` uses dynamic form rendering based on node type
- **Custom Hooks**: Zustand selectors used for efficient state subscriptions

**State Management**:
- **Zustand Store**: Centralized state in `workflowStore.ts` with typed actions
- **Selective Subscriptions**: Components subscribe only to needed state slices to minimize re-renders
- **Immutable Updates**: All state updates use immutable patterns

**Folder Structure**:
- Feature-based organization (components, api, store, types)
- Clear separation between UI, business logic, and data layer
- Type definitions centralized for consistency

**Key Patterns**:
```typescript
// Selective state subscription
const { nodes, edges, setNodes } = useWorkflowStore((s) => ({
  nodes: s.nodes,
  edges: s.edges,
  setNodes: s.setNodes,
}))

// Memoized callbacks to prevent re-renders
const onNodesChange = useCallback(
  (changes: NodeChange[]) => setNodes(applyNodeChanges(changes, nodes)),
  [nodes, setNodes]
)
```

#### 3. Complex Form Handling

**Dynamic Forms**: `NodeFormPanel` renders different form fields based on node type using a switch statement. Each node type has its own form schema.

**Type-Specific Fields**:
- **Start Node**: Title, metadata (key-value pairs)
- **Task Node**: Title, description, assignee, due date, custom fields
- **Approval Node**: Title, approver role, auto-approve threshold
- **Automation Node**: Title, action selection (from API), dynamic parameters based on selected action
- **End Node**: End message, summary flag

**Dynamic Parameters**: Automation nodes fetch available actions from `/api/automations` and render parameter inputs dynamically based on the selected action's `params` array.

**Form State Management**:
- Controlled components with React state
- Real-time updates to workflow store on field changes
- Key-value pair management for metadata and custom fields

**Key Implementation**:
```typescript
// Dynamic form rendering based on node type
const renderFields = () => {
  switch (data.type) {
    case 'automation':
      return <AutomationParams data={data} onChange={update} />
    // ... other cases
  }
}

// Dynamic parameter inputs based on selected action
{selected.params.map((param) => (
  <input
    key={param}
    value={data.params[param] ?? ''}
    onChange={(e) => updateParam(param, e.target.value)}
  />
))}
```

#### 4. Mock API Interaction

**MSW Setup**: Mock Service Worker configured to intercept API calls in development. Service worker auto-registers on app start.

**API Abstractions**:
- **`api/client.ts`**: Base fetch wrapper with error handling
- **`api/automations.ts`**: Typed function for fetching automation actions
- **`api/simulate.ts`**: Typed function for workflow simulation

**Mock Handlers** (`mocks/handlers.ts`):
- `GET /api/automations`: Returns list of available automation actions with parameters
- `POST /api/simulate`: Accepts workflow JSON, returns step-by-step execution log

**Async Patterns**:
- Proper error handling with try/catch
- Loading states managed in components
- Type-safe API responses

**Key Implementation**:
```typescript
// Typed API client
export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const res = await fetch(`/api${endpoint}`, options)
  if (!res.ok) throw new Error(`API error: ${res.statusText}`)
  return res.json()
}

// Mock handler with realistic simulation
http.post('/api/simulate', async ({ request }) => {
  const { nodes, edges } = await request.json()
  // Generate step-by-step execution log
  return HttpResponse.json({ steps: [...] })
})
```

#### 5. Scalability

**Extensibility**:
- **Node Types**: Easy to add new node types by extending `NodeKind` union and adding form fields
- **Form System**: Modular form rendering allows adding new fields without touching other node types
- **Validation**: Validation rules are centralized and can be extended
- **API Layer**: Abstracted API calls make it easy to swap mock for real backend

**Type Safety**: Comprehensive TypeScript types ensure compile-time safety and make refactoring safer.

**Performance Considerations**:
- Memoized callbacks prevent unnecessary re-renders
- Selective Zustand subscriptions
- React Flow's built-in optimizations for large graphs

**Future-Proof Structure**:
- Clear separation of concerns allows independent evolution of features
- Type system makes it easy to add new node properties
- Store structure can be extended without breaking existing code

#### 6. Communication

**README Documentation**: This README provides:
- Clear setup instructions
- Architecture overview
- Design decision explanations
- Feature list
- Future enhancement ideas

**Code Comments**: Key functions and complex logic have inline comments explaining intent.

**Type Definitions**: TypeScript types serve as documentation for data structures and API contracts.

## 🎨 Design Decisions

### Why Zustand over Context API?
- Simpler API, less boilerplate
- Better performance with selective subscriptions
- Easier to test and debug

### Why MSW over JSON Server?
- More realistic API simulation
- Can intercept actual fetch calls
- Better integration with React development workflow
- No separate server process needed

### Why Custom Node Components?
- Full control over node appearance and behavior
- Type-specific rendering and styling
- Easy to extend with new node types

### Dark Mode Implementation
- CSS-based theme switching using `theme-dark` class
- Preserves user preference across sessions
- Smooth transitions between themes

## ✅ What Was Completed

### Core Requirements (100%)
- ✅ React Flow canvas with custom nodes
- ✅ Drag-and-drop node palette
- ✅ Node editing/configuration forms
- ✅ Mock API layer (MSW)
- ✅ Workflow testing/sandbox panel
- ✅ Workflow validation

### Bonus Features
- ✅ Export workflow as JSON
- ✅ Dark/Light mode toggle
- ✅ Preview modal with execution timeline
- ✅ Stats bar showing workflow metrics
- ✅ "Connect All" utility for quick node chaining
- ✅ Visual node type differentiation
- ✅ Responsive layout

## 🚧 What Would Be Added With More Time

### High Priority
1. **Undo/Redo History**: Implement command pattern for workflow operations
2. **Import Workflow**: Load workflows from exported JSON files
3. **Cycle Detection**: Advanced validation to detect circular dependencies
4. **Node Templates**: Pre-configured node templates for common workflows
5. **Auto-Layout**: Automatic node positioning algorithms (hierarchical, force-directed)

### Medium Priority
1. **Rich Simulation**: More realistic simulation with timing, conditional branching
2. **Node Versioning**: Track changes to nodes over time
3. **Workflow Validation UI**: Visual indicators on nodes showing validation errors
4. **Mini-map Enhancements**: Interactive mini-map with zoom controls
5. **Keyboard Shortcuts**: Power user features (delete, copy, paste nodes)

### Nice to Have
1. **Collaboration Features**: Real-time multi-user editing
2. **Workflow Library**: Save and share common workflow patterns
3. **Analytics Dashboard**: Workflow execution metrics and analytics
4. **Export Formats**: Export to PDF, PNG, or other formats
5. **Node Search**: Search and filter nodes in large workflows

## 📊 Assessment Criteria Coverage

| Area | Implementation |
|------|----------------|
| **React Flow Proficiency** | ✅ Custom nodes, edge management, positioning, drag-and-drop |
| **React Architecture** | ✅ Clean component structure, hooks, Zustand state, separation of concerns |
| **Complex Form Handling** | ✅ Dynamic forms, type-specific fields, key-value pairs, controlled components |
| **Mock API Interaction** | ✅ MSW setup, typed API layer, async patterns, error handling |
| **Scalability** | ✅ Extensible architecture, type safety, modular design |
| **Communication** | ✅ Comprehensive README, code comments, type documentation |
| **Delivery Speed** | ✅ Functional prototype delivered with bonus features |

## 🧪 Testing the Application

1. **Add Nodes**: Drag nodes from the left sidebar onto the canvas
2. **Connect Nodes**: Click and drag from a node's handle to another node
3. **Configure Nodes**: Click a node to open the configuration panel on the right
4. **Test Workflow**: Click "Test Workflow" in the sidebar or use the sandbox panel
5. **Export**: Click "Export JSON" to download the workflow
6. **Preview**: Click "Preview" in the header to see execution timeline

## 📝 Notes

- The application uses MSW for API mocking. In production, replace `api/client.ts` to point to real backend endpoints.
- Workflow state is stored in memory. For persistence, integrate with a backend API.
- Node positions are managed by React Flow. For auto-layout, consider integrating libraries like `dagre` or `elkjs`.

## 📄 License

This is a prototype project for assessment purposes.
