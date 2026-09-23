/**
 * BART-LINK Simulator — Orquestrador de Renderização da Interface
 * Controle de bancada, navegação lateral e roteamento para todos os 7 dispositivos:
 * ADSL, WR841N, Multi-WAN, Switch L2, Repetidor, Access Point PoE e GPON ONT.
 */

import { appState, setDeviceData } from '../state.js';
import { HELP_DICTIONARY } from '../constants.js';
import { triggerReboot } from '../services/networkSim.js';
// Visualizadores modulares
import { renderIoTView } from './views/iot.js';
import { renderStatusView } from './views/status.js';
import { renderWizardView } from './views/wizard.js';
import { renderResidentialView } from './views/residential.js';
import { renderWirelessView, renderWirelessSecView, renderMacFilterView } from './views/wireless.js';
import { renderWanView } from './views/wan.js';
import { renderSwitchView } from './views/switch.js';
import { renderExtenderView } from './views/extender.js';
import { renderAccessPointView } from './views/ap.js';
import { renderGponView } from './views/gpon.js';
import { renderMikrotikView } from './views/mikrotik.js';
/**
 * Estrutura de menus por perfil de equipamento
 */
const MENU_REGISTRY = {
  loadbalance: [
    { id: 'status', label: 'Status' },
    { id: 'network_wan', label: 'Rede > WAN' },
    { id: 'network_lan', label: 'Rede > LAN e DHCP' },
    { id: 'trans_loadbalance', label: 'Transmissão > Balanceamento' },
    { id: 'trans_linkbackup', label: 'Transmissão > Redundância (Backup)' },
    { id: 'trans_policyroute', label: 'Transmissão > Roteamento por Regra' },
    { id: 'firewall_antiarp', label: 'Firewall > Proteção Anti-ARP' },
    { id: 'diag_tools', label: 'Ferramentas > Diagnósticos' },
    { id: 'syslog_view', label: 'Ferramentas > Log do Sistema' },
    { id: 'maintenance', label: 'Ferramentas > Reiniciar' }
  ],
  adsl: [
    { id: 'status', label: 'Status' },
    { id: 'quickstart', label: 'Assistente Rápido' },
    { id: 'network_lan', label: 'Configuração de Interface (LAN)' },
    { id: 'maintenance', label: 'Manutenção' }
  ],
  switch: [
    { id: 'switch_ports', label: 'Painel de Portas & PVID' },
    { id: 'switch_vlan', label: 'VLAN 802.1Q (Matriz)' },
    { id: 'switch_mactable', label: 'Tabela MAC (CAM)' },
    { id: 'switch_simulator', label: 'Laboratório de Quadros L2' },
    { id: 'diag_tools', label: 'Ferramentas de Rede' },
    { id: 'maintenance', label: 'Reinicialização' }
  ],
  extender: [
    { id: 'extender_status', label: 'Status & LED de Sinal' },
    { id: 'extender_wizard', label: 'Assistente Rápido' },
    { id: 'extender_mode', label: 'Modo de Operação' },
    { id: 'maintenance', label: 'Reinicialização' }
  ],
  accesspoint: [
    { id: 'ap_status', label: 'Status & PoE' },
    { id: 'ap_multissid', label: 'Redes Sem Fio (Multi-SSID / VLAN)' },
    { id: 'ap_radios', label: 'Gerenciamento de Rádio (2.4G / 5G)' },
    { id: 'ap_portal', label: 'Portal Captivo / Hotspot' },
    { id: 'maintenance', label: 'Reinicialização' }
  ],
  gpon: [
    { id: 'gpon_status', label: 'Status & Parâmetros Ópticos' },
    { id: 'gpon_config', label: 'Autenticação GPON (SN / PLOAM)' },
    { id: 'gpon_wan', label: 'Configuração de Serviço (Bridge / VLAN)' },
    { id: 'diag_tools', label: 'Diagnósticos de Rede' },
    { id: 'maintenance', label: 'Reinicialização' }
  ],
  iotgateway: [
    { id: 'iot_status', label: 'Status & Enlace IP' },
    { id: 'iot_devices', label: 'Topologia de Sensores' },
    { id: 'iot_automations', label: 'Automações Locais (Edge)' },
    { id: 'iot_matter', label: 'Padrão Matter & Bridge' },
    { id: 'maintenance', label: 'Reinicialização' }
  ],
  mikrotik: [
    { id: 'mt_resource', label: 'System > Resources' },
    { id: 'mt_ip_addresses', label: 'IP > Addresses' },
    { id: 'mt_ip_routes', label: 'IP > Routes & L3 Engine' },
    { id: 'mt_firewall_nat', label: 'IP > Firewall (NAT)' },
    { id: 'mt_ppp_server', label: 'PPP > PPPoE Server' },
    { id: 'mt_terminal', label: 'New Terminal (CLI)' },
    { id: 'maintenance', label: 'System > Reboot' }
  ],
  pfsense: [
    { id: 'pf_dashboard', label: 'Status > Dashboard' },
    { id: 'pf_rules', label: 'Firewall > Rules (Stateful)' },
    { id: 'pf_pkt_sim', label: 'Diagnostics > Packet Simulator' },
    { id: 'pf_aliases', label: 'Firewall > Aliases' },
    { id: 'pf_openvpn', label: 'VPN > OpenVPN' },
    { id: 'maintenance', label: 'Diagnostics > Reboot' }
  ],
  nrouter: [
    { id: 'status', label: 'Status' },
    { id: 'wr_wan', label: 'Rede > WAN' },
    { id: 'wr_macclone', label: 'Rede > Clonar MAC' },
    { id: 'network_lan', label: 'Rede > LAN e DHCP' },
    { id: 'wireless', label: 'Sem Fio > Configurações Básicas' },
    { id: 'wireless_sec', label: 'Sem Fio > Segurança Sem Fio' },
    { id: 'wireless_macfilter', label: 'Sem Fio > Filtragem por MAC' },
    { id: 'guest', label: 'Rede de Convidados' },
    { id: 'forwarding_vserver', label: 'Encaminhamento > Servidores Virtuais' },
    { id: 'forwarding_dmz', label: 'Encaminhamento > Host DMZ' },
    { id: 'parental', label: 'Controle dos Pais' },
    { id: 'bandwidth_control', label: 'Controle de Banda (QoS)' },
    { id: 'diag_tools', label: 'Ferramentas > Diagnósticos' },
    { id: 'maintenance', label: 'Ferramentas > Reiniciar' }
  ]
};

