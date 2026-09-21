/**
 * BART-LINK Simulator — Vistas de Configurações Sem Fio (Wireless)
 */

import { appState, saveState } from '../../state.js';
import { openSurveyModal } from '../modal.js';
import { triggerReboot } from '../../services/networkSim.js';

export function renderWirelessView(container, onRefresh) {
  const w = appState.deviceData.wireless;

  container.innerHTML = `
    <div class="form-grid">
      <label>Nome da Rede (SSID):</label>
      <input type="text" id="wrSsid" value="${w.ssid}">

      <label>Modo:</label>
      <select id="wrMode">
        <option value="11bgn mixed" selected>11bgn misto (Recomendado)</option>
        <option value="11bg mixed">11bg misto</option>
        <option value="11n only">11n apenas</option>
      </select>

      <label>Largura do Canal:</label>
      <select id="wrWidth">
        <option value="Auto" ${w.channelWidth === 'Auto' ? 'selected' : ''}>Automático</option>
        <option value="20MHz" ${w.channelWidth === '20MHz' ? 'selected' : ''}>20MHz</option>
        <option value="40MHz" ${w.channelWidth === '40MHz' ? 'selected' : ''}>40MHz</option>
      </select>

      <label>Canal:</label>
      <select id="wrChan">
        <option value="Auto" ${w.channel === 'Auto' ? 'selected' : ''}>Automático</option>
        <option value="1" ${w.channel === '1' ? 'selected' : ''}>Canal 1</option>
        <option value="6" ${w.channel === '6' ? 'selected' : ''}>Canal 6</option>
        <option value="11" ${w.channel === '11' ? 'selected' : ''}>Canal 11</option>
      </select>

      <label>Habilitar Repetidor (WDS):</label>
      <div>
        <input type="checkbox" id="chkWds" ${w.wdsEnabled ? 'checked' : ''}>
        <span style="font-size:11px; color:#666;">(Conectar e repetir sinal de outro roteador sem fio)</span>
      </div>
    </div>

    <div id="wdsFieldsContainer" style="display: ${w.wdsEnabled ? 'block' : 'none'}; border: 1px solid #c2d5e3; background: #fdfdfd; padding: 12px; margin: 15px 0;">
      <h4 style="color:#004466; margin-bottom:10px;">Configurações do Enlace de Repetição (WDS Bridging)</h4>
      <div class="form-grid">
        <label>SSID (Rede Raiz):</label>
        <div>
          <input type="text" id="wdsSsid" placeholder="Nome do Wi-Fi raiz" value="${w.wdsSsid || ''}" style="width:200px;">
          <button class="btn-tplink" id="btnOpenSurvey">Buscar (Survey)</button>
        </div>

        <label>BSSID (MAC Raiz):</label>
        <input type="text" id="wdsBssid" placeholder="Ex: C0-4A-00-1E-5A-20" value="${w.wdsBssid || ''}">

        <label>Tipo de Chave:</label>
        <select id="wdsKeyType">
          <option value="WPA-PSK/WPA2-PSK" selected>WPA-PSK / WPA2-PSK</option>
          <option value="WEP">WEP</option>
          <option value="None">Nenhuma (Aberta)</option>
        </select>

        <label>Senha da Rede Raiz:</label>
        <input type="password" id="wdsKey" placeholder="Senha do Wi-Fi que será repetido" value="${w.wdsKey || ''}">
      </div>
      <p style="font-size:11px; color:#a00; margin-top:8px;">
        <strong>Atenção Didática:</strong> Ao habilitar o WDS, o roteador desativará o servidor DHCP local e ajustará o IP LAN para 192.168.0.254 para evitar conflito com o roteador principal.
      </p>
    </div>

    <button class="btn-tplink" id="btnSaveWirelessWds">SALVAR</button>
  `;

  const chkWds = container.querySelector('#chkWds');
  const wdsContainer = container.querySelector('#wdsFieldsContainer');
  chkWds.addEventListener('change', () => {
    wdsContainer.style.display = chkWds.checked ? 'block' : 'none';
  });

  container.querySelector('#btnOpenSurvey').addEventListener('click', () => {
    openSurveyModal((chosenNet) => {
      container.querySelector('#wdsSsid').value = chosenNet.ssid;
      container.querySelector('#wdsBssid').value = chosenNet.bssid;
      container.querySelector('#wrChan').value = chosenNet.channel.toString();
    });
  });

  container.querySelector('#btnSaveWirelessWds').addEventListener('click', () => {
    w.ssid = container.querySelector('#wrSsid').value;
    w.mode = container.querySelector('#wrMode').value;
    w.channelWidth = container.querySelector('#wrWidth').value;
    w.channel = container.querySelector('#wrChan').value;
    w.wdsEnabled = chkWds.checked;

    if (w.wdsEnabled) {
      w.wdsSsid = container.querySelector('#wdsSsid').value;
      w.wdsBssid = container.querySelector('#wdsBssid').value;
      w.wdsKey = container.querySelector('#wdsKey').value;
      appState.deviceData.lan.dhcpEnabled = false;
      appState.deviceData.lan.ip = '192.168.0.254';
    }

    triggerReboot('Sincronizando rádio Wi-Fi e estabelecendo enlace WDS...', () => {
      saveState();
      onRefresh();
    });
  });
}

