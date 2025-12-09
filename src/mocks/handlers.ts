import { http, HttpResponse } from 'msw'
import type { SimulationRequest, SimulationStep } from '../types/workflow'

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
    const steps: SimulationStep[] = body.nodes.map((node) => ({
      id: node.id,
      label: `${node.data.title} (${node.data.type})`,
      status: 'ok',
      detail: `Visited node ${node.id}`,
    }))

    if (body.nodes.length === 0) {
      steps.push({ id: 'none', label: 'Empty workflow', status: 'warning' })
    }

    return HttpResponse.json({ steps })
  }),
]

