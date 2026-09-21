/**
 * BART-LINK Simulator — Vista do Repetidor Wi-Fi (TL-WA850RE)
 * Configuração de Enlace Raiz, Indicador LED de Posicionamento e Modos de Operação.
 */

import { appState, saveState } from '../../state.js';
import { triggerReboot } from '../../services/networkSim.js';
import { openSurveyModal } from '../modal.js';

export function renderExtenderView(tab, titleEl, container, onRefresh) {
  const d = appState.deviceData;
  if (!d) return;

  // --- 1. STATUS E MEDIDOR DE SINAL DOS LEDS ---
  if (tab === 'extender_status') {
    titleEl.innerText = 'Status de Operação e Posicionamento (Smart Signal)';

    const sig = d.uplink.signalPercent;
    let ledColor = '#3b82f6'; // azul característico
    let qualityMsg = 'Desconectado da Rede Raiz';

    if (d.uplink.connected) {
      if (sig >= 60) {
        qualityMsg = 'Ótimo Posicionamento (Conexão Estável)';
      } else if (sig >= 30) {
        qualityMsg = 'Aviso: Sinal Fraco! Aproxime o repetidor do roteador principal.';
        ledColor = '#f59e0b';
      } else {
        qualityMsg = 'Crítico: Sinal Insuficiente! Risco alto de desconexão e latência alta.';
        ledColor = '#ef4444';
      }
    }

    // Representação dos 5 LEDs circulares frontais do WA850RE
    const ledsCount = d.uplink.connected ? Math.ceil((sig / 100) * 5) : 0;
    const ringLeds = [1, 2, 3, 4, 5].map(i => `
      <div style="width: 16px; height: 16px; border-radius: 50%; background: ${i <= ledsCount ? ledColor : '#334155'}; box-shadow: ${i <= ledsCount ? '0 0 8px ' + ledColor : 'none'};"></div>
    `).join('');

    container.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; background:#0f172a; color:#fff; padding:20px; border-radius:8px; margin-bottom:20px;">
        <div>
          <div style="font-size:16px; font-weight:bold; margin-bottom:4px;">Anel Indicador de Sinal (Smart LED)</div>
          <div style="font-size:12px; color:${d.uplink.connected ? '#38bdf8' : '#94a3b8'};">${qualityMsg}</div>
          <div style="font-size:11px; margin-top:8px; color:#cbd5e1;">Potência Captada da Base: <strong>${d.uplink.connected ? sig + '%' : '0%'}</strong></div>
        </div>
        <div style="display:flex; gap:8px; background:#1e293b; padding:12px 18px; border-radius:24px; border:1px solid #475569;">
          ${ringLeds}
        </div>
      </div>

      <table class="data-table">
        <thead><tr><th colspan="2">Conexão com a Rede Sem Fio Principal (Uplink)</th></tr></thead>
        <tbody>
          <tr><td width="220">Status do Enlace:</td><td><strong>${d.uplink.connected ? '<span style="color:green;">Conectado e Estendido</span>' : '<span style="color:#ef4444;">Sem Conexão</span>'}</strong></td></tr>
          <tr><td>Nome da Rede Principal (SSID):</td><td>${d.uplink.ssid || '<em>Nenhuma selecionada</em>'}</td></tr>
          <tr><td>Endereço MAC da Base (BSSID):</td><td>${d.uplink.bssid || '---'}</td></tr>
          <tr><td>Canal de Frequência:</td><td>${d.uplink.channel || '---'}</td></tr>
        </tbody>
      </table>

      <table class="data-table" style="margin-top:15px;">
        <thead><tr><th colspan="2">Rede Sem Fio Estendida (Re-transmissão)</th></tr></thead>
        <tbody>
          <tr><td width="220">Nome da Rede Estendida (SSID):</td><td><strong>${d.extendedWireless.ssid}</strong></td></tr>
          <tr><td>Modo de Operação:</td><td>${d.mode === 'RangeExtender' ? 'Repetidor de Sinal Sem Fio' : 'Ponto de Acesso Cabeado (AP)'}</td></tr>
          <tr><td>IP Local do Repetidor:</td><td>${d.lan.ip} (Acesso ao painel administrativo)</td></tr>
        </tbody>
      </table>
    `;
    return;
  }

  // --- 2. ASSISTENTE DE CONFIGURAÇÃO RÁPIDA (SURVEY E EMPARELHAMENTO) ---
  if (tab === 'extender_wizard') {
    titleEl.innerText = 'Assistente de Conexão Rápida';

    container.innerHTML = `
      <div style="background:#f8fafc; border-left:4px solid #0284c7; padding:12px; margin-bottom:15px; font-size:12px;">
        Conecte o repetidor à rede Wi-Fi principal selecionando-a na lista de varredura (Survey) e fornecendo a palavra-passe do roteador.
      </div>

      <div class="form-grid">
        <label>Rede Principal a Repetir:</label>
        <div>
          <input type="text" id="extRootSsid" placeholder="Nome da rede principal" value="${d.uplink.ssid}" style="width:200px;">
          <button class="btn-tplink" id="btnExtSurvey">Buscar Redes (Survey)</button>
        </div>

        <label>MAC da Base (BSSID):</label>
        <input type="text" id="extRootBssid" placeholder="MAC do roteador" value="${d.uplink.bssid}">

        <label>Senha do Wi-Fi Principal:</label>
        <input type="password" id="extRootKey" placeholder="Palavra-passe da rede original" value="${d.extendedWireless.key}">

        <label>Nome do Novo Wi-Fi Estendido:</label>
        <div>
          <input type="radio" name="extSsidOpt" id="optSame" ${d.extendedWireless.copyRootSsid ? 'checked' : ''}>
          <label for="optSame">Copiar SSID da Base (Mesmo Nome - Roaming)</label><br>
          <input type="radio" name="extSsidOpt" id="optCustom" ${!d.extendedWireless.copyRootSsid ? 'checked' : ''}>
          <label for="optCustom">Personalizar Nome:</label>
          <input type="text" id="extCustomSsid" value="${d.extendedWireless.ssid}" style="width:160px; margin-left:6px;" ${d.extendedWireless.copyRootSsid ? 'disabled' : ''}>
        </div>
      </div>

      <button class="btn-tplink" id="btnSaveExtenderWizard" style="margin-top:20px;">CONECTAR E REINICIAR</button>
    `;

    const optSame = container.querySelector('#optSame');
    const optCustom = container.querySelector('#optCustom');
    const customInput = container.querySelector('#extCustomSsid');
    const rootSsidInput = container.querySelector('#extRootSsid');

    optSame.addEventListener('change', () => {
      customInput.disabled = true;
      customInput.value = rootSsidInput.value;
    });

    optCustom.addEventListener('change', () => {
      customInput.disabled = false;
    });

    container.querySelector('#btnExtSurvey').addEventListener('click', () => {
      openSurveyModal((chosen) => {
        rootSsidInput.value = chosen.ssid;
        container.querySelector('#extRootBssid').value = chosen.bssid;
        d.uplink.channel = chosen.channel;

        // Calcula uma porcentagem aproximada de sinal baseada no RSSI
        const rssiVal = parseInt(chosen.rssi, 10) || -60;
        d.uplink.signalPercent = Math.min(100, Math.max(10, Math.round((rssiVal + 100) * 1.8)));

        if (optSame.checked) customInput.value = chosen.ssid;
      });
    });

    container.querySelector('#btnSaveExtenderWizard').addEventListener('click', () => {
      const ssid = rootSsidInput.value.trim();
      const key = container.querySelector('#extRootKey').value.trim();

      if (!ssid) return alert('Selecione ou digite o nome da rede principal.');
      if (!key) return alert('Digite a senha da rede principal para o repetidor autenticar.');

      d.uplink.ssid = ssid;
      d.uplink.bssid = container.querySelector('#extRootBssid').value.trim();
      d.extendedWireless.key = key;
      d.extendedWireless.copyRootSsid = optSame.checked;
      d.extendedWireless.ssid = optSame.checked ? ssid : customInput.value.trim();
      d.uplink.connected = true;

      triggerReboot('Sincronizando rádio e estabelecendo enlace com a rede raiz...', () => {
        saveState();
        appState.activeTab = 'extender_status';
        onRefresh();
      });
    });
    return;
  }

  // --- 3. MODO DE OPERAÇÃO (RANGE EXTENDER VS ACCESS POINT) ---
  if (tab === 'extender_mode') {
    titleEl.innerText = 'Modo de Operação do Equipamento';

    container.innerHTML = `
      <div class="form-grid">
        <label>Modo de Funcionamento:</label>
        <div>
          <input type="radio" name="devMode" id="mExt" value="RangeExtender" ${d.mode === 'RangeExtender' ? 'checked' : ''}>
          <label for="mExt"><strong>Modo Repetidor (Range Extender):</strong> Estende a cobertura sem fios existente captando o sinal pelo ar.</label>
          <br><br>
          <input type="radio" name="devMode" id="mAp" value="AccessPoint" ${d.mode === 'AccessPoint' ? 'checked' : ''}>
          <label for="mAp"><strong>Modo Ponto de Acesso (Access Point):</strong> Transforma uma rede cabeada existente (ligada na porta Ethernet) em sinal sem fios.</label>
        </div>
      </div>
      <button class="btn-tplink" id="btnSaveMode" style="margin-top:20px;">ALTERAR MODO</button>
    `;

    container.querySelector('#btnSaveMode').addEventListener('click', () => {
      const selected = container.querySelector('input[name="devMode"]:checked').value;
      d.mode = selected;

      triggerReboot(`Alterando sistema para ${selected === 'RangeExtender' ? 'Modo Repetidor' : 'Modo Access Point'}...`, () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }
}