export function renderWirelessSecView(container, onRefresh) {
  const w = appState.deviceData.wireless;

  container.innerHTML = `
    <div class="form-grid">
      <label>Opção de Segurança:</label>
      <select id="wrSecSelect">
        <option value="WPA-PSK/WPA2-PSK" ${w.security === 'WPA-PSK/WPA2-PSK' ? 'selected' : ''}>WPA/WPA2 - Pessoal (Recomendado)</option>
        <option value="WPA-Enterprise" ${w.security === 'WPA-Enterprise' ? 'selected' : ''}>WPA/WPA2 - Corporativo (Servidor RADIUS)</option>
        <option value="WEP" ${w.security === 'WEP' ? 'selected' : ''}>WEP (Legado 64/128-bit)</option>
        <option value="Disable Security" ${w.security === 'Disable Security' ? 'selected' : ''}>Desativar Segurança (Rede Aberta)</option>
      </select>
    </div>
    <div id="secFieldsContainer" style="margin-top:15px; border-top:1px dashed #ccc; padding-top:15px;"></div>
    <button class="btn-tplink" id="btnSaveSec" style="margin-top:15px;">SALVAR</button>
  `;

  const secSelect = container.querySelector('#wrSecSelect');
  const secContainer = container.querySelector('#secFieldsContainer');

  function renderSubFields(mode) {
    if (mode === 'WPA-PSK/WPA2-PSK') {
      secContainer.innerHTML = `
        <div class="form-grid">
          <label>Versão:</label>
          <select id="wpaVer">
            <option value="Automatic" selected>Automática (WPA-PSK ou WPA2-PSK)</option>
            <option value="WPA2-PSK">WPA2-PSK (AES Recomendado)</option>
          </select>

          <label>Criptografia:</label>
          <select id="wpaEnc">
            <option value="AES" selected>AES (Recomendado para 802.11n)</option>
            <option value="TKIP">TKIP</option>
          </select>

          <label>Senha da Rede (PSK):</label>
          <input type="text" id="wpaPass" value="${w.psk || '12345678'}">
        </div>
      `;
    } else if (mode === 'WPA-Enterprise') {
      secContainer.innerHTML = `
        <div class="form-grid">
          <label>IP do Servidor RADIUS:</label>
          <input type="text" id="radIp" value="192.168.0.250">

          <label>Porta UDP:</label>
          <input type="text" id="radPort" value="1812">

          <label>Chave Secreta Compartilhada:</label>
          <input type="password" id="radKey" value="radius_secret_key">
        </div>
      `;
    } else if (mode === 'WEP') {
      secContainer.innerHTML = `
        <div class="form-grid">
          <label>Chave WEP 128-bit:</label>
          <input type="text" id="wepKey1" value="1234567890ABCDEF1234567890">
        </div>
        <p style="color:#a00; font-size:11px; margin-top:8px;">Aviso: A criptografia WEP limita a velocidade máxima para 54Mbps.</p>
      `;
    } else {
      secContainer.innerHTML = `<p style="color:#a00; font-weight:bold;">Atenção: A rede ficará aberta sem nenhuma proteção por senha.</p>`;
    }
  }

  renderSubFields(w.security || 'WPA-PSK/WPA2-PSK');
  secSelect.addEventListener('change', (e) => renderSubFields(e.target.value));

  container.querySelector('#btnSaveSec').addEventListener('click', () => {
    w.security = secSelect.value;
    const pskEl = container.querySelector('#wpaPass');
    if (pskEl) w.psk = pskEl.value;

    triggerReboot('Gravando parâmetros de segurança na memória Flash...', () => {
      saveState();
      onRefresh();
    });
  });
}

