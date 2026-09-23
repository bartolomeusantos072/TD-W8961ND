/**
 * BART-LINK Simulator — Vista Avançada do Netgate / pfSense Plus
 * Inclui Motor de Inspeção Stateful, Injetor de Pacotes e Tabela de Estados Dinâmica.
 */

import { appState, saveState } from '../../state.js';
import { triggerReboot } from '../../services/networkSim.js';

let activeInterfaceTab = 'lan';

// Tabela volátil de conexões ativas inspecionadas pelo motor stateful
export const liveStateTable = [
  { id: 1, proto: 'tcp', src: '192.168.1.50:52410', dst: '189.40.10.1:443', state: 'ESTABLISHED:ESTABLISHED', age: '00:04:12' },
  { id: 2, proto: 'udp', src: '192.168.1.100:61120', dst: '8.8.8.8:53', state: 'SINGLE:MULTIPLE', age: '00:00:18' }
];

export function renderPfsenseView(tab, titleEl, container, onRefresh) {
  const d = appState.deviceData;
  if (!d) return;

  // ===========================================================================
  // 1. DASHBOARD & SYSTEM INFORMATION
  // ===========================================================================
  if (tab === 'pf_dashboard') {
    titleEl.innerText = 'pfSense+ — Dashboard do Sistema';

    const ifaces = d.interfaces;
    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-top: 3px solid #0284c7; padding: 14px; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 13px;">System Information</h4>
          <table class="data-table" style="font-size: 11px;">
            <tbody>
              <tr><td width="130">Hostname / Domain:</td><td><strong>${d.system.hostname}.${d.system.domain}</strong></td></tr>
              <tr><td>Versão / OS:</td><td>${d.firmware}</td></tr>
              <tr><td>Hardware:</td><td>${d.hardware}</td></tr>
              <tr><td>Uptime:</td><td>${d.system.uptime}</td></tr>
              <tr><td>Uso de CPU / RAM:</td><td>${d.system.cpuUsage} | ${d.system.memoryUsage}</td></tr>
              <tr><td>State Table Size:</td><td><strong style="color: #16a34a;">${liveStateTable.length} / 200000</strong></td></tr>
            </tbody>
          </table>
        </div>

        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-top: 3px solid #10b981; padding: 14px; border-radius: 4px;">
          <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 13px;">Interfaces Status</h4>
          <table class="data-table" style="font-size: 11px;">
            <thead><tr><th>Interface</th><th>Status</th><th>Endereço IP</th><th>Sub-rede</th></tr></thead>
            <tbody>
              <tr><td><strong>WAN</strong></td><td><span style="color:#16a34a; font-weight:bold;">UP</span></td><td>${ifaces.wan.ip}</td><td>${ifaces.wan.subnet}</td></tr>
              <tr><td><strong>LAN</strong></td><td><span style="color:#16a34a; font-weight:bold;">UP</span></td><td>${ifaces.lan.ip}</td><td>${ifaces.lan.subnet}</td></tr>
              <tr><td><strong>OPT1 (DMZ)</strong></td><td><span style="color:#16a34a; font-weight:bold;">UP</span></td><td>${ifaces.opt1.ip}</td><td>${ifaces.opt1.subnet}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
    return;
  }

  // ===========================================================================
  // 2. FIREWALL > RULES (GESTÃO COMPLETA)
  // ===========================================================================
  if (tab === 'pf_rules') {
    titleEl.innerText = 'pfSense+ — Firewall > Rules';

    const currentRules = d.rules[activeInterfaceTab] || [];
    const ruleRows = currentRules.map((r, idx) => `
      <tr>
        <td style="text-align: center;">
          <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${r.action === 'pass' ? '#22c55e' : '#ef4444'};" title="${r.action.toUpperCase()}"></span>
        </td>
        <td><strong>${r.proto}</strong></td>
        <td>${r.source}</td>
        <td>${r.port}</td>
        <td>${r.dest}</td>
        <td>${r.destPort || '*'}</td>
        <td>${r.desc}</td>
        <td><button class="btn-tplink btn-del-pfrule" data-idx="${idx}">Del</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div style="display: flex; gap: 4px; margin-bottom: 12px; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px;">
        <button class="btn-pf-tab" data-tab="wan" style="padding: 5px 14px; font-size: 11px; cursor: pointer; background:${activeInterfaceTab === 'wan' ? '#0284c7' : '#e2e8f0'}; color:${activeInterfaceTab === 'wan' ? '#fff' : '#000'}; border:none; border-radius:3px; font-weight:bold;">WAN (${d.rules.wan.length})</button>
        <button class="btn-pf-tab" data-tab="lan" style="padding: 5px 14px; font-size: 11px; cursor: pointer; background:${activeInterfaceTab === 'lan' ? '#0284c7' : '#e2e8f0'}; color:${activeInterfaceTab === 'lan' ? '#fff' : '#000'}; border:none; border-radius:3px; font-weight:bold;">LAN (${d.rules.lan.length})</button>
        <button class="btn-pf-tab" data-tab="opt1" style="padding: 5px 14px; font-size: 11px; cursor: pointer; background:${activeInterfaceTab === 'opt1' ? '#0284c7' : '#e2e8f0'}; color:${activeInterfaceTab === 'opt1' ? '#fff' : '#000'}; border:none; border-radius:3px; font-weight:bold;">DMZ / OPT1 (${d.rules.opt1.length})</button>
      </div>

      <div style="background:#f8fafc; border-left:4px solid #0284c7; padding:8px; margin-bottom:12px; font-size:11px;">
        <strong>Conceito de Filtragem de Pacotes:</strong> As regras são processadas sequencialmente no sentido de entrada (Ingress) da interface selecionada. A primeira regra que coincidir encerra a avaliação.
      </div>

      <table class="data-table">
        <thead><tr><th>Ação</th><th>Proto</th><th>Origem</th><th>Porta</th><th>Destino</th><th>Porta Dest.</th><th>Descrição</th><th>Ação</th></tr></thead>
        <tbody>${ruleRows.length > 0 ? ruleRows : '<tr><td colspan="8" style="text-align:center;">Nenhuma regra configurada nesta interface.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Adicionar Regra em ${activeInterfaceTab.toUpperCase()}</h4>
      <div class="form-grid">
        <label>Ação (Action):</label>
        <select id="selPfAction">
          <option value="pass">Pass (Permitir tráfego)</option>
          <option value="block">Block (Descarte silencioso)</option>
        </select>

        <label>Protocolo:</label>
        <select id="selPfProto">
          <option value="IPv4 TCP">TCP</option>
          <option value="IPv4 UDP">UDP</option>
          <option value="IPv4 TCP/UDP">TCP/UDP</option>
          <option value="IPv4 ICMP">ICMP (Ping)</option>
          <option value="IPv4 *">Qualquer (IPv4 Any)</option>
        </select>

        <label>Origem (Source):</label>
        <input type="text" id="txtPfSrc" value="${activeInterfaceTab.toUpperCase()} net">

        <label>Destino (Destination):</label>
        <input type="text" id="txtPfDst" placeholder="* ou IP/Alias">

        <label>Porta de Destino:</label>
        <input type="text" id="txtPfPort" placeholder="* ou 80, 443">

        <label>Descrição:</label>
        <input type="text" id="txtPfDesc" placeholder="Ex: Liberar tráfego HTTP">
      </div>
      <button class="btn-tplink" id="btnAddPfRule" style="margin-top:10px;">SAVE RULE</button>
    `;

    container.querySelectorAll('.btn-pf-tab').forEach(b => {
      b.addEventListener('click', (e) => {
        activeInterfaceTab = e.target.getAttribute('data-tab');
        onRefresh();
      });
    });

    container.querySelectorAll('.btn-del-pfrule').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-idx'), 10);
        d.rules[activeInterfaceTab].splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddPfRule').addEventListener('click', () => {
      const act = container.querySelector('#selPfAction').value;
      const proto = container.querySelector('#selPfProto').value;
      const src = container.querySelector('#txtPfSrc').value.trim() || '*';
      const dst = container.querySelector('#txtPfDst').value.trim() || '*';
      const port = container.querySelector('#txtPfPort').value.trim() || '*';
      const desc = container.querySelector('#txtPfDesc').value.trim() || 'Custom Rule';

      d.rules[activeInterfaceTab].push({
        id: d.rules[activeInterfaceTab].length + 1,
        action: act, proto, source: src, port: '*', dest: dst, destPort: port, desc
      });
      saveState();
      onRefresh();
    });
    return;
  }

  // ===========================================================================
  // 3. DIAGNOSTICS > PACKET SIMULATOR & STATE ENGINE (NOVO MOTOR)
  // ===========================================================================
  if (tab === 'pf_pkt_sim') {
    titleEl.innerText = 'pfSense+ — Laboratório de Injeção de Pacotes & State Engine';

    const stateRows = liveStateTable.map(st => `
      <tr>
        <td><strong>${st.proto.toUpperCase()}</strong></td>
        <td><code>${st.src}</code></td>
        <td><code>${st.dst}</code></td>
        <td><strong style="color:#16a34a;">${st.state}</strong></td>
        <td>${st.age}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div style="background:#f8fafc; border-left:4px solid #10b981; padding:10px; margin-bottom:15px; font-size:11px;">
        <strong>Conceito Didático (Stateful Filtering):</strong> Quando um pacote é aprovado por uma regra com ação <em>Pass</em>, uma entrada de retorno é criada na <strong>Tabela de Estados</strong>. As respostas vindas da internet não precisam de regras adicionais de entrada na WAN.
      </div>

      <div style="background: #0f172a; color: #fff; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <h4 style="color: #38bdf8; margin: 0 0 10px 0; font-size: 13px;">Injetor de Pacote de Rede</h4>
        <div class="form-grid" style="grid-template-columns: 140px 1fr 140px 1fr; gap: 8px;">
          <label style="color:#cbd5e1;">Interface de Entrada:</label>
          <select id="simInIface" style="background:#1e293b; color:#fff; border:1px solid #475569; padding:4px;">
            <option value="lan">LAN (Rede Corporativa)</option>
            <option value="opt1">OPT1 (DMZ Servidores)</option>
            <option value="wan">WAN (Internet Externa)</option>
          </select>

          <label style="color:#cbd5e1;">Protocolo:</label>
          <select id="simProto" style="background:#1e293b; color:#fff; border:1px solid #475569; padding:4px;">
            <option value="TCP">TCP</option>
            <option value="UDP">UDP</option>
            <option value="ICMP">ICMP</option>
          </select>

          <label style="color:#cbd5e1;">IP de Origem:</label>
          <input type="text" id="simSrcIp" value="192.168.1.50" style="background:#1e293b; color:#fff; border:1px solid #475569; padding:4px;">

          <label style="color:#cbd5e1;">IP de Destino:</label>
          <input type="text" id="simDstIp" value="172.16.50.10" style="background:#1e293b; color:#fff; border:1px solid #475569; padding:4px;">

          <label style="color:#cbd5e1;">Porta de Destino:</label>
          <input type="text" id="simDstPort" value="80" style="background:#1e293b; color:#fff; border:1px solid #475569; padding:4px;">
        </div>

        <button class="btn-tplink" id="btnTestPacket" style="background:#0284c7; margin-top:12px; width:100%;">TESTAR PASSAGEM DO PACOTE</button>
        <div id="simLogResult" style="margin-top:12px; font-family:monospace; font-size:11px; display:none;"></div>
      </div>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Tabela de Estados Ativos do Firewall (Live State Table)</h4>
      <table class="data-table">
        <thead><tr><th>Protocolo</th><th>Origem (Local)</th><th>Destino (Remoto)</th><th>Estado da Conexão</th><th>Tempo</th></tr></thead>
        <tbody>${stateRows}</tbody>
      </table>
    `;

    container.querySelector('#btnTestPacket').addEventListener('click', () => {
      const iface = container.querySelector('#simInIface').value;
      const proto = container.querySelector('#simProto').value;
      const src = container.querySelector('#simSrcIp').value.trim();
      const dst = container.querySelector('#simDstIp').value.trim();
      const port = container.querySelector('#simDstPort').value.trim();
      const res = container.querySelector('#simLogResult');
      res.style.display = 'block';

      const rules = d.rules[iface] || [];
      let matchRule = null;
      let ruleIndex = -1;

      for (let i = 0; i < rules.length; i++) {
        const r = rules[i];
        const protoMatch = r.proto.includes(proto) || r.proto.includes('*');
        const portMatch = r.destPort === '*' || !r.destPort || r.destPort.includes(port);

        // Validação de IP / Sub-rede simplificada
        let dstMatch = (r.dest === '*' || r.dest.includes(dst));
        if (r.dest === 'LAN net' && dst.startsWith('192.168.1.')) dstMatch = true;
        if (r.dest === 'DMZ net' && dst.startsWith('172.16.50.')) dstMatch = true;

        if (protoMatch && portMatch && dstMatch) {
          matchRule = r;
          ruleIndex = i + 1;
          break;
        }
      }

      if (!matchRule || matchRule.action === 'block') {
        const motivo = matchRule ? `Bloqueado pela regra #${ruleIndex}: [${matchRule.desc}]` : 'Descartado pelo Bloqueio Implícito Padrão (Default Deny)';
        res.innerHTML = `
          <div style="background:#450a0a; border-left:4px solid #ef4444; padding:10px; color:#fca5a5;">
            <strong>[DROP / BLOCKED]</strong> O pacote ${proto} ${src} &rarr; ${dst}:${port} foi rejeitado na interface ${iface.toUpperCase()}.<br>
            Motivo: ${motivo}
          </div>
        `;
      } else {
        // Regra aprovada: cria entrada na tabela de estados
        const randPort = Math.floor(10000 + Math.random() * 50000);
        liveStateTable.unshift({
          id: liveStateTable.length + 1,
          proto: proto.toLowerCase(),
          src: `${src}:${randPort}`,
          dst: `${dst}:${port}`,
          state: 'ESTABLISHED:ESTABLISHED',
          age: '00:00:01'
        });

        res.innerHTML = `
          <div style="background:#052e16; border-left:4px solid #22c55e; padding:10px; color:#86efac;">
            <strong>[PASS / ALLOWED]</strong> Pacote aprovado pela Regra #${ruleIndex} (${matchRule.desc})!<br>
            Uma nova entrada de estado bilateral foi criada na tabela de conexão.
          </div>
        `;
        setTimeout(() => onRefresh(), 2200);
      }
    });
    return;
  }

  // ===========================================================================
  // 4. FIREWALL > ALIASES
  // ===========================================================================
  if (tab === 'pf_aliases') {
    titleEl.innerText = 'pfSense+ — Firewall > Aliases';

    const aliasRows = d.aliases.map((a, idx) => `
      <tr>
        <td><strong>${a.name}</strong></td>
        <td>${a.type}</td>
        <td><code>${a.values}</code></td>
        <td>${a.desc}</td>
        <td><button class="btn-tplink btn-del-alias" data-idx="${idx}">Del</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Nome do Alias</th><th>Tipo</th><th>Valores</th><th>Descrição</th><th>Ação</th></tr></thead>
        <tbody>${aliasRows.length > 0 ? aliasRows : '<tr><td colspan="5" style="text-align:center;">Nenhum Alias configurado.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Criar Novo Alias</h4>
      <div class="form-grid">
        <label>Nome:</label>
        <input type="text" id="txtAliasName" placeholder="Ex: Servidores_Web">

        <label>Tipo:</label>
        <select id="selAliasType">
          <option value="Host(s)">Host(s) (Endereços IP)</option>
          <option value="Port(s)">Port(s) (Portas de Serviço)</option>
        </select>

        <label>Valores (Separados por vírgula):</label>
        <input type="text" id="txtAliasValues" placeholder="Ex: 80, 443, 8080">

        <label>Descrição:</label>
        <input type="text" id="txtAliasDesc" placeholder="Descrição do grupo">
      </div>
      <button class="btn-tplink" id="btnAddAlias" style="margin-top:10px;">SAVE ALIAS</button>
    `;

    container.querySelectorAll('.btn-del-alias').forEach(b => {
      b.addEventListener('click', () => {
        const idx = parseInt(b.getAttribute('data-idx'), 10);
        d.aliases.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddAlias').addEventListener('click', () => {
      const name = container.querySelector('#txtAliasName').value.trim();
      const type = container.querySelector('#selAliasType').value;
      const values = container.querySelector('#txtAliasValues').value.trim();
      const desc = container.querySelector('#txtAliasDesc').value.trim();
      if (!name || !values) return alert('Preencha nome e valores.');

      d.aliases.push({ name, type, values, desc });
      saveState();
      onRefresh();
    });
    return;
  }

  // ===========================================================================
  // 5. VPN > OPENVPN
  // ===========================================================================
  if (tab === 'pf_openvpn') {
    titleEl.innerText = 'pfSense+ — VPN > OpenVPN Server';
    const vpn = d.vpn.openvpn;

    const clientRows = vpn.activeClients.map(c => `
      <tr>
        <td><strong>${c.user}</strong></td>
        <td><code>${c.virtualIp}</code></td>
        <td>${c.realIp}</td>
        <td>${c.connectedSince}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="form-grid">
        <label>Servidor OpenVPN:</label>
        <input type="checkbox" id="chkPfVpnEnable" ${vpn.enabled ? 'checked' : ''}>

        <label>Modo de Conexão:</label>
        <input type="text" value="${vpn.mode}" disabled>

        <label>Protocolo e Porta:</label>
        <input type="text" value="${vpn.protocol} : ${vpn.port}" disabled>

        <label>Rede do Túnel:</label>
        <input type="text" id="txtPfTunnel" value="${vpn.tunnelNetwork}">
      </div>
      <button class="btn-tplink" id="btnSavePfVpn" style="margin-top:10px;">SAVE OPENVPN</button>

      <h4 style="color:#004466; margin: 25px 0 10px 0;">Clientes Conectados</h4>
      <table class="data-table">
        <thead><tr><th>Utilizador</th><th>IP Virtual</th><th>IP Real</th><th>Tempo</th></tr></thead>
        <tbody>${clientRows}</tbody>
      </table>
    `;

    container.querySelector('#btnSavePfVpn').addEventListener('click', () => {
      vpn.enabled = container.querySelector('#chkPfVpnEnable').checked;
      vpn.tunnelNetwork = container.querySelector('#txtPfTunnel').value.trim();
      saveState();
      onRefresh();
    });
    return;
  }
}