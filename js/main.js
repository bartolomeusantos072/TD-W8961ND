/**
 * BART-LINK Simulator — Ponto de Entrada Principal
 * Orquestra ciclo de vida, autenticação e despacho de eventos.
 */

import { appState, initAppState } from './state.js';
import { setupAuth } from './services/auth.js';
import { setupSupportModal } from './ui/modal.js';
import { renderInterface } from './ui/render.js';

// Restaura o tema persistido antes de montar os componentes
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
}

// Expõe a alternância de tema global caso haja botão no HTML
export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', current);
  localStorage.setItem('theme', current);
}

// Inicialização da aplicação após parsing do DOM
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  
  // 1. Carrega dados de dispositivos e sessão
  await initAppState();

  // 2. Configura serviços globais de interface
  setupSupportModal();

  // 3. Gerencia fluxo de autenticação e renderização
  setupAuth({
    onSuccess: () => {
      renderInterface();
    }
  });
});