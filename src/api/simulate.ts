import type { SimulationRequest, SimulationResponse } from '../types/workflow'
import { http } from './client'

export async function simulateWorkflow(payload: SimulationRequest): Promise<SimulationResponse> {
  return http<SimulationResponse>('/simulate', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

