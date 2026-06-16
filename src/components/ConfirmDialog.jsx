// A small reusable yes/no confirmation used for resign / restart / home.
export default function ConfirmDialog({ message, confirmLabel = 'Yes', onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="wood-panel confirm-panel">
        <p className="confirm-message">{message}</p>
        <div className="confirm-buttons">
          <button type="button" className="wood-btn" onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className="wood-btn ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
