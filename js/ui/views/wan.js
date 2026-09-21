/**
 * BART-LINK Simulator — Vistas de WAN, Multi-WAN, Encaminhamento e Ferramentas
 */

import { appState, saveState } from '../../state.js';
import { triggerReboot, runNetworkDiagnostic } from '../../services/networkSim.js';

export function renderWanView(tab, titleEl, container, onRefresh) {
  const d = appState.deviceData;

  // --- LAN & DHCP ---
  if (tab === 'network_lan') {
    titleEl.innerText = 'Configurações de Rede Local (LAN) e DHCP';
    container.innerHTML = `
      <div class="form-grid">
        <label>Endereço IP (Gateway Local):</label>
        <input type="text" id="inputLanIp" value="${d.lan.ip}">

        <label>Máscara de Sub-rede:</label>
        <input type="text" id="inputLanMask" value="${d.lan.netmask}">

        <label>Servidor DHCP:</label>
        <select id="selectDhcp">
          <option value="true" ${d.lan.dhcpEnabled ? 'selected' : ''}>Habilitado</option>
          <option value="false" ${!d.lan.dhcpEnabled ? 'selected' : ''}>Desabilitado</option>
        </select>
      </div>
      <button class="btn-tplink" id="btnSaveLan">SALVAR</button>
    `;

    container.querySelector('#btnSaveLan').addEventListener('click', () => {
      d.lan.ip = container.querySelector('#inputLanIp').value;
      d.lan.netmask = container.querySelector('#inputLanMask').value;
      d.lan.dhcpEnabled = container.querySelector('#selectDhcp').value === 'true';

      triggerReboot('Salvando parâmetros de LAN e reiniciando DHCP...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // --- WAN ROTEADOR RESIDENCIAL ---
  if (tab === 'wr_wan') {
    titleEl.innerText = 'Configuração da Interface WAN (Internet)';
    container.innerHTML = `
      <div class="form-grid">
        <label>Tipo de Conexão WAN:</label>
        <select id="wrWanType">
          <option value="Dynamic IP" ${d.wan.type === 'Dynamic IP' ? 'selected' : ''}>IP Dinâmico (DHCP)</option>
          <option value="Static IP" ${d.wan.type === 'Static IP' ? 'selected' : ''}>IP Estático (Fixo)</option>
          <option value="PPPoE" ${d.wan.type === 'PPPoE' ? 'selected' : ''}>PPPoE (Usuário e Senha)</option>
        </select>

        <label>Endereço IP:</label>
        <input type="text" id="wrWanIp" value="${d.wan.ip}" ${d.wan.type === 'Dynamic IP' ? 'disabled' : ''}>

        <label>Máscara de Sub-rede:</label>
        <input type="text" id="wrWanMask" value="${d.wan.netmask || '255.255.255.0'}" ${d.wan.type === 'Dynamic IP' ? 'disabled' : ''}>

        <label>Gateway Padrão:</label>
        <input type="text" id="wrWanGw" value="${d.wan.gateway || '192.168.1.1'}" ${d.wan.type === 'Dynamic IP' ? 'disabled' : ''}>
      </div>
      <button class="btn-tplink" id="btnSaveWrWan">SALVAR</button>
    `;

    const selectType = container.querySelector('#wrWanType');
    const ipInput = container.querySelector('#wrWanIp');
    const maskInput = container.querySelector('#wrWanMask');
    const gwInput = container.querySelector('#wrWanGw');

    selectType.addEventListener('change', () => {
      const isStatic = selectType.value === 'Static IP';
      ipInput.disabled = !isStatic;
      maskInput.disabled = !isStatic;
      gwInput.disabled = !isStatic;
    });

    container.querySelector('#btnSaveWrWan').addEventListener('click', () => {
      d.wan.type = selectType.value;
      d.wan.ip = ipInput.value;
      d.wan.netmask = maskInput.value;
      d.wan.gateway = gwInput.value;
      d.wan.status = 'Connected';

      triggerReboot('Reconectando interface WAN...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // --- MULTI-WAN TL-R470T+ ---
  if (tab === 'network_wan' && d.type === 'loadbalance') {
    titleEl.innerText = 'Configuração das Portas WAN';
    const wanConfigs = d.wans.slice(0, d.wanPortsCount).map(w => `
      <div style="border: 1px solid #c2d5e3; padding: 10px; margin-bottom: 12px; background: #f9fbfd;">
        <h4 style="color:#004466; margin-bottom:8px;">Parâmetros da Porta WAN ${w.id}</h4>
        <div class="form-grid">
          <label>Tipo de Conexão:</label>
          <select class="sel-wan-type" data-id="${w.id}">
            <option value="Dynamic IP" ${w.type === 'Dynamic IP' ? 'selected' : ''}>IP Dinâmico (DHCP)</option>
            <option value="Static IP" ${w.type === 'Static IP' ? 'selected' : ''}>IP Estático</option>
            <option value="PPPoE" ${w.type === 'PPPoE' ? 'selected' : ''}>PPPoE</option>
          </select>

          <label>Endereço IP:</label>
          <input type="text" id="wanIp_${w.id}" value="${w.ip}" ${w.type === 'Dynamic IP' ? 'disabled' : ''}>

          <label>Banda de Envio (Upload Kbps):</label>
          <input type="text" id="wanUp_${w.id}" value="${w.upstream || 100000}">

          <label>Banda de Recepção (Download Kbps):</label>
          <input type="text" id="wanDown_${w.id}" value="${w.downstream || 100000}">
        </div>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="form-grid" style="margin-bottom:15px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
        <label>Quantidade de Portas WAN Ativas:</label>
        <select id="selWanCount">
          <option value="1" ${d.wanPortsCount === 1 ? 'selected' : ''}>1 Porta WAN (WAN1)</option>
          <option value="2" ${d.wanPortsCount === 2 ? 'selected' : ''}>2 Portas WAN (WAN1, WAN2)</option>
          <option value="3" ${d.wanPortsCount === 3 ? 'selected' : ''}>3 Portas WAN (WAN1 a WAN3)</option>
          <option value="4" ${d.wanPortsCount === 4 ? 'selected' : ''}>4 Portas WAN (WAN1 a WAN4)</option>
        </select>
      </div>
      <div id="wanListContainer">${wanConfigs}</div>
      <button class="btn-tplink" id="btnSaveMultiWan">SALVAR TODAS AS WANs</button>
    `;

    container.querySelector('#selWanCount').addEventListener('change', (e) => {
      d.wanPortsCount = parseInt(e.target.value, 10);
      saveState();
      onRefresh();
    });

    container.querySelector('#btnSaveMultiWan').addEventListener('click', () => {
      const count = d.wanPortsCount;
      d.wans.forEach((w, idx) => {
        if (idx < count) {
          const typeEl = container.querySelector(`.sel-wan-type[data-id="${w.id}"]`);
          const ipEl = container.querySelector(`#wanIp_${w.id}`);
          const upEl = container.querySelector(`#wanUp_${w.id}`);
          const downEl = container.querySelector(`#wanDown_${w.id}`);

          if (typeEl) w.type = typeEl.value;
          if (ipEl && w.type !== 'Dynamic IP') w.ip = ipEl.value;
          if (upEl) w.upstream = parseInt(upEl.value, 10);
          if (downEl) w.downstream = parseInt(downEl.value, 10);
          w.status = 'Connected';
        } else {
          w.status = 'Disabled';
          w.ip = '0.0.0.0';
        }
      });

      triggerReboot('Aplicando portas Multi-WAN...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // --- DIAGNÓSTICOS (PING & TRACEROUTE) ---
  if (tab === 'diag_tools') {
    titleEl.innerText = 'Diagnósticos de Rede (Ping e Traceroute)';
    container.innerHTML = `
      <div class="form-grid">
        <label>Ferramenta de Diagnóstico:</label>
        <select id="diagTool">
          <option value="ping">Ping (Eco ICMP)</option>
          <option value="traceroute">Traceroute (Rastreamento de Saltos)</option>
        </select>

        <label>Endereço de Destino (IP / Domínio):</label>
        <input type="text" id="diagTarget" value="8.8.8.8" placeholder="Ex: 8.8.8.8 ou google.com">

        <label>Interface de Saída:</label>
        <select id="diagIface">
          <option value="WAN1">WAN1 (Internet)</option>
          <option value="LAN">LAN (Rede Local)</option>
        </select>
      </div>
      <button class="btn-tplink" id="btnRunDiag">INICIAR TESTE</button>
      
      <div id="diagConsole" style="background:#111; color:#00ff66; padding:12px; margin-top:15px; font-family:monospace; font-size:11px; min-height:100px; border-radius:3px;">
        Console de diagnósticos pronto. Clique em INICIAR TESTE.
      </div>
    `;

    container.querySelector('#btnRunDiag').addEventListener('click', () => {
      runNetworkDiagnostic({
        tool: container.querySelector('#diagTool').value,
        target: container.querySelector('#diagTarget').value.trim(),
        iface: container.querySelector('#diagIface').value,
        outputElement: container.querySelector('#diagConsole')
      });
    });
    return;
  }

  // Seção Padrão de aviso para abas em transição
  titleEl.innerText = 'Configurações';
  container.innerHTML = `<p>Configurações gravadas e sincronizadas.</p>`;
}