🛠️ Laboratório de Redes e Telecomunicações — BART-LINK Simulator
Simulador web interativo para aulas práticas de Redes de Computadores e Telecomunicações. Cobre toda a pilha de infraestrutura: desde o acesso físico à internet (ADSL e Fibra Óptica FTTH), comutação de camada 2 (VLANs), distribuição residencial/corporativa e segurança, até ecossistemas de Automação IoT.

📋 Topologia e Equipamentos da Bancada (8 Dispositivos)
TD-W8961ND (Modem ADSL2+ Router): Acesso de banda larga legado via par metálico, encapsulamento ATM VPI/VCI (regras regionais brasileiras) e discagem PPPoE.
TX-6610 (GPON Optical Network Terminal - ONT): Acesso moderno via fibra óptica FTTH, medição de atenuação do laser em dBm (Classes B+/C+), estados de ativação ITU-T G.984 (O1 a O5), autenticação por GPON SN / PLOAM e modo Bridge com marcação de VLAN do provedor.
TL-SG3210 (Switch L2 Gerenciável JetStream): Comutação Gigabit de Camada 2, matriz interativa 802.1Q (portas Tagged/Untagged), PVID nativo, Tabela de Encaminhamento CAM e motor de decisão ASIC de quadros Ethernet (Unicast, Flooding e Drops).
TL-WR841N (Wireless N Router): Roteador residencial clássico, NAT, WDS Bridging com AP Survey, Servidores Virtuais (Port Forwarding para câmeras/consoles), Hospedeiro DMZ, QoS e Controle dos Pais.
TL-WA850RE (Universal Wi-Fi Range Extender): Repetidor de sinal de tomada, indicador visual Smart LED de potência captada (posicionamento ideal vs perda de pacotes) e alternância entre Modo Repetidor e Modo Access Point.
EAP225 (Ponto de Acesso Corporativo PoE): Wi-Fi corporativo de teto, multi-SSID segmentado por VLANs 802.1Q integradas ao Switch L2, Isolamento de Clientes (AP Isolation) e Portal Captivo com emissão de vouchers.
Tapo-H100 (Gateway IoT / Smart Hub): Hub inteligente de automação residencial; demonstra como dezenas de nós em malha (Mesh Routers) e sensores a bateria (Sleepy End Devices) consomem apenas 1 único IP na rede, com automação local em borda (Edge Computing) e padrão Matter.
TL-R470T+ (Load Balance Multi-WAN Broadband Router): Roteador de borda empresarial, agregação de múltiplos links de internet (WAN1 a WAN4), Failover automático, Roteamento por Políticas de Serviço, mitigação Anti-ARP Spoofing e Syslog.

🌐 Formas de Acesso ao Laboratório
🔹 Método 1: Acesso Realista via Arquivo hosts (Recomendado para Aulas)
Para que o aluno digite os endereços de domínio ou acesse como se estivesse diante dos equipamentos físicos:
No Windows:
Abra o Bloco de Notas como Administrador.
Abra o arquivo: C:\Windows\System32\drivers\etc\hosts.
Adicione o bloco abaixo (substitua 127.0.0.1 pelo IP do servidor local da escola ou pelos servidores do GitHub Pages, se aplicável):
127.0.0.1    adsl.bart-link.local       tplinkmodem.net
127.0.0.1    gpon.bart-link.local       ont.local
127.0.0.1    switch.bart-link.local
127.0.0.1    roteador.bart-link.local   tplinkwifi.net
127.0.0.1    repetidor.bart-link.local  tplinkrepeater.net
127.0.0.1    ap.bart-link.local         eap.local
127.0.0.1    hub.bart-link.local        iot.local
127.0.0.1    loadbalance.bart-link.local
No Linux / macOS:
Abra o terminal e execute: sudo nano /etc/hosts
Adicione as mesmas linhas e salve com Ctrl + O e Enter, depois saia com Ctrl + X.
Endereços de acesso direto no navegador:
Modem ADSL: http://adsl.bart-link.local ou http://tplinkmodem.net
ONT GPON (Fibra): http://gpon.bart-link.local ou http://ont.local
Switch L2: http://switch.bart-link.local
Roteador Wi-Fi: http://roteador.bart-link.local ou http://tplinkwifi.net
Repetidor Wi-Fi: http://repetidor.bart-link.local ou http://tplinkrepeater.net
AP Corporativo PoE: http://ap.bart-link.local ou http://eap.local
Gateway IoT: http://hub.bart-link.local ou http://iot.local
Multi-WAN Empresarial: http://loadbalance.bart-link.local

