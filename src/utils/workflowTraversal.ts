import type { WorkflowEdge, WorkflowNode } from '../types/workflow'

/**
 * Traverses the workflow graph following edge connections
 * Returns nodes in execution order based on the actual arrow connections
 */
export const traverseWorkflow = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): WorkflowNode[] => {
  // Find the start node
  const startNode = nodes.find((n) => n.data.type === 'start')
  if (!startNode) {
    return []
  }

  // Build adjacency map: nodeId -> array of connected node IDs (following edges)
  const adjacencyMap = new Map<string, string[]>()
  edges.forEach((edge) => {
    if (!adjacencyMap.has(edge.source)) {
      adjacencyMap.set(edge.source, [])
    }
    adjacencyMap.get(edge.source)!.push(edge.target)
  })

  // Create node lookup map
  const nodeMap = new Map<string, WorkflowNode>()
  nodes.forEach((node) => {
    nodeMap.set(node.id, node)
  })

  // BFS traversal starting from start node
  const visited = new Set<string>()
  const executionOrder: WorkflowNode[] = []
  const queue: string[] = [startNode.id]

  while (queue.length > 0) {
    const currentNodeId = queue.shift()!
    
    if (visited.has(currentNodeId)) {
      continue
    }

    visited.add(currentNodeId)
    const currentNode = nodeMap.get(currentNodeId)
    
    if (currentNode) {
      executionOrder.push(currentNode)
    }

    // Add connected nodes to queue (following outgoing edges)
    const connectedNodeIds = adjacencyMap.get(currentNodeId) || []
    connectedNodeIds.forEach((targetId) => {
      if (!visited.has(targetId)) {
        queue.push(targetId)
      }
    })
  }

  // Add any unvisited nodes (isolated nodes) at the end
  nodes.forEach((node) => {
    if (!visited.has(node.id)) {
      executionOrder.push(node)
    }
  })

  return executionOrder
}

/**
 * Gets the execution path as a sequence of node IDs following edges
 */
export const getExecutionPath = (
  nodes: WorkflowNode[],
  edges: WorkflowEdge[],
): string[] => {
  return traverseWorkflow(nodes, edges).map((node) => node.id)
}

