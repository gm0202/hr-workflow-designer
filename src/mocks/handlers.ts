import { http, HttpResponse } from 'msw'
import type { SimulationRequest, SimulationStep } from '../types/workflow'
import { traverseWorkflow } from '../utils/workflowTraversal'

const automations = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'provision_account', label: 'Provision Account', params: ['system', 'role'] },
]

export const handlers = [
  http.get('/api/automations', () => {
    return HttpResponse.json(automations)
  }),
  http.post('/api/simulate', async ({ request }) => {
    const body = (await request.json()) as SimulationRequest
    
    // Traverse workflow following actual edge connections
    const executionOrder = traverseWorkflow(body.nodes, body.edges)
    
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

    return HttpResponse.json({ steps })
  }),
]