🔹 Método 2: Acesso Rápido via Parâmetro de URL
Caso não deseje alterar o arquivo hosts dos computadores do laboratório, use o parâmetro direto:
Modem ADSL: http://localhost/?device=TD-W8961ND
ONT GPON (Fibra): http://localhost/?device=TX-6610
Switch Gerenciável L2: http://localhost/?device=TL-SG3210
Roteador Wi-Fi: http://localhost/?device=TL-WR841N
Repetidor Wi-Fi: http://localhost/?device=TL-WA850RE
AP Corporativo PoE: http://localhost/?device=EAP225
Gateway IoT: http://localhost/?device=Tapo-H100
Multi-WAN Balanceador: http://localhost/?device=TL-R470T

🗺️ Mapa de Endereçamento IP de Gerência da Topologia
Para evitar colisões em bancada e simular uma infraestrutura corporativa real:
TX-6610: Terminal Óptico (Demarcação Provedor) — 192.168.1.254 / 255.255.255.0
TD-W8961ND: Modem DSL de Entrada — 192.168.1.1 / 255.255.255.0
TL-R470T+: Gateway Corporativo / Borda Multi-WAN — 192.168.10.1 / 255.255.255.0
TL-WR841N: Gateway Residencial / NAT Local — 192.168.0.1 / 255.255.255.0
TL-SG3210: Switch de Distribuição (VLAN 1 Admin) — 192.168.0.2 / 255.255.255.0
EAP225: Ponto de Acesso PoE de Teto — 192.168.0.3 / 255.255.255.0
Tapo-H100: Hub de Automação IoT (DHCP da LAN) — 192.168.0.150 / 255.255.255.0
TL-WA850RE: Extensor de Cobertura Sem Fio — 192.168.0.254 / 255.255.255.0

🔐 Credenciais Padrão do Firmware
Ao acessar a interface web de qualquer equipamento simulado:
Usuário: admin
Senha: admin

📌 Parâmetros e Regras Técnicas de Validação Didática

1. Parâmetros de Atenuação da Fibra Óptica (TX-6610 GPON)
   Sinal Ideal (Classe B+): Entre -15.00 dBm e -24.00 dBm (Estado O5 Operacional).
   Alerta de Atenuação: Entre -24.01 dBm e -27.00 dBm (Alerta de conector sujo ou curva acentuada).
   Falha Crítica (Sinal Fraco / Drop): Abaixo de -27.01 dBm (Fibra atenuada, perda de quadros).
   Saturação do Receptor: Acima de -8.00 dBm (Risco de queima por ausência de atenuador óptico).
2. Circuito ADSL Brasileiro (TD-W8961ND)
   Oi Velox Grupo 1 (RS): VPI 1 / VCI 32 — PPPoE LLC
   Oi Velox Grupo 2 (Centro-Oeste / Sul): VPI 0 / VCI 35 — PPPoE LLC
   Oi Velox Grupo 3 (Sudeste / Nordeste / Norte): VPI 0 / VCI 33 — PPPoE LLC
   Telefônica / Speedy / Vivo (SP): VPI 8 / VCI 35 — PPPoE LLC
   GVT Nacional (Legado): VPI 0 / VCI 35 — PPPoE LLC

🔄 Persistência e Reinicialização da Sessão (Modo Aula)
O simulador gerencia o estado por meio de chaves independentes em sessionStorage (BARTLINK_SESSION_Dispositivo).
As alterações feitas pelo aluno são mantidas durante navegações na mesma aba.
Para restaurar a bancada para as configurações de fábrica: basta fechar a aba do navegador e reabri-l

# 🛠️ Laboratório de Redes e Roteadores TP-Link / BART-LINK

Simulador web interativo para aulas práticas de Redes de Computadores, contemplando equipamentos residenciais, corporativos e wireless.

---

## 📋 Equipamentos Disponíveis no Laboratório

1. **TD-W8961ND (Modem ADSL2+ Router):** Configuração de circuito ATM (VPI/VCI regional brasileiro) e discagem PPPoE.
2. **TL-R470T+ (Load Balance Multi-WAN Router):** Agregação de links (1 a 4 WANs), Failover, Roteamento por Políticas, Anti ARP Spoofing e Diagnósticos.
3. **TL-WR841N (Wireless N Router):** Clonagem de MAC, Rádio Wi-Fi 2.4GHz, WDS Bridging (Repetidor), Rede de Convidados e Controle Parental.

