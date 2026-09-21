/**
 * BART-LINK Simulator — Orquestrador de Renderização da Interface
 * Constrói a navegação lateral, cabeçalho e roteia a área central de conteúdo.
 */

import { appState } from '../state.js';
import { HELP_DICTIONARY } from '../constants.js';

// Vistas que encapsulam cada ecrã individual
import { renderStatusView } from './views/status.js';
import { renderWizardView } from './views/wizard.js';
import { renderWirelessView, renderWirelessSecView, renderMacFilterView } from './views/wireless.js';
import { renderWanView } from './views/wan.js';
import { triggerReboot } from '../services/networkSim.js';

/**
 * Obtém os itens de menu baseados no tipo do dispositivo atual
 * @param {string} deviceType 
 * @returns {Array<{id: string, label: string}>}
 */
function getMenuStructure(deviceType) {
  if (deviceType === 'loadbalance') {
    return [
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
    ];
  }

  if (deviceType === 'adsl') {
    return [
      { id: 'status', label: 'Status' },
      { id: 'quickstart', label: 'Assistente Rápido' },
      { id: 'network_lan', label: 'Configuração de Interface (LAN)' },
      { id: 'maintenance', label: 'Manutenção' }
    ];
  }

  // Padrão: nrouter (TL-WR841N)
  return [
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
  ];
}

/**
 * Renderiza todo o ambiente: cabeçalhos, barra lateral e secção ativa
 */
export function renderInterface() {
  const d = appState.deviceData;
  if (!d) return;

  // Atualização dos nomes e modelos no cabeçalho
  const modelNameEl = document.getElementById('firmwareModelName');
  const modelSubEl = document.getElementById('firmwareModelSub');
  if (modelNameEl) modelNameEl.innerText = d.name.split(' ')[0];
  if (modelSubEl) modelSubEl.innerText = d.name;

  // Construção dinâmica da lista do menu lateral
  const menuContainer = document.getElementById('sidebarMenu');
  if (menuContainer) {
    menuContainer.innerHTML = '';
    const menuItems = getMenuStructure(d.type);

    menuItems.forEach(item => {
      const li = document.createElement('li');
      li.className = `tp-menu-item ${appState.activeTab === item.id ? 'active' : ''}`;
      li.innerText = item.label;
      li.setAttribute('title', `Acessar menu: ${item.label}`);
      li.addEventListener('click', () => {
        appState.activeTab = item.id;
        renderInterface();
      });
      menuContainer.appendChild(li);
    });
  }

  // Atualização do texto da barra lateral de ajuda
  const helpKey = appState.activeTab.split('_')[1] || appState.activeTab;
  const helpContent = document.getElementById('helpContent');
  if (helpContent) {
    helpContent.innerHTML = HELP_DICTIONARY[helpKey] || HELP_DICTIONARY[appState.activeTab] || 'Selecione uma opção.';
  }

  // Encaminha a renderização do bloco central
  renderContentSection();
}

/**
 * Roteia o preenchimento da área de conteúdo principal
 */
function renderContentSection() {
  const title = document.getElementById('sectionTitle');
  const body = document.getElementById('sectionBody');
  if (!title || !body) return;

  const tab = appState.activeTab;

  // 1. Status Geral
  if (tab === 'status') {
    title.innerText = 'Status';
    renderStatusView(body);
    return;
  }

  // 2. Assistente Rápido ADSL
  if (tab === 'quickstart') {
    title.innerText = 'Assistente de Configuração Rápida';
    renderWizardView(body, renderInterface);
    return;
  }

  // 3. Menus Sem Fios (Wireless)
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

  // 4. Manutenção (Reinicialização)
  if (tab === 'maintenance') {
    title.innerText = 'Manutenção - Reinicialização do Sistema';
    body.innerHTML = `
      <p style="margin-bottom:15px;">Clique no botão abaixo para reiniciar o sistema embarcado do roteador.</p>
      <button class="btn-tplink" id="btnTriggerMaintenanceReboot">REINICIAR</button>
    `;
    body.querySelector('#btnTriggerMaintenanceReboot').addEventListener('click', () => {
      triggerReboot('Reiniciando o equipamento...', () => {
        renderInterface();
      });
    });
    return;
  }

  // 5. WAN, Multi-WAN, Rotas e Ferramentas (Delegadas para módulo WAN/Tools)
  renderWanView(tab, title, body, renderInterface);
}