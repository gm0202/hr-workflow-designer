# 🎨 HR Workflow Designer

> **A visual workflow builder for HR processes** - Drag, drop, configure, and simulate employee onboarding workflows with ease!

![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)
![React Flow](https://img.shields.io/badge/React%20Flow-11+-FF6B6B?logo=reactflow)

---

## 🌐 Live Demo

**Try it out now!** The working module is deployed and available at:

🔗 **[https://hr-workflow-designer-lsvht0u1d-gaurangs-projects-1eb2dfac.vercel.app/](https://hr-workflow-designer-lsvht0u1d-gaurangs-projects-1eb2dfac.vercel.app/)**

This is the fully functional prototype where you can:
- Create workflows by dragging and dropping nodes
- Connect nodes with arrows to define the flow
- Configure node properties and priorities
- Test workflow execution
- Export workflows as JSON

> **Note**: MSW (Mock Service Worker) is enabled in production too! The service worker intercepts API calls in both development and production. If MSW fails to start, the app automatically falls back to mock data, ensuring all features work seamlessly.

---

## 📋 Table of Contents

- [✨ What is This?](#-what-is-this)
- [🏗️ Architecture](#️-architecture)
- [🚀 How to Run](#-how-to-run)
- [🎯 Design Decisions](#-design-decisions)
- [✅ What's Completed](#-whats-completed)
- [🔮 Future Enhancements](#-future-enhancements)

---

## ✨ What is This?

Imagine you're an HR manager who needs to design an employee onboarding process. Instead of writing long documents or using complex tools, you can **visually drag and drop** workflow steps, connect them together, and see how they'll execute!

This is a **prototype workflow designer** built with React and React Flow that lets you:
- 🎨 Create visual workflows by dragging nodes onto a canvas
- 🔗 Connect nodes with arrows to define the execution flow
- ⚙️ Configure each step (tasks with subtasks, approvals, automations)
- 🎯 Set priorities and track progress
- 🧪 Test your workflow - execution follows arrow connections
- 📊 See execution previews and progress

---

## 🏗️ Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      User Interface                          │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐     │
│  │ Sidebar  │  │   Canvas     │  │  Configuration   │     │
│  │ (Palette)│  │ (React Flow) │  │     Panel        │     │
│  └──────────┘  └──────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    State Management                          │
│              (Zustand Store)                                │
│  • Nodes & Edges  • Selected Node  • Validation  • Logs     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│              (Mock Service Worker - MSW)                     │
│  • /api/automations  • /api/simulate                        │
└─────────────────────────────────────────────────────────────┘
```

### Tech Stack Breakdown

| Layer | Technology | Why We Chose It |
|-------|-----------|-----------------|
| **Build Tool** | Vite | ⚡ Lightning-fast dev server and builds |
| **UI Framework** | React 18 | 🎯 Component-based, widely adopted |
| **Type Safety** | TypeScript | 🛡️ Catch errors before runtime |
| **Canvas/Graph** | React Flow | 🎨 Perfect for node-based workflows |
| **State Management** | Zustand | 🪶 Lightweight, simple API |
| **API Mocking** | MSW | 🎭 Mock APIs without backend |

### Project Structure

```
hr-workflow/
├── src/
│   ├── components/          # React components
│   │   ├── Canvas.tsx       # Main React Flow canvas
│   │   ├── Sidebar.tsx      # Node palette & actions
│   │   ├── NodeFormPanel.tsx # Node configuration forms
│   │   └── SandboxPanel.tsx  # Simulation logs
│   ├── store/
│   │   └── workflowStore.ts # Zustand state management
│   ├── types/
│   │   └── workflow.ts      # TypeScript type definitions
│   ├── api/                 # API client functions
│   │   ├── automations.ts
│   │   └── simulate.ts
│   ├── mocks/               # MSW handlers
│   │   ├── handlers.ts
│   │   └── browser.ts
│   ├── utils/
│   │   ├── validation.ts    # Workflow validation logic
│   │   └── workflowTraversal.ts # Graph traversal for execution order
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   └── style.css            # Global styles
├── public/
│   └── mockServiceWorker.js # MSW service worker
└── package.json
```

### Data Flow

```
User Action (Drag Node)
    ↓
Canvas Component
    ↓
Zustand Store (addNode)
    ↓
React Flow Renders Node
    ↓
User Connects Nodes (Drag Handle to Handle)
    ↓
Store Updates (addEdge)
    ↓
User Clicks "Test Workflow"
    ↓
Workflow Traversal (follows arrow connections)
    ↓
Simulation API (executes in connection order)
    ↓
Results Displayed in Sandbox Panel
```

**Key Point**: Workflow execution order is determined by **arrow connections**, not node positions. The `workflowTraversal.ts` utility uses BFS (Breadth-First Search) to traverse the graph starting from the Start node, following edges to determine execution sequence.

---

## 🚀 How to Run

> 💡 **Quick Access**: You can try the live demo at [https://hr-workflow-designer-lsvht0u1d-gaurangs-projects-1eb2dfac.vercel.app/](https://hr-workflow-designer-lsvht0u1d-gaurangs-projects-1eb2dfac.vercel.app/) without any setup!

### Prerequisites

Make sure you have:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

### Step-by-Step Setup

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone https://github.com/gm0202/hr-workflow-designer.git
   cd hr-workflow-designer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This will install all the packages listed in `package.json` (React, React Flow, Zustand, MSW, etc.)

3. **Start the development server**
   ```bash
   npm run dev
   ```
   You should see something like:
   ```
   VITE v7.2.7  ready in 500 ms
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173/`
   - The MSW service worker will automatically register (works in both dev and production)
   - You should see the workflow designer interface! 🎉
   - If MSW fails to start, the app will automatically use mock data fallback

### Quick Start Guide

1. **Add Nodes**: Drag nodes from the left sidebar onto the canvas
2. **Connect Nodes**: Drag from the **bottom handle** (blue circle) of a node to the **top handle** of another node
3. **Delete Connections**: Click on an arrow to select it, then press `Delete` or click "Delete Connection"
4. **Configure Nodes**: Click a node to edit its properties (priority, subtasks, assignee, etc.)
5. **Test Workflow**: Click "Test Workflow" - execution follows your arrow connections!
6. **Export**: Click "Export JSON" to save your workflow

### Available Scripts

| Command | What It Does |
|---------|-------------|
| `npm run dev` | 🚀 Start development server |
| `npm run build` | 📦 Build for production |
| `npm run preview` | 👀 Preview production build |

---

## 🎯 Design Decisions

### Why React Flow?

**React Flow** was chosen because:
- ✅ Built specifically for node-based UIs
- ✅ Handles complex edge cases (panning, zooming, node positioning)
- ✅ Great performance with many nodes
- ✅ Active community and good documentation

**Alternative considered**: D3.js, but React Flow provides better React integration out of the box.

### Why Zustand Instead of Redux?

**Zustand** was chosen because:
- ✅ Minimal boilerplate (no actions, reducers, or providers needed)
- ✅ Small bundle size (~1KB)
- ✅ Simple API that's easy to understand
- ✅ Perfect for this prototype's state needs

**Alternative considered**: Redux Toolkit, but it's overkill for this project's state complexity.

### Why MSW for Mocking?

**MSW (Mock Service Worker)** was chosen because:
- ✅ Intercepts real HTTP requests (no code changes needed)
- ✅ Works in both browser and Node.js
- ✅ Easy to switch to real APIs later
- ✅ Great developer experience

**Important Note**: 
- MSW is enabled in **both development and production** modes
- The service worker (`mockServiceWorker.js`) intercepts API calls in both environments
- If MSW fails to start or API calls fail, the app automatically falls back to mock data
- The fallback uses the same logic as MSW handlers, ensuring consistent functionality

**Alternative considered**: JSON Server, but MSW is more flexible and doesn't require a separate process.

### Component Architecture

We chose a **component-based architecture** because:
- 🧩 Each component has a single responsibility
- 🔄 Easy to test and maintain
- 📦 Reusable across the app
- 🎨 Clear separation of concerns

**Example**: The `Canvas` component only handles rendering and interactions, while `NodeFormPanel` handles configuration logic.

### Styling Approach

We used **plain CSS** instead of CSS-in-JS because:
- ✅ No runtime overhead
- ✅ Better performance
- ✅ Easier to debug
- ✅ Works well with dark mode

**Dark mode** is implemented using CSS classes (`theme-dark`) that toggle based on user preference.

---

## ✅ What's Completed

### Core Features ✨

- [x] **Drag-and-Drop Node Palette**
  - 5 node types: Start, Task, Approval, Automation, End
  - Visual distinction with color-coded cards
  - Smooth drag-and-drop experience

- [x] **Interactive Canvas**
  - React Flow canvas with pan, zoom, and minimap
  - Connect nodes by dragging between handles (source/target handles)
  - Visual feedback on selection and errors
  - Delete connections by selecting edges and pressing Delete
  - Animated arrows showing workflow flow direction

- [x] **Node Configuration**
  - Type-specific forms for each node type
  - Dynamic fields (e.g., automation parameters)
  - Real-time updates as you type

- [x] **Workflow Validation**
  - Checks for required nodes (Start, End)
  - Validates node connections
  - Shows error messages

- [x] **Workflow Simulation**
  - Mock API integration with MSW
  - Step-by-step execution logs
  - Progress tracking
  - **Connection-based execution**: Workflow follows arrow connections (not just node order)
  - Graph traversal algorithm determines execution path

- [x] **Export Functionality**
  - Export workflow as JSON
  - Downloadable file with all node and edge data

- [x] **Dark Mode**
  - Toggle between light and dark themes
  - Consistent styling across all components

- [x] **Node Information Display**
  - Shows assignee, due date in nodes
  - **Subtask to-do lists** for task nodes with progress tracking
  - **Priority settings** (Low/Medium/High) for task, approval, and automation nodes
  - Progress bars calculated from subtask completion
  - Clean, readable typography with black text for visibility

### UI/UX Features 🎨

- [x] Modern, clean interface
- [x] Responsive layout
- [x] Visual feedback on interactions
- [x] Preview modal for workflow execution (shows connection-based order)
- [x] Stats bar showing workflow metrics
- [x] Connect All button for quick linking
- [x] Delete selected node functionality
- [x] **Edge deletion**: Select arrows and delete connections
- [x] **Connection handles**: Visual handles on nodes for easy connecting
- [x] **Enhanced arrows**: Large, visible, animated arrows showing flow
- [x] Dark mode toggle in header

### Technical Implementation 🔧

- [x] TypeScript for type safety
- [x] Zustand for state management
- [x] MSW for API mocking (enabled in both development and production)
- [x] **Mock data fallback** - automatic fallback if MSW fails or API calls fail
- [x] Proper error handling
- [x] Code organization and structure
- [x] Build configuration for production

---

## 🔮 Future Enhancements

### If We Had More Time... ⏰

#### High Priority 🚨

1. **Undo/Redo Functionality**
   - History stack for node/edge changes
   - Keyboard shortcuts (Ctrl+Z, Ctrl+Y)
   - Visual history timeline

2. **Auto-Layout Algorithm**
   - Automatically arrange nodes in a logical flow
   - Hierarchical layout for complex workflows
   - Custom layout options

3. **Workflow Persistence**
   - Save workflows to localStorage
   - Load saved workflows
   - Import/export with versioning

4. **Enhanced Validation**
   - Cycle detection (prevent circular dependencies)
   - Required field validation
   - Inline error messages on nodes
   - Warning system for potential issues

#### Medium Priority 📋

5. **Richer Simulation**
   - Animated execution flow
   - Per-step status icons (✅ ⏳ ❌)
   - Detailed execution logs with timestamps
   - Conditional branching simulation

6. **Node Templates**
   - Pre-configured node templates
   - Save custom node configurations
   - Template library

7. **Collaboration Features**
   - Real-time collaboration (WebSockets)
   - Comments on nodes
   - Version history

8. **Advanced Node Types**
   - Timer/Delay nodes
   - Conditional branches
   - Parallel execution nodes
   - Sub-workflow nodes

#### Nice to Have 🎁

9. **Workflow Analytics**
   - Execution time tracking
   - Bottleneck identification
   - Success rate metrics

10. **Export Options**
    - Export as image (PNG/SVG)
    - Export as PDF documentation
    - Integration with other tools

11. **Accessibility Improvements**
    - Keyboard navigation
    - Screen reader support
    - High contrast mode

12. **Mobile Responsiveness**
    - Touch-friendly interface
    - Mobile canvas view
    - Responsive panels

---

## 📚 Additional Resources

### Learn More

- [React Flow Documentation](https://reactflow.dev/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [MSW Documentation](https://mswjs.io/)
- [Vite Documentation](https://vitejs.dev/)

### Contributing

Found a bug or have an idea? Feel free to:
- Open an issue on GitHub
- Submit a pull request
- Share feedback!

---

## 📝 License

This project is a prototype/demo. Feel free to use it as a reference or starting point for your own projects!

---

**Built with ❤️ using React, React Flow, and TypeScript**

*Last updated: 2025*
