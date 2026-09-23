/**
 * BART-LINK Simulator — Vista Avançada do MikroTik RouterOS (WebFig + CLI)
 * Inclui Motor de Encaminhamento L3 (Longest Prefix Match) e Terminal RouterOS.
 */

import { appState, saveState } from '../../state.js';
import { triggerReboot } from '../../services/networkSim.js';

/**
 * Converte IP string em inteiro de 32 bits
 */
function ipToLong(ip) {
  return ip.split('.').reduce((acc, oct) => ((acc << 8) + parseInt(oct, 10)) >>> 0, 0);
}

/**
 * Verifica se um IP de destino pertence a um bloco CIDR
 */
function isIpInSubnet(ip, cidr) {
  if (cidr === '0.0.0.0/0') return true;
  const [range, bitsStr] = cidr.split('/');
  const bits = parseInt(bitsStr, 10);
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
  return (ipToLong(ip) & mask) === (ipToLong(range) & mask);
}

export function renderMikrotikView(tab, titleEl, container, onRefresh) {
  const d = appState.deviceData;
  if (!d) return;

  // ===========================================================================
  // 1. SYSTEM > RESOURCES & INTERFACES
  // ===========================================================================
  if (tab === 'mt_resource') {
    titleEl.innerText = 'MikroTik RouterOS — System > Resources';

    const ifaceRows = d.interfaces.map(i => `
      <tr>
        <td><strong>${i.name}</strong></td>
        <td>${i.type}</td>
        <td><code>${i.mac}</code></td>
        <td><strong style="color:${i.running ? '#16a34a' : '#64748b'};">${i.running ? 'R (Running)' : 'Down'}</strong></td>
        <td>${i.comment || '-'}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div style="background: #1e293b; color: #f8fafc; padding: 14px; border-radius: 6px; margin-bottom: 15px; font-family: monospace; font-size: 12px; display: flex; justify-content: space-between; border-left: 4px solid #38bdf8;">
        <div>
          Identity: <strong style="color: #38bdf8;">[${d.system.identity}]</strong><br>
          Board: <strong>${d.hardware}</strong> | OS: <strong>${d.firmware}</strong>
        </div>
        <div>
          CPU Load: <strong>${d.system.cpuLoad}%</strong><br>
          Free Memory: <strong>${d.system.freeMemory}</strong> | Uptime: <strong>${d.system.uptime}</strong>
        </div>
      </div>

      <table class="data-table">
        <thead><tr><th>Interface</th><th>Tipo</th><th>MAC Address</th><th>Estado</th><th>Comentário</th></tr></thead>
        <tbody>${ifaceRows}</tbody>
      </table>
    `;
    return;
  }

  // ===========================================================================
  // 2. IP > ADDRESSES
  // ===========================================================================
  if (tab === 'mt_ip_addresses') {
    titleEl.innerText = 'MikroTik RouterOS — IP > Addresses';

    const rows = d.ipAddresses.map((a, idx) => `
      <tr>
        <td><strong>${a.address}</strong></td>
        <td>${a.network}</td>
        <td>${a.interface}</td>
        <td><button class="btn-tplink btn-del-ip" data-idx="${idx}">Excluir</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Address / Netmask</th><th>Network</th><th>Interface</th><th>Ação</th></tr></thead>
        <tbody>${rows.length > 0 ? rows : '<tr><td colspan="4" style="text-align:center;">Nenhum IP configurado.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Atribuir Endereço IP à Interface</h4>
      <div class="form-grid">
        <label>Address / CIDR:</label>
        <input type="text" id="txtMtAddress" placeholder="Ex: 192.168.10.1/24">

        <label>Interface:</label>
        <select id="selMtIface">
          ${d.interfaces.map(i => `<option value="${i.name}">${i.name}</option>`).join('')}
        </select>
      </div>
      <button class="btn-tplink" id="btnAddMtIp" style="margin-top:10px;">APPLY ADDRESS</button>
    `;

    container.querySelectorAll('.btn-del-ip').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        d.ipAddresses.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddMtIp').addEventListener('click', () => {
      const addr = container.querySelector('#txtMtAddress').value.trim();
      const iface = container.querySelector('#selMtIface').value;
      if (!addr || !addr.includes('/')) return alert('Informe o IP no padrão CIDR (ex: 192.168.10.1/24).');

      d.ipAddresses.push({ id: d.ipAddresses.length + 1, address: addr, network: addr.split('/')[0], interface: iface });
      saveState();
      onRefresh();
    });
    return;
  }

  // ===========================================================================
  // 3. IP > ROUTES + MOTOR LONGEST PREFIX MATCH
  // ===========================================================================
  if (tab === 'mt_ip_routes') {
    titleEl.innerText = 'MikroTik RouterOS — IP > Routes & Simulador L3';

    const rows = d.routes.map((r, idx) => `
      <tr>
        <td><strong>${r.dstAddress}</strong></td>
        <td>${r.gateway}</td>
        <td>${r.distance}</td>
        <td><strong style="color:${r.status.includes('Active') ? '#16a34a' : '#64748b'};">${r.status}</strong></td>
        <td>${r.distance > 0 ? `<button class="btn-tplink btn-del-route" data-idx="${idx}">Excluir</button>` : '<span style="font-size:10px; color:#666;">Diretamente Conectada</span>'}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div style="background:#f8fafc; border-left:4px solid #0284c7; padding:10px; margin-bottom:15px; font-size:11px;">
        <strong>Conceito Didático (FIB - Forwarding Information Base):</strong> Quando múltiplos prefixos combinam com o destino, o processador seleciona a rota com a <strong>máscara mais específica (Longest Prefix Match)</strong>. Em caso de empate de máscara, vence a menor <strong>Distância Administrativa</strong>.
      </div>

      <table class="data-table">
        <thead><tr><th>Dst. Address</th><th>Gateway</th><th>Distance</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <!-- SIMULADOR INTERATIVO DE DECISÃO DE ROTA -->
      <div style="background: #0f172a; color: #fff; padding: 15px; border-radius: 6px; margin: 20px 0;">
        <h4 style="color: #38bdf8; margin: 0 0 8px 0; font-size: 13px;">Laboratório Interativo de Roteamento L3</h4>
        <p style="font-size: 11px; color: #94a3b8; margin-bottom: 10px;">Injete um pacote com IP de destino e visualize a regra do Kernel do RouterOS determinando a saída:</p>
        <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <input type="text" id="testDstIp" placeholder="Ex: 8.8.8.8 ou 192.168.88.50" style="padding: 6px 10px; border-radius: 4px; border: 1px solid #475569; background: #1e293b; color: #fff; font-family: monospace;">
          <button class="btn-tplink" id="btnRunRouteSim" style="background: #0284c7;">RESOLVER DESTINO</button>
        </div>
        <div id="routeSimResult" style="margin-top: 12px; font-size: 12px; font-family: monospace; display: none;"></div>
      </div>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Criar Rota Estática</h4>
      <div class="form-grid">
        <label>Dst. Address (Rede de Destino):</label>
        <input type="text" id="txtMtRouteDst" placeholder="0.0.0.0/0 ou 10.50.0.0/16">

        <label>Gateway (Próximo Salto):</label>
        <input type="text" id="txtMtRouteGw" placeholder="Ex: 203.0.113.1 ou ether1-WAN">

        <label>Distance (Métrica):</label>
        <input type="number" id="txtMtRouteDist" value="1" min="1" max="255">
      </div>
      <button class="btn-tplink" id="btnAddMtRoute" style="margin-top:10px;">ADD STATIC ROUTE</button>
    `;

    // Ação de resolução do teste de tráfego L3
    container.querySelector('#btnRunRouteSim').addEventListener('click', () => {
      const targetIp = container.querySelector('#testDstIp').value.trim();
      const resDiv = container.querySelector('#routeSimResult');
      resDiv.style.display = 'block';

      if (!targetIp.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
        resDiv.innerHTML = '<span style="color:#ef4444;">Digite um endereço IPv4 válido no formato x.x.x.x</span>';
        return;
      }

      // Procura todas as rotas coincidentes
      const matches = d.routes.filter(r => isIpInSubnet(targetIp, r.dstAddress));

      if (matches.length === 0) {
        resDiv.innerHTML = `<span style="color:#ef4444;">[DROP] Unreachable: Nenhuma rota para ${targetIp}. O pacote é descartado com ICMP Host Unreachable.</span>`;
        return;
      }

      // Ordena por maior comprimento de máscara (prefixo) e menor distância
      matches.sort((a, b) => {
        const maskA = parseInt(a.dstAddress.split('/')[1] || 0, 10);
        const maskB = parseInt(b.dstAddress.split('/')[1] || 0, 10);
        if (maskB !== maskA) return maskB - maskA;
        return a.distance - b.distance;
      });

      const winner = matches[0];
      resDiv.innerHTML = `
        <div style="background: #1e293b; padding: 10px; border-radius: 4px; border-left: 4px solid #22c55e;">
          <span style="color:#4ade80; font-weight:bold;">[ENCAMINHADO COM SUCESSO]</span><br>
          Pacote com destino a <strong>${targetIp}</strong> encaminhado via <strong>${winner.gateway}</strong>.<br>
          <span style="color: #94a3b8; font-size: 11px;">Rota vencedora: <code>${winner.dstAddress}</code> (Distância: ${winner.distance}, Máscara: /${winner.dstAddress.split('/')[1]}).</span>
        </div>
      `;
    });

    container.querySelectorAll('.btn-del-route').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        d.routes.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddMtRoute').addEventListener('click', () => {
      const dst = container.querySelector('#txtMtRouteDst').value.trim();
      const gw = container.querySelector('#txtMtRouteGw').value.trim();
      const dist = parseInt(container.querySelector('#txtMtRouteDist').value, 10) || 1;
      if (!dst || !gw) return alert('Preencha destino e gateway.');

      d.routes.push({ id: d.routes.length + 1, dstAddress: dst, gateway: gw, distance: dist, status: 'Active, Static' });
      saveState();
      onRefresh();
    });
    return;
  }

  // ===========================================================================
  // 4. IP > FIREWALL > NAT (MASQUERADE)
  // ===========================================================================
  if (tab === 'mt_firewall_nat') {
    titleEl.innerText = 'MikroTik RouterOS — IP > Firewall > NAT';

    const rows = d.firewallNat.map((n, idx) => `
      <tr>
        <td><strong>${n.chain}</strong></td>
        <td>${n.outInterface}</td>
        <td><strong style="color: #2563eb;">${n.action}</strong></td>
        <td>${n.comment || '-'}</td>
        <td><button class="btn-tplink btn-del-nat" data-idx="${idx}">Excluir</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Chain</th><th>Out. Interface</th><th>Action</th><th>Comentário</th><th>Ação</th></tr></thead>
        <tbody>${rows.length > 0 ? rows : '<tr><td colspan="5" style="text-align:center;">Nenhuma regra de NAT ativa.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Criar Regra de NAT</h4>
      <div class="form-grid">
        <label>Chain:</label>
        <input type="text" value="srcnat" disabled>

        <label>Out. Interface:</label>
        <select id="selMtNatOut">
          ${d.interfaces.map(i => `<option value="${i.name}">${i.name}</option>`).join('')}
        </select>

        <label>Action:</label>
        <select id="selMtNatAction">
          <option value="masquerade">masquerade (Recomendado para IP Dinâmico/PPPoE)</option>
          <option value="src-nat">src-nat (IP Público Estático)</option>
        </select>
      </div>
      <button class="btn-tplink" id="btnAddMtNat" style="margin-top:10px;">APPLY NAT RULE</button>
    `;

    container.querySelectorAll('.btn-del-nat').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        d.firewallNat.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddMtNat').addEventListener('click', () => {
      const outIface = container.querySelector('#selMtNatOut').value;
      const act = container.querySelector('#selMtNatAction').value;
      d.firewallNat.push({ id: d.firewallNat.length + 1, chain: 'srcnat', outInterface: outIface, action: act, comment: 'Regra de Borda' });
      saveState();
      onRefresh();
    });
    return;
  }

  // ===========================================================================
  // 5. PPP > PPPOE SERVER
  // ===========================================================================
  if (tab === 'mt_ppp_server') {
    titleEl.innerText = 'MikroTik RouterOS — PPP > PPPoE Server';
    const srv = d.pppoeServer;

    const secretRows = srv.secrets.map((s, idx) => `
      <tr>
        <td><strong>${s.user}</strong></td>
        <td><code>***</code></td>
        <td>${s.profile}</td>
        <td>${s.localAddress}</td>
        <td>${s.remoteAddress}</td>
        <td><button class="btn-tplink btn-del-secret" data-idx="${idx}">Excluir</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="form-grid">
        <label>Servidor PPPoE Ativo:</label>
        <input type="checkbox" id="chkMtPppoeEnable" ${srv.enabled ? 'checked' : ''}>

        <label>Nome do Serviço (Service Name):</label>
        <input type="text" id="txtMtPppoeName" value="${srv.serviceName}">

        <label>Interface de Autenticação:</label>
        <select id="selMtPppoeIface">
          ${d.interfaces.map(i => `<option value="${i.name}" ${srv.interface === i.name ? 'selected' : ''}>${i.name}</option>`).join('')}
        </select>
      </div>
      <button class="btn-tplink" id="btnSaveMtPppoe" style="margin-top:10px;">SALVAR CONFIGURAÇÃO</button>

      <h4 style="color:#004466; margin: 25px 0 10px 0;">Base de Clientes (PPP Secrets)</h4>
      <table class="data-table">
        <thead><tr><th>Username</th><th>Password</th><th>Profile</th><th>Local IP</th><th>Remote IP</th><th>Ação</th></tr></thead>
        <tbody>${secretRows}</tbody>
      </table>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Adicionar Credencial de Cliente</h4>
      <div class="form-grid">
        <label>Usuário:</label>
        <input type="text" id="txtNewSecUser" placeholder="cliente_fibra02">

        <label>Senha:</label>
        <input type="password" id="txtNewSecPass" placeholder="Senha do cliente">

        <label>IP Remoto:</label>
        <input type="text" id="txtNewSecRemote" placeholder="10.0.0.51">
      </div>
      <button class="btn-tplink" id="btnAddSecret" style="margin-top:10px;">ADD CLIENT SECRET</button>
    `;

    container.querySelector('#btnSaveMtPppoe').addEventListener('click', () => {
      srv.enabled = container.querySelector('#chkMtPppoeEnable').checked;
      srv.serviceName = container.querySelector('#txtMtPppoeName').value.trim();
      srv.interface = container.querySelector('#selMtPppoeIface').value;
      saveState();
      onRefresh();
    });

    container.querySelectorAll('.btn-del-secret').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        srv.secrets.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddSecret').addEventListener('click', () => {
      const u = container.querySelector('#txtNewSecUser').value.trim();
      const p = container.querySelector('#txtNewSecPass').value.trim();
      const rem = container.querySelector('#txtNewSecRemote').value.trim();
      if (!u || !p || !rem) return alert('Preencha os campos do cliente.');

      srv.secrets.push({ user: u, password: p, profile: 'default', localAddress: '10.0.0.1', remoteAddress: rem });
      saveState();
      onRefresh();
    });
    return;
  }

  // ===========================================================================
  // 6. NEW TERMINAL (CLI DO ROUTEROS)
  // ===========================================================================
  if (tab === 'mt_terminal') {
    titleEl.innerText = 'MikroTik RouterOS — Terminal Interativo (CLI)';

    container.innerHTML = `
      <div style="background: #000; color: #38bdf8; font-family: 'Courier New', Courier, monospace; font-size: 12px; padding: 15px; border-radius: 6px; min-height: 380px; display: flex; flex-direction: column;">
        <div id="cliOutput" style="white-space: pre-wrap; flex-grow: 1; overflow-y: auto; max-height: 320px; line-height: 1.4;">
  MMM      MMM       III  KKK  KKK  RRRRRR     OOOOOO   TTTTTTTTT  III  KKK  KKK
  MMMM    MMMM       III  KKK  KKK  RRR  RRR  OOO  OOO     TTT     III  KKK  KKK
  MMM MMMM MMM  III  III  KKKKK     RRRRRR    OOO  OOO     TTT     III  KKKKK    
  MMM  MM  MMM  III  III  KKK KKK   RRR  RRR  OOO  OOO     TTT     III  KKK KKK  
  MMM      MMM  III  III  KKK  KKK  RRR   RRR  OOOOOO      TTT     III  KKK  KKK

MikroTik RouterOS 7.14.3 (c) 1999-2026       http://www.mikrotik.com/
Terminal interativo pronto. Digite 'help' para listar comandos disponíveis.
        </div>
        <div style="display: flex; margin-top: 10px; border-top: 1px solid #1e293b; padding-top: 8px;">
          <span style="color: #4ade80; font-weight: bold; margin-right: 6px;">[admin@BARTLINK] &gt;</span>
          <input type="text" id="cliInput" autofocus style="background: transparent; border: none; color: #fff; outline: none; font-family: monospace; font-size: 12px; flex-grow: 1;">
        </div>
      </div>
    `;

    const out = container.querySelector('#cliOutput');
    const input = container.querySelector('#cliInput');

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        input.value = '';
        out.innerHTML += `\n<span style="color:#4ade80;">[admin@BARTLINK] &gt;</span> ${cmd}`;

        const lower = cmd.toLowerCase();

        if (lower === 'help') {
          out.innerHTML += `\nComandos suportados no simulador:
  /ip address print      - Lista os endereços IP das interfaces
  /ip route print        - Exibe a tabela de rotas ativa
  /interface print       - Exibe as interfaces físicas
  ping <ip>              - Testa conectividade ICMP
  clear                  - Limpa a tela do terminal
  /system reboot         - Reinicia o sistema operacional`;
        } else if (lower === 'clear') {
          out.innerHTML = '';
        } else if (lower === '/ip address print' || lower === 'ip address print') {
          let str = '\nFlags: X - disabled, I - invalid, D - dynamic \n #   ADDRESS            NETWORK         INTERFACE';
          d.ipAddresses.forEach((a, i) => {
            str += `\n ${i}   ${a.address.padEnd(18)} ${a.network.padEnd(15)} ${a.interface}`;
          });
          out.innerHTML += str;
        } else if (lower === '/ip route print' || lower === 'ip route print') {
          let str = '\nFlags: D - DYNAMIC; A - ACTIVE; c - CONNECT, s - STATIC \nColumns: DST-ADDRESS, GATEWAY, DISTANCE\n  DST-ADDRESS        GATEWAY          DISTANCE';
          d.routes.forEach(r => {
            str += `\n  ${r.dstAddress.padEnd(18)} ${r.gateway.padEnd(16)} ${r.distance}`;
          });
          out.innerHTML += str;
        } else if (lower === '/interface print' || lower === 'interface print') {
          let str = '\nFlags: R - RUNNING\n #     NAME           TYPE       MAC-ADDRESS';
          d.interfaces.forEach((iface, i) => {
            str += `\n ${i}  ${iface.running ? 'R' : ' '}  ${iface.name.padEnd(14)} ${iface.type.padEnd(10)} ${iface.mac}`;
          });
          out.innerHTML += str;
        } else if (lower.startsWith('ping ')) {
          const target = cmd.split(' ')[1];
          out.innerHTML += `\nHOST: ${target}\nSEQ SIZE TTL TIME  STATUS\n  0   56  64 12ms  echo reply\n  1   56  64 11ms  echo reply\n  2   56  64 13ms  echo reply\npacket-loss=0% min-rtt=11ms avg-rtt=12ms max-rtt=13ms`;
        } else if (lower === '/system reboot' || lower === 'system reboot') {
          out.innerHTML += '\nReiniciando o sistema RouterOS...';
          triggerReboot('Reiniciando RouterOS...', () => onRefresh());
        } else if (cmd !== '') {
          out.innerHTML += `\nbad command name '${cmd}' (type 'help' for available commands)`;
        }

        out.scrollTop = out.scrollHeight;
      }
    });
    return;
  }
}