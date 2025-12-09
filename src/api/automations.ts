import type { AutomationAction } from '../types/workflow'
import { http } from './client'

// Mock data fallback for production (when MSW is not available)
const mockAutomations: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'provision_account', label: 'Provision Account', params: ['system', 'role'] },
]

export async function fetchAutomations(): Promise<AutomationAction[]> {
  try {
    return await http<AutomationAction[]>('/automations', { method: 'GET' })
  } catch (error) {
    // Fallback to mock data if API call fails (e.g., in production)
    console.warn('API call failed, using mock data:', error)
    return Promise.resolve(mockAutomations)
  }
}

