import type { ChangeEvent, ReactNode } from 'react'
import { useWorkflowStore } from '../store/workflowStore'
import type { AutomationNodeData, KeyValue, WorkflowNodeData } from '../types/workflow'

const Field = ({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) => (
  <div className="form-group">
    <label>{label}</label>
    {children}
  </div>
)

const KeyValueList = ({
  items,
  onChange,
  title,
}: {
  items: KeyValue[]
  onChange: (items: KeyValue[]) => void
  title: string
}) => {
  const update = (idx: number, field: keyof KeyValue, value: string) => {
    const next = [...items]
    next[idx] = { ...next[idx], [field]: value }
    onChange(next)
  }
  const add = () => onChange([...(items || []), { key: '', value: '' }])
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx))

  return (
    <div className="form-group">
      <label>{title}</label>
      {(items ?? []).map((pair, idx) => (
        <div className="keyval-row" key={`${idx}-${pair.key}`}>
          <input
            className="input"
            value={pair.key}
            placeholder="Key"
            onChange={(e) => update(idx, 'key', e.target.value)}
          />
          <input
            className="input"
            value={pair.value}
            placeholder="Value"
            onChange={(e) => update(idx, 'value', e.target.value)}
          />
          <button className="toolbar-btn" onClick={() => remove(idx)}>
            ✕
          </button>
        </div>
      ))}
      <button className="toolbar-btn" onClick={add}>
        + Add
      </button>
    </div>
  )
}

const AutomationParams = ({
  data,
  onChange,
}: {
  data: AutomationNodeData
  onChange: (data: Partial<AutomationNodeData>) => void
}) => {
  const automations = useWorkflowStore((s) => s.automations)
  const selected = automations.find((a) => a.id === data.actionId)

  const updateParam = (key: string, value: string) => {
    onChange({ params: { ...data.params, [key]: value } })
  }

  return (
    <>
      <Field label="Action">
        <select
          className="select"
          value={data.actionId ?? ''}
          onChange={(e) => onChange({ actionId: e.target.value || undefined })}
        >
          <option value="">Select action</option>
          {automations.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </Field>
      {selected && (
        <div className="form-group">
          <label>Parameters</label>
          {selected.params.map((param) => (
            <input
              key={param}
              className="input"
              placeholder={param}
              value={data.params[param] ?? ''}
              onChange={(e) => updateParam(param, e.target.value)}
            />
          ))}
        </div>
      )}
    </>
  )
}

export const NodeFormPanel = () => {
  const { nodes, selectedNodeId, updateNodeData, automations } = useWorkflowStore((s) => s)
  const node = nodes.find((n) => n.id === selectedNodeId)

  const update = (partial: Partial<WorkflowNodeData>) => {
    if (!node) return
    updateNodeData(node.id, partial as Partial<WorkflowNodeData>)
  }

  if (!node) {
    return (
      <section className="panel">
        <h2>Node Form</h2>
        <p className="muted">Select a node to edit its configuration.</p>
      </section>
    )
  }

  const data = node.data

  const renderFields = () => {
    if (data.type === 'start') {
      return (
        <>
          <Field label="Start title">
            <input
              className="input"
              value={data.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update({ title: e.target.value })}
            />
          </Field>
          <KeyValueList
            title="Metadata"
            items={data.metadata}
            onChange={(items) => update({ metadata: items })}
          />
        </>
      )
    }

    if (data.type === 'task') {
      return (
        <>
          <Field label="Title">
            <input
              className="input"
              value={data.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update({ title: e.target.value })}
            />
          </Field>
          <Field label="Description">
            <textarea
              className="textarea"
              value={data.description ?? ''}
              onChange={(e) => update({ description: e.target.value })}
            />
          </Field>
          <div className="grid-two">
            <Field label="Assignee">
              <input
                className="input"
                value={data.assignee ?? ''}
                onChange={(e) => update({ assignee: e.target.value })}
              />
            </Field>
            <Field label="Due date">
              <input
                className="input"
                type="date"
                value={data.dueDate ?? ''}
                onChange={(e) => update({ dueDate: e.target.value })}
              />
            </Field>
          </div>
          <KeyValueList
            title="Custom fields"
            items={data.customFields}
            onChange={(items) => update({ customFields: items })}
          />
        </>
      )
    }

    if (data.type === 'approval') {
      return (
        <>
          <Field label="Title">
            <input
              className="input"
              value={data.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update({ title: e.target.value })}
            />
          </Field>
          <div className="grid-two">
            <Field label="Approver role">
              <select
                className="select"
                value={data.role}
                onChange={(e) => update({ role: e.target.value })}
              >
                <option>Manager</option>
                <option>HRBP</option>
                <option>Director</option>
              </select>
            </Field>
            <Field label="Auto-approve threshold">
              <input
                className="input"
                type="number"
                value={data.threshold ?? 0}
                onChange={(e) => update({ threshold: Number(e.target.value) })}
              />
            </Field>
          </div>
        </>
      )
    }

    if (data.type === 'automation') {
      return (
        <>
          <Field label="Title">
            <input
              className="input"
              value={data.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update({ title: e.target.value })}
            />
          </Field>
          {automations.length === 0 ? (
            <p className="muted">Loading automations...</p>
          ) : (
            <AutomationParams data={data as AutomationNodeData} onChange={update} />
          )}
        </>
      )
    }

    if (data.type === 'end') {
      return (
        <>
          <Field label="End message">
            <input
              className="input"
              value={data.message ?? ''}
              onChange={(e: ChangeEvent<HTMLInputElement>) => update({ message: e.target.value })}
            />
          </Field>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={data.summary}
              onChange={(e) => update({ summary: e.target.checked })}
            />
            Include summary
          </label>
        </>
      )
    }

    return null
  }

  return (
    <section className="panel">
      <h2>Node Form</h2>
      <p className="muted">
        Editing <span className="badge">{data.type}</span>
      </p>
      {renderFields()}
    </section>
  )
}