/**
 * Obtém a lista de menus de acordo com o dispositivo
 * @param {string} deviceType 
 * @returns {Array<{id: string, label: string}>}
 */
function getMenuStructure(deviceType) {
  return MENU_REGISTRY[deviceType] || MENU_REGISTRY.nrouter;
}

/**
 * Monta ou atualiza a barra superior de seleção de bancada (Todos os 7 Aparelhos)

function renderDeviceSwitcher() {
  let switcher = document.getElementById('deviceSwitcherBar');
  if (!switcher) {
    switcher = document.createElement('div');
    switcher.id = 'deviceSwitcherBar';
    switcher.style.cssText = 'background: #091a2b; color: #fff; padding: 6px 16px; display: flex; align-items: center; gap: 8px; font-size: 12px; border-bottom: 2px solid #0284c7; z-index: 1000; flex-wrap: wrap;';

    const label = document.createElement('span');
    label.innerText = 'Bancada de Laboratório:';
    label.style.fontWeight = 'bold';
    label.style.color = '#38bdf8';
    switcher.appendChild(label);

    const devices = [
      { key: 'TD-W8961ND', label: '📟 Modem ADSL' },
      { key: 'TX-6610', label: '💡 GPON ONT (Fibra)' },
      { key: 'TL-SG3210', label: '🎛️ Switch L2 (VLANs)' },
      { key: 'TL-WR841N', label: '📶 Roteador Wi-Fi' },
      { key: 'TL-WA850RE', label: '🔌 Repetidor' },
      { key: 'EAP225', label: '📡 AP Corporativo PoE' },
      { key: 'Tapo-H100', label: '🏠 Gateway IoT (Smart Hub)' },
      { key: 'TL-R470T', label: '🏢 Multi-WAN Balanceador' }
    ];

    devices.forEach(dev => {
      const btn = document.createElement('button');
      btn.className = 'btn-switch-device';
      btn.setAttribute('data-device', dev.key);
      btn.innerText = dev.label;
      btn.style.cssText = 'background: #1e293b; color: #cbd5e1; border: 1px solid #475569; padding: 4px 8px; font-size: 11px; border-radius: 4px; cursor: pointer; transition: all 0.2s ease;';

      btn.addEventListener('click', async () => {
        const url = new URL(window.location);
        url.searchParams.set('device', dev.key);
        window.location.href = url.toString();
      });

      switcher.appendChild(btn);
    });

    const body = document.body;
    body.insertBefore(switcher, body.firstChild);
  }

  switcher.querySelectorAll('.btn-switch-device').forEach(b => {
    const isCurrent = b.getAttribute('data-device') === appState.targetDeviceKey;
    b.style.background = isCurrent ? '#0284c7' : '#1e293b';
    b.style.color = isCurrent ? '#ffffff' : '#cbd5e1';
    b.style.borderColor = isCurrent ? '#38bdf8' : '#475569';
    b.style.fontWeight = isCurrent ? 'bold' : 'normal';
  });
}
*/

