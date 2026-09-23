# 🛠️ Laboratório de Redes e Telecomunicações — BART-LINK Simulator

Simulador web interativo para aulas práticas de Redes de Computadores e Telecomunicações. Cobre toda a pilha de infraestrutura: desde o acesso físico à internet (ADSL e Fibra Óptica FTTH), comutação de camada 2 (VLANs), distribuição residencial/corporativa e segurança, até ecossistemas de Automação IoT.

## 📋 Topologia e Equipamentos da Bancada

O laboratório é composto por 8 dispositivos simulados:

1. **TD-W8961ND (Modem ADSL2+ Router):** Acesso de banda larga legado via par metálico, encapsulamento ATM VPI/VCI (regras regionais brasileiras) e discagem PPPoE.
2. **TX-6610 (GPON Optical Network Terminal - ONT):** Acesso moderno via fibra óptica FTTH, medição de atenuação do laser em dBm (Classes B+/C+), estados de ativação ITU-T G.984 (O1 a O5), autenticação por GPON SN / PLOAM e modo Bridge com marcação de VLAN do provedor.
3. **TL-SG3210 (Switch L2 Gerenciável JetStream):** Comutação Gigabit de Camada 2, matriz interativa 802.1Q (portas Tagged/Untagged), PVID nativo, Tabela de Encaminhamento CAM e motor de decisão ASIC de quadros Ethernet (Unicast, Flooding e Drops).
4. **TL-WR841N (Wireless N Router):** Roteador residencial clássico, NAT, WDS Bridging com AP Survey, Servidores Virtuais (Port Forwarding para câmeras/consoles), Hospedeiro DMZ, QoS e Controle dos Pais.
5. **TL-WA850RE (Universal Wi-Fi Range Extender):** Repetidor de sinal de tomada, indicador visual Smart LED de potência captada (posicionamento ideal vs perda de pacotes) e alternância entre Modo Repetidor e Modo Access Point.
6. **EAP225 (Ponto de Acesso Corporativo PoE):** Wi-Fi corporativo de teto, multi-SSID segmentado por VLANs 802.1Q integradas ao Switch L2, Isolamento de Clientes (AP Isolation) e Portal Captivo com emissão de vouchers.
7. **Tapo-H100 (Gateway IoT / Smart Hub):** Hub inteligente de automação residencial; demonstra como dezenas de nós em malha (Mesh Routers) e sensores a bateria (Sleepy End Devices) consomem apenas 1 único IP na rede, com automação local em borda (Edge Computing) e padrão Matter.
8. **TL-R470T+ (Load Balance Multi-WAN Broadband Router):** Roteador de borda empresarial, agregação de múltiplos links de internet (WAN1 a WAN4), Failover automático, Roteamento por Políticas de Serviço, mitigação Anti-ARP Spoofing e Syslog.

## 🌐 Formas de Acesso ao Laboratório

### 🔹 Método 1: Acesso Realista via Arquivo `hosts`

Recomendado para aulas em laboratório. Permite que o aluno digite endereços de domínio e acesse os equipamentos como se estivesse diante dos dispositivos físicos.

> **Observação:** substitua `127.0.0.1` pelo IP do servidor local da escola ou pelos servidores do GitHub Pages, se aplicável.

#### Windows

1. Abra o **Bloco de Notas como Administrador**.
2. Abra o arquivo:
   `C:\Windows\System32\drivers\etc\hosts`
3. Adicione as linhas abaixo:

```text
127.0.0.1    adsl.bart-link.local       tplinkmodem.net
127.0.0.1    gpon.bart-link.local       ont.local
127.0.0.1    switch.bart-link.local
127.0.0.1    roteador.bart-link.local   tplinkwifi.net
127.0.0.1    repetidor.bart-link.local  tplinkrepeater.net
127.0.0.1    ap.bart-link.local         eap.local
127.0.0.1    hub.bart-link.local        iot.local
127.0.0.1    loadbalance.bart-link.local
```

#### Linux / macOS

1. Abra o terminal.
2. Execute:

```bash
sudo nano /etc/hosts
```

3. Adicione as mesmas linhas mostradas acima.
4. Salve com `Ctrl + O` e pressione `Enter`.
5. Saia com `Ctrl + X`.

### Endereços de acesso direto no navegador

| Equipamento | Endereço |
|---|---|
| Modem ADSL | `http://adsl.bart-link.local` ou `http://tplinkmodem.net` |
| ONT GPON (Fibra) | `http://gpon.bart-link.local` ou `http://ont.local` |
| Switch L2 | `http://switch.bart-link.local` |
| Roteador Wi-Fi | `http://roteador.bart-link.local` ou `http://tplinkwifi.net` |
| Repetidor Wi-Fi | `http://repetidor.bart-link.local` ou `http://tplinkrepeater.net` |
| AP Corporativo PoE | `http://ap.bart-link.local` ou `http://eap.local` |
| Gateway IoT | `http://hub.bart-link.local` ou `http://iot.local` |
| Multi-WAN Empresarial | `http://loadbalance.bart-link.local` |

