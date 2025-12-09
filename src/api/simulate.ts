import type { SimulationRequest, SimulationResponse, SimulationStep } from '../types/workflow'
import { http } from './client'
import { traverseWorkflow } from '../utils/workflowTraversal'

// Mock simulation fallback for production (when MSW is not available)
function mockSimulate(payload: SimulationRequest): SimulationResponse {
  // Traverse workflow following actual edge connections
  const executionOrder = traverseWorkflow(payload.nodes, payload.edges)
  
  const steps: SimulationStep[] = executionOrder.map((node, index) => {
    let detail = `Executing ${node.data.type} node`
    
    // Add specific details based on node type
    if (node.data.type === 'task' && 'assignee' in node.data && node.data.assignee) {
      detail = `Assigned to: ${node.data.assignee}`
    } else if (node.data.type === 'approval' && 'role' in node.data) {
      detail = `Requires approval from: ${node.data.role}`
    } else if (node.data.type === 'automation' && 'actionId' in node.data && node.data.actionId) {
      detail = `Running automation: ${node.data.actionId}`
    } else if (node.data.type === 'end' && 'message' in node.data && node.data.message) {
      detail = node.data.message
    }
    
    return {
      id: node.id,
      label: `${node.data.title} (${node.data.type})`,
      status: 'ok' as const,
      detail: `${index + 1}. ${detail}`,
    }
  })

  if (executionOrder.length === 0) {
    steps.push({ id: 'none', label: 'Empty workflow', status: 'warning' })
  }

  // Check if workflow reaches an end node
  const hasEndNode = executionOrder.some((node) => node.data.type === 'end')
  if (!hasEndNode && executionOrder.length > 0) {
    steps.push({
      id: 'warning',
      label: 'Warning: Workflow does not reach an end node',
      status: 'warning',
      detail: 'The workflow path does not connect to an end node',
    })
  }

  return { steps }
}

export async function simulateWorkflow(payload: SimulationRequest): Promise<SimulationResponse> {
  // Try API call first (MSW will intercept in both dev and production)
  // Fallback to mock simulation if API call fails
  try {
    return await http<SimulationResponse>('/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    // Fallback to mock simulation if API call fails (e.g., MSW not available)
    console.warn('API call failed, using mock simulation fallback:', error)
    return Promise.resolve(mockSimulate(payload))
  }
}

