import { useEffect, useMemo, useState } from 'react'
import { Eye, Save, Sparkles, User, Check, Zap, Flag } from 'lucide-react'
import { Canvas } from './components/Canvas'
import { NodeFormPanel } from './components/NodeFormPanel'
import { SandboxPanel } from './components/SandboxPanel'
import { Sidebar } from './components/Sidebar'
import { useWorkflowStore } from './store/workflowStore'
import { fetchAutomations } from './api/automations'
import type { WorkflowNode } from './types/workflow'

const App = () => {
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState<'design' | 'config' | 'test'>('design')
  const [darkMode, setDarkMode] = useState(true)
  const setAutomations = useWorkflowStore((s) => s.setAutomations)
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const loadAutomations = async () => {
    const automations = await fetchAutomations()
    setAutomations(automations)
  }

  useEffect(() => {
    loadAutomations()
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('theme-dark')
    } else {
      document.body.classList.remove('theme-dark')
    }
  }, [darkMode])

  return (
    <div className="app-shell">
      <nav className="nav-shell">
        <div className="nav-left">
          <div className="brand-pill">
            <Sparkles size={18} color="#fff" />
          </div>
          <div className="brand-text">
            <h1>FlowForge Studio</h1>
            <p>Employee Onboarding Automation</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'design' ? 'active' : ''}`}
              onClick={() => setActiveTab('design')}
            >
              Design
            </button>
            <button
              className={`nav-tab ${activeTab === 'config' ? 'active' : ''}`}
              onClick={() => setActiveTab('config')}
            >
              Configure
            </button>
            <button
              className={`nav-tab ${activeTab === 'test' ? 'active' : ''}`}
              onClick={() => setActiveTab('test')}
            >
              Test
            </button>
          </div>
          <div className="nav-actions">
            <button className="ghost-btn" onClick={() => setDarkMode((d) => !d)}>
              {darkMode ? 'Light' : 'Dark'}
            </button>
            <button className="ghost-btn" onClick={() => setShowPreview(true)}>
              <Eye size={16} /> Preview
            </button>
            <button className="primary-grad">
              <Save size={16} /> Publish
            </button>
          </div>
        </div>
      </nav>

      <main className="app-main">
        <Sidebar />
        <div>
          <div className="stats-bar">
            <div className="stat-chip">
              <span className="edge-icon" /> Nodes: {nodes.length}
            </div>
            <div className="stat-chip">
              <span className="edge-icon" /> Edges: {edges.length}
            </div>
          </div>
          <Canvas />
        </div>
        <div className="right-rail">
          <NodeFormPanel />
          <SandboxPanel />
        </div>
      </main>

      {showPreview && <PreviewModal nodes={nodes} onClose={() => setShowPreview(false)} />}
    </div>
  )
}

export default App

type PreviewModalProps = {
  nodes: WorkflowNode[]
  onClose: () => void
}

const nodeLabel = (node: WorkflowNode) => `${node.data.title} (${node.data.type})`

const PreviewModal = ({ nodes, onClose }: PreviewModalProps) => {
  const ordered = useMemo(
    () => [...nodes].sort((a, b) => (a.position.y ?? 0) - (b.position.y ?? 0)),
    [nodes],
  )

  const iconFor = (type: WorkflowNode['data']['type']) => {
    switch (type) {
      case 'start':
        return Sparkles
      case 'task':
        return User
      case 'approval':
        return Check
      case 'automation':
        return Zap
      case 'end':
      default:
        return Flag
    }
  }

  const colorFor = (type: WorkflowNode['data']['type']) => {
    switch (type) {
      case 'start':
        return '#10b981'
      case 'task':
        return '#2563eb'
      case 'approval':
        return '#f59e0b'
      case 'automation':
        return '#a855f7'
      case 'end':
      default:
        return '#f43f5e'
    }
  }

  const statusFor = (type: WorkflowNode['data']['type']) => {
    switch (type) {
      case 'start':
        return { label: 'Completed', tone: '#10b981', muted: '2m ago' }
      case 'task':
        return { label: 'In Progress', tone: '#2563eb', muted: 'Current' }
      case 'approval':
        return { label: 'Pending', tone: '#cbd5e1', muted: 'Waiting' }
      case 'automation':
        return { label: 'Queued', tone: '#a855f7', muted: 'Next' }
      case 'end':
      default:
        return { label: 'Pending', tone: '#cbd5e1', muted: 'Final' }
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal preview-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Workflow Preview</h3>
          <button className="toolbar-btn" onClick={onClose}>
            Close
          </button>
        </div>
        <p className="muted" style={{ marginTop: 6 }}>
          Ordered top-to-bottom from the canvas.
        </p>
        <div className="preview-list">
          {ordered.map((n) => {
            const Icon = iconFor(n.data.type)
            const color = colorFor(n.data.type)
            const status = statusFor(n.data.type)
            return (
              <div key={n.id} className="preview-card">
                <div className="preview-icon" style={{ background: `${color}1a`, borderColor: color }}>
                  <Icon size={18} color={color} />
                </div>
                <div className="preview-body">
                  <div className="preview-title">{nodeLabel(n)}</div>
                  <div className="preview-sub">{status.muted}</div>
                </div>
                <div className="status-pill" style={{ color: color, borderColor: color }}>
                  {status.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

