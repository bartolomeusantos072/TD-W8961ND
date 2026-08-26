/**
 * BART-LINK Simulator — Ambiente Educacional de Redes de Computadores
 * Copyright (c) 2026 Bartolomeu Uender dos Santos
 * 
 * Licenciado sob a Licença MIT.
 * Distribuído gratuitamente para fins didáticos e educacionais.
 * 
 * -----------------------------------------------------------------------------
 * Motor de Simulação TP-LINK / BART-LINK
 * Implementação: Varredura Wi-Fi com Modal, WDS, Criptografia WPA/WPA2/WEP,
 * Multi-WAN Load Balance, Link Backup, QoS, Firewall, Defesa Anti-ARP e Diagnósticos.
 * -----------------------------------------------------------------------------
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', current);
  localStorage.setItem('theme', current);
}

// Restaura o tema salvo ao carregar a página
document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') || 'light');

const CONFIG = {
  defaultDevice: 'TD-W8961ND',
  auth: { user: 'admin', pass: 'admin' }
};

let appState = {
  targetDeviceKey: 'TD-W8961ND',
  deviceData: null,
  ispPresets: [],
  wdsSurvey: [],
  activeTab: 'status',
  quickStep: 1
};

let wizardTempData = {};

const REGRAS_DSLAM = {
  "Oi Velox - Grupo 1": { vpi: 1, vci: 32, aceita: ["RS"] },
  "Oi Velox - Grupo 2": { vpi: 0, vci: 35, aceita: ["AC", "DF", "GO", "MS", "MT", "PR", "RO", "SC"] },
  "Oi Velox - Grupo 3": { vpi: 0, vci: 33, aceita: ["AL", "BA", "CE", "ES", "MA", "MG", "PA", "PB", "PE", "RJ", "RN", "SE"] },
  "Telefônica / Speedy / Vivo": { vpi: 8, vci: 35, aceita: ["SP"] },
  "GVT (Legado)": { vpi: 0, vci: 35, aceita: "Nacional" }
};

const UF_AULA = "MG";

const HELP_DICTIONARY = {
  status: `
    <h4>Status do Sistema</h4>
    <p>Exibe os parâmetros operacionais de hardware, rede local (LAN), interfaces de Internet (WAN) e estatísticas de tráfego.</p>
  `,
  quickstart: `
    <h4>Assistente de Configuração Rápida (ADSL)</h4>
    <p>Guia passo a passo para configuração de parâmetros ATM (VPI/VCI) e credenciais PPPoE da operadora.</p>
  `,
  wr_wan: `
    <h4>Configurações de WAN</h4>
    <p>Define o tipo de conexão com a Internet: IP Dinâmico (DHCP), IP Estático ou discagem PPPoE.</p>
  `,
  wr_macclone: `
    <h4>Clonagem de MAC</h4>
    <p>Copia o endereço MAC físico da placa de rede do computador para a porta WAN caso a operadora restrinja a autenticação ao computador original.</p>
  `,
  network_lan: `
    <h4>Configuração de LAN e DHCP</h4>
    <p>Define o endereço IP do roteador (Gateway) e a faixa de endereços distribuídos automaticamente para a rede interna.</p>
  `,
  wireless: `
    <h4>Configurações Sem Fio e WDS</h4>
    <p>Ajuste do nome da rede (SSID), canal de operação e enlace de repetição sem fio (WDS Bridging) através da ferramenta de varredura (Survey).</p>
  `,
  wireless_sec: `
    <h4>Segurança Sem Fio</h4>
    <p>Criptografia de transmissão: WPA/WPA2-PSK (AES/TKIP), WEP legado ou padrão corporativo com servidor central RADIUS.</p>
  `,
  wireless_macfilter: `
    <h4>Filtro de MAC Sem Fio</h4>
    <p>Permite (Lista Branca) ou Bloqueia (Lista Negra) dispositivos específicos com base em seus endereços físicos.</p>
  `,
  guest: `
    <h4>Rede de Convidados</h4>
    <p>Cria uma rede Wi-Fi isolada para visitantes, impedindo o acesso aos computadores e servidores da rede principal.</p>
  `,
  forwarding_vserver: `
    <h4>Servidores Virtuais (Redirecionamento de Portas)</h4>
    <p>Encaminha portas públicas da Internet para servidores na rede interna (ex: Web porta 80, Câmeras porta 8080).</p>
  `,
  forwarding_dmz: `
    <h4>Hospedeiro DMZ</h4>
    <p>Expõe todas as portas de um computador local diretamente para a Internet para testes ou jogos online.</p>
  `,
  parental: `
    <h4>Controle dos Pais</h4>
    <p>Restringe o acesso à Internet de aparelhos específicos por horários e lista de sites permitidos.</p>
  `,
  bandwidth_control: `
    <h4>Controle de Banda (QoS)</h4>
    <p>Limita as taxas de envio (Upload) e recepção (Download) por endereço IP ou faixa de rede local.</p>
  `,
  trans_loadbalance: `
    <h4>Balanceamento de Carga</h4>
    <p>Distribui as requisições dos computadores entre múltiplos provedores de Internet usando regras proporcionais de tráfego.</p>
  `,
  trans_linkbackup: `
    <h4>Redundância de Link (Failover)</h4>
    <p>Ativa automaticamente um link de contingência caso a conexão principal sofra quedas ou instabilidades.</p>
  `,
  trans_policyroute: `
    <h4>Roteamento Baseado em Políticas</h4>
    <p>Direciona tráfegos específicos (ex: portas HTTP/HTTPS ou IPs específicos) obrigatoriamente por um link determinado.</p>
  `,
  firewall_antiarp: `
    <h4>Defesa Anti ARP Spoofing</h4>
    <p>Protege a rede contra ataques de envenenamento ARP através do travamento estático IP-MAC e envio de anúncios GARP.</p>
  `,
  diag_tools: `
    <h4>Diagnósticos de Rede</h4>
    <p>Realiza testes de conectividade ICMP (Ping) e verificação de rotas (Traceroute) pelas portas físicas.</p>
  `,
  syslog_view: `
    <h4>Registros do Sistema</h4>
    <p>Histórico de eventos operacionais, concessões de IP do DHCP e notificações de segurança do equipamento.</p>
  `,
  maintenance: `
    <h4>Manutenção do Sistema</h4>
    <p>Reinicialização do sistema operacional embarcado e restauração dos padrões de fábrica.</p>
  `
};

document.addEventListener('DOMContentLoaded', async () => {
  await initData();
  setupAuth();
  setupSupportModal();
});

// =============================================================================
// 1. INICIALIZAÇÃO DE DADOS E AUTENTICAÇÃO
// =============================================================================

async function initData() {
  const urlParams = new URLSearchParams(window.location.search);
  const host = window.location.hostname.toLowerCase();
  
  let target = urlParams.get('device') || CONFIG.defaultDevice;
  if (host.includes('adsl')) target = 'TD-W8961ND';
  if (host.includes('loadbalance')) target = 'TL-R470T';
  if (host.includes('roteador') || host.includes('wr841')) target = 'TL-WR841N';

  appState.targetDeviceKey = target;
  const storageKey = `BARTLINK_SESSION_${target}`;
  const sessionData = sessionStorage.getItem(storageKey);

  try {
    const res = await fetch('devices.json');
    const json = await res.json();
    appState.ispPresets = json.ispPresets || [];
    appState.wdsSurvey = json.wdsScanSurvey || [];

    if (sessionData) {
      appState.deviceData = JSON.parse(sessionData);
    } else {
      const factory = json.devices[target] || json.devices[CONFIG.defaultDevice];
      appState.deviceData = JSON.parse(JSON.stringify(factory));
      saveState();
    }
  } catch (err) {
    console.error('Falha ao carregar devices.json:', err);
  }
}

function saveState() {
  sessionStorage.setItem(`BARTLINK_SESSION_${appState.targetDeviceKey}`, JSON.stringify(appState.deviceData));
}

function setupAuth() {
  const host = window.location.hostname || 'tplinkwifi.net';
  const hostEl = document.getElementById('authHostDisplay');
  if (hostEl) hostEl.innerText = host;

  const btnSubmit = document.getElementById('btnSubmitAuth');
  const btnCancel = document.getElementById('btnCancelAuth');
  const txtUser = document.getElementById('authUsername');
  const txtPass = document.getElementById('authPassword');
  const errBox = document.getElementById('authErrorMessage');

  function attemptLogin() {
    if (txtUser.value === CONFIG.auth.user && txtPass.value === CONFIG.auth.pass) {
      document.getElementById('httpAuthOverlay').style.display = 'none';
      document.getElementById('firmwareContainer').style.display = 'flex';
      renderInterface();
    } else {
      errBox.innerText = 'Nome de usuário ou senha incorretos.';
      txtPass.value = '';
      txtPass.focus();
    }
  }

  if (btnSubmit) btnSubmit.addEventListener('click', attemptLogin);
  if (txtPass) txtPass.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });
  if (txtUser) txtUser.addEventListener('keydown', (e) => { if (e.key === 'Enter') attemptLogin(); });

  if (btnCancel) {
    btnCancel.addEventListener('click', () => {
      document.getElementById('httpAuthOverlay').style.display = 'none';
      document.getElementById('unauthorizedScreen').style.display = 'block';
    });
  }
}

// =============================================================================
// 2. SUPORTE, DOAÇÃO VOLUNTÁRIA E PIX
// =============================================================================

function setupSupportModal() {
  const modal = document.getElementById('supportModal');
  const btnCopy = document.querySelector('.btn-copy-pix');
  const chavePix = 'professorbarto@gmail.com';

  // Fechar ao clicar fora da caixa branca
  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Fechar ao pressionar a tecla ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      modal.style.display = 'none';
    }
  });

  // Copiar chave PIX com retorno visual
  if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(chavePix);
        const originalText = btnCopy.innerHTML;
        btnCopy.innerHTML = '✅ Chave Copiada!';
        btnCopy.style.backgroundColor = '#0d9488';

        setTimeout(() => {
          btnCopy.innerHTML = originalText;
          btnCopy.style.backgroundColor = '';
        }, 2000);
      } catch (err) {
        console.error('Falha ao copiar:', err);
      }
    });
  }
}

// =============================================================================
// 3. RENDERIZAÇÃO DA INTERFACE E MENUS
// =============================================================================

function renderInterface() {
  const d = appState.deviceData;
  document.getElementById('firmwareModelName').innerText = d.name.split(' ')[0];
  document.getElementById('firmwareModelSub').innerText = d.name;

  let menu = [];

  if (d.type === 'loadbalance') {
    menu = [
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
  } else if (d.type === 'adsl') {
    menu = [
      { id: 'status', label: 'Status' },
      { id: 'quickstart', label: 'Assistente Rápido' },
      { id: 'network_lan', label: 'Configuração de Interface (LAN)' },
      { id: 'maintenance', label: 'Manutenção' }
    ];
  } else if (d.type === 'nrouter') {
    menu = [
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

  const menuContainer = document.getElementById('sidebarMenu');
  menuContainer.innerHTML = '';

  menu.forEach(item => {
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

  const helpKey = appState.activeTab.split('_')[1] || appState.activeTab;
  document.getElementById('helpContent').innerHTML = HELP_DICTIONARY[helpKey] || HELP_DICTIONARY[appState.activeTab] || 'Selecione uma opção.';
  renderContentSection();
}

// =============================================================================
// 4. ÁREA CENTRAL DE CONTEÚDO
// =============================================================================

function renderContentSection() {
  const d = appState.deviceData;
  const title = document.getElementById('sectionTitle');
  const body = document.getElementById('sectionBody');

  // --- 1. STATUS GERAL ---
  if (appState.activeTab === 'status') {
    title.innerText = 'Status';
    if (d.type === 'loadbalance') {
      let wanRows = d.wans.map(w => `
        <tr>
          <td><strong>WAN ${w.id}</strong></td>
          <td>${w.type}</td>
          <td><strong style="color: ${w.status === 'Connected' || w.status === 'Conectado' ? '#008800' : '#888'};">${w.status === 'Connected' ? 'Conectado' : w.status}</strong></td>
          <td>${w.ip}</td>
          <td>${w.gateway}</td>
          <td>${(w.upstream/1000).toFixed(0)}k / ${(w.downstream/1000).toFixed(0)}k</td>
        </tr>
      `).join('');

      body.innerHTML = `
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
      body.innerHTML = `
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
      body.innerHTML = `
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

  // --- 2. ASSISTENTE ADSL ---
  else if (appState.activeTab === 'quickstart') {
    title.innerText = 'Assistente de Configuração Rápida';
    renderWizard(body);
  }

  // --- 3. CONFIGURAÇÕES SEM FIO & REPETIDOR WDS ---
  else if (appState.activeTab === 'wireless' && d.type === 'nrouter') {
    title.innerText = 'Configurações Sem Fio (Wireless)';
    const w = d.wireless;
    body.innerHTML = `
      <div class="form-grid">
        <label title="Nome da rede sem fio">Nome da Rede (SSID):</label>
        <input type="text" id="wrSsid" title="Digite o nome da rede Wi-Fi" value="${w.ssid}">

        <label title="Modo de modulação de frequência Wi-Fi">Modo:</label>
        <select id="wrMode" title="Padrão de rádio compatível">
          <option value="11bgn mixed" selected>11bgn misto (Recomendado)</option>
          <option value="11bg mixed">11bg misto</option>
          <option value="11n only">11n apenas</option>
        </select>

        <label title="Largura de canal em 2.4GHz">Largura do Canal:</label>
        <select id="wrWidth">
          <option value="Auto" ${w.channelWidth === 'Auto' ? 'selected' : ''}>Automático</option>
          <option value="20MHz" ${w.channelWidth === '20MHz' ? 'selected' : ''}>20MHz</option>
          <option value="40MHz" ${w.channelWidth === '40MHz' ? 'selected' : ''}>40MHz</option>
        </select>

        <label title="Canal de radiofrequência">Canal:</label>
        <select id="wrChan">
          <option value="Auto" ${w.channel === 'Auto' ? 'selected' : ''}>Automático</option>
          <option value="1" ${w.channel === '1' ? 'selected' : ''}>Canal 1</option>
          <option value="6" ${w.channel === '6' ? 'selected' : ''}>Canal 6</option>
          <option value="11" ${w.channel === '11' ? 'selected' : ''}>Canal 11</option>
        </select>

        <label title="Ativar função repetidor de sinal Wi-Fi (WDS)">Habilitar Repetidor (WDS):</label>
        <div>
          <input type="checkbox" id="chkWds" ${w.wdsEnabled ? 'checked' : ''} onchange="toggleWdsFields(this.checked)">
          <span style="font-size:11px; color:#666;">(Conectar e repetir sinal de outro roteador sem fio)</span>
        </div>
      </div>

      <!-- CAMPOS DO REPETIDOR WDS (COM BOTÃO VARREDURA) -->
      <div id="wdsFieldsContainer" style="display: ${w.wdsEnabled ? 'block' : 'none'}; border: 1px solid #c2d5e3; background: #fdfdfd; padding: 12px; margin: 15px 0;">
        <h4 style="color:#004466; margin-bottom:10px;">Configurações do Enlace de Repetição (WDS Bridging)</h4>
        <div class="form-grid">
          <label title="Nome da rede sem fio do roteador raiz">SSID (Rede Raiz):</label>
          <div>
            <input type="text" id="wdsSsid" placeholder="Nome do Wi-Fi raiz" value="${w.wdsSsid || ''}" style="width:200px;">
            <button class="btn-tplink" title="Escanear redes vizinhas no ar" onclick="openSurveyModal()">Buscar (Survey)</button>
          </div>

          <label title="Endereço MAC do roteador raiz">BSSID (MAC Raiz):</label>
          <input type="text" id="wdsBssid" placeholder="Ex: C0-4A-00-1E-5A-20" value="${w.wdsBssid || ''}">

          <label title="Tipo de criptografia da rede de origem">Tipo de Chave:</label>
          <select id="wdsKeyType">
            <option value="WPA-PSK/WPA2-PSK" selected>WPA-PSK / WPA2-PSK</option>
            <option value="WEP">WEP</option>
            <option value="None">Nenhuma (Aberta)</option>
          </select>

          <label title="Senha de conexão Wi-Fi do roteador raiz">Senha da Rede Raiz:</label>
          <input type="password" id="wdsKey" placeholder="Senha do Wi-Fi que será repetido" value="${w.wdsKey || ''}">
        </div>
        <p style="font-size:11px; color:#a00; margin-top:8px;">
          <strong>Atenção Didática:</strong> Ao habilitar o WDS, o roteador desativará o servidor DHCP local e ajustará o IP LAN para 192.168.0.254 para evitar conflito com o roteador principal.
        </p>
      </div>

      <button class="btn-tplink" title="Salvar configurações" onclick="saveWrWirelessAndWds()">SALVAR</button>
    `;
  }

  // --- 4. SEGURANÇA SEM FIO ---
  else if (appState.activeTab === 'wireless_sec' && d.type === 'nrouter') {
    title.innerText = 'Segurança Sem Fio (Wireless Security)';
    const w = d.wireless;
    body.innerHTML = `
      <div class="form-grid">
        <label title="Protocolo de segurança">Opção de Segurança:</label>
        <select id="wrSecSelect" onchange="renderSecSubFields(this.value)">
          <option value="WPA-PSK/WPA2-PSK" ${w.security === 'WPA-PSK/WPA2-PSK' ? 'selected' : ''}>WPA/WPA2 - Pessoal (Recomendado)</option>
          <option value="WPA-Enterprise" ${w.security === 'WPA-Enterprise' ? 'selected' : ''}>WPA/WPA2 - Corporativo (Servidor RADIUS)</option>
          <option value="WEP" ${w.security === 'WEP' ? 'selected' : ''}>WEP (Legado 64/128-bit)</option>
          <option value="Disable Security" ${w.security === 'Disable Security' ? 'selected' : ''}>Desativar Segurança (Rede Aberta)</option>
        </select>
      </div>

      <div id="secFieldsContainer" style="margin-top:15px; border-top:1px dashed #ccc; padding-top:15px;"></div>
      <button class="btn-tplink" style="margin-top:15px;" onclick="saveAdvancedSecurity()">SALVAR</button>
    `;
    renderSecSubFields(w.security || 'WPA-PSK/WPA2-PSK');
  }

  // --- 5. FILTRO DE MAC SEM FIO ---
  else if (appState.activeTab === 'wireless_macfilter' && d.type === 'nrouter') {
    title.innerText = 'Filtragem por Endereço MAC Sem Fio';
    const mf = d.wireless.macFilter || { enabled: false, rule: 'ALLOW', list: [] };
    let rows = (mf.list || []).map((m, idx) => `
      <tr>
        <td>${m.mac}</td>
        <td>${m.desc}</td>
        <td><strong style="color:green;">${m.status === 'Enabled' ? 'Ativo' : 'Inativo'}</strong></td>
        <td><button class="btn-tplink" onclick="deleteMacFilterEntry(${idx})">Excluir</button></td>
      </tr>
    `).join('');

    body.innerHTML = `
      <div class="form-grid">
        <label title="Ativar filtragem">Filtragem de MAC:</label>
        <div>
          <button class="btn-tplink" onclick="toggleMacFilterGlobal()">${mf.enabled ? 'Desativar' : 'Ativar'}</button>
          <span style="font-weight:bold; margin-left:10px; color:${mf.enabled ? 'green' : '#666'}">${mf.enabled ? 'Habilitado' : 'Desabilitado'}</span>
        </div>

        <label title="Regra de filtragem">Regras de Acesso:</label>
        <div>
          <input type="radio" name="macRule" id="rAllow" value="ALLOW" ${mf.rule === 'ALLOW' ? 'checked' : ''}>
          <label for="rAllow">Permitir apenas os aparelhos listados abaixo (Lista Branca)</label><br>
          <input type="radio" name="macRule" id="rDeny" value="DENY" ${mf.rule === 'DENY' ? 'checked' : ''}>
          <label for="rDeny">Bloquear os aparelhos listados abaixo (Lista Negra)</label>
        </div>
      </div>

      <table class="data-table" style="margin-top:15px;">
        <thead><tr><th>Endereço MAC</th><th>Descrição / Aparelho</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>${rows.length > 0 ? rows : '<tr><td colspan="4" style="text-align:center;">Nenhum endereço MAC cadastrado.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin:15px 0 8px 0;">Adicionar Novo Endereço MAC</h4>
      <div class="form-grid">
        <label>Endereço MAC:</label>
        <input type="text" id="newFilterMac" placeholder="00-11-22-33-44-55">

        <label>Descrição:</label>
        <input type="text" id="newFilterDesc" placeholder="Ex: Celular_Aluno">
      </div>
      <button class="btn-tplink" onclick="addMacFilterEntry()">ADICIONAR</button>
    `;
  }

  // --- 6. SERVIDORES VIRTUAIS ---
  else if (appState.activeTab === 'forwarding_vserver' && d.type === 'nrouter') {
    title.innerText = 'Servidores Virtuais (Redirecionamento de Portas)';
    let vRows = (d.forwarding?.virtualServers || []).map((v, i) => `
      <tr>
        <td>${v.extPort}</td>
        <td>${v.intPort}</td>
        <td>${v.serverIp}</td>
        <td>${v.proto}</td>
        <td><strong style="color:green;">${v.status === 'Enabled' ? 'Ativo' : 'Inativo'}</strong></td>
        <td><button class="btn-tplink" onclick="deleteVirtualServer(${i})">Excluir</button></td>
      </tr>
    `).join('');

    body.innerHTML = `
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
        <select id="vsProto"><option value="ALL">TODOS</option><option value="TCP">TCP</option><option value="UDP">UDP</option></select>
      </div>
      <button class="btn-tplink" onclick="addVirtualServer()">SALVAR REGRA</button>
    `;
  }

  // --- 7. DMZ ---
  else if (appState.activeTab === 'forwarding_dmz' && d.type === 'nrouter') {
    title.innerText = 'Hospedeiro DMZ (Zona Desmilitarizada)';
    const dmz = d.forwarding?.dmz || { enabled: false, ip: '0.0.0.0' };
    body.innerHTML = `
      <div class="form-grid">
        <label>Status do Host DMZ:</label>
        <div>
          <input type="radio" name="dmzSt" id="dmzEn" value="true" ${dmz.enabled ? 'checked' : ''}> <label for="dmzEn">Habilitar</label>
          <input type="radio" name="dmzSt" id="dmzDis" value="false" ${!dmz.enabled ? 'checked' : ''}> <label for="dmzDis">Desabilitar</label>
        </div>

        <label>Endereço IP na LAN:</label>
        <input type="text" id="txtDmzIp" value="${dmz.ip}" placeholder="192.168.0.x">
      </div>
      <button class="btn-tplink" onclick="saveDmzConfig()">SALVAR</button>
    `;
  }

  // --- 8. CONTROLE DE BANDA (QoS) ---
  else if (appState.activeTab === 'bandwidth_control' && d.type === 'nrouter') {
    title.innerText = 'Controle de Banda e Qualidade de Serviço (QoS)';
    const qos = d.bandwidthControl || { enabled: false, egress: 1024, ingress: 10240, rules: [] };
    body.innerHTML = `
      <div class="form-grid">
        <label>Habilitar Controle de Banda:</label>
        <input type="checkbox" id="chkQosEn" ${qos.enabled ? 'checked' : ''}>

        <label>Banda Máxima de Envio (Upload Kbps):</label>
        <input type="text" id="txtEgress" value="${qos.egress}">

        <label>Banda Máxima de Recepção (Download Kbps):</label>
        <input type="text" id="txtIngress" value="${qos.ingress}">
      </div>
      <button class="btn-tplink" onclick="saveQosSettings()">SALVAR</button>
    `;
  }

  // --- 9. WAN WR841N ---
  else if (appState.activeTab === 'wr_wan' && d.type === 'nrouter') {
    title.innerText = 'Configuração da Interface WAN (Internet)';
    body.innerHTML = `
      <div class="form-grid">
        <label>Tipo de Conexão WAN:</label>
        <select id="wrWanType" onchange="toggleWrWanFields(this.value)">
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
      <button class="btn-tplink" onclick="saveWrWanConfig()">SALVAR</button>
    `;
  }

  // --- 10. CLONAR MAC ---
  else if (appState.activeTab === 'wr_macclone' && d.type === 'nrouter') {
    title.innerText = 'Clonagem de Endereço MAC';
    body.innerHTML = `
      <div class="form-grid">
        <label>Endereço MAC da WAN:</label>
        <input type="text" id="wrWanMac" value="${d.wan.mac}">

        <label>MAC da Placa do seu Computador:</label>
        <div>
          <input type="text" id="pcMacDisplay" value="6C-62-6D-F7-2E-82" disabled style="width:160px;">
          <button class="btn-tplink" onclick="clonePcMac()">Clonar MAC do PC</button>
          <button class="btn-tplink" onclick="restoreFactoryMac()">Restaurar MAC Padrão</button>
        </div>
      </div>
      <button class="btn-tplink" onclick="saveMacClone()">SALVAR</button>
    `;
  }

  // --- 11. REDE DE CONVIDADOS ---
  else if (appState.activeTab === 'guest' && d.type === 'nrouter') {
    title.innerText = 'Rede Sem Fio para Convidados (Guest Network)';
    const gn = d.guestNetwork || { enabled: false, ssid: 'TP-LINK_GUEST', allowLanAccess: false };
    body.innerHTML = `
      <div class="form-grid">
        <label>Habilitar Rede de Convidados:</label>
        <input type="checkbox" id="chkGuestEnable" ${gn.enabled ? 'checked' : ''}>

        <label>Nome da Rede (SSID):</label>
        <input type="text" id="guestSsid" value="${gn.ssid}">

        <label>Permitir Acesso à Rede Local (LAN):</label>
        <input type="checkbox" id="chkGuestLan" ${gn.allowLanAccess ? 'checked' : ''}>
      </div>
      <button class="btn-tplink" onclick="saveGuestConfig()">SALVAR</button>
    `;
  }

  // --- 12. CONTROLE DOS PAIS ---
  else if (appState.activeTab === 'parental' && d.type === 'nrouter') {
    title.innerText = 'Controle dos Pais (Filtro por Aparelho e Domínio)';
    const pc = d.parentalControl || { enabled: false, parentMac: '50-E5-49-C8-E2-7A', rules: [] };
    let ruleRows = (pc.rules || []).map((r, i) => `
      <tr>
        <td>${r.childMac}</td>
        <td>${r.desc}</td>
        <td>${r.domain}</td>
        <td><strong style="color:green;">${r.status === 'Enabled' ? 'Ativo' : 'Inativo'}</strong></td>
        <td><button class="btn-tplink" onclick="deleteParentalRule(${i})">Excluir</button></td>
      </tr>
    `).join('');

    body.innerHTML = `
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
      <button class="btn-tplink" onclick="addParentalRule()">ADICIONAR REGRA</button>
    `;
  }

  // --- 13. MULTI-WAN TL-R470T+ ---
  else if (appState.activeTab === 'network_wan' && d.type === 'loadbalance') {
    title.innerText = 'Configuração das Portas WAN';
    let wanConfigs = d.wans.slice(0, d.wanPortsCount).map(w => `
      <div style="border: 1px solid #c2d5e3; padding: 10px; margin-bottom: 12px; background: #f9fbfd;">
        <h4 style="color:#004466; margin-bottom:8px;">Parâmetros da Porta WAN ${w.id}</h4>
        <div class="form-grid">
          <label>Tipo de Conexão:</label>
          <select id="wanType_${w.id}" onchange="toggleWanTypeEdit(${w.id}, this.value)">
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

    body.innerHTML = `
      <div class="form-grid" style="margin-bottom:15px; border-bottom: 1px solid #ccc; padding-bottom: 10px;">
        <label>Quantidade de Portas WAN Ativas:</label>
        <select id="selWanCount">
          <option value="1" ${d.wanPortsCount === 1 ? 'selected' : ''}>1 Porta WAN (WAN1)</option>
          <option value="2" ${d.wanPortsCount === 2 ? 'selected' : ''}>2 Portas WAN (WAN1, WAN2)</option>
          <option value="3" ${d.wanPortsCount === 3 ? 'selected' : ''}>3 Portas WAN (WAN1 a WAN3)</option>
          <option value="4" ${d.wanPortsCount === 4 ? 'selected' : ''}>4 Portas WAN (WAN1 a WAN4)</option>
        </select>
      </div>
      ${wanConfigs}
      <button class="btn-tplink" onclick="saveFullWanConfig()">SALVAR TODAS AS WANs</button>
    `;
  }

  // --- 14. BALANCEAMENTO DE CARGA (LOAD BALANCE) ---
  else if (appState.activeTab === 'trans_loadbalance' && d.type === 'loadbalance') {
    title.innerText = 'Configurações de Balanceamento de Carga';
    const lb = d.transmission.loadBalancing;
    body.innerHTML = `
      <div class="form-grid">
        <label>Ativar Balanceamento de Carga:</label>
        <input type="checkbox" id="chkLbEnable" ${lb.enabled ? 'checked' : ''}>

        <label>Roteamento Otimizado por Aplicação:</label>
        <input type="checkbox" id="chkAppOpt" ${lb.appOptimized ? 'checked' : ''}>

        <label>Balanceamento Baseado na Largura de Banda:</label>
        <input type="checkbox" id="chkBwBased" ${lb.bandwidthBased ? 'checked' : ''}>
      </div>
      <button class="btn-tplink" onclick="saveLbSettings()">SALVAR</button>
    `;
  }

  // --- 15. REDUNDÂNCIA DE LINK (FAILOVER) ---
  else if (appState.activeTab === 'trans_linkbackup' && d.type === 'loadbalance') {
    title.innerText = 'Redundância e Contingência de Links (Failover)';
    const bk = d.transmission.linkBackup;
    body.innerHTML = `
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

        <label>Modo de Acionamento:</label>
        <select id="selBackupMode">
          <option value="Failover" selected>Failover (Ativa imediatamente se o link principal cair)</option>
          <option value="Timing">Horário Programado</option>
        </select>
      </div>
      <button class="btn-tplink" onclick="saveLinkBackup()">SALVAR</button>
    `;
  }

  // --- 16. ROTEAMENTO POR REGRAS ---
  else if (appState.activeTab === 'trans_policyroute' && d.type === 'loadbalance') {
    title.innerText = 'Roteamento Baseado em Políticas';
    let routeRows = d.transmission.policyRouting.map((r, i) => `
      <tr>
        <td>${r.id}</td>
        <td>${r.name}</td>
        <td>${r.service}</td>
        <td>${r.sourceIp}</td>
        <td><strong>${r.wan}</strong></td>
        <td><button class="btn-tplink" onclick="deletePolicyRoute(${i})">Excluir</button></td>
      </tr>
    `).join('');

    body.innerHTML = `
      <table class="data-table">
        <thead><tr><th>#</th><th>Nome da Regra</th><th>Serviço</th><th>Faixa IP de Origem</th><th>WAN de Saída</th><th>Ação</th></tr></thead>
        <tbody>${routeRows}</tbody>
      </table>

      <h4 style="color:#004466; margin: 15px 0 8px 0;">Adicionar Rota por Política</h4>
      <div class="form-grid">
        <label>Nome da Regra:</label>
        <input type="text" id="polName" placeholder="Ex: Web_Direto">

        <label>Tipo de Serviço:</label>
        <select id="polService"><option value="HTTP">HTTP (Porta 80)</option><option value="HTTPS">HTTPS (Porta 443)</option><option value="ALL">TODOS os Serviços</option></select>

        <label>Faixa IP de Origem:</label>
        <input type="text" id="polSrc" placeholder="Ex: 192.168.0.10-192.168.0.50">

        <label>Forçar Saída pela WAN:</label>
        <select id="polWan"><option value="WAN1">WAN1</option><option value="WAN2">WAN2</option></select>
      </div>
      <button class="btn-tplink" onclick="addPolicyRoute()">ADICIONAR REGRA</button>
    `;
  }

  // --- 17. DEFESA ANTI ARP SPOOFING ---
  else if (appState.activeTab === 'firewall_antiarp' && d.type === 'loadbalance') {
    title.innerText = 'Proteção Anti-ARP Spoofing e Amarração IP-MAC';
    const arp = d.firewall.antiArp;
    let bindRows = d.firewall.ipMacBinding.map((b, i) => `
      <tr>
        <td>${b.ip}</td>
        <td>${b.mac}</td>
        <td>${b.desc}</td>
        <td><strong style="color:green;">${b.status === 'Enabled' ? 'Travado' : 'Inativo'}</strong></td>
        <td><button class="btn-tplink" onclick="deleteArpBind(${i})">Excluir</button></td>
      </tr>
    `).join('');

    body.innerHTML = `
      <div class="form-grid">
        <label>Ativar Proteção Anti-ARP:</label>
        <input type="checkbox" id="chkArpDef" ${arp.enabled ? 'checked' : ''}>

        <label>Enviar Pacotes GARP Periódicos:</label>
        <input type="checkbox" id="chkGarp" ${arp.sendGarp ? 'checked' : ''}>
      </div>

      <table class="data-table" style="margin-top:15px;">
        <thead><tr><th>Endereço IP</th><th>Endereço MAC</th><th>Identificação</th><th>Status</th><th>Ação</th></tr></thead>
        <tbody>${bindRows}</tbody>
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
      <button class="btn-tplink" onclick="addArpBinding()">TRAVAR IP-MAC</button>
    `;
  }

  // --- 18. DIAGNÓSTICOS (PING & TRACEROUTE) ---
  else if (appState.activeTab === 'diag_tools') {
    title.innerText = 'Diagnósticos de Rede (Ping e Traceroute)';
    body.innerHTML = `
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
      <button class="btn-tplink" onclick="runDiagnostics()">INICIAR TESTE</button>
      
      <div id="diagConsole" style="background:#111; color:#00ff66; padding:12px; margin-top:15px; font-family:monospace; font-size:11px; min-height:100px; border-radius:3px;">
        Console de diagnósticos pronto. Clique em INICIAR TESTE.
      </div>
    `;
  }

  // --- 19. LOGS DO SISTEMA ---
  else if (appState.activeTab === 'syslog_view' && d.type === 'loadbalance') {
    title.innerText = 'Registros de Eventos do Sistema (System Logs)';
    let logRows = (d.systemLogs || []).map(l => `
      <tr>
        <td width="140">${l.time}</td>
        <td width="70"><strong>${l.module}</strong></td>
        <td width="70"><span style="color:${l.level === 'NOTICE' ? '#006699' : '#333'}">${l.level}</span></td>
        <td>${l.content}</td>
      </tr>
    `).join('');

    body.innerHTML = `
      <table class="data-table" style="font-size:11px;">
        <thead><tr><th>Horário</th><th>Módulo</th><th>Nível</th><th>Descrição do Evento</th></tr></thead>
        <tbody>${logRows}</tbody>
      </table>
      <button class="btn-tplink" onclick="clearLogs()">LIMPAR LOGS</button>
    `;
  }

  // --- 20. CONFIGURAÇÃO DE LAN & DHCP ---
  else if (appState.activeTab === 'network_lan') {
    title.innerText = 'Configurações de Rede Local (LAN) e DHCP';
    body.innerHTML = `
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
      <button class="btn-tplink" onclick="saveLanConfig()">SALVAR</button>
    `;
  }

  // --- 21. REINICIALIZAÇÃO ---
  else if (appState.activeTab === 'maintenance') {
    title.innerText = 'Manutenção - Reinicialização do Sistema';
    body.innerHTML = `
      <p style="margin-bottom:15px;">Clique no botão abaixo para reiniciar o sistema embarcado do roteador.</p>
      <button class="btn-tplink" onclick="triggerReboot('Reiniciando o equipamento...', () => {})">REINICIAR</button>
    `;
  }
}

// =============================================================================
// 5. MODAL DE SURVEY (VARREDURA WI-FI)
// =============================================================================

window.openSurveyModal = function() {
  let modal = document.getElementById('surveyModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'surveyModal';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '99999';
    document.body.appendChild(modal);
  }

  let surveyRows = appState.wdsSurvey.map((s, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${s.ssid}</strong></td>
      <td>${s.bssid}</td>
      <td>${s.rssi}</td>
      <td>${s.channel}</td>
      <td>${s.security}</td>
      <td><button class="btn-tplink" onclick="selectSurveyFromModal(${idx})">Conectar</button></td>
    </tr>
  `).join('');

  modal.innerHTML = `
    <div style="background:#fff; width:650px; border-radius:4px; box-shadow:0 4px 15px rgba(0,0,0,0.3); overflow:hidden; font-family:Arial, sans-serif;">
      <div style="background:#0f2b46; color:#fff; padding:10px 15px; display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; font-size:14px;">Varredura de Redes Sem Fio (AP Survey)</h3>
        <span style="cursor:pointer; font-weight:bold; font-size:16px;" onclick="document.getElementById('surveyModal').style.display='none';">&times;</span>
      </div>
      <div style="padding:15px; max-height:400px; overflow-y:auto;">
        <p style="margin-bottom:10px; font-size:12px;">Selecione o ponto de acesso Wi-Fi que este roteador irá repetir:</p>
        <table class="data-table" style="font-size:11px;">
          <thead>
            <tr><th>#</th><th>Nome da Rede (SSID)</th><th>MAC (BSSID)</th><th>Sinal</th><th>Canal</th><th>Segurança</th><th>Ação</th></tr>
          </thead>
          <tbody>${surveyRows}</tbody>
        </table>
      </div>
      <div style="background:#f2f2f2; padding:8px 15px; text-align:right;">
        <button class="btn-tplink" onclick="document.getElementById('surveyModal').style.display='none';">Fechar</button>
      </div>
    </div>
  `;
  modal.style.display = 'flex';
};

window.selectSurveyFromModal = function(idx) {
  const net = appState.wdsSurvey[idx];
  const ssidInput = document.getElementById('wdsSsid');
  const bssidInput = document.getElementById('wdsBssid');
  const chanSelect = document.getElementById('wrChan');

  if (ssidInput) ssidInput.value = net.ssid;
  if (bssidInput) bssidInput.value = net.bssid;
  if (chanSelect) chanSelect.value = net.channel.toString();

  document.getElementById('surveyModal').style.display = 'none';
};

window.toggleWdsFields = function(checked) {
  const c = document.getElementById('wdsFieldsContainer');
  if (c) c.style.display = checked ? 'block' : 'none';
};

// =============================================================================
// 6. OPERAÇÕES DE SALVAMENTO E LÓGICA DE REDES
// =============================================================================

function renderSecSubFields(mode) {
  const container = document.getElementById('secFieldsContainer');
  if (!container) return;
  const w = appState.deviceData.wireless;

  if (mode === 'WPA-PSK/WPA2-PSK') {
    container.innerHTML = `
      <div class="form-grid">
        <label>Versão:</label>
        <select id="wpaVer">
          <option value="Automatic" selected>Automática (WPA-PSK ou WPA2-PSK)</option>
          <option value="WPA2-PSK">WPA2-PSK (AES Recomendado)</option>
        </select>

        <label>Criptografia:</label>
        <select id="wpaEnc">
          <option value="AES" selected>AES (Recomendado para 802.11n)</option>
          <option value="TKIP">TKIP</option>
        </select>

        <label>Senha da Rede (PSK):</label>
        <input type="text" id="wpaPass" value="${w.psk || '12345678'}">
      </div>
    `;
  } else if (mode === 'WPA-Enterprise') {
    container.innerHTML = `
      <div class="form-grid">
        <label>IP do Servidor RADIUS:</label>
        <input type="text" id="radIp" placeholder="192.168.0.250" value="192.168.0.250">

        <label>Porta UDP:</label>
        <input type="text" id="radPort" value="1812">

        <label>Chave Secreta Compartilhada:</label>
        <input type="password" id="radKey" value="radius_secret_key">
      </div>
    `;
  } else if (mode === 'WEP') {
    container.innerHTML = `
      <div class="form-grid">
        <label>Tipo de Autenticação:</label>
        <select id="wepType"><option value="Automatic">Automática</option><option value="Shared Key">Chave Compartilhada</option></select>

        <label>Formato da Chave:</label>
        <select id="wepFmt"><option value="Hexadecimal">Hexadecimal</option><option value="ASCII">ASCII</option></select>

        <label>Chave WEP 128-bit:</label>
        <input type="text" id="wepKey1" value="1234567890ABCDEF1234567890">
      </div>
      <p style="color:#a00; font-size:11px; margin-top:8px;">Aviso: A criptografia WEP limita a velocidade máxima para 54Mbps.</p>
    `;
  } else {
    container.innerHTML = `<p style="color:#a00; font-weight:bold;">Atenção: A rede ficará aberta sem nenhuma proteção por senha.</p>`;
  }
}

window.saveWrWirelessAndWds = function() {
  const w = appState.deviceData.wireless;
  w.ssid = document.getElementById('wrSsid').value;
  w.mode = document.getElementById('wrMode').value;
  w.channelWidth = document.getElementById('wrWidth').value;
  w.channel = document.getElementById('wrChan').value;
  w.wdsEnabled = document.getElementById('chkWds').checked;

  if (w.wdsEnabled) {
    w.wdsSsid = document.getElementById('wdsSsid').value;
    w.wdsBssid = document.getElementById('wdsBssid').value;
    w.wdsKey = document.getElementById('wdsKey').value;
    appState.deviceData.lan.dhcpEnabled = false;
    appState.deviceData.lan.ip = '192.168.0.254';
  }

  triggerReboot('Sincronizando rádio Wi-Fi e estabelecendo enlace WDS...', () => {
    saveState();
    renderInterface();
  });
};

window.saveAdvancedSecurity = function() {
  const w = appState.deviceData.wireless;
  const sec = document.getElementById('wrSecSelect').value;
  w.security = sec;

  if (sec === 'WPA-PSK/WPA2-PSK') {
    w.psk = document.getElementById('wpaPass').value;
  }
  triggerReboot('Gravando parâmetros de segurança na memória Flash...', () => {
    saveState();
    renderInterface();
  });
};

window.toggleMacFilterGlobal = function() {
  if (!appState.deviceData.wireless.macFilter) {
    appState.deviceData.wireless.macFilter = { enabled: false, rule: 'ALLOW', list: [] };
  }
  appState.deviceData.wireless.macFilter.enabled = !appState.deviceData.wireless.macFilter.enabled;
  saveState();
  renderInterface();
};

window.addMacFilterEntry = function() {
  const mac = document.getElementById('newFilterMac').value.trim().toUpperCase();
  const desc = document.getElementById('newFilterDesc').value.trim();

  if (!mac) return alert('Digite um endereço MAC válido.');
  if (!appState.deviceData.wireless.macFilter) {
    appState.deviceData.wireless.macFilter = { enabled: true, rule: 'ALLOW', list: [] };
  }

  appState.deviceData.wireless.macFilter.list.push({
    mac: mac, desc: desc || 'Dispositivo', status: 'Enabled'
  });
  saveState();
  renderInterface();
};

window.deleteMacFilterEntry = function(idx) {
  appState.deviceData.wireless.macFilter.list.splice(idx, 1);
  saveState();
  renderInterface();
};

window.addVirtualServer = function() {
  const ext = document.getElementById('vsExt').value.trim();
  const intP = document.getElementById('vsInt').value.trim();
  const ip = document.getElementById('vsIp').value.trim();
  const proto = document.getElementById('vsProto').value;

  if (!ext || !ip) return alert('Preencha a porta e o IP de destino.');
  if (!appState.deviceData.forwarding) appState.deviceData.forwarding = { virtualServers: [], dmz: { enabled: false, ip: '0.0.0.0' } };

  appState.deviceData.forwarding.virtualServers.push({
    extPort: ext, intPort: intP || ext, serverIp: ip, proto: proto, status: 'Enabled'
  });
  saveState();
  renderInterface();
};

window.deleteVirtualServer = function(idx) {
  appState.deviceData.forwarding.virtualServers.splice(idx, 1);
  saveState();
  renderInterface();
};

window.saveDmzConfig = function() {
  if (!appState.deviceData.forwarding) appState.deviceData.forwarding = { virtualServers: [], dmz: { enabled: false, ip: '0.0.0.0' } };
  const dmz = appState.deviceData.forwarding.dmz;
  dmz.enabled = document.getElementById('dmzEn').checked;
  dmz.ip = document.getElementById('txtDmzIp').value.trim();
  triggerReboot('Atualizando configurações de host DMZ...', () => {
    saveState();
    renderInterface();
  });
};

window.saveQosSettings = function() {
  if (!appState.deviceData.bandwidthControl) appState.deviceData.bandwidthControl = { enabled: false, egress: 1024, ingress: 10240, rules: [] };
  const qos = appState.deviceData.bandwidthControl;
  qos.enabled = document.getElementById('chkQosEn').checked;
  qos.egress = parseInt(document.getElementById('txtEgress').value, 10);
  qos.ingress = parseInt(document.getElementById('txtIngress').value, 10);
  triggerReboot('Aplicando regras de controle de banda (QoS)...', () => {
    saveState();
    renderInterface();
  });
};

window.toggleWrWanFields = function(val) {
  const ip = document.getElementById('wrWanIp');
  const mask = document.getElementById('wrWanMask');
  const gw = document.getElementById('wrWanGw');
  const isStatic = (val === 'Static IP');
  if (ip) ip.disabled = !isStatic;
  if (mask) mask.disabled = !isStatic;
  if (gw) gw.disabled = !isStatic;
};

window.saveWrWanConfig = function() {
  const d = appState.deviceData;
  d.wan.type = document.getElementById('wrWanType').value;
  d.wan.ip = document.getElementById('wrWanIp').value;
  d.wan.netmask = document.getElementById('wrWanMask').value;
  d.wan.gateway = document.getElementById('wrWanGw').value;
  d.wan.status = 'Connected';
  triggerReboot('Reconectando interface WAN...', () => {
    saveState();
    renderInterface();
  });
};

window.clonePcMac = function() {
  document.getElementById('wrWanMac').value = '6C-62-6D-F7-2E-82';
};

window.restoreFactoryMac = function() {
  document.getElementById('wrWanMac').value = 'F4-EC-38-B5-D2-46';
};

window.saveMacClone = function() {
  appState.deviceData.wan.mac = document.getElementById('wrWanMac').value.trim().toUpperCase();
  triggerReboot('Atualizando endereço MAC da WAN...', () => {
    saveState();
    renderInterface();
  });
};

window.saveGuestConfig = function() {
  if (!appState.deviceData.guestNetwork) appState.deviceData.guestNetwork = { enabled: false, ssid: 'TP-LINK_GUEST', allowLanAccess: false };
  const gn = appState.deviceData.guestNetwork;
  gn.enabled = document.getElementById('chkGuestEnable').checked;
  gn.ssid = document.getElementById('guestSsid').value;
  gn.allowLanAccess = document.getElementById('chkGuestLan').checked;
  triggerReboot('Atualizando Rede de Convidados...', () => {
    saveState();
    renderInterface();
  });
};

window.addParentalRule = function() {
  const mac = document.getElementById('childMacInput').value.trim().toUpperCase();
  const desc = document.getElementById('childDescInput').value.trim();
  const domain = document.getElementById('childDomainInput').value.trim();

  if (!mac || !domain) return alert('Preencha o MAC e o domínio autorizado.');
  if (!appState.deviceData.parentalControl) appState.deviceData.parentalControl = { enabled: true, parentMac: '50-E5-49-C8-E2-7A', rules: [] };

  appState.deviceData.parentalControl.rules.push({
    childMac: mac, desc: desc || 'Dispositivo', domain: domain, status: 'Enabled'
  });
  saveState();
  renderInterface();
};

window.deleteParentalRule = function(idx) {
  appState.deviceData.parentalControl.rules.splice(idx, 1);
  saveState();
  renderInterface();
};

window.saveFullWanConfig = function() {
  const d = appState.deviceData;
  const count = parseInt(document.getElementById('selWanCount').value, 10);
  d.wanPortsCount = count;

  d.wans.forEach((w, idx) => {
    if (idx < count) {
      const typeEl = document.getElementById(`wanType_${w.id}`);
      const ipEl = document.getElementById(`wanIp_${w.id}`);
      const upEl = document.getElementById(`wanUp_${w.id}`);
      const downEl = document.getElementById(`wanDown_${w.id}`);

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

  if (d.systemLogs) {
    d.systemLogs.unshift({
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      module: 'WAN',
      level: 'NOTICE',
      content: `Portas WAN atualizadas para ${count} porta(s) ativa(s).`
    });
  }

  triggerReboot('Aplicando portas Multi-WAN...', () => {
    saveState();
    renderInterface();
  });
};

window.saveLbSettings = function() {
  const lb = appState.deviceData.transmission.loadBalancing;
  lb.enabled = document.getElementById('chkLbEnable').checked;
  lb.appOptimized = document.getElementById('chkAppOpt').checked;
  lb.bandwidthBased = document.getElementById('chkBwBased').checked;
  triggerReboot('Salvando regras de Load Balance...', () => {
    saveState();
    renderInterface();
  });
};

window.saveLinkBackup = function() {
  const bk = appState.deviceData.transmission.linkBackup;
  bk.enabled = document.getElementById('chkBackupEnable').checked;
  bk.primaryWan = document.getElementById('selPrimaryWan').value;
  bk.backupWan = document.getElementById('selBackupWan').value;
  triggerReboot('Salvando redundância de links...', () => {
    saveState();
    renderInterface();
  });
};

window.addPolicyRoute = function() {
  const name = document.getElementById('polName').value.trim();
  const service = document.getElementById('polService').value;
  const src = document.getElementById('polSrc').value.trim();
  const wan = document.getElementById('polWan').value;

  if (!name || !src) return alert('Preencha o nome e a faixa de IP.');

  appState.deviceData.transmission.policyRouting.push({
    id: appState.deviceData.transmission.policyRouting.length + 1,
    name: name, service: service, sourceIp: src, wan: wan, status: 'Enabled'
  });
  saveState();
  renderInterface();
};

window.deletePolicyRoute = function(idx) {
  appState.deviceData.transmission.policyRouting.splice(idx, 1);
  saveState();
  renderInterface();
};

window.addArpBinding = function() {
  const ip = document.getElementById('bindIp').value.trim();
  const mac = document.getElementById('bindMac').value.trim().toUpperCase();
  const desc = document.getElementById('bindDesc').value.trim();

  if (!ip || !mac) return alert('Preencha o IP e o MAC.');

  appState.deviceData.firewall.ipMacBinding.push({
    ip: ip, mac: mac, desc: desc || 'Dispositivo', status: 'Enabled'
  });
  saveState();
  renderInterface();
};

window.deleteArpBind = function(idx) {
  appState.deviceData.firewall.ipMacBinding.splice(idx, 1);
  saveState();
  renderInterface();
};

window.runDiagnostics = function() {
  const tool = document.getElementById('diagTool').value;
  const target = document.getElementById('diagTarget').value.trim();
  const iface = document.getElementById('diagIface').value;
  const consoleEl = document.getElementById('diagConsole');

  consoleEl.innerHTML = `[${iface}] Executando ${tool.toUpperCase()} para ${target}...<br>`;

  let i = 1;
  const interval = setInterval(() => {
    if (tool === 'ping') {
      consoleEl.innerHTML += `Resposta de ${target}: bytes=32 tempo=${Math.floor(Math.random() * 15 + 8)}ms TTL=54 (via ${iface})<br>`;
    } else {
      consoleEl.innerHTML += `salto ${i}:  10.${i}.0.1  ${Math.floor(Math.random() * 10 + 5)}ms  ${Math.floor(Math.random() * 10 + 5)}ms<br>`;
    }
    i++;
    if (i > 4) {
      clearInterval(interval);
      consoleEl.innerHTML += `<strong>${tool.toUpperCase()} finalizado com sucesso.</strong>`;
    }
  }, 400);
};

window.clearLogs = function() {
  appState.deviceData.systemLogs = [];
  saveState();
  renderInterface();
};

window.saveLanConfig = function() {
  appState.deviceData.lan.ip = document.getElementById('inputLanIp').value;
  appState.deviceData.lan.netmask = document.getElementById('inputLanMask').value;
  appState.deviceData.lan.dhcpEnabled = document.getElementById('selectDhcp').value === 'true';
  triggerReboot('Salvando parâmetros de LAN e reiniciando DHCP...', () => {
    saveState();
    renderInterface();
  });
};

// =============================================================================
// 7. ASSISTENTE RÁPIDO ADSL (WIZARD)
// =============================================================================

function renderWizard(container) {
  const step = appState.quickStep;
  let html = `<p style="margin-bottom:15px; font-weight:bold;">Passo ${step} de 3</p>`;

  if (step === 1) {
    html += `
      <div class="form-grid">
        <label title="Fuso horário para sincronismo NTP">Fuso Horário:</label>
        <select id="wzTz">
          <option value="-5">(GMT-05:00) Horário do Leste (EUA & Canadá)</option>
          <option value="-3" selected>(GMT-03:00) Brasília, São Paulo, Minas Gerais</option>
          <option value="+0">(GMT+00:00) Londres, Lisboa, Dublin</option>
          <option value="+1">(GMT+01:00) Berlim, Paris, Madri</option>
        </select>
      </div>
      <button class="btn-tplink" onclick="appState.quickStep=2; renderContentSection();">PRÓXIMO</button>
    `;
  } else if (step === 2) {
    let presetOptions = `<option value="">-- Selecione uma Região/Operadora --</option>` + 
      appState.ispPresets.map((p, idx) => `<option value="${idx}">${p.name}</option>`).join('');

    const curVpi = wizardTempData.vpi !== undefined ? wizardTempData.vpi : (appState.deviceData.wan.vpi || '0');
    const curVci = wizardTempData.vci !== undefined ? wizardTempData.vci : (appState.deviceData.wan.vci || '33');
    const curUser = wizardTempData.username !== undefined ? wizardTempData.username : (appState.deviceData.wan.username || '');
    const curPass = wizardTempData.password !== undefined ? wizardTempData.password : (appState.deviceData.wan.password || '');

    html += `
      <div class="form-grid">
        <label>Perfil de Operadora:</label>
        <select id="wzPreset" onchange="applyWizardPreset(this.value)">${presetOptions}</select>

        <label>Tipo de Conexão WAN:</label>
        <select id="wzWanType">
          <option value="PPPoE" selected>PPPoE / PPPoA (Usuário e Senha)</option>
          <option value="Dynamic">IP Dinâmico (DHCP)</option>
          <option value="Static">IP Estático</option>
          <option value="Bridge">Modo Bridge</option>
        </select>
      </div>

      <div id="wzPppoeFields" class="form-grid">
        <label>Nome de Usuário:</label>
        <input type="text" id="wzUser" placeholder="Ex: cliente@provedor.com.br" value="${curUser}">

        <label>Senha:</label>
        <input type="password" id="wzPass" placeholder="Senha do provedor" value="${curPass}">

        <label>Circuito ATM (VPI/VCI):</label>
        <div>
          <input type="text" id="wzVpi" placeholder="VPI" value="${curVpi}" style="width:50px;"> /
          <input type="text" id="wzVci" placeholder="VCI" value="${curVci}" style="width:50px;">
        </div>
      </div>

      <div style="margin-top:15px;">
        <button class="btn-tplink" onclick="appState.quickStep=1; renderContentSection();">VOLTAR</button>
        <button class="btn-tplink" onclick="goToWizardStep3()">PRÓXIMO</button>
      </div>
    `;
  } else if (step === 3) {
    html += `
      <div class="form-section">
        <h4 style="color:#004466; margin-bottom: 10px;">Validação dos Parâmetros ADSL</h4>
        <p style="margin-bottom: 10px;">
          <strong>VCI 35:</strong> Paraná, Santa Catarina, Goiás, Mato Grosso do Sul e São Paulo (Vivo).<br>
          <strong>VCI 33:</strong> Rio de Janeiro, Minas Gerais, Bahia, Alagoas e Ceará.<br>
          <strong>VCI 32 (VPI 1):</strong> Rio Grande do Sul.
        </p>
      </div>
      <div style="margin-top:15px;">
        <button class="btn-tplink" onclick="appState.quickStep=2; renderContentSection();">VOLTAR</button>
        <button class="btn-tplink" onclick="finishQuickSetup()">SALVAR & REINICIAR</button>
      </div>
    `;
  }
  container.innerHTML = html;
}

window.goToWizardStep3 = function() {
  const vpiInput = document.getElementById('wzVpi');
  const vciInput = document.getElementById('wzVci');
  const userInput = document.getElementById('wzUser');
  const passInput = document.getElementById('wzPass');
  const presetSelect = document.getElementById('wzPreset');

  if (vpiInput) wizardTempData.vpi = parseInt(vpiInput.value, 10);
  if (vciInput) wizardTempData.vci = parseInt(vciInput.value, 10);
  if (userInput) wizardTempData.username = userInput.value.trim();
  if (passInput) wizardTempData.password = passInput.value.trim();
  
  if (presetSelect && presetSelect.value !== "") {
    const presetIndex = parseInt(presetSelect.value, 10);
    const preset = appState.ispPresets[presetIndex];
    if (preset) wizardTempData.operadora = preset.name.split(' (')[0].trim();
  }

  appState.quickStep = 3;
  renderContentSection();
};

window.finishQuickSetup = function() {
  const vpi = wizardTempData.vpi !== undefined ? wizardTempData.vpi : appState.deviceData.wan.vpi;
  const vci = wizardTempData.vci !== undefined ? wizardTempData.vci : appState.deviceData.wan.vci;
  const user = wizardTempData.username !== undefined ? wizardTempData.username : (appState.deviceData.wan.username || "");
  const pass = wizardTempData.password !== undefined ? wizardTempData.password : (appState.deviceData.wan.password || "");

  appState.deviceData.wan.vpi = vpi;
  appState.deviceData.wan.vci = vci;
  appState.deviceData.wan.username = user;
  appState.deviceData.wan.password = pass;

  const operadoraSelecionada = wizardTempData.operadora || "Oi Velox - Grupo 3";
  const regra = REGRAS_DSLAM[operadoraSelecionada];

  const circuitoValido = (regra && regra.vpi === vpi && regra.vci === vci && (regra.aceita === "Nacional" || regra.aceita.includes(UF_AULA))) ||
                         (UF_AULA === "MG" && vpi === 0 && vci === 33);

  const credenciaisPreenchidas = user.trim().length > 0 && pass.trim().length > 0;

  triggerReboot('Sincronizando modulação DSL e estabelecendo sessão PPP...', () => {
    appState.quickStep = 1;
    appState.activeTab = 'status';

    if (!circuitoValido) {
      appState.deviceData.wan.status = `Desconectado (Timeout LCP - VPI/VCI ${vpi}/${vci} inválido para ${UF_AULA})`;
      appState.deviceData.wan.ip = '0.0.0.0';
    } else if (!credenciaisPreenchidas) {
      appState.deviceData.wan.status = 'Falha de Autenticação (Usuário ou senha vazios)';
      appState.deviceData.wan.ip = '0.0.0.0';
    } else {
      appState.deviceData.wan.status = 'Conectado';
      appState.deviceData.wan.ip = '189.40.122.50';
    }

    saveState();
    renderInterface();
  });
};

window.applyWizardPreset = function(idx) {
  if (idx === '') return;
  const p = appState.ispPresets[idx];
  document.getElementById('wzVpi').value = p.vpi;
  document.getElementById('wzVci').value = p.vci;
};

// =============================================================================
// 8. GERENCIADOR DE REBOOT E BLOQUEIO DE CLIENTES
// =============================================================================

function triggerReboot(message, callback) {
  const overlay = document.getElementById('rebootOverlay');
  const fill = document.getElementById('rebootProgressFill');
  const txt = document.getElementById('rebootPercentText');
  document.getElementById('rebootTitle').innerText = message;

  overlay.style.display = 'flex';
  fill.style.width = '0%';
  txt.innerText = '0';

  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    fill.style.width = `${progress}%`;
    txt.innerText = progress;

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        overlay.style.display = 'none';
        callback();
      }, 300);
    }
  }, 30);
}

window.blockClientByMac = function(mac, name) {
  const d = appState.deviceData;
  const client = (d.dhcpClients || []).find(c => c.mac === mac);
  if (!client) return;

  if (!d.wireless.macFilter) {
    d.wireless.macFilter = { enabled: true, rule: 'DENY', list: [] };
  }

  if (!client.blocked) {
    client.blocked = true;
    d.wireless.macFilter.enabled = true;
    d.wireless.macFilter.rule = 'DENY';
    if (!d.wireless.macFilter.list.some(m => m.mac === mac)) {
      d.wireless.macFilter.list.push({ mac: mac, desc: name, status: 'Enabled' });
    }
  } else {
    client.blocked = false;
    d.wireless.macFilter.list = d.wireless.macFilter.list.filter(m => m.mac !== mac);
  }

  saveState();
  renderInterface();
};