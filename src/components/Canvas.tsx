import React, { useCallback, useEffect, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  Handle,
  Position,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  type Edge,
  MarkerType,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useWorkflowStore } from '../store/workflowStore'
import type { NodeKind, WorkflowNode } from '../types/workflow'

const typeColors: Record<NodeKind, { bg: string; border: string; accent: string; text: string; label: string }> = {
  start: { bg: '#dbeafe', border: '#0ea5e9', accent: '#0ea5e9', text: '#1e40af', label: '#1e3a8a' },
  task: { bg: '#dbeafe', border: '#2563eb', accent: '#2563eb', text: '#1e40af', label: '#1e3a8a' },
  approval: { bg: '#fef3c7', border: '#d97706', accent: '#d97706', text: '#92400e', label: '#78350f' },
  automation: { bg: '#e9d5ff', border: '#a855f7', accent: '#a855f7', text: '#6b21a8', label: '#581c87' },
  end: { bg: '#fecdd3', border: '#fb7185', accent: '#fb7185', text: '#9f1239', label: '#881337' },
}

const NodeCard = (props: { data: WorkflowNode['data']; id: string }) => {
  const { data, id } = props
  const colors = typeColors[data.type as NodeKind]
  const edges = useWorkflowStore((s) => s.edges)
  // Always use black text for better visibility
  const textColor = '#000000'
  const labelColor = '#000000'
  
  // Calculate progress based on connections (simplified: if node has outgoing edges, it's "in progress")
  const hasOutgoing = edges.some((e) => e.source === id)
  const hasIncoming = edges.some((e) => e.target === id)
  const progress = data.type === 'start' ? (hasOutgoing ? 50 : 0) : data.type === 'end' ? (hasIncoming ? 100 : 0) : hasOutgoing && hasIncoming ? 75 : hasIncoming ? 50 : 0

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return '#ef4444'
      case 'medium': return '#f59e0b'
      case 'low': return '#10b981'
      default: return '#6b7280'
    }
  }

  const renderDetails = () => {
    switch (data.type) {
      case 'task':
        const taskData = data as any
        const taskPriority = taskData.priority || 'medium'
        const taskPriorityColor = getPriorityColor(taskPriority)
        const subtasks = taskData.subtasks || []
        const completedSubtasks = subtasks.filter((st: any) => st.completed).length
        const totalSubtasks = subtasks.length
        const taskProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
        
        return (
          <>
            <div className="node-detail">
              <span className="node-detail-label" style={{ color: labelColor }}>Priority:</span>
              <span className="node-detail-value" style={{ color: taskPriorityColor, fontWeight: 700 }}>
                {taskPriority.toUpperCase()}
              </span>
            </div>
            {subtasks.length > 0 && (
              <div className="node-detail">
                <span className="node-detail-label" style={{ color: labelColor }}>Subtasks:</span>
                <div style={{ marginTop: 4 }}>
                  {subtasks.slice(0, 3).map((subtask: any) => (
                    <div key={subtask.id} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                      <span style={{ color: subtask.completed ? '#10b981' : '#6b7280' }}>
                        {subtask.completed ? '✓' : '○'}
                      </span>
                      <span style={{ 
                        textDecoration: subtask.completed ? 'line-through' : 'none',
                        opacity: subtask.completed ? 0.6 : 1,
                        color: textColor
                      }}>
                        {subtask.text || 'Untitled subtask'}
                      </span>
                    </div>
                  ))}
                  {subtasks.length > 3 && (
                    <div style={{ fontSize: '11px', color: '#6b7280', marginTop: 2 }}>
                      +{subtasks.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            )}
            {taskData.assignee && (
              <div className="node-detail">
                <span className="node-detail-label" style={{ color: labelColor }}>Assignee:</span>
                <span className="node-detail-value" style={{ color: textColor }}>{taskData.assignee}</span>
              </div>
            )}
            {taskData.dueDate && (
              <div className="node-detail">
                <span className="node-detail-label" style={{ color: labelColor }}>Due Date:</span>
                <span className="node-detail-value" style={{ color: textColor }}>{taskData.dueDate}</span>
              </div>
            )}
            {totalSubtasks > 0 && (
              <div className="node-progress">
                <div className="node-progress-bar">
                  <div 
                    className="node-progress-fill" 
                    style={{ width: `${taskProgress}%`, backgroundColor: colors.accent }}
                  />
                </div>
                <span className="node-progress-text" style={{ color: textColor }}>
                  {completedSubtasks}/{totalSubtasks} ({taskProgress}%)
                </span>
              </div>
            )}
          </>
        )
      case 'approval':
        const approvalData = data as any
        const approvalPriority = approvalData.priority || 'medium'
        const approvalPriorityColor = getPriorityColor(approvalPriority)
        return (
          <>
            <div className="node-detail">
              <span className="node-detail-label" style={{ color: labelColor }}>Priority:</span>
              <span className="node-detail-value" style={{ color: approvalPriorityColor, fontWeight: 700 }}>
                {approvalPriority.toUpperCase()}
              </span>
            </div>
            {approvalData.role && (
              <div className="node-detail">
                <span className="node-detail-label" style={{ color: labelColor }}>Role:</span>
                <span className="node-detail-value" style={{ color: textColor }}>{approvalData.role}</span>
              </div>
            )}
            {approvalData.threshold !== undefined && (
              <div className="node-detail">
                <span className="node-detail-label" style={{ color: labelColor }}>Threshold:</span>
                <span className="node-detail-value" style={{ color: textColor }}>{approvalData.threshold}</span>
              </div>
            )}
            <div className="node-progress">
              <div className="node-progress-bar">
                <div 
                  className="node-progress-fill" 
                  style={{ width: `${progress}%`, backgroundColor: colors.accent }}
                />
              </div>
              <span className="node-progress-text" style={{ color: textColor }}>{progress}%</span>
            </div>
          </>
        )
      case 'automation':
        const automationData = data as any
        const automationPriority = automationData.priority || 'medium'
        const automationPriorityColor = getPriorityColor(automationPriority)
        return (
          <>
            <div className="node-detail">
              <span className="node-detail-label" style={{ color: labelColor }}>Priority:</span>
              <span className="node-detail-value" style={{ color: automationPriorityColor, fontWeight: 700 }}>
                {automationPriority.toUpperCase()}
              </span>
            </div>
            {automationData.actionId && (
              <div className="node-detail">
                <span className="node-detail-label" style={{ color: labelColor }}>Action:</span>
                <span className="node-detail-value" style={{ color: textColor }}>{automationData.actionId}</span>
              </div>
            )}
            <div className="node-progress">
              <div className="node-progress-bar">
                <div 
                  className="node-progress-fill" 
                  style={{ width: `${progress}%`, backgroundColor: colors.accent }}
                />
              </div>
              <span className="node-progress-text" style={{ color: textColor }}>{progress}%</span>
            </div>
          </>
        )
      case 'end':
        const endData = data as any
        return (
          <>
            {endData.message && (
              <div className="node-detail">
                <span className="node-detail-label" style={{ color: labelColor }}>Message:</span>
                <span className="node-detail-value" style={{ color: textColor }}>{endData.message}</span>
              </div>
            )}
          </>
        )
      case 'start':
        const startData = data as any
        return (
          <>
            {startData.metadata && startData.metadata.length > 0 && (
              <div className="node-detail">
                <span className="node-detail-label" style={{ color: labelColor }}>Metadata:</span>
                <span className="node-detail-value" style={{ color: textColor }}>{startData.metadata.length} items</span>
              </div>
            )}
          </>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`node-card node-${data.type}`}
      style={{ 
        background: colors.bg, 
        borderColor: colors.border,
        color: colors.text,
        position: 'relative'
      }}
    >
      {/* Target handle (top) - for incoming connections */}
      {data.type !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: colors.accent,
            width: 14,
            height: 14,
            border: `3px solid ${colors.border}`,
            borderRadius: '50%',
            top: -7,
          }}
        />
      )}
      
      <div className="node-pill" style={{ color: colors.accent, backgroundColor: `${colors.accent}20`, fontWeight: 700 }}>
        {data.type.toUpperCase()}
      </div>
      <h3 style={{ color: textColor }}>{data.title}</h3>
      <div className="node-details">
        {renderDetails()}
      </div>
      
      {/* Source handle (bottom) - for outgoing connections */}
      {data.type !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: colors.accent,
            width: 14,
            height: 14,
            border: `3px solid ${colors.border}`,
            borderRadius: '50%',
            bottom: -7,
          }}
        />
      )}
    </div>
  )
}

