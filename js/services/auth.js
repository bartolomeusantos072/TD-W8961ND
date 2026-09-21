/**
 * BART-LINK Simulator — Serviço de Autenticação
 * Controla o diálogo de autenticação HTTP simulado.
 */

import { CONFIG } from '../constants.js';

/**
 * Inicializa os ouvintes do modal de autenticação
 * @param {Object} options
 * @param {Function} options.onSuccess Executado após login com sucesso
 */
export function setupAuth({ onSuccess }) {
  const host = window.location.hostname || 'tplinkwifi.net';
  const hostEl = document.getElementById('authHostDisplay');
  if (hostEl) hostEl.innerText = host;

  const btnSubmit = document.getElementById('btnSubmitAuth');
  const btnCancel = document.getElementById('btnCancelAuth');
  const txtUser = document.getElementById('authUsername');
  const txtPass = document.getElementById('authPassword');
  const errBox = document.getElementById('authErrorMessage');
  const authOverlay = document.getElementById('httpAuthOverlay');
  const firmwareContainer = document.getElementById('firmwareContainer');
  const unauthorizedScreen = document.getElementById('unauthorizedScreen');

  function attemptLogin() {
    if (txtUser.value === CONFIG.auth.user && txtPass.value === CONFIG.auth.pass) {
      if (authOverlay) authOverlay.style.display = 'none';
      if (firmwareContainer) firmwareContainer.style.display = 'flex';
      if (typeof onSuccess === 'function') onSuccess();
    } else {
      if (errBox) errBox.innerText = 'Nome de usuário ou senha incorretos.';
      txtPass.value = '';
      txtPass.focus();
    }
  }

  if (btnSubmit) btnSubmit.addEventListener('click', attemptLogin);
  if (txtPass) txtPass.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });
  if (txtUser) txtUser.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      if (authOverlay) authOverlay.style.display = 'none';
      if (unauthorizedScreen) unauthorizedScreen.style.display = 'block';
    });
  }
}