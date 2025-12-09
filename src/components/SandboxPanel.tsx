import { useState } from 'react'
import { simulateWorkflow } from '../api/simulate'
import { useWorkflowStore } from '../store/workflowStore'
import { validateWorkflow } from '../utils/validation'

export const SandboxPanel = () => {
  const { nodes, edges, setValidation, validation, resetLog, pushLog, simulationLog } =
    useWorkflowStore((s) => s)
  const [loading, setLoading] = useState(false)

  const runSimulation = async () => {
    const issues = validateWorkflow(nodes, edges)
    setValidation(issues)
    if (issues.length > 0) {
      pushLog(`Blocked: ${issues[0].message}`)
      return
    }
    setLoading(true)
    resetLog()
    try {
      const res = await simulateWorkflow({ nodes, edges })
      res.steps.forEach((step) => pushLog(`[${step.status}] ${step.label} ${step.detail ?? ''}`))
    } catch (err) {
      pushLog(`Error: ${(err as Error).message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Workflow Test / Sandbox</h2>
          <p className="muted">Validate and simulate the current workflow.</p>
        </div>
        <button className="button" onClick={runSimulation} disabled={loading}>
          {loading ? 'Running...' : 'Simulate'}
        </button>
      </div>
      {validation.length > 0 && (
        <div className="error">
          {validation.map((v, idx) => (
            <div key={idx}>• {v.message}</div>
          ))}
        </div>
      )}
      <div className="log">{simulationLog.map((line, idx) => <div key={idx}>{line}</div>)}</div>
    </section>
  )
}

