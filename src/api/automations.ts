import type { AutomationAction } from '../types/workflow'
import { http } from './client'

export async function fetchAutomations(): Promise<AutomationAction[]> {
  return http<AutomationAction[]>('/automations', { method: 'GET' })
}