### 🔹 Método 2: Acesso Rápido via Parâmetro de URL

Caso não deseje alterar o arquivo `hosts` dos computadores do laboratório, utilize diretamente o parâmetro `device` na URL.

| Equipamento | URL |
|---|---|
| Modem ADSL | `http://localhost/?device=TD-W8961ND` |
| ONT GPON (Fibra) | `http://localhost/?device=TX-6610` |
| Switch Gerenciável L2 | `http://localhost/?device=TL-SG3210` |
| Roteador Wi-Fi | `http://localhost/?device=TL-WR841N` |
| Repetidor Wi-Fi | `http://localhost/?device=TL-WA850RE` |
| AP Corporativo PoE | `http://localhost/?device=EAP225` |
| Gateway IoT | `http://localhost/?device=Tapo-H100` |
| Multi-WAN Balanceador | `http://localhost/?device=TL-R470T` |

## 🗺️ Mapa de Endereçamento IP de Gerência da Topologia

Para evitar colisões em bancada e simular uma infraestrutura corporativa real:

| Equipamento | Função | Endereço IP | Máscara |
|---|---|---|---|
| TX-6610 | Terminal Óptico (Demarcação Provedor) | `192.168.1.254` | `255.255.255.0` |
| TD-W8961ND | Modem DSL de Entrada | `192.168.1.1` | `255.255.255.0` |
| TL-R470T+ | Gateway Corporativo / Borda Multi-WAN | `192.168.10.1` | `255.255.255.0` |
| TL-WR841N | Gateway Residencial / NAT Local | `192.168.0.1` | `255.255.255.0` |
| TL-SG3210 | Switch de Distribuição (VLAN 1 Admin) | `192.168.0.2` | `255.255.255.0` |
| EAP225 | Ponto de Acesso PoE de Teto | `192.168.0.3` | `255.255.255.0` |
| Tapo-H100 | Hub de Automação IoT (DHCP da LAN) | `192.168.0.150` | `255.255.255.0` |
| TL-WA850RE | Extensor de Cobertura Sem Fio | `192.168.0.254` | `255.255.255.0` |

## 🔐 Credenciais Padrão do Firmware

Ao acessar a interface web de qualquer equipamento simulado:

- **Usuário:** `admin`
- **Senha:** `admin`

## 📌 Parâmetros e Regras Técnicas de Validação Didática

### 1. Parâmetros de Atenuação da Fibra Óptica — TX-6610 GPON

| Condição | Faixa / Parâmetro | Situação |
|---|---|---|
| Sinal Ideal (Classe B+) | Entre `-15.00 dBm` e `-24.00 dBm` | Estado O5 Operacional |
| Alerta de Atenuação | Entre `-24.01 dBm` e `-27.00 dBm` | Alerta de conector sujo ou curva acentuada |
| Falha Crítica (Sinal Fraco / Drop) | Abaixo de `-27.01 dBm` | Fibra atenuada, perda de quadros |
| Saturação do Receptor | Acima de `-8.00 dBm` | Risco de queima por ausência de atenuador óptico |

### 2. Circuito ADSL Brasileiro — TD-W8961ND

| Região / Operadora | Estados Atendidos | VPI | VCI | Encapsulamento |
|---|---|---:|---:|---|
| **Oi Velox - Grupo 1** | RS | 1 | 32 | PPPoE LLC |
| **Oi Velox - Grupo 2** | AC, DF, GO, MS, MT, PR, RO, SC | 0 | 35 | PPPoE LLC |
| **Oi Velox - Grupo 3** | AL, BA, CE, ES, MA, MG, PA, PB, PE, RJ, RN, SE | 0 | 33 | PPPoE LLC |
| **Telefônica / Speedy / Vivo** | SP | 8 | 35 | PPPoE LLC |
| **GVT Nacional (Legado)** | Nacional | 0 | 35 | PPPoE LLC |

## 🔄 Persistência e Reinicialização da Sessão — Modo Aula

O simulador gerencia o estado por meio de chaves independentes em `sessionStorage`:

```text
BARTLINK_SESSION_Dispositivo
```

- As alterações feitas pelo aluno são mantidas durante as navegações na mesma aba.
- Para restaurar a bancada para as configurações de fábrica, basta **fechar a aba do navegador e reabri-la**.