/**
 * Renderização central da interface
 */
export function renderInterface() {
  const d = appState.deviceData;
  if (!d) return;

  /* renderDeviceSwitcher();*/

  const modelNameEl = document.getElementById('firmwareModelName');
  const modelSubEl = document.getElementById('firmwareModelSub');
  if (modelNameEl) modelNameEl.innerText = d.name.split(' ')[0];
  if (modelSubEl) modelSubEl.innerText = d.name;

  const menuItems = getMenuStructure(d.type);
  const isValidTab = menuItems.some(item => item.id === appState.activeTab);
  if (!isValidTab) {
    appState.activeTab = menuItems[0].id;
  }

  const menuContainer = document.getElementById('sidebarMenu');
  if (menuContainer) {
    menuContainer.innerHTML = '';
    menuItems.forEach(item => {
      const li = document.createElement('li');
      li.className = `tp-menu-item ${appState.activeTab === item.id ? 'active' : ''}`;
      li.innerText = item.label;
      li.setAttribute('title', `Abrir: ${item.label}`);
      li.addEventListener('click', () => {
        appState.activeTab = item.id;
        renderInterface();
      });
      menuContainer.appendChild(li);
    });
  }

  const helpKey = appState.activeTab.split('_')[1] || appState.activeTab;
  const helpContent = document.getElementById('helpContent');
  if (helpContent) {
    helpContent.innerHTML = HELP_DICTIONARY[helpKey] || HELP_DICTIONARY[appState.activeTab] || 'Selecione uma opção de configuração.';
  }

  renderContentSection();
}

/**
 * Despacha o preenchimento da área de conteúdo principal
 */
