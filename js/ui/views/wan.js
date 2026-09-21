/**
 * BART-LINK Simulator — Vistas de WAN, Multi-WAN, Transmissão, Firewall e Logs
 */

import { appState, saveState } from '../../state.js';
import { triggerReboot, runNetworkDiagnostic } from '../../services/networkSim.js';

export function renderWanView(tab, titleEl, container, onRefresh) {
  const d = appState.deviceData;
  if (!d) return;

  // --- 1. REDE > LAN E DHCP ---
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

  // --- 2. REDE > WAN (TL-WR841N) ---
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

  // --- 3. REDE > WAN (MULTI-WAN TL-R470T+) ---
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

  // --- 4. TRANSMISSÃO > BALANCEAMENTO (LOAD BALANCE) ---
  if (tab === 'trans_loadbalance' && d.type === 'loadbalance') {
    titleEl.innerText = 'Configurações de Balanceamento de Carga';
    const lb = d.transmission.loadBalancing;
    container.innerHTML = `
      <div class="form-grid">
        <label>Ativar Balanceamento de Carga:</label>
        <input type="checkbox" id="chkLbEnable" ${lb.enabled ? 'checked' : ''}>

        <label>Roteamento Otimizado por Aplicação:</label>
        <input type="checkbox" id="chkAppOpt" ${lb.appOptimized ? 'checked' : ''}>

        <label>Balanceamento Baseado na Largura de Banda:</label>
        <input type="checkbox" id="chkBwBased" ${lb.bandwidthBased ? 'checked' : ''}>
      </div>
      <button class="btn-tplink" id="btnSaveLb">SALVAR</button>
    `;

    container.querySelector('#btnSaveLb').addEventListener('click', () => {
      lb.enabled = container.querySelector('#chkLbEnable').checked;
      lb.appOptimized = container.querySelector('#chkAppOpt').checked;
      lb.bandwidthBased = container.querySelector('#chkBwBased').checked;

      triggerReboot('Salvando regras de Load Balance...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // --- 5. TRANSMISSÃO > REDUNDÂNCIA (LINK BACKUP / FAILOVER) ---
  if (tab === 'trans_linkbackup' && d.type === 'loadbalance') {
    titleEl.innerText = 'Redundância e Contingência de Links (Failover)';
    const bk = d.transmission.linkBackup;
    container.innerHTML = `
      <div class="form-grid">
        <label>Habilitar Redundância de Link:</label>
        <input type="checkbox" id="chkBackupEnable" ${bk.enabled ? 'checked' : ''}>

        <label>Link Principal:</label>
        <select id="selPrimaryWan">
          <option value="WAN1" ${bk.primaryWan === 'WAN1' ? 'selected' : ''}>WAN1</option>
          <option value="WAN2" ${bk.primaryWan === 'WAN2' ? 'selected' : ''}>WAN2</option>
        </select>

        <label>Link de Backup (Contingência):</label>
        <select id="selBackupWan">
          <option value="WAN2" ${bk.backupWan === 'WAN2' ? 'selected' : ''}>WAN2</option>
          <option value="WAN1" ${bk.backupWan === 'WAN1' ? 'selected' : ''}>WAN1</option>
        </select>
      </div>
      <button class="btn-tplink" id="btnSaveBackup">SALVAR</button>
    `;

    container.querySelector('#btnSaveBackup').addEventListener('click', () => {
      bk.enabled = container.querySelector('#chkBackupEnable').checked;
      bk.primaryWan = container.querySelector('#selPrimaryWan').value;
      bk.backupWan = container.querySelector('#selBackupWan').value;

      triggerReboot('Salvando redundância de links...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // --- 6. TRANSMISSÃO > ROTEAMENTO POR REGRA (POLICY ROUTING) ---
  if (tab === 'trans_policyroute' && d.type === 'loadbalance') {
    titleEl.innerText = 'Roteamento Baseado em Políticas';
    const routeRows = d.transmission.policyRouting.map((r, i) => `
      <tr>
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.service}</td>
        <td>${r.sourceIp}</td>
        <td><strong>${r.wan}</strong></td>
        <td><button class="btn-tplink btn-del-route" data-index="${i}">Excluir</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th>#</th><th>Nome da Regra</th><th>Serviço</th><th>Faixa IP de Origem</th><th>WAN de Saída</th><th>Ação</th></tr></thead>
        <tbody>${routeRows.length > 0 ? routeRows : '<tr><td colspan="6" style="text-align:center;">Nenhuma regra configurada.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin: 15px 0 8px 0;">Adicionar Rota por Política</h4>
      <div class="form-grid">
        <label>Nome da Regra:</label>
        <input type="text" id="polName" placeholder="Ex: Web_Direto">

        <label>Tipo de Serviço:</label>
        <select id="polService">
          <option value="HTTP">HTTP (Porta 80)</option>
          <option value="HTTPS">HTTPS (Porta 443)</option>
          <option value="ALL">TODOS os Serviços</option>
        </select>

        <label>Faixa IP de Origem:</label>
        <input type="text" id="polSrc" placeholder="Ex: 192.168.0.10-192.168.0.50">

        <label>Forçar Saída pela WAN:</label>
        <select id="polWan">
          <option value="WAN1">WAN1</option>
          <option value="WAN2">WAN2</option>
        </select>
      </div>
      <button class="btn-tplink" id="btnAddPolicy">ADICIONAR REGRA</button>
    `;

    container.querySelectorAll('.btn-del-route').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        d.transmission.policyRouting.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddPolicy').addEventListener('click', () => {
      const name = container.querySelector('#polName').value.trim();
      const service = container.querySelector('#polService').value;
      const src = container.querySelector('#polSrc').value.trim();
      const wan = container.querySelector('#polWan').value;

      if (!name || !src) return alert('Preencha o nome e a faixa de IP.');

      d.transmission.policyRouting.push({
        id: d.transmission.policyRouting.length + 1,
        name, service, sourceIp: src, wan, status: 'Enabled'
      });
      saveState();
      onRefresh();
    });
    return;
  }

  // --- 7. FIREWALL > DEFESA ANTI-ARP ---
  if (tab === 'firewall_antiarp' && d.type === 'loadbalance') {
    titleEl.innerText = 'Proteção Anti-ARP Spoofing e Amarração IP-MAC';
    const arp = d.firewall.antiArp;
    const bindRows = d.firewall.ipMacBinding.map((b, i) => `
      <tr>
        <td>${b.ip}</td>
        <td>${b.mac}</td>
        <td>${b.desc}</td>
        <td><strong style="color:green;">${b.status === 'Enabled' ? 'Travado' : 'Inativo'}</strong></td>
        <td><button class="btn-tplink btn-del-bind" data-index="${i}">Excluir</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="form-grid">
        <label>Ativar Proteção Anti-ARP:</label>
        <input type="checkbox" id="chkArpDef" ${arp.enabled ? 'checked' : ''}>

        <label>Enviar Pacotes GARP Periódicos:</label>
        <input type="checkbox" id="chkGarp" ${arp.sendGarp ? 'checked' : ''}>
      </div>

      <table class="data-table" style="margin-top:15px;">
        <thead><tr><th>Endereço IP</th><th>Endereço MAC</th><th>Identificação</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>${bindRows.length > 0 ? bindRows : '<tr><td colspan="5" style="text-align:center;">Nenhuma amarração cadastrada.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin: 15px 0 8px 0;">Travar Associação IP-MAC</h4>
      <div class="form-grid">
        <label>Endereço IP:</label>
        <input type="text" id="bindIp" placeholder="192.168.0.x">

        <label>Endereço MAC:</label>
        <input type="text" id="bindMac" placeholder="00-11-22-33-44-55">

        <label>Descrição:</label>
        <input type="text" id="bindDesc" placeholder="Ex: Servidor_Financeiro">
      </div>
      <button class="btn-tplink" id="btnAddArpBind">TRAVAR IP-MAC</button>
    `;

    container.querySelector('#chkArpDef').addEventListener('change', (e) => {
      arp.enabled = e.target.checked;
      saveState();
    });

    container.querySelector('#chkGarp').addEventListener('change', (e) => {
      arp.sendGarp = e.target.checked;
      saveState();
    });

    container.querySelectorAll('.btn-del-bind').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-index'), 10);
        d.firewall.ipMacBinding.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddArpBind').addEventListener('click', () => {
      const ip = container.querySelector('#bindIp').value.trim();
      const mac = container.querySelector('#bindMac').value.trim().toUpperCase();
      const desc = container.querySelector('#bindDesc').value.trim();

      if (!ip || !mac) return alert('Preencha o IP e o MAC.');

      d.firewall.ipMacBinding.push({
        ip, mac, desc: desc || 'Dispositivo', status: 'Enabled'
      });
      saveState();
      onRefresh();
    });
    return;
  }

  // --- 8. FERRAMENTAS > DIAGNÓSTICOS ---
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

  // --- 9. FERRAMENTAS > REGISTOS DO SISTEMA (SYSLOG) ---
  if (tab === 'syslog_view' && d.type === 'loadbalance') {
    titleEl.innerText = 'Registros de Eventos do Sistema (System Logs)';
    const logRows = (d.systemLogs || []).map(l => `
      <tr>
        <td width="140">${l.time}</td>
        <td width="70"><strong>${l.module}</strong></td>
        <td width="70"><span style="color:${l.level === 'NOTICE' ? '#006699' : '#333'}">${l.level}</span></td>
        <td>${l.content}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="data-table" style="font-size:11px;">
        <thead><tr><th>Horário</th><th>Módulo</th><th>Nível</th><th>Descrição do Evento</th></tr></thead>
        <tbody>${logRows.length > 0 ? logRows : '<tr><td colspan="4" style="text-align:center;">Nenhum evento registrado.</td></tr>'}</tbody>
      </table>
      <button class="btn-tplink" id="btnClearLogs" style="margin-top:10px;">LIMPAR LOGS</button>
    `;

    container.querySelector('#btnClearLogs').addEventListener('click', () => {
      d.systemLogs = [];
      saveState();
      onRefresh();
    });
    return;
  }

  titleEl.innerText = 'Configurações';
  container.innerHTML = `<p>Selecione uma opção no menu lateral.</p>`;
}