const nodeTypes = {
  start: (props: any) => <NodeCard {...props} />,
  task: (props: any) => <NodeCard {...props} />,
  approval: (props: any) => <NodeCard {...props} />,
  automation: (props: any) => <NodeCard {...props} />,
  end: (props: any) => <NodeCard {...props} />,
}

const CanvasInner = () => {
  const { project } = useReactFlow()
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const selectedEdgeId = useWorkflowStore((s) => s.selectedEdgeId)
  const setNodes = useWorkflowStore((s) => s.setNodes)
  const setEdges = useWorkflowStore((s) => s.setEdges)
  const selectNode = useWorkflowStore((s) => s.selectNode)
  const selectEdge = useWorkflowStore((s) => s.selectEdge)
  const deleteEdge = useWorkflowStore((s) => s.deleteEdge)
  const addNode = useWorkflowStore((s) => s.addNode)
  const validation = useWorkflowStore((s) => s.validation)

  const memoNodeTypes = useMemo(() => nodeTypes, [])

  const hasError = useMemo(() => {
    const map = new Set(validation.map((v) => v.nodeId).filter(Boolean))
    return map
  }, [validation])

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep',
      animated: true,
      style: { 
        stroke: '#2563eb', 
        strokeWidth: 4,
        filter: 'drop-shadow(0 2px 6px rgba(37, 99, 235, 0.5))'
      },
      markerEnd: { 
        type: MarkerType.ArrowClosed, 
        width: 32, 
        height: 32, 
        color: '#2563eb'
      },
    }),
    [],
  )

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      const newEdges = applyEdgeChanges(changes, edges)
      setEdges(newEdges)
      
      // Clear selected edge if it was deleted
      const deletedEdgeId = changes.find((change) => change.type === 'remove')?.id
      if (deletedEdgeId === selectedEdgeId) {
        selectEdge(undefined)
      }
    },
    [edges, setEdges, selectedEdgeId, selectEdge],
  )

  const onConnect = useCallback(
    (connection: Connection) => setEdges(addEdge(connection, edges)),
    [edges, setEdges],
  )

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      const type = event.dataTransfer.getData('application/reactflow') as NodeKind
      if (!type) return
      const bounds = (event.target as Element).getBoundingClientRect()
      const position = project({ x: event.clientX - bounds.left, y: event.clientY - bounds.top })
      addNode(type, position)
    },
    [addNode, project],
  )

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: WorkflowNode) => {
      selectNode(node.id)
    },
    [selectNode],
  )

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      selectEdge(edge.id)
    },
    [selectEdge],
  )

  // Handle Delete key to remove selected edge
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEdgeId) {
        event.preventDefault()
        deleteEdge(selectedEdgeId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedEdgeId, deleteEdge])

  // Update edges to show selected state
  const edgesWithSelection = useMemo(
    () =>
      edges.map((edge) => ({
        ...edge,
        selected: edge.id === selectedEdgeId,
      })),
    [edges, selectedEdgeId],
  )

  return (
    <div className="panel canvas-wrapper">
      <div className="canvas-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
          <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>
            💡 Drag from the bottom handle of a node to the top handle of another to connect them
            {selectedEdgeId && ' • Click an arrow to select it, then press Delete to remove'}
          </span>
        </div>
        {selectedEdgeId && (
          <button
            className="toolbar-btn"
            onClick={() => {
              deleteEdge(selectedEdgeId)
            }}
            style={{ background: '#ef4444', color: 'white', borderColor: '#ef4444' }}
          >
            Delete Connection
          </button>
        )}
        <button
          className="toolbar-btn"
          onClick={() => {
            if (!selectedNodeId && !selectedEdgeId) {
              selectNode(undefined)
              selectEdge(undefined)
              return
            }
            if (selectedNodeId) {
              setNodes(nodes.filter((n) => n.id !== selectedNodeId))
              setEdges(edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId))
              selectNode(undefined)
            }
            if (selectedEdgeId) {
              deleteEdge(selectedEdgeId)
            }
          }}
        >
          Clear selection
        </button>
        <button
          className="toolbar-btn"
          onClick={() => {
            if (nodes.length < 2) return
            const ordered = [...nodes].sort((a, b) => (a.position.y ?? 0) - (b.position.y ?? 0))
            const chainEdges = ordered.slice(0, -1).map((n, idx) => {
              const target = ordered[idx + 1]
              return {
                id: `auto-${n.id}-${target.id}`,
                source: n.id,
                target: target.id,
                type: 'smoothstep',
                animated: true,
                style: { stroke: '#2563eb', strokeWidth: 4 },
                markerEnd: { type: MarkerType.ArrowClosed, width: 32, height: 32, color: '#2563eb' },
              }
            })
            setEdges(chainEdges)
          }}
        >
          Connect all
        </button>
      </div>
      <div style={{ height: '70vh' }}>
        <ReactFlow
          nodes={nodes.map((n: WorkflowNode) =>
            hasError.has(n.id) ? { ...n, style: { borderColor: '#ef4444' } } : n,
          )}
          edges={edgesWithSelection}
          nodeTypes={memoNodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
          onEdgeClick={onEdgeClick}
          deleteKeyCode={['Delete', 'Backspace']}
          fitView
        >
          <MiniMap />
          <Controls />
          <Background gap={16} />
        </ReactFlow>
      </div>
    </div>
  )
}

export const Canvas = () => (
  <ReactFlowProvider>
    <CanvasInner />
  </ReactFlowProvider>
)