---

## 🌐 Formas de Acesso ao Simulador

### 🔹 Método 1: Acesso Rápido via Barra de Endereço (URL com Parâmetro)

Abra qualquer navegador moderno e utilize os parâmetros diretos:

* **Modem ADSL:** `http://localhost/?device=TD-W8961ND` (ou `http://127.0.0.1/?device=TD-W8961ND`)
* **Load Balance Multi-WAN:** `http://localhost/?device=TL-R470T`
* **Roteador Wireless N:** `http://localhost/?device=TL-WR841N`

---

### 🔹 Método 2: Acesso Realista por Domínio Local (Arquivo `hosts`)

Para simular o acesso como se os equipamentos fossem físicos na rede, configure o arquivo de resolução de nomes do sistema operacional.

#### No Windows:

1. Abra o Bloco de Notas como **Administrador**.
2. Abra o arquivo: `C:\Windows\System32\drivers\etc\hosts`.
3. Adicione as seguintes linhas ao final do arquivo:

   ```text
   127.0.0.1    tplinkwifi.net
   127.0.0.1    adsl.bart-link.local
   127.0.0.1    loadbalance.bart-link.local
   127.0.0.1    roteador.bart-link.local
   ```
4. Salve o arquivo.

#### No Linux / macOS:

1. Abra o terminal e execute: `sudo nano /etc/hosts`
2. Adicione as mesmas linhas:
   **Plaintext**

   ```
   127.0.0.1    tplinkwifi.net
   127.0.0.1    adsl.bart-link.local
   127.0.0.1    loadbalance.bart-link.local
   127.0.0.1    roteador.bart-link.local
   ```
3. Pressione `Ctrl + O` para salvar e `Ctrl + X` para sair.

> **Acesso no navegador após configurar o hosts:**
>
> * ADSL: `http://adsl.bart-link.local`
> * Load Balance: `http://loadbalance.bart-link.local`
> * Roteador Wi-Fi: `http://roteador.bart-link.local` ou `http://tplinkwifi.net`

## 🔐 Credenciais de Autenticação HTTP

Ao acessar qualquer equipamento, a tela de autenticação do firmware solicitará:

* **Username:** `admin`
* **Password:** `admin`

## 💻 Configuração da Placa de Rede do Computador (IP do Aluno)

Para entender a camada de enlace e rede local:

1. **Obter IP Automaticamente (DHCP):**
   * Configuração padrão recomendada. O roteador distribuirá IPs na faixa `192.168.0.100` a `192.168.0.199` (ou `192.168.1.x` no caso do ADSL).
2. **Configuração Estática Manual (Para testes de falha/conflito):**
   * **Endereço IP:** `192.168.0.50`
   * **Máscara de Sub-rede:** `255.255.255.0`
   * **Gateway Padrão:** `192.168.0.1` (ou `192.168.1.1` para TD-W8961ND)
   * **DNS Primário:** `8.8.8.8`

## 📌 Regras de Validação Técnica do Circuito ADSL (Brasil)

| **Região / Operadora**         | **Estados Atendidos**                    | **VPI** | **VCI** | **Encapsulamento** |
| ------------------------------------- | ---------------------------------------------- | ------------- | ------------- | ------------------------ |
| **Oi Velox - Grupo 1**          | RS                                             | 1             | 32            | PPPoE LLC                |
| **Oi Velox - Grupo 2**          | AC, DF, GO, MS, MT, PR, RO, SC                 | 0             | 35            | PPPoE LLC                |
| **Oi Velox - Grupo 3**          | AL, BA, CE, ES, MA, MG, PA, PB, PE, RJ, RN, SE | 0             | 33            | PPPoE LLC                |
| **Telefônica / Speedy / Vivo** | SP                                             | 8             | 35            | PPPoE LLC                |
| **GVT (Legado)**                | Nacional                                       | 0             | 35            | PPPoE LLC                |

## 🔄 Reset de Sessão para Nova Aula

O simulador utiliza `sessionStorage`:

* Todas as alterações de laboratório permanecem enquanto a aba do navegador estiver aberta.
* **Para reiniciar o equipamento para os padrões de fábrica:** basta fechar a aba/janela e abri-la novamente.