export function renderMacFilterView(container, onRefresh) {
  const mf = appState.deviceData.wireless.macFilter || { enabled: false, rule: 'ALLOW', list: [] };

  const rows = (mf.list || []).map((m, idx) => `
    <tr>
      <td>${m.mac}</td>
      <td>${m.desc}</td>
      <td><strong style="color:green;">${m.status === 'Enabled' ? 'Ativo' : 'Inativo'}</strong></td>
      <td><button class="btn-tplink btn-del-mac" data-index="${idx}">Excluir</button></td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="form-grid">
      <label>Filtragem de MAC:</label>
      <div>
        <button class="btn-tplink" id="btnToggleMacFilter">${mf.enabled ? 'Desativar' : 'Ativar'}</button>
        <span style="font-weight:bold; margin-left:10px; color:${mf.enabled ? 'green' : '#666'}">${mf.enabled ? 'Habilitado' : 'Desabilitado'}</span>
      </div>

      <label>Regras de Acesso:</label>
      <div>
        <input type="radio" name="macRule" id="rAllow" value="ALLOW" ${mf.rule === 'ALLOW' ? 'checked' : ''}>
        <label for="rAllow">Permitir apenas os aparelhos listados abaixo (Lista Branca)</label><br>
        <input type="radio" name="macRule" id="rDeny" value="DENY" ${mf.rule === 'DENY' ? 'checked' : ''}>
        <label for="rDeny">Bloquear os aparelhos listados abaixo (Lista Negra)</label>
      </div>
    </div>

    <table class="data-table" style="margin-top:15px;">
      <thead><tr><th>Endereço MAC</th><th>Descrição / Aparelho</th><th>Status</th><th>Ação</th></tr></thead>
      <tbody>${rows.length > 0 ? rows : '<tr><td colspan="4" style="text-align:center;">Nenhum endereço MAC cadastrado.</td></tr>'}</tbody>
    </table>

    <h4 style="color:#004466; margin:15px 0 8px 0;">Adicionar Novo Endereço MAC</h4>
    <div class="form-grid">
      <label>Endereço MAC:</label>
      <input type="text" id="newFilterMac" placeholder="00-11-22-33-44-55">

      <label>Descrição:</label>
      <input type="text" id="newFilterDesc" placeholder="Ex: Celular_Aluno">
    </div>
    <button class="btn-tplink" id="btnAddMacEntry">ADICIONAR</button>
  `;

  container.querySelector('#btnToggleMacFilter').addEventListener('click', () => {
    mf.enabled = !mf.enabled;
    appState.deviceData.wireless.macFilter = mf;
    saveState();
    onRefresh();
  });

  container.querySelectorAll('input[name="macRule"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      mf.rule = e.target.value;
      appState.deviceData.wireless.macFilter = mf;
      saveState();
    });
  });

  container.querySelectorAll('.btn-del-mac').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      mf.list.splice(idx, 1);
      appState.deviceData.wireless.macFilter = mf;
      saveState();
      onRefresh();
    });
  });

  container.querySelector('#btnAddMacEntry').addEventListener('click', () => {
    const mac = container.querySelector('#newFilterMac').value.trim().toUpperCase();
    const desc = container.querySelector('#newFilterDesc').value.trim();
    if (!mac) return alert('Digite um endereço MAC válido.');

    mf.list.push({ mac, desc: desc || 'Dispositivo', status: 'Enabled' });
    appState.deviceData.wireless.macFilter = mf;
    saveState();
    onRefresh();
  });
}