function renderContentSection() {
  const title = document.getElementById('sectionTitle');
  const body = document.getElementById('sectionBody');
  if (!title || !body) return;

  const tab = appState.activeTab;

  // 1. Manutenção / Reboot Global
  if (tab === 'maintenance') {
    title.innerText = 'Manutenção - Reinicialização do Sistema';
    body.innerHTML = `
      <p style="margin-bottom:15px;">Clique no botão abaixo para reiniciar o sistema embarcado do dispositivo e aplicar todas as alterações.</p>
      <button class="btn-tplink" id="btnTriggerMaintenanceReboot">REINICIAR</button>
    `;
    body.querySelector('#btnTriggerMaintenanceReboot').addEventListener('click', () => {
      triggerReboot('Reiniciando o equipamento...', () => {
        renderInterface();
      });
    });
    return;
  }

  // 2. Status Geral (ADSL / Residencial / Multi-WAN)
  if (tab === 'status') {
    title.innerText = 'Status';
    renderStatusView(body);
    return;
  }

  // 3. Assistente ADSL
  if (tab === 'quickstart') {
    title.innerText = 'Assistente de Configuração Rápida';
    renderWizardView(body, renderInterface);
    return;
  }

  // 4. Switch Gerenciável L2 (TL-SG3210)
  const switchTabs = ['switch_ports', 'switch_vlan', 'switch_mactable', 'switch_simulator'];
  if (switchTabs.includes(tab)) {
    renderSwitchView(tab, title, body, renderInterface);
    return;
  }

  // 5. Repetidor Wi-Fi (TL-WA850RE)
  const extenderTabs = ['extender_status', 'extender_wizard', 'extender_mode'];
  if (extenderTabs.includes(tab)) {
    renderExtenderView(tab, title, body, renderInterface);
    return;
  }

  // 6. Access Point Corporativo PoE (EAP225)
  const apTabs = ['ap_status', 'ap_multissid', 'ap_radios', 'ap_portal'];
  if (apTabs.includes(tab)) {
    renderAccessPointView(tab, title, body, renderInterface);
    return;
  }

  // 7. Terminal Óptico GPON ONT (TX-6610)
  const gponTabs = ['gpon_status', 'gpon_config', 'gpon_wan'];
  if (gponTabs.includes(tab)) {
    renderGponView(tab, title, body, renderInterface);
    return;
  }

  // 8. Rádio Wi-Fi Geral (TL-WR841N)
  if (tab === 'wireless') {
    title.innerText = 'Configurações Sem Fio (Wireless)';
    renderWirelessView(body, renderInterface);
    return;
  }

  if (tab === 'wireless_sec') {
    title.innerText = 'Segurança Sem Fio (Wireless Security)';
    renderWirelessSecView(body, renderInterface);
    return;
  }

  if (tab === 'wireless_macfilter') {
    title.innerText = 'Filtragem por Endereço MAC Sem Fio';
    renderMacFilterView(body, renderInterface);
    return;
  }
  const mtTabs = ['mt_resource', 'mt_ip_addresses', 'mt_ip_routes', 'mt_firewall_nat', 'mt_ppp_server', 'mt_terminal'];
  if (mtTabs.includes(tab)) {
    renderMikrotikView(tab, title, body, renderInterface);
    return;
  }
  
  const pfTabs = ['pf_dashboard', 'pf_rules', 'pf_pkt_sim', 'pf_aliases', 'pf_openvpn'];
  if (pfTabs.includes(tab)) {
    renderPfsenseView(tab, title, body, renderInterface);
    return;
  }
  // 9. Funcionalidades Residenciais (TL-WR841N)
  const residentialTabs = ['wr_macclone', 'guest', 'forwarding_vserver', 'forwarding_dmz', 'parental', 'bandwidth_control'];
  if (residentialTabs.includes(tab)) {
    renderResidentialView(tab, title, body, renderInterface);
    return;
  }

  //10. Gateway IoT (Tapo-H100)
  const iotTabs = ['iot_status', 'iot_devices', 'iot_automations', 'iot_matter'];
  if (iotTabs.includes(tab)) {
    renderIoTView(tab, title, body, renderInterface);
    return;
  }
  // 11. Interfaces WAN, Multi-WAN e Diagnósticos
  renderWanView(tab, title, body, renderInterface);
}