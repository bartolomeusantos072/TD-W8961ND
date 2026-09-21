/**
 * BART-LINK Simulator — Gestão de Modais
 * Controla os modais de Suporte (PIX) e de Varredura Wi-Fi (AP Survey).
 */

import { appState } from '../state.js';

/**
 * Inicializa os eventos do modal de suporte e cópia de chave PIX
 */
export function setupSupportModal() {
  const modal = document.getElementById('supportModal');
  const btnCopy = document.querySelector('.btn-copy-pix');
  const chavePix = 'professorbarto@gmail.com';

  // Fechar ao clicar fora da caixa branca
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Fechar ao premir a tecla ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });

  // Copiar chave PIX com retorno visual
  if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(chavePix);
        const originalText = btnCopy.innerHTML;
        btnCopy.innerHTML = '✅ Chave Copiada!';
        btnCopy.style.backgroundColor = '#0d9488';

        setTimeout(() => {
          btnCopy.innerHTML = originalText;
          btnCopy.style.backgroundColor = '';
        }, 2000);
      } catch (err) {
        console.error('Falha ao copiar a chave PIX:', err);
      }
    });
  }
}

/**
 * Abre o modal de varredura Wi-Fi para selecionar a rede raiz do WDS
 * @param {Function} onSelect Callback executado com os dados da rede selecionada
 */
export function openSurveyModal(onSelect) {
  let modal = document.getElementById('surveyModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'surveyModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '99999';
    document.body.appendChild(modal);
  }

  const surveyRows = appState.wdsSurvey.map((s, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${s.ssid}</strong></td>
      <td>${s.bssid}</td>
      <td>${s.rssi}</td>
      <td>${s.channel}</td>
      <td>${s.security}</td>
      <td><button class="btn-tplink btn-select-ap" data-index="${idx}">Conectar</button></td>
    </tr>
  `).join('');

  modal.innerHTML = `
    <div style="background:#fff; width:650px; border-radius:4px; box-shadow:0 4px 15px rgba(0,0,0,0.3); overflow:hidden; font-family:Arial, sans-serif;">
      <div style="background:#0f2b46; color:#fff; padding:10px 15px; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:14px;">Varredura de Redes Sem Fio (AP Survey)</h3>
        <span style="cursor:pointer; font-weight:bold; font-size:16px;" id="btnCloseSurveyX">&times;</span>
      </div>
      <div style="padding:15px; max-height:400px; overflow-y:auto;">
        <p style="margin-bottom:10px; font-size:12px;">Selecione o ponto de acesso Wi-Fi que este roteador irá repetir:</p>
        <table class="data-table" style="font-size:11px;">
          <thead>
            <tr><th>#</th><th>Nome da Rede (SSID)</th><th>MAC (BSSID)</th><th>Sinal</th><th>Canal</th><th>Segurança</th><th>Ação</th></tr>
          </thead>
          <tbody>${surveyRows}</tbody>
        </table>
      </div>
      <div style="background:#f2f2f2; padding:8px 15px; text-align:right;">
        <button class="btn-tplink" id="btnCloseSurveyBtn">Fechar</button>
      </div>
    </div>
  `;

  modal.style.display = 'flex';

  const closeModal = () => { modal.style.display = 'none'; };
  modal.querySelector('#btnCloseSurveyX').addEventListener('click', closeModal);
  modal.querySelector('#btnCloseSurveyBtn').addEventListener('click', closeModal);

  // Delegação de eventos para seleção do ponto de acesso
  modal.querySelectorAll('.btn-select-ap').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      const chosenNet = appState.wdsSurvey[idx];
      if (typeof onSelect === 'function') onSelect(chosenNet);
      closeModal();
    });
  });
}