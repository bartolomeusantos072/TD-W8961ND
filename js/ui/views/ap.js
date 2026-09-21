/**
 * BART-LINK Simulator — Vista do Ponto de Acesso Corporativo PoE (EAP225)
 * Multi-SSID vinculado a VLANs 802.1Q, Isolamento de Clientes e Portal Captivo.
 */

import { appState, saveState } from '../../state.js';
import { triggerReboot } from '../../services/networkSim.js';

export function renderAccessPointView(tab, titleEl, container, onRefresh) {
  const d = appState.deviceData;
  if (!d) return;

  // --- 1. STATUS GERAL E ALIMENTAÇÃO POE ---
  if (tab === 'ap_status') {
    titleEl.innerText = 'Status Operacional e Alimentação PoE';

    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th colspan="2">Informações do Ponto de Acesso</th></tr></thead>
        <tbody>
          <tr><td width="220">Modelo de Hardware:</td><td>${d.hardware}</td></tr>
          <tr><td>Versão de Firmware:</td><td>${d.firmware}</td></tr>
          <tr><td>Estado de Alimentação:</td><td><strong style="color: green;">${d.lan.poeStatus}</strong></td></tr>
          <tr><td>IP de Gerência / Máscara:</td><td>${d.lan.ip} / ${d.lan.netmask}</td></tr>
          <tr><td>VLAN Nativa de Gerência:</td><td><strong style="color: #0284c7;">VLAN ${d.lan.vlanManagement}</strong></td></tr>
        </tbody>
      </table>

      <table class="data-table" style="margin-top: 15px;">
        <thead><tr><th colspan="4">Estatísticas dos Rádios Wi-Fi</th></tr></thead>
        <tbody>
          <tr><th>Frequência</th><th>Status</th><th>Canal</th><th>Potência de Transmissão (Tx)</th></tr>
          <tr>
            <td><strong>2.4 GHz (802.11b/g/n)</strong></td>
            <td><strong style="color: green;">Ativo</strong></td>
            <td>Canal ${d.radios.w24g.channel} (${d.radios.w24g.width})</td>
            <td>${d.radios.w24g.power}</td>
          </tr>
          <tr>
            <td><strong>5 GHz (802.11a/n/ac)</strong></td>
            <td><strong style="color: green;">Ativo</strong></td>
            <td>Canal ${d.radios.w5g.channel} (${d.radios.w5g.width})</td>
            <td>${d.radios.w5g.power}</td>
          </tr>
        </tbody>
      </table>
    `;
    return;
  }

  // --- 2. MULTI-SSID MAPEADO EM VLANS 802.1Q ---
  if (tab === 'ap_multissid') {
    titleEl.innerText = 'Redes Sem Fio Corporativas (Multi-SSID & VLANs)';

    const rows = d.ssids.map((s, idx) => `
      <tr>
        <td><strong>${s.ssid}</strong></td>
        <td>${s.band}</td>
        <td><strong style="color: #2563eb;">VLAN ${s.vid}</strong></td>
        <td>${s.security}</td>
        <td>${s.clientIsolation ? '<span style="color:green; font-weight:bold;">Ativo</span>' : '<span style="color:#666;">Inativo</span>'}</td>
        <td>${s.portal ? '<span style="color:#a855f7; font-weight:bold;">Voucher Exigido</span>' : 'Direto'}</td>
        <td><button class="btn-tplink btn-del-ssid" data-index="${idx}">Excluir</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div style="background:#f8fafc; border-left:4px solid #0284c7; padding:10px; margin-bottom:15px; font-size:11px;">
        <strong>Conceito Didático:</strong> Cada rede Wi-Fi injeta seu tráfego encapsulado com a Tag 802.1Q diretamente na porta Ethernet trunk conectada ao Switch Gerenciável.
      </div>

      <table class="data-table">
        <thead><tr><th>Nome da Rede (SSID)</th><th>Banda</th><th>VLAN ID (802.1Q)</th><th>Segurança</th><th>Isolamento (AP Isolation)</th><th>Portal Captivo</th><th>Ação</th></tr></thead>
        <tbody>${rows.length > 0 ? rows : '<tr><td colspan="7" style="text-align:center;">Nenhum SSID configurado.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Criar Novo SSID Corporativo</h4>
      <div class="form-grid">
        <label>Nome da Rede (SSID):</label>
        <input type="text" id="newSsidName" placeholder="Ex: Financeiro_WiFi">

        <label>Banda de Frequência:</label>
        <select id="newSsidBand">
          <option value="Dual">Dual Band (2.4GHz + 5GHz)</option>
          <option value="5GHz">Apenas 5GHz (Alta Densidade)</option>
          <option value="2.4GHz">Apenas 2.4GHz (Longo Alcance)</option>
        </select>

        <label>VLAN 802.1Q de Associação:</label>
        <input type="number" id="newSsidVid" placeholder="Ex: 10" min="1" max="4094">

        <label>Segurança:</label>
        <select id="newSsidSec">
          <option value="WPA2-PSK">WPA2-PSK Pessoal</option>
          <option value="WPA-Enterprise">WPA-Enterprise (RADIUS 802.1X)</option>
          <option value="None">Aberta (Sem Senha / Uso com Portal)</option>
        </select>

        <label>Senha da Rede:</label>
        <input type="password" id="newSsidKey" placeholder="Senha do Wi-Fi">

        <label>Isolamento de Clientes:</label>
        <div>
          <input type="checkbox" id="chkNewIso" checked>
          <span style="font-size:11px; color:#666;">(Impede celulares na mesma rede de se comunicarem diretamente)</span>
        </div>

        <label>Habilitar Portal Captivo:</label>
        <input type="checkbox" id="chkNewPortal">
      </div>
      <button class="btn-tplink" id="btnAddSsid" style="margin-top:10px;">SALVAR E TRANSMITIR SSID</button>
    `;

    container.querySelectorAll('.btn-del-ssid').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        d.ssids.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddSsid').addEventListener('click', () => {
      const ssid = container.querySelector('#newSsidName').value.trim();
      const band = container.querySelector('#newSsidBand').value;
      const vid = parseInt(container.querySelector('#newSsidVid').value, 10);
      const security = container.querySelector('#newSsidSec').value;
      const key = container.querySelector('#newSsidKey').value.trim();
      const clientIsolation = container.querySelector('#chkNewIso').checked;
      const portal = container.querySelector('#chkNewPortal').checked;

      if (!ssid) return alert('Digite o nome do SSID.');
      if (!vid || vid < 1 || vid > 4094) return alert('Defina uma VLAN válida entre 1 e 4094.');

      d.ssids.push({
        id: d.ssids.length + 1,
        ssid, band, vid, security, key, clientIsolation, portal
      });

      triggerReboot('Atualizando beacons de rádio e tabelas de mapeamento VLAN...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // --- 3. GESTÃO DOS RÁDIOS 2.4G E 5G ---
  if (tab === 'ap_radios') {
    titleEl.innerText = 'Parâmetros Avançados de RF (Rádios 2.4GHz e 5GHz)';

    container.innerHTML = `
      <div style="border: 1px solid #cbd5e1; padding: 15px; border-radius: 6px; margin-bottom: 15px; background: #f8fafc;">
        <h4 style="color:#004466; margin-bottom: 10px;">Rádio 1 — Frequência 2.4 GHz</h4>
        <div class="form-grid">
          <label>Canal de Transmissão:</label>
          <select id="rad24Chan">
            <option value="1" ${d.radios.w24g.channel === 1 ? 'selected' : ''}>Canal 1 (2412 MHz)</option>
            <option value="6" ${d.radios.w24g.channel === 6 ? 'selected' : ''}>Canal 6 (2437 MHz)</option>
            <option value="11" ${d.radios.w24g.channel === 11 ? 'selected' : ''}>Canal 11 (2462 MHz)</option>
          </select>

          <label>Largura de Banda:</label>
          <select id="rad24Width">
            <option value="20MHz" ${d.radios.w24g.width === '20MHz' ? 'selected' : ''}>20 MHz (Reduz interferência de vizinhos)</option>
            <option value="40MHz" ${d.radios.w24g.width === '40MHz' ? 'selected' : ''}>40 MHz (Maior vazão)</option>
          </select>
        </div>
      </div>

      <div style="border: 1px solid #cbd5e1; padding: 15px; border-radius: 6px; margin-bottom: 15px; background: #f8fafc;">
        <h4 style="color:#004466; margin-bottom: 10px;">Rádio 2 — Frequência 5 GHz</h4>
        <div class="form-grid">
          <label>Canal de Transmissão:</label>
          <select id="rad5Chan">
            <option value="36" ${d.radios.w5g.channel === 36 ? 'selected' : ''}>Canal 36 (5180 MHz - Baixo)</option>
            <option value="48" ${d.radios.w5g.channel === 48 ? 'selected' : ''}>Canal 48 (5240 MHz - Baixo)</option>
            <option value="149" ${d.radios.w5g.channel === 149 ? 'selected' : ''}>Canal 149 (5745 MHz - Alto)</option>
          </select>

          <label>Largura de Banda:</label>
          <select id="rad5Width">
            <option value="80MHz" ${d.radios.w5g.width === '80MHz' ? 'selected' : ''}>80 MHz (Gigabit 802.11ac)</option>
            <option value="40MHz" ${d.radios.w5g.width === '40MHz' ? 'selected' : ''}>40 MHz</option>
            <option value="20MHz" ${d.radios.w5g.width === '20MHz' ? 'selected' : ''}>20 MHz</option>
          </select>
        </div>
      </div>

      <button class="btn-tplink" id="btnSaveApRadios">SALVAR PARÂMETROS RF</button>
    `;

    container.querySelector('#btnSaveApRadios').addEventListener('click', () => {
      d.radios.w24g.channel = parseInt(container.querySelector('#rad24Chan').value, 10);
      d.radios.w24g.width = container.querySelector('#rad24Width').value;
      d.radios.w5g.channel = parseInt(container.querySelector('#rad5Chan').value, 10);
      d.radios.w5g.width = container.querySelector('#rad5Width').value;

      triggerReboot('Recalibrando circuitos de rádio RF...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // --- 4. PORTAL CAPTIVO (HOTSPOT DE VOUCHERS) ---
  if (tab === 'ap_portal') {
    titleEl.innerText = 'Portal Captivo / Gerenciador de Acesso por Voucher';
    const pc = d.portalCaptive || { enabled: true, authType: 'Voucher', vouchers: [] };

    const voucherRows = (pc.vouchers || []).map((v, i) => `
      <tr>
        <td><code>${v.code}</code></td>
        <td>${v.durationMinutes} minutos</td>
        <td><strong style="color:${v.status === 'Valid' ? 'green' : '#999'};">${v.status === 'Valid' ? 'Ativo (Disponível)' : 'Utilizado'}</strong></td>
        <td><button class="btn-tplink btn-del-voucher" data-idx="${i}">Excluir</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Código do Voucher</th><th>Tempo de Acesso</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>${voucherRows.length > 0 ? voucherRows : '<tr><td colspan="4" style="text-align:center;">Nenhum voucher emitido.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Emitir Novo Lote de Voucher</h4>
      <div class="form-grid">
        <label>Tempo de Validade:</label>
        <select id="vchDuration">
          <option value="60">1 Hora (60 min)</option>
          <option value="120" selected>2 Horas (120 min)</option>
          <option value="480">8 Horas (Expediente)</option>
          <option value="1440">24 Horas (1 Dia)</option>
        </select>
      </div>
      <button class="btn-tplink" id="btnGenVoucher">GERAR VOUCHER</button>
    `;

    container.querySelectorAll('.btn-del-voucher').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        pc.vouchers.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnGenVoucher').addEventListener('click', () => {
      const duration = parseInt(container.querySelector('#vchDuration').value, 10);
      const code = 'VCH-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      pc.vouchers.push({ code, durationMinutes: duration, status: 'Valid' });
      saveState();
      onRefresh();
    });
    return;
  }
}