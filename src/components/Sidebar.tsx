import React, { useCallback, useState } from 'react'
import { useWorkflowStore } from '../store/workflowStore'
import type { NodeKind } from '../types/workflow'
import { simulateWorkflow } from '../api/simulate'
import { validateWorkflow } from '../utils/validation'

const palette: { type: NodeKind; label: string; hint: string }[] = [
  { type: 'start', label: 'Start', hint: 'Entry point' },
  { type: 'task', label: 'Task', hint: 'Human task' },
  { type: 'approval', label: 'Approval', hint: 'Manager/HR check' },
  { type: 'automation', label: 'Automation', hint: 'System action' },
  { type: 'end', label: 'End', hint: 'Completion' },
]

export const Sidebar = () => {
  const addNode = useWorkflowStore((s) => s.addNode)
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const setValidation = useWorkflowStore((s) => s.setValidation)
  const resetLog = useWorkflowStore((s) => s.resetLog)
  const pushLog = useWorkflowStore((s) => s.pushLog)
  const [running, setRunning] = useState(false)

  const onDragStart = useCallback((event: React.DragEvent, type: NodeKind) => {
    event.dataTransfer.setData('application/reactflow', type)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  const onQuickAdd = (type: NodeKind) => {
    addNode(type, { x: 120, y: 120 })
  }

  const runTestWorkflow = async () => {
    const issues = validateWorkflow(nodes, edges)
    setValidation(issues)
    resetLog()
    if (issues.length > 0) {
      pushLog(`Blocked: ${issues[0].message}`)
      return
    }
    setRunning(true)
    try {
      const res = await simulateWorkflow({ nodes, edges })
      res.steps.forEach((step) => pushLog(`[${step.status}] ${step.label} ${step.detail ?? ''}`))
    } catch (err) {
      pushLog(`Error: ${(err as Error).message}`)
    } finally {
      setRunning(false)
    }
  }

  const exportJson = () => {
    const payload = { nodes, edges }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'workflow.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <aside className="panel sidebar">
      <h2>Node Palette</h2>
      <p className="muted">Drag onto canvas or click to add quickly.</p>
      <div className="node-palette">
        {palette.map((item) => (
          <div
            key={item.type}
            className="node-chip"
            draggable
            onDragStart={(e) => onDragStart(e, item.type)}
            onClick={() => onQuickAdd(item.type)}
          >
            <div>
              <span>{item.label}</span>
              <div className="muted">{item.hint}</div>
            </div>
            <small>{item.type}</small>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
        <button className="button" onClick={runTestWorkflow} disabled={running}>
          {running ? 'Running...' : 'Test Workflow'}
        </button>
        <button className="button secondary" onClick={exportJson}>
          Export JSON
        </button>
      </div>
    </aside>
  )
}

