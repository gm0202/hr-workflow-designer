import { create } from 'zustand'
import { nanoid } from 'nanoid/non-secure'
import type {
  AutomationAction,
  NodeKind,
  ValidationIssue,
  WorkflowEdge,
  WorkflowNode,
  WorkflowNodeData,
} from '../types/workflow'

type WorkflowState = {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  selectedNodeId?: string
  selectedEdgeId?: string
  automations: AutomationAction[]
  validation: ValidationIssue[]
  simulationLog: string[]
  setAutomations: (list: AutomationAction[]) => void
  addNode: (type: NodeKind, position: { x: number; y: number }) => void
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void
  setEdges: (edges: WorkflowEdge[]) => void
  setNodes: (nodes: WorkflowNode[]) => void
  selectNode: (id?: string) => void
  selectEdge: (id?: string) => void
  deleteEdge: (id: string) => void
  setValidation: (issues: ValidationIssue[]) => void
  pushLog: (line: string) => void
  resetLog: () => void
}

const makeNode = (type: NodeKind, position: { x: number; y: number }): WorkflowNode => {
  let data: WorkflowNodeData
  switch (type) {
    case 'start':
      data = { type: 'start', title: 'Start', metadata: [] }
      break
    case 'task':
      data = {
        type: 'task',
        title: 'Task',
        assignee: '',
        dueDate: '',
        customFields: [],
        priority: 'medium',
        subtasks: [],
      }
      break
    case 'approval':
      data = { type: 'approval', title: 'Approval', role: 'Manager', threshold: 1, priority: 'medium' }
      break
    case 'automation':
      data = { type: 'automation', title: 'Automation', actionId: undefined, params: {}, priority: 'medium' }
      break
    case 'end':
      data = { type: 'end', title: 'End', message: 'Complete', summary: false }
      break
  }
  return { id: nanoid(6), type, position, data }
}

const initialNodes: WorkflowNode[] = [
  makeNode('start', { x: 150, y: 80 }),
  makeNode('task', { x: 150, y: 220 }),
  makeNode('end', { x: 150, y: 380 }),
]

const initialEdges: WorkflowEdge[] = [
  { id: 'e-start-task', source: initialNodes[0].id, target: initialNodes[1].id },
  { id: 'e-task-end', source: initialNodes[1].id, target: initialNodes[2].id },
]

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: undefined,
  selectedEdgeId: undefined,
  automations: [],
  validation: [],
  simulationLog: [],
  setAutomations: (list) => set({ automations: list }),
  addNode: (type, position) =>
    set((state) => {
      const nodes = [...state.nodes, makeNode(type, position)] as WorkflowNode[]
      return { ...state, nodes } as WorkflowState
    }),
  updateNodeData: (id, data) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node,
      ),
    })),
  setEdges: (edges) => set({ edges }),
  setNodes: (nodes) => set({ nodes }),
  selectNode: (id) => set({ selectedNodeId: id, selectedEdgeId: undefined }),
  selectEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: undefined }),
  deleteEdge: (id) =>
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
      selectedEdgeId: undefined,
    })),
  setValidation: (issues) => set({ validation: issues }),
  pushLog: (line) => set((state) => ({ simulationLog: [...state.simulationLog, line] })),
  resetLog: () => set({ simulationLog: [] }),
}))

