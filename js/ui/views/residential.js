/**
 * BART-LINK Simulator — Vistas do Roteador Residencial (TL-WR841N)
 * Implementação completa: Clonagem de MAC, Servidores Virtuais, Host DMZ,
 * Controle de Banda (QoS), Controle dos Pais e Rede de Convidados.
 */

import { appState, saveState } from '../../state.js';
import { triggerReboot } from '../../services/networkSim.js';

export function renderResidentialView(tab, titleEl, container, onRefresh) {
  const d = appState.deviceData;
  if (!d) return;

  // ===========================================================================
  // 1. REDE > CLONAR MAC
  // ===========================================================================
  if (tab === 'wr_macclone') {
    titleEl.innerText = 'Clonagem de Endereço MAC';
    container.innerHTML = `
      <div class="form-grid">
        <label>Endereço MAC da WAN:</label>
        <input type="text" id="wrWanMac" value="${d.wan.mac}">

        <label>MAC da Placa do seu Computador:</label>
        <div>
          <input type="text" id="pcMacDisplay" value="6C-62-6D-F7-2E-82" disabled style="width:160px;">
          <button class="btn-tplink" id="btnCloneMac">Clonar MAC do PC</button>
          <button class="btn-tplink" id="btnRestoreMac">Restaurar MAC Padrão</button>
        </div>
      </div>
      <button class="btn-tplink" id="btnSaveMac">SALVAR</button>
    `;

    container.querySelector('#btnCloneMac').addEventListener('click', () => {
      container.querySelector('#wrWanMac').value = '6C-62-6D-F7-2E-82';
    });

    container.querySelector('#btnRestoreMac').addEventListener('click', () => {
      container.querySelector('#wrWanMac').value = 'F4-EC-38-B5-D2-46';
    });

    container.querySelector('#btnSaveMac').addEventListener('click', () => {
      d.wan.mac = container.querySelector('#wrWanMac').value.trim().toUpperCase();
      triggerReboot('Atualizando endereço MAC da WAN...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // ===========================================================================
  // 2. ENCAMINHAMENTO > SERVIDORES VIRTUAIS (PORT FORWARDING)
  // ===========================================================================
  if (tab === 'forwarding_vserver') {
    titleEl.innerText = 'Servidores Virtuais (Redirecionamento de Portas)';
    const vServers = d.forwarding?.virtualServers || [];
    const vRows = vServers.map((v, i) => `
      <tr>
        <td>${v.extPort}</td>
        <td>${v.intPort}</td>
        <td>${v.serverIp}</td>
        <td>${v.proto}</td>
        <td><strong style="color:green;">${v.status === 'Enabled' ? 'Ativo' : 'Inativo'}</strong></td>
        <td><button class="btn-tplink btn-del-vs" data-index="${i}">Excluir</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Porta Externa</th><th>Porta Interna</th><th>Endereço IP Local</th><th>Protocolo</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>${vRows.length > 0 ? vRows : '<tr><td colspan="6" style="text-align:center;">Nenhum redirecionamento cadastrado.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin: 15px 0 8px 0;">Adicionar Servidor Virtual</h4>
      <div class="form-grid">
        <label>Porta de Serviço (Externa):</label>
        <input type="text" id="vsExt" placeholder="80">

        <label>Porta Interna:</label>
        <input type="text" id="vsInt" placeholder="80">

        <label>IP do Servidor na LAN:</label>
        <input type="text" id="vsIp" placeholder="192.168.0.100">

        <label>Protocolo:</label>
        <select id="vsProto">
          <option value="ALL">TODOS</option>
          <option value="TCP">TCP</option>
          <option value="UDP">UDP</option>
        </select>
      </div>
      <button class="btn-tplink" id="btnAddVs">SALVAR REGRA</button>
    `;

    container.querySelectorAll('.btn-del-vs').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        d.forwarding.virtualServers.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddVs').addEventListener('click', () => {
      const ext = container.querySelector('#vsExt').value.trim();
      const intP = container.querySelector('#vsInt').value.trim();
      const ip = container.querySelector('#vsIp').value.trim();
      const proto = container.querySelector('#vsProto').value;

      if (!ext || !ip) return alert('Preencha a porta e o IP de destino.');
      if (!d.forwarding) d.forwarding = { virtualServers: [], dmz: { enabled: false, ip: '0.0.0.0' } };

      d.forwarding.virtualServers.push({
        extPort: ext,
        intPort: intP || ext,
        serverIp: ip,
        proto: proto,
        status: 'Enabled'
      });
      saveState();
      onRefresh();
    });
    return;
  }

  // ===========================================================================
  // 3. ENCAMINHAMENTO > HOSPEDEIRO DMZ
  // ===========================================================================
  if (tab === 'forwarding_dmz') {
    titleEl.innerText = 'Hospedeiro DMZ (Zona Desmilitarizada)';
    const dmz = d.forwarding?.dmz || { enabled: false, ip: '0.0.0.0' };
    container.innerHTML = `
      <div class="form-grid">
        <label>Status do Host DMZ:</label>
        <div>
          <input type="radio" name="dmzSt" id="dmzEn" value="true" ${dmz.enabled ? 'checked' : ''}> <label for="dmzEn">Habilitar</label>
          <input type="radio" name="dmzSt" id="dmzDis" value="false" ${!dmz.enabled ? 'checked' : ''}> <label for="dmzDis">Desabilitar</label>
        </div>

        <label>Endereço IP na LAN:</label>
        <input type="text" id="txtDmzIp" value="${dmz.ip}" placeholder="192.168.0.x">
      </div>
      <button class="btn-tplink" id="btnSaveDmz">SALVAR</button>
    `;

    container.querySelector('#btnSaveDmz').addEventListener('click', () => {
      if (!d.forwarding) d.forwarding = { virtualServers: [], dmz: { enabled: false, ip: '0.0.0.0' } };
      d.forwarding.dmz.enabled = container.querySelector('#dmzEn').checked;
      d.forwarding.dmz.ip = container.querySelector('#txtDmzIp').value.trim();

      triggerReboot('Atualizando configurações de host DMZ...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // ===========================================================================
  // 4. REDE DE CONVIDADOS
  // ===========================================================================
  if (tab === 'guest') {
    titleEl.innerText = 'Rede Sem Fio para Convidados (Guest Network)';
    const gn = d.guestNetwork || { enabled: false, ssid: 'TP-LINK_GUEST', allowLanAccess: false };
    container.innerHTML = `
      <div class="form-grid">
        <label>Habilitar Rede de Convidados:</label>
        <input type="checkbox" id="chkGuestEnable" ${gn.enabled ? 'checked' : ''}>

        <label>Nome da Rede (SSID):</label>
        <input type="text" id="guestSsid" value="${gn.ssid}">

        <label>Permitir Acesso à Rede Local (LAN):</label>
        <input type="checkbox" id="chkGuestLan" ${gn.allowLanAccess ? 'checked' : ''}>
      </div>
      <button class="btn-tplink" id="btnSaveGuest">SALVAR</button>
    `;

    container.querySelector('#btnSaveGuest').addEventListener('click', () => {
      if (!d.guestNetwork) d.guestNetwork = { enabled: false, ssid: 'TP-LINK_GUEST', allowLanAccess: false };
      d.guestNetwork.enabled = container.querySelector('#chkGuestEnable').checked;
      d.guestNetwork.ssid = container.querySelector('#guestSsid').value;
      d.guestNetwork.allowLanAccess = container.querySelector('#chkGuestLan').checked;

      triggerReboot('Atualizando Rede de Convidados...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // ===========================================================================
  // 5. CONTROLE DOS PAIS
  // ===========================================================================
  if (tab === 'parental') {
    titleEl.innerText = 'Controle dos Pais (Filtro por Aparelho e Domínio)';
    const pc = d.parentalControl || { enabled: false, parentMac: '50-E5-49-C8-E2-7A', rules: [] };
    const ruleRows = (pc.rules || []).map((r, i) => `
      <tr>
        <td>${r.childMac}</td>
        <td>${r.desc}</td>
        <td>${r.domain}</td>
        <td><strong style="color:green;">${r.status === 'Enabled' ? 'Ativo' : 'Inativo'}</strong></td>
        <td><button class="btn-tplink btn-del-parent" data-index="${i}">Excluir</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="form-grid">
        <label>Habilitar Controle dos Pais:</label>
        <input type="checkbox" id="chkParentalEnable" ${pc.enabled ? 'checked' : ''}>

        <label>Endereço MAC do Computador dos Pais:</label>
        <input type="text" id="txtParentMac" value="${pc.parentMac}">
      </div>

      <table class="data-table" style="margin-top:15px;">
        <thead><tr><th>MAC do Filho</th><th>Descrição</th><th>Site / Domínio Permitido</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>${ruleRows.length > 0 ? ruleRows : '<tr><td colspan="5" style="text-align:center;">Nenhuma regra cadastrada.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin: 15px 0 8px 0;">Adicionar Regra de Controle dos Pais</h4>
      <div class="form-grid">
        <label>MAC do Aparelho do Filho:</label>
        <input type="text" id="childMacInput" placeholder="00-11-22-33-44-AA">

        <label>Descrição:</label>
        <input type="text" id="childDescInput" placeholder="Ex: Celular Filho">

        <label>Domínio Autorizado:</label>
        <input type="text" id="childDomainInput" placeholder="Ex: www.escola.com.br">
      </div>
      <button class="btn-tplink" id="btnAddParental">ADICIONAR REGRA</button>
    `;

    container.querySelector('#chkParentalEnable').addEventListener('change', (e) => {
      if (!d.parentalControl) d.parentalControl = { enabled: false, parentMac: '50-E5-49-C8-E2-7A', rules: [] };
      d.parentalControl.enabled = e.target.checked;
      saveState();
    });

    container.querySelector('#txtParentMac').addEventListener('change', (e) => {
      if (!d.parentalControl) d.parentalControl = { enabled: false, parentMac: '50-E5-49-C8-E2-7A', rules: [] };
      d.parentalControl.parentMac = e.target.value.trim().toUpperCase();
      saveState();
    });

    container.querySelectorAll('.btn-del-parent').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        d.parentalControl.rules.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddParental').addEventListener('click', () => {
      const mac = container.querySelector('#childMacInput').value.trim().toUpperCase();
      const desc = container.querySelector('#childDescInput').value.trim();
      const domain = container.querySelector('#childDomainInput').value.trim();

      if (!mac || !domain) return alert('Preencha o MAC e o domínio autorizado.');
      if (!d.parentalControl) d.parentalControl = { enabled: true, parentMac: '50-E5-49-C8-E2-7A', rules: [] };

      d.parentalControl.rules.push({
        childMac: mac,
        desc: desc || 'Dispositivo',
        domain: domain,
        status: 'Enabled'
      });
      saveState();
      onRefresh();
    });
    return;
  }

  // ===========================================================================
  // 6. CONTROLE DE BANDA (QoS)
  // ===========================================================================
  if (tab === 'bandwidth_control') {
    titleEl.innerText = 'Controle de Banda e Qualidade de Serviço (QoS)';
    const qos = d.bandwidthControl || { enabled: false, egress: 1024, ingress: 10240, rules: [] };
    container.innerHTML = `
      <div class="form-grid">
        <label>Habilitar Controle de Banda:</label>
        <input type="checkbox" id="chkQosEn" ${qos.enabled ? 'checked' : ''}>

        <label>Banda Máxima de Envio (Upload Kbps):</label>
        <input type="text" id="txtEgress" value="${qos.egress}">

        <label>Banda Máxima de Recepção (Download Kbps):</label>
        <input type="text" id="txtIngress" value="${qos.ingress}">
      </div>
      <button class="btn-tplink" id="btnSaveQos">SALVAR</button>
    `;

    container.querySelector('#btnSaveQos').addEventListener('click', () => {
      if (!d.bandwidthControl) d.bandwidthControl = { enabled: false, egress: 1024, ingress: 10240, rules: [] };
      d.bandwidthControl.enabled = container.querySelector('#chkQosEn').checked;
      d.bandwidthControl.egress = parseInt(container.querySelector('#txtEgress').value, 10);
      d.bandwidthControl.ingress = parseInt(container.querySelector('#txtIngress').value, 10);

      triggerReboot('Aplicando regras de controle de banda (QoS)...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }
}