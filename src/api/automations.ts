import type { AutomationAction } from '../types/workflow'
import { http } from './client'

// Mock data fallback for production (when MSW is not available)
const mockAutomations: AutomationAction[] = [
  { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
  { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
  { id: 'provision_account', label: 'Provision Account', params: ['system', 'role'] },
]

export async function fetchAutomations(): Promise<AutomationAction[]> {
  // In production, MSW is not available, so use mock data directly
  if (import.meta.env.PROD) {
    return Promise.resolve(mockAutomations)
  }
  
  // In development, try MSW first, fallback to mock data if it fails
  try {
    return await http<AutomationAction[]>('/automations', { method: 'GET' })
  } catch (error) {
    // Fallback to mock data if API call fails
    return Promise.resolve(mockAutomations)
  }
}

