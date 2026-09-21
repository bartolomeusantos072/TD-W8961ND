/**
 * BART-LINK Simulator — Vista de Estado Geral (Status)
 */

import { appState } from '../../state.js';

export function renderStatusView(container) {
  const d = appState.deviceData;
  if (!d) return;

  if (d.type === 'loadbalance') {
    const wanRows = d.wans.map(w => `
      <tr>
        <td><strong>WAN ${w.id}</strong></td>
        <td>${w.type}</td>
        <td><strong style="color: ${w.status === 'Connected' || w.status === 'Conectado' ? '#008800' : '#888'};">${w.status === 'Connected' ? 'Conectado' : w.status}</strong></td>
        <td>${w.ip}</td>
        <td>${w.gateway}</td>
        <td>${(w.upstream / 1000).toFixed(0)}k / ${(w.downstream / 1000).toFixed(0)}k</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th colspan="2">Informações do Equipamento</th></tr></thead>
        <tbody>
          <tr><td width="200">Versão de Hardware:</td><td>${d.hardware}</td></tr>
          <tr><td>Versão de Firmware:</td><td>${d.firmware}</td></tr>
          <tr><td>IP da LAN / Máscara:</td><td>${d.lan.ip} / ${d.lan.netmask}</td></tr>
        </tbody>
      </table>

      <table class="data-table" style="margin-top:15px;">
        <thead><tr><th colspan="6">Status das Portas WAN IPv4</th></tr></thead>
        <tbody>
          <tr><th>Porta</th><th>Tipo de Conexão</th><th>Status</th><th>Endereço IP</th><th>Gateway</th><th>Banda (Up/Down)</th></tr>
          ${wanRows}
        </tbody>
      </table>
    `;
  } else if (d.type === 'nrouter') {
    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th colspan="2">Rede Local (LAN)</th></tr></thead>
        <tbody>
          <tr><td width="180">Endereço MAC:</td><td>${d.lan.mac}</td></tr>
          <tr><td>Endereço IP:</td><td>${d.lan.ip}</td></tr>
          <tr><td>Máscara de Sub-rede:</td><td>${d.lan.netmask}</td></tr>
          <tr><td>Servidor DHCP:</td><td>${d.lan.dhcpEnabled ? 'Habilitado' : '<span style="color:orange;">Desabilitado (Modo Repetidor WDS)</span>'}</td></tr>
        </tbody>
      </table>

      <table class="data-table" style="margin-top:15px;">
        <thead><tr><th colspan="2">Rede Sem Fio (Wireless 2.4 GHz)</th></tr></thead>
        <tbody>
          <tr><td width="180">Rádio Sem Fio:</td><td>${d.wireless.enabled ? 'Habilitado' : 'Desabilitado'}</td></tr>
          <tr><td>Nome da Rede (SSID):</td><td><strong>${d.wireless.ssid}</strong></td></tr>
          <tr><td>Modo / Canal:</td><td>${d.wireless.mode} / ${d.wireless.channel} (${d.wireless.channelWidth})</td></tr>
          <tr><td>Segurança:</td><td>${d.wireless.security}</td></tr>
          <tr><td>Repetição WDS:</td><td>${d.wireless.wdsEnabled ? `<span style="color:green; font-weight:bold;">Ativo & Associado (${d.wireless.wdsSsid})</span>` : 'Desabilitado'}</td></tr>
        </tbody>
      </table>

      <table class="data-table" style="margin-top:15px;">
        <thead><tr><th colspan="2">Internet (WAN)</th></tr></thead>
        <tbody>
          <tr><td width="180">Endereço MAC:</td><td>${d.wan.mac}</td></tr>
          <tr><td>Endereço IP:</td><td>${d.wan.ip} (${d.wan.type})</td></tr>
          <tr><td>Máscara / Gateway:</td><td>${d.wan.netmask || '255.255.255.0'} / ${d.wan.gateway || '192.168.1.1'}</td></tr>
          <tr><td>Status da Conexão:</td><td><strong style="color:${d.wan.status === 'Connected' || d.wan.status === 'Conectado' ? '#008800' : '#cc0000'}">${d.wan.status === 'Connected' ? 'Conectado' : d.wan.status}</strong></td></tr>
        </tbody>
      </table>
    `;
  } else {
    container.innerHTML = `
      <table class="data-table">
        <thead><tr><th colspan="2">Rede Local (LAN)</th></tr></thead>
        <tbody>
          <tr><td width="180">Endereço MAC:</td><td>F4:EC:38:00:1E:5A</td></tr>
          <tr><td>Endereço IP:</td><td>${d.lan.ip}</td></tr>
          <tr><td>Máscara de Sub-rede:</td><td>${d.lan.netmask}</td></tr>
          <tr><td>Servidor DHCP:</td><td>${d.lan.dhcpEnabled ? 'Habilitado' : 'Desabilitado'}</td></tr>
        </tbody>
      </table>
      <table class="data-table" style="margin-top:15px;">
        <thead><tr><th colspan="2">Interface ADSL (WAN ATM)</th></tr></thead>
        <tbody>
          <tr><td width="180">Tipo de Conexão:</td><td>${d.wan.type}</td></tr>
          <tr><td>Endereço IP:</td><td>${d.wan.ip}</td></tr>
          <tr><td>Circuito VPI / VCI:</td><td>${d.wan.vpi} / ${d.wan.vci} (${d.wan.encapsulation})</td></tr>
          <tr><td>Status da Conexão:</td><td><strong style="color:${d.wan.status === 'Connected' || d.wan.status === 'Conectado' ? '#008800' : '#cc0000'}">${d.wan.status === 'Connected' ? 'Conectado' : d.wan.status}</strong></td></tr>
        </tbody>
      </table>
    `;
  }
}