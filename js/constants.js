/**
 * BART-LINK Simulator — Constantes Globais e Dicionários
 * Centraliza credenciais padrão, regras de circuitos ATM e textos informativos.
 */

export const CONFIG = {
  defaultDevice: 'TD-W8961ND',
  auth: { user: 'admin', pass: 'admin' }
};

export const UF_AULA = 'MG';

export const REGRAS_DSLAM = {
  "Oi Velox - Grupo 1": { vpi: 1, vci: 32, aceita: ["RS"] },
  "Oi Velox - Grupo 2": { vpi: 0, vci: 35, aceita: ["AC", "DF", "GO", "MS", "MT", "PR", "RO", "SC"] },
  "Oi Velox - Grupo 3": { vpi: 0, vci: 33, aceita: ["AL", "BA", "CE", "ES", "MA", "MG", "PA", "PB", "PE", "RJ", "RN", "SE"] },
  "Telefônica / Speedy / Vivo": { vpi: 8, vci: 35, aceita: ["SP"] },
  "GVT (Legado)": { vpi: 0, vci: 35, aceita: "Nacional" }
};

export const HELP_DICTIONARY = {
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