import React from 'react';

import './index.css';

const Modal = props => (
  <div style={props.style} className="modal">
    <section className="modal-content">
      {props.children}
      {<p style={{ color: 'red' }}>
        {props.errorMessage}
      </p>}
    </section>
    <section className="modal-actions">
      {props.onCancel && (
        <button type="button" className="btn-modal cancel" onClick={props.onCancel}>
          Cancelar
        </button>
      )}
      {props.onConfirm && (
        <button type="button" className="btn-modal confirm" onClick={props.onConfirm}>
          Confirmar
        </button>
      )}
    </section>
  </div>
);

export default Modal;