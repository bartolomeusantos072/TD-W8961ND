/**
 * BART-LINK Simulator — Motor do Switch Gerenciável L2 (TL-SG3210 / JetStream)
 * Implementação: Matriz Interativa 802.1Q, Configuração de PVID, Tabela CAM Dinâmica,
 * Simulador de Tráfego de Quadros Ethernet (ASIC Engine) e Teste Virtual de Cabo (VCT).
 */

import { appState, saveState } from '../../state.js';
import { triggerReboot } from '../../services/networkSim.js';

export function renderSwitchView(tab, titleEl, container, onRefresh) {
  const d = appState.deviceData;
  if (!d) return;

  // Garante estruturas caso venha de um json enxuto
  if (!d.ports) {
    d.ports = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1, status: i < 4 ? 'Up' : 'Down', speed: '1000M', duplex: 'Full', pvid: 1
    }));
  }
  if (!d.vlans) {
    d.vlans = [
      { vid: 1, name: 'Default', tagged: [], untagged: [1, 2, 3, 4, 5, 6, 7, 8] }
    ];
  }
  if (!d.macTable) d.macTable = [];

  // ===========================================================================
  // 1. STATUS E PAINEL VISUAL DE PORTAS
  // ===========================================================================
  if (tab === 'switch_ports') {
    titleEl.innerText = 'Painel de Portas Físicas e Configuração de PVID';

    const badges = d.ports.map(p => `
      <div style="border: 2px solid ${p.status === 'Up' ? '#10b981' : '#64748b'}; background: ${p.status === 'Up' ? '#ecfdf5' : '#f1f5f9'}; border-radius: 6px; padding: 8px 12px; min-width: 70px; text-align: center;">
        <div style="font-weight: bold; font-size: 13px; color: #1e293b;">Porta ${p.id}</div>
        <div style="font-size: 11px; font-weight: bold; color: ${p.status === 'Up' ? '#059669' : '#94a3b8'};">${p.status === 'Up' ? 'LINK UP' : 'DOWN'}</div>
        <div style="font-size: 10px; color: #475569;">${p.status === 'Up' ? p.speed : '---'}</div>
        <div style="font-size: 11px; margin-top: 4px; background: #e2e8f0; border-radius: 3px; font-weight: bold; color: #0284c7;">PVID: ${p.pvid}</div>
      </div>
    `).join('');

    const rows = d.ports.map((p, idx) => `
      <tr>
        <td><strong>Porta ${p.id}</strong></td>
        <td>
          <select class="p-status" data-idx="${idx}">
            <option value="Up" ${p.status === 'Up' ? 'selected' : ''}>Conectada (Cabo Plugado)</option>
            <option value="Down" ${p.status === 'Down' ? 'selected' : ''}>Desconectada (Sem Link)</option>
          </select>
        </td>
        <td>
          <select class="p-speed" data-idx="${idx}">
            <option value="1000M" ${p.speed === '1000M' ? 'selected' : ''}>1000 Mbps (Gigabit Full)</option>
            <option value="100M" ${p.speed === '100M' ? 'selected' : ''}>100 Mbps (Fast Ethernet)</option>
            <option value="10M" ${p.speed === '10M' ? 'selected' : ''}>10 Mbps (Legado)</option>
          </select>
        </td>
        <td>
          <input type="number" class="p-pvid" data-idx="${idx}" value="${p.pvid}" min="1" max="4094" style="width: 60px;">
        </td>
        <td>
          <span style="font-size: 11px; color: #666;">
            ${p.pvid === 1 ? 'VLAN Padrão' : `Tráfego untagged entrará na VLAN ${p.pvid}`}
          </span>
        </td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div style="display: flex; gap: 10px; flex-wrap: wrap; background: #0f172a; padding: 15px; border-radius: 8px; margin-bottom: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.5);">
        ${badges}
      </div>

      <table class="data-table">
        <thead><tr><th>Porta</th><th>Estado Físico</th><th>Velocidade Negociada</th><th>PVID (Port VLAN ID)</th><th>Comportamento no Ingresso</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <button class="btn-tplink" id="btnSaveSwitchPorts" style="margin-top: 15px;">SALVAR PORTAS E PVID</button>
    `;

    container.querySelector('#btnSaveSwitchPorts').addEventListener('click', () => {
      d.ports.forEach((p, idx) => {
        p.status = container.querySelector(`.p-status[data-idx="${idx}"]`).value;
        p.speed = container.querySelector(`.p-speed[data-idx="${idx}"]`).value;
        p.pvid = parseInt(container.querySelector(`.p-pvid[data-idx="${idx}"]`).value, 10) || 1;
      });

      triggerReboot('Atualizando transceptores e tabela PVID na memória ASIC...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // ===========================================================================
  // 2. MATRIZ DE VLAN 802.1Q INTERATIVA
  // ===========================================================================
  if (tab === 'switch_vlan') {
    titleEl.innerText = 'Segmentação de Redes — VLAN 802.1Q (Tabela de Membros)';

    // Gera o cabeçalho das portas
    let portHeaders = d.ports.map(p => `<th style="text-align:center; width:45px;">P${p.id}</th>`).join('');

    // Gera as linhas da matriz de cada VLAN
    let vlanMatrixRows = d.vlans.map((v, vIdx) => {
      let cells = d.ports.map(p => {
        let isTagged = v.tagged.includes(p.id);
        let isUntagged = v.untagged.includes(p.id);
        let label = isTagged ? 'TAG' : (isUntagged ? 'UNTAG' : '---');
        let color = isTagged ? '#2563eb' : (isUntagged ? '#059669' : '#94a3b8');
        let bg = isTagged ? '#dbeafe' : (isUntagged ? '#d1fae5' : '#f8fafc');

        return `
          <td style="text-align:center; padding: 4px;">
            <button class="btn-matrix-port" data-vlan="${vIdx}" data-port="${p.id}" style="border: 1px solid ${color}; background: ${bg}; color: ${color}; font-weight: bold; font-size: 10px; width: 100%; padding: 4px 2px; border-radius: 3px; cursor: pointer;">
              ${label}
            </button>
          </td>
        `;
      }).join('');

      return `
        <tr>
          <td><strong>VID ${v.vid}</strong></td>
          <td>${v.name}</td>
          ${cells}
          <td>${v.vid === 1 ? '<span style="color:#888;">Padrão</span>' : `<button class="btn-tplink btn-del-vlan" data-idx="${vIdx}">Excluir</button>`}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 10px; margin-bottom: 15px; font-size: 11px;">
        <strong>Instruções Didáticas:</strong> Clique no botão da porta correspondente para alternar o modo:
        <span style="color:#059669; font-weight:bold; margin: 0 6px;">[UNTAG] = Modo Acesso (PCs, Servidores)</span> | 
        <span style="color:#2563eb; font-weight:bold; margin: 0 6px;">[TAG] = Modo Trunk (Ligação com Roteador ou outro Switch)</span> | 
        <span style="color:#64748b; font-weight:bold; margin: 0 6px;">[---] = Não Pertence</span>
      </div>

      <table class="data-table" style="font-size: 11px;">
        <thead>
          <tr>
            <th>VID</th>
            <th>Nome</th>
            ${portHeaders}
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>${vlanMatrixRows}</tbody>
      </table>

      <button class="btn-tplink" id="btnSaveMatrix" style="margin-top: 15px;">GRAVAR MATRIZ 802.1Q</button>

      <hr style="margin: 25px 0; border: none; border-top: 1px solid #cbd5e1;">

      <h4 style="color:#004466; margin-bottom: 10px;">Adicionar Nova VLAN</h4>
      <div class="form-grid">
        <label>VLAN ID (VID 2 a 4094):</label>
        <input type="number" id="txtNewVid" placeholder="Ex: 10" min="2" max="4094">

        <label>Nome Descritivo da VLAN:</label>
        <input type="text" id="txtNewVlanName" placeholder="Ex: Financeiro_Lab">
      </div>
      <button class="btn-tplink" id="btnCreateVlan">CRIAR VLAN</button>
    `;

    // Interatividade da matriz de portas (Ciclo: Untagged -> Tagged -> None -> Untagged)
    container.querySelectorAll('.btn-matrix-port').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const vlanIdx = parseInt(btn.getAttribute('data-vlan'), 10);
        const portId = parseInt(btn.getAttribute('data-port'), 10);
        const targetVlan = d.vlans[vlanIdx];

        const isUntagged = targetVlan.untagged.includes(portId);
        const isTagged = targetVlan.tagged.includes(portId);

        if (isUntagged) {
          targetVlan.untagged = targetVlan.untagged.filter(p => p !== portId);
          targetVlan.tagged.push(portId);
        } else if (isTagged) {
          targetVlan.tagged = targetVlan.tagged.filter(p => p !== portId);
        } else {
          // Remover de outras untagged se for entrar como untagged aqui (regra de ouro 802.1Q: 1 porta só pode ter 1 untagged)
          d.vlans.forEach(v => {
            v.untagged = v.untagged.filter(p => p !== portId);
          });
          targetVlan.untagged.push(portId);
        }
        saveState();
        renderSwitchView('switch_vlan', titleEl, container, onRefresh);
      });
    });

    container.querySelectorAll('.btn-del-vlan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        d.vlans.splice(idx, 1);
        saveState();
        renderSwitchView('switch_vlan', titleEl, container, onRefresh);
      });
    });

    container.querySelector('#btnCreateVlan').addEventListener('click', () => {
      const vid = parseInt(container.querySelector('#txtNewVid').value, 10);
      const name = container.querySelector('#txtNewVlanName').value.trim();

      if (!vid || vid < 2 || vid > 4094) return alert('VID inválido. Escolha um número entre 2 e 4094.');
      if (d.vlans.some(v => v.vid === vid)) return alert(`A VLAN ${vid} já existe.`);
      if (!name) return alert('Dê um nome para a VLAN.');

      d.vlans.push({ vid, name, tagged: [], untagged: [] });
      saveState();
      renderSwitchView('switch_vlan', titleEl, container, onRefresh);
    });

    container.querySelector('#btnSaveMatrix').addEventListener('click', () => {
      triggerReboot('Gravando partições de portas 802.1Q na memória CAM...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // ===========================================================================
  // 3. TABELA MAC (CAM) COM APRENDIZAGEM MANUAL E DINÂMICA
  // ===========================================================================
  if (tab === 'switch_mactable') {
    titleEl.innerText = 'Tabela de Encaminhamento MAC (Tabela CAM)';

    const rows = d.macTable.map((m, i) => `
      <tr>
        <td><strong>${m.mac}</strong></td>
        <td>VLAN ${m.vid}</td>
        <td>Porta ${m.port}</td>
        <td><strong style="color: ${m.type === 'Static' ? '#0066cc' : '#10b981'};">${m.type}</strong></td>
        <td><button class="btn-tplink btn-del-mac-cam" data-idx="${i}">Excluir</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <p style="font-size: 11px; color: #555; margin-bottom: 12px;">
        A tabela CAM associa o endereço físico dos dispositivos com a porta física de entrada e a VLAN correspondente.
      </p>

      <table class="data-table">
        <thead><tr><th>Endereço MAC</th><th>VLAN ID</th><th>Porta Física</th><th>Tipo</th><th>Ação</th></tr></thead>
        <tbody>${rows.length > 0 ? rows : '<tr><td colspan="5" style="text-align:center;">Tabela CAM vazia (Nenhum frame comutado ainda).</td></tr>'}</tbody>
      </table>

      <div style="margin-top: 15px;">
        <button class="btn-tplink" id="btnClearCam">LIMPAR TABELA CAM</button>
      </div>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Adicionar Entrada Estática na Tabela CAM</h4>
      <div class="form-grid">
        <label>Endereço MAC:</label>
        <input type="text" id="camMac" placeholder="00-11-22-33-44-AA">

        <label>VLAN ID:</label>
        <select id="camVid">${d.vlans.map(v => `<option value="${v.vid}">VLAN ${v.vid} (${v.name})</option>`).join('')}</select>

        <label>Porta Física:</label>
        <select id="camPort">${d.ports.map(p => `<option value="${p.id}">Porta ${p.id}</option>`).join('')}</select>
      </div>
      <button class="btn-tplink" id="btnAddStaticCam">TRAVAR ENTRADA NA CAM</button>
    `;

    container.querySelector('#btnClearCam').addEventListener('click', () => {
      d.macTable = [];
      saveState();
      onRefresh();
    });

    container.querySelectorAll('.btn-del-mac-cam').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        d.macTable.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddStaticCam').addEventListener('click', () => {
      const mac = container.querySelector('#camMac').value.trim().toUpperCase();
      const vid = parseInt(container.querySelector('#camVid').value, 10);
      const port = parseInt(container.querySelector('#camPort').value, 10);

      if (!mac) return alert('Digite um endereço MAC.');

      d.macTable.push({ mac, vid, port, type: 'Static' });
      saveState();
      onRefresh();
    });
    return;
  }

  // ===========================================================================
  // 4. SIMULADOR DE ENCAMINHAMENTO DE QUADROS (O "CORAÇÃO" DA AULA)
  // ===========================================================================
  if (tab === 'switch_simulator') {
    titleEl.innerText = 'Laboratório Interativo — Motor de Decisão L2 (ASIC Frame Forwarding)';

    container.innerHTML = `
      <div style="background:#f1f5f9; padding:12px; border-radius:6px; font-size:11px; margin-bottom:15px; border-left:4px solid #2563eb;">
        <strong>Finalidade Didática:</strong> Injete um quadro Ethernet em uma porta e veja o Switch tomar as decisões reais de Camada 2: Aprendizado de MAC, Verificação de Isolamento de VLAN, Encaminhamento Unicast, Inundação (Flooding) ou Descarte (Drop).
      </div>

      <div class="form-grid">
        <label>Porta de Entrada (Ingresso):</label>
        <select id="simInPort">
          ${d.ports.map(p => `<option value="${p.id}">Porta ${p.id} (PVID ${p.pvid} - Link${p.status})</option>`).join('')}
        </select>

        <label>Endereço MAC de Origem:</label>
        <input type="text" id="simSrcMac" value="00-AA-BB-11-22-33" placeholder="Ex: 00-AA-BB-11-22-33">

        <label>Endereço MAC de Destino:</label>
        <input type="text" id="simDstMac" value="FF-FF-FF-FF-FF-FF" placeholder="Ex: FF-FF-FF-FF-FF-FF (Broadcast)">

        <label>Tag 802.1Q no Quadro Recebido:</label>
        <select id="simTag">
          <option value="none">Sem Tag (Quadro Não-Identificado / Acesso)</option>
          ${d.vlans.map(v => `<option value="${v.vid}">Com Tag 802.1Q (VID ${v.vid})</option>`).join('')}
        </select>
      </div>

      <button class="btn-tplink" id="btnRunSwitchSimulation" style="margin-top:15px;">DISPARAR QUADRO NA REDE</button>

      <div id="simLogConsole" style="background:#0f172a; color:#38bdf8; padding:15px; margin-top:20px; font-family:Consolas, monospace; font-size:11px; min-height:160px; border-radius:6px; line-height: 1.6;">
        > Aguardando disparo do quadro para processamento pelo Switch ASIC...
      </div>
    `;

    container.querySelector('#btnRunSwitchSimulation').addEventListener('click', () => {
      const inPortId = parseInt(container.querySelector('#simInPort').value, 10);
      const srcMac = container.querySelector('#simSrcMac').value.trim().toUpperCase();
      const dstMac = container.querySelector('#simDstMac').value.trim().toUpperCase();
      const tagVal = container.querySelector('#simTag').value;
      const consoleEl = container.querySelector('#simLogConsole');

      const inPort = d.ports.find(p => p.id === inPortId);

      consoleEl.innerHTML = `<strong>[ASIC INGRESSO]</strong> Quadro recebido na Porta Física ${inPortId} ...<br>`;

      // 1. Checa Link Físico
      if (inPort.status !== 'Up') {
        consoleEl.innerHTML += `<span style="color:#ef4444;">[ERRO FÍSICO] A Porta ${inPortId} está DESCONECTADA (Link Down). O quadro foi perdido.</span><br>`;
        return;
      }

      // 2. Determina a VLAN do Quadro
      let frameVid = null;
      if (tagVal === 'none') {
        frameVid = inPort.pvid;
        consoleEl.innerHTML += `> Quadro chegou sem tag 802.1Q. Switch aplica o PVID nativo da porta: <strong>VLAN ${frameVid}</strong>.<br>`;
      } else {
        frameVid = parseInt(tagVal, 10);
        consoleEl.innerHTML += `> Quadro chegou com cabeçalho 802.1Q Tag: <strong>VLAN ${frameVid}</strong>.<br>`;
        // Checa se a porta aceita esse VID tagged
        const vlanObj = d.vlans.find(v => v.vid === frameVid);
        if (!vlanObj || (!vlanObj.tagged.includes(inPortId) && !vlanObj.untagged.includes(inPortId))) {
          consoleEl.innerHTML += `<span style="color:#ef4444;">[INGRESS DROP] A Porta ${inPortId} não é membro da VLAN ${frameVid}. Quadro descartado por violação 802.1Q.</span><br>`;
          return;
        }
      }

      // 3. Aprendizagem de Endereço MAC (Learning)
      const existingMac = d.macTable.find(m => m.mac === srcMac && m.vid === frameVid);
      if (!existingMac) {
        d.macTable.push({ mac: srcMac, vid: frameVid, port: inPortId, type: 'Dynamic' });
        consoleEl.innerHTML += `> <span style="color:#4ade80;">[MAC LEARNING]</span> Novo endereço aprendido: MAC ${srcMac} vinculado à Porta ${inPortId} na VLAN ${frameVid}.<br>`;
        saveState();
      } else if (existingMac.port !== inPortId) {
        consoleEl.innerHTML += `> <span style="color:#f59e0b;">[MAC MOVE]</span> Endereço ${srcMac} mudou da Porta ${existingMac.port} para a Porta ${inPortId}. Tabela CAM atualizada.<br>`;
        existingMac.port = inPortId;
        saveState();
      } else {
        consoleEl.innerHTML += `> MAC de origem ${srcMac} já registrado na CAM para esta porta.<br>`;
      }

      // 4. Decisão de Encaminhamento (Forwarding Engine)
      const targetVlan = d.vlans.find(v => v.vid === frameVid);
      const isBroadcast = dstMac === 'FF-FF-FF-FF-FF-FF';

      consoleEl.innerHTML += `<br><strong>[TABELA DE DECISÃO EGRESSO - VLAN ${frameVid}]</strong><br>`;

      if (isBroadcast) {
        consoleEl.innerHTML += `> Destino é BROADCAST. Executando inundação (Flooding) apenas para as portas da VLAN ${frameVid} (exceto porta de origem P${inPortId}):<br>`;
        let forwardedCount = 0;

        d.ports.forEach(p => {
          if (p.id === inPortId || p.status !== 'Up') return;
          const isUntag = targetVlan.untagged.includes(p.id);
          const isTag = targetVlan.tagged.includes(p.id);

          if (isUntag) {
            consoleEl.innerHTML += `  -> Encaminhado para <strong>Porta ${p.id}</strong>: <span style="color:#4ade80;">Removida a tag (Quadro Normal/Access)</span><br>`;
            forwardedCount++;
          } else if (isTag) {
            consoleEl.innerHTML += `  -> Encaminhado para <strong>Porta ${p.id}</strong>: <span style="color:#38bdf8;">Mantida a Tag 802.1Q (VID ${frameVid})</span><br>`;
            forwardedCount++;
          }
        });

        if (forwardedCount === 0) {
          consoleEl.innerHTML += `  <em>Nenhuma outra porta ativa na VLAN ${frameVid} para receber a inundação.</em><br>`;
        }
      } else {
        // Procura destino na CAM
        const destEntry = d.macTable.find(m => m.mac === dstMac && m.vid === frameVid);

        if (destEntry) {
          if (destEntry.port === inPortId) {
            consoleEl.innerHTML += `<span style="color:#f59e0b;">[FILTERING DROP] O destino ${dstMac} está na mesma porta de origem (Porta ${inPortId}). Quadro filtrado.</span><br>`;
          } else {
            const outPort = d.ports.find(p => p.id === destEntry.port);
            if (outPort.status !== 'Up') {
              consoleEl.innerHTML += `<span style="color:#ef4444;">[DROP] A porta de destino ${destEntry.port} está Desconectada.</span><br>`;
            } else {
              const isTag = targetVlan.tagged.includes(destEntry.port);
              consoleEl.innerHTML += `> <span style="color:#4ade80;">[UNICAST FORWARDING]</span> MAC encontrado na Tabela CAM!<br>`;
              consoleEl.innerHTML += `  -> Encaminhado exclusivamente para a <strong>Porta ${destEntry.port}</strong> (${isTag ? 'Trunk com Tag VID ' + frameVid : 'Acesso sem Tag'}).<br>`;
            }
          }
        } else {
          consoleEl.innerHTML += `> Destino ${dstMac} DESCONHECIDO na VLAN ${frameVid} (Unknown Unicast). Inundando todas as portas membros da VLAN para descobrir o host...<br>`;
        }
      }
    });
    return;
  }
}