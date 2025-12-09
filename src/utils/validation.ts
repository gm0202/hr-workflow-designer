import type { ValidationIssue, WorkflowEdge, WorkflowNode } from '../types/workflow'

export const validateWorkflow = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): ValidationIssue[] => {
  const issues: ValidationIssue[] = []
  const startNodes = nodes.filter((n) => n.data.type === 'start')
  if (startNodes.length !== 1) {
    issues.push({ message: 'Workflow must have exactly one start node' })
  }

  const endNodes = nodes.filter((n) => n.data.type === 'end')
  if (endNodes.length === 0) {
    issues.push({ message: 'Add at least one end node' })
  }

  const edgeTargets = new Map<string, number>()
  const edgeSources = new Map<string, number>()
  edges.forEach((e) => {
    edgeSources.set(e.source, (edgeSources.get(e.source) ?? 0) + 1)
    edgeTargets.set(e.target, (edgeTargets.get(e.target) ?? 0) + 1)
  })

  nodes.forEach((node) => {
    if (!edgeSources.has(node.id) && !edgeTargets.has(node.id)) {
      issues.push({ message: 'Node is isolated', nodeId: node.id })
    }
    if (node.data.type === 'start' && edgeTargets.has(node.id)) {
      issues.push({ message: 'Start node cannot have incoming edges', nodeId: node.id })
    }
    if (node.data.type === 'end' && edgeSources.has(node.id)) {
      issues.push({ message: 'End node should not have outgoing edges', nodeId: node.id })
    }
  })

  edges.forEach((edge) => {
    const source = nodes.find((n) => n.id === edge.source)
    const target = nodes.find((n) => n.id === edge.target)
    if (!source || !target) {
      issues.push({ message: 'Edge references missing node', nodeId: edge.id })
    }
  })

  return issues
}

