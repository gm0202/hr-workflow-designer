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
  automations: AutomationAction[]
  validation: ValidationIssue[]
  simulationLog: string[]
  setAutomations: (list: AutomationAction[]) => void
  addNode: (type: NodeKind, position: { x: number; y: number }) => void
  updateNodeData: (id: string, data: Partial<WorkflowNodeData>) => void
  setEdges: (edges: WorkflowEdge[]) => void
  setNodes: (nodes: WorkflowNode[]) => void
  selectNode: (id?: string) => void
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
        description: '',
        assignee: '',
        dueDate: '',
        customFields: [],
      }
      break
    case 'approval':
      data = { type: 'approval', title: 'Approval', role: 'Manager', threshold: 1 }
      break
    case 'automation':
      data = { type: 'automation', title: 'Automation', actionId: undefined, params: {} }
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
  selectNode: (id) => set({ selectedNodeId: id }),
  setValidation: (issues) => set({ validation: issues }),
  pushLog: (line) => set((state) => ({ simulationLog: [...state.simulationLog, line] })),
  resetLog: () => set({ simulationLog: [] }),
}))

