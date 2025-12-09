import type { Edge, Node, XYPosition } from 'reactflow'

export type NodeKind = 'start' | 'task' | 'approval' | 'automation' | 'end'

export type KeyValue = { key: string; value: string }

export type AutomationAction = {
  id: string
  label: string
  params: string[]
}

export type Priority = 'low' | 'medium' | 'high'

export type Subtask = {
  id: string
  text: string
  completed: boolean
}

export type BaseNodeData = {
  type: NodeKind
  title: string
}

export type StartNodeData = BaseNodeData & {
  type: 'start'
  metadata: KeyValue[]
}

export type TaskNodeData = BaseNodeData & {
  type: 'task'
  assignee?: string
  dueDate?: string
  customFields: KeyValue[]
  priority?: Priority
  subtasks: Subtask[]
}

export type ApprovalNodeData = BaseNodeData & {
  type: 'approval'
  role: string
  threshold?: number
  priority?: Priority
}

export type AutomationNodeData = BaseNodeData & {
  type: 'automation'
  actionId?: string
  params: Record<string, string>
  priority?: Priority
}

export type EndNodeData = BaseNodeData & {
  type: 'end'
  message?: string
  summary: boolean
}

export type WorkflowNodeData =
  | StartNodeData
  | TaskNodeData
  | ApprovalNodeData
  | AutomationNodeData
  | EndNodeData

export type WorkflowNode = Node<any>
export type WorkflowEdge = Edge

export type ValidationIssue = {
  message: string
  nodeId?: string
}

export type SimulationRequest = {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export type SimulationStep = {
  id: string
  label: string
  status: 'ok' | 'warning'
  detail?: string
}

export type SimulationResponse = {
  steps: SimulationStep[]
}

export type NewNodeInput = {
  type: NodeKind
  position: XYPosition
}

