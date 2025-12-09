import React, { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
  MarkerType,
  useReactFlow,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useWorkflowStore } from '../store/workflowStore'
import type { NodeKind, WorkflowNode } from '../types/workflow'

const typeColors: Record<NodeKind, { bg: string; border: string; accent: string }> = {
  start: { bg: '#e0f7f4', border: '#0ea5e9', accent: '#0ea5e9' },
  task: { bg: '#e0edff', border: '#2563eb', accent: '#2563eb' },
  approval: { bg: '#fff7e0', border: '#d97706', accent: '#d97706' },
  automation: { bg: '#f3e8ff', border: '#a855f7', accent: '#a855f7' },
  end: { bg: '#ffe4e6', border: '#fb7185', accent: '#fb7185' },
}

const NodeCard = ({ data }: { data: WorkflowNode['data'] }) => {
  const colors = typeColors[data.type as NodeKind]
  return (
    <div
      className={`node-card node-${data.type}`}
      style={{ background: colors.bg, borderColor: colors.border }}
    >
      <div className="node-pill" style={{ color: colors.accent }}>
        {data.type.toUpperCase()}
      </div>
      <h3>{data.title}</h3>
    </div>
  )
}

const nodeTypes = {
  start: NodeCard,
  task: NodeCard,
  approval: NodeCard,
  automation: NodeCard,
  end: NodeCard,
}

const CanvasInner = () => {
  const { project } = useReactFlow()
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const setNodes = useWorkflowStore((s) => s.setNodes)
  const setEdges = useWorkflowStore((s) => s.setEdges)
  const selectNode = useWorkflowStore((s) => s.selectNode)
  const addNode = useWorkflowStore((s) => s.addNode)
  const validation = useWorkflowStore((s) => s.validation)

  const memoNodeTypes = useMemo(() => nodeTypes, [])

  const hasError = useMemo(() => {
    const map = new Set(validation.map((v) => v.nodeId).filter(Boolean))
    return map
  }, [validation])

  const defaultEdgeOptions = useMemo(
    () => ({
      style: { stroke: '#475569', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#475569' },
    }),
    [],
  )

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes(applyNodeChanges(changes, nodes)),
    [nodes, setNodes],
  )

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges(applyEdgeChanges(changes, edges)),
    [edges, setEdges],
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

  return (
    <div className="panel canvas-wrapper">
      <div className="canvas-toolbar">
        <button
          className="toolbar-btn"
          onClick={() => {
            if (!selectedNodeId) {
              selectNode(undefined)
              return
            }
            setNodes(nodes.filter((n) => n.id !== selectedNodeId))
            setEdges(edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId))
            selectNode(undefined)
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
          edges={edges}
          nodeTypes={memoNodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={onNodeClick}
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
