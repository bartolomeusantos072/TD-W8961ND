# 🛠️ Laboratório de Redes e Telecomunicações — BART-LINK Simulator

Simulador web interativo desenvolvido para aulas práticas de **Redes de Computadores e Telecomunicações**.

O BART-LINK permite simular diferentes equipamentos e tecnologias presentes em uma infraestrutura de redes, abrangendo desde o acesso físico à Internet, passando por comutação, roteamento, redes sem fio e automação IoT, até equipamentos avançados de roteamento e segurança.

O laboratório contempla atualmente **10 dispositivos/simuladores**, representando diferentes camadas e funções de uma infraestrutura de redes.

---

# 📋 1. Topologia e Equipamentos da Bancada

## 1.1 TD-W8961ND — Modem ADSL2+ Router

Simula um equipamento de acesso de banda larga legado utilizando **par metálico**.

Principais recursos simulados:

* ADSL2+;
* Encapsulamento ATM;
* VPI/VCI;
* PPPoE;
* Regras regionais brasileiras de VPI/VCI;
* Interface LAN;
* Servidor DHCP;
* Rede Wi-Fi;
* WPA2-PSK;
* Configuração de WAN.

O equipamento utiliza o endereço de gerenciamento:

```text
192.168.1.1
```

---

## 1.2 TX-6610 — GPON Optical Network Terminal (ONT)

Simula uma **ONT GPON** utilizada em redes de fibra óptica FTTH.

Principais recursos simulados:

* Tecnologia GPON;
* Fibra óptica FTTH;
* Medição de potência óptica em dBm;
* Classes ópticas B+ e C+;
* Estados de ativação ITU-T G.984;
* Estados O1 até O5;
* Autenticação por GPON Serial Number;
* Autenticação PLOAM;
* Modo Bridge;
* VLAN do provedor;
* Simulação de atenuação do sinal óptico.

Endereço de gerenciamento:

```text
192.168.1.254
```

---

## 1.3 TL-SG3210 — Switch L2 Gerenciável JetStream

Simula um switch gerenciável de **Camada 2**.

Principais recursos simulados:

* Comutação Gigabit;
* VLAN 802.1Q;
* Portas Tagged;
* Portas Untagged;
* PVID;
* Tabela CAM;
* Encaminhamento de quadros;
* Unicast;
* Flooding;
* Drops;
* Motor de decisão de quadros Ethernet.

Endereço de gerenciamento:

```text
192.168.0.2
```

O equipamento representa o switch de distribuição da rede, utilizando a VLAN 1 como rede administrativa.

---

## 1.4 TL-WR841N — Wireless N Router

Simula um roteador residencial clássico.

Principais recursos simulados:

* Roteamento;
* NAT;
* WDS Bridging;
* AP Survey;
* Servidores Virtuais;
* Port Forwarding;
* DMZ Host;
* QoS;
* Controle dos Pais;
* Rede sem fio.

Endereço de gerenciamento:

```text
192.168.0.1
```

---

## 1.5 TL-WA850RE — Universal Wi-Fi Range Extender

Simula um repetidor de sinal Wi-Fi.

Principais recursos simulados:

* Repetição de sinal;
* Indicador visual Smart LED;
* Intensidade do sinal recebido;
* Relação entre posicionamento e perda de pacotes;
* Modo Repetidor;
* Modo Access Point.

Endereço de gerenciamento:

```text
192.168.0.254
```

---

## 1.6 EAP225 — Access Point Corporativo PoE

Simula um ponto de acesso Wi-Fi corporativo instalado em teto e alimentado por PoE.

Principais recursos simulados:

* Wi-Fi corporativo;
* Múltiplos SSIDs;
* Segmentação por VLAN;
* VLAN 802.1Q;
* Integração com switch L2;
* AP Isolation;
* Isolamento de clientes;
* Portal Captivo;
* Emissão de vouchers.

Endereço de gerenciamento:

```text
192.168.0.3
```

---

## 1.7 Tapo-H100 — Gateway IoT / Smart Hub

Simula um gateway para automação residencial e dispositivos IoT.

O simulador demonstra uma arquitetura na qual diversos dispositivos da rede IoT podem utilizar um único ponto de comunicação com a rede IP.

Principais recursos simulados:

* Gateway IoT;
* Smart Hub;
* Mesh Routers;
* Sleepy End Devices;
* Sensores alimentados por bateria;
* Automação local;
* Edge Computing;
* Matter;
* Integração com dispositivos IoT;
* Regras de automação.

Endereço de gerenciamento:

```text
192.168.0.150
```

---

## 1.8 TL-R470T+ — Load Balance Multi-WAN Broadband Router

Simula um roteador empresarial de borda com múltiplas conexões WAN.

Principais recursos simulados:

* Multi-WAN;
* Agregação de links;
* WAN1 a WAN4;
* Failover automático;
* Balanceamento de carga;
* Roteamento por políticas de serviço;
* Anti-ARP Spoofing;
* Syslog.

Endereço de gerenciamento:

```text
192.168.10.1
```

---

# 🖥️ 1.9 MikroTik RouterBOARD hEX — RB750Gr3

O BART-LINK também possui um simulador específico para o **MikroTik RouterBOARD hEX (RB750Gr3)**, reproduzindo uma interface inspirada no **RouterOS WebFig** e disponibilizando um terminal CLI.

O equipamento utiliza:

```text
Hardware: RB750Gr3 (MMIPS)
Sistema: RouterOS v7.14.3
Identity: BARTLINK-CORE-01
```

O simulador possui um **motor de encaminhamento L3 baseado em Longest Prefix Match**, permitindo trabalhar conceitos de roteamento IP.

### Interfaces

| Interface      | Função                 | Estado  |
| -------------- | ------------------------ | ------- |
| `ether1-WAN` | Link ISP / Borda         | Running |
| `ether2-LAN` | Rede local / Switch Core | Running |
| `ether3`     | Interface adicional      | Down    |
| `ether4`     | Interface adicional      | Down    |
| `ether5`     | Interface adicional      | Down    |

### Endereçamento

| Endereço           | Interface      | Rede                |
| ------------------- | -------------- | ------------------- |
| `203.0.113.2/30`  | `ether1-WAN` | `203.0.113.0/30`  |
| `192.168.88.1/24` | `ether2-LAN` | `192.168.88.0/24` |

### Rota padrão

```text
Destino: 0.0.0.0/0
Gateway: 203.0.113.1
```

### Recursos do simulador

A interface do MikroTik disponibiliza recursos inspirados no RouterOS, incluindo:

* System > Resources;
* Visualização das interfaces;
* IP > Addresses;
* Tabela de endereçamento;
* Tabela de rotas;
* Motor de encaminhamento L3;
* Longest Prefix Match;
* Terminal RouterOS;
* Comandos de diagnóstico;
* `ping`;
* Reinicialização simulada.

### Terminal RouterOS

O simulador possui um terminal interativo com comandos como:

```text
/ip address print
/ip route print
/interface print
ping <ip>
clear
/system reboot
```

O terminal também apresenta a identificação:

```text
[admin@BARTLINK] >
```

e simula o ambiente do RouterOS 7.14.3.

---

# 🛡️ 1.10 Netgate / pfSense Plus

O BART-LINK também possui um simulador específico para **Netgate / pfSense Plus**, voltado principalmente para conceitos de **firewall, inspeção de tráfego, NAT, estados de conexão e VPN**.

O simulador possui:

* Motor de inspeção Stateful;
* Injetor de pacotes;
* Tabela dinâmica de estados;
* Regras de firewall;
* NAT;
* Interfaces WAN, LAN e OPT1/DMZ;
* OpenVPN;
* Dashboard de sistema;
* Simulação de passagem de pacotes.

## Firewall Stateful

O simulador mantém uma tabela de conexões ativas denominada:

```text
Live State Table
```

Exemplos de estados simulados incluem:

```text
ESTABLISHED:ESTABLISHED
SINGLE:MULTIPLE
```

A tabela é utilizada pelo motor de inspeção Stateful para representar conexões acompanhadas pelo firewall.

## Injetor de Pacotes

O simulador permite testar a passagem de um pacote informando:

* Interface de entrada;
* Protocolo;
* IP de origem;
* IP de destino;
* Porta de destino.

O mecanismo procura uma regra compatível e informa se o pacote será permitido ou bloqueado.

Quando nenhuma regra corresponde ao pacote, o simulador utiliza o conceito de:

```text
Default Deny
```

Também é possível identificar a regra responsável pelo bloqueio quando existe uma regra explícita correspondente.

## Interfaces

O dashboard apresenta:

* WAN;
* LAN;
* OPT1 (DMZ).

Também são exibidos:

* Endereço IP;
* Sub-rede;
* Estado da interface;
* Informações do sistema;
* Versão do sistema;
* Hardware;
* Uptime;
* Uso de CPU/RAM;
* Quantidade de estados ativos.

## OpenVPN

O simulador possui uma área específica para:

```text
VPN > OpenVPN Server
```

permitindo trabalhar conceitos como:

* Servidor OpenVPN;
* Ativação/desativação;
* Modo de conexão;
* Protocolo;
* Porta;
* Rede do túnel;
* Clientes conectados;
* IP virtual;
* IP real.

---

# 🌐 2. Formas de Acesso ao Laboratório

O BART-LINK oferece duas formas principais de acesso aos simuladores.

---

## 🔹 2.1 Acesso via arquivo `hosts`

Esse método é recomendado para aulas práticas, pois permite que o aluno utilize endereços semelhantes aos encontrados em equipamentos reais.

### Windows

Abra o **Bloco de Notas como Administrador** e abra:

```text
C:\Windows\System32\drivers\etc\hosts
```

Adicione:

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

---

## 🔹 2.2 Linux / macOS

Abra o terminal:

```bash
sudo nano /etc/hosts
```

Adicione as mesmas entradas apresentadas anteriormente.

Para salvar no `nano`:

```text
Ctrl + O
Enter
Ctrl + X
```

---

# 🌎 3. Endereços de Acesso dos Equipamentos

| Equipamento     | Endereço                              |
| --------------- | -------------------------------------- |
| Modem ADSL      | `http://adsl.bart-link.local`        |
| ONT GPON        | `http://gpon.bart-link.local`        |
| Switch L2       | `http://switch.bart-link.local`      |
| Roteador Wi-Fi  | `http://roteador.bart-link.local`    |
| Repetidor Wi-Fi | `http://repetidor.bart-link.local`   |
| AP Corporativo  | `http://ap.bart-link.local`          |
| Gateway IoT     | `http://hub.bart-link.local`         |
| Multi-WAN       | `http://loadbalance.bart-link.local` |

Os oito primeiros equipamentos possuem os endereços definidos no arquivo original do laboratório.

---

# ⚡ 4. Acesso Rápido por Parâmetro de URL

Caso não seja necessário configurar o arquivo `hosts`, os simuladores podem ser acessados diretamente utilizando o parâmetro `device`.

```text
http://localhost/?device=TD-W8961ND
```

### Equipamentos

| Equipamento     | URL                                     |
| --------------- | --------------------------------------- |
| Modem ADSL      | `http://localhost/?device=TD-W8961ND` |
| ONT GPON        | `http://localhost/?device=TX-6610`    |
| Switch L2       | `http://localhost/?device=TL-SG3210`  |
| Roteador Wi-Fi  | `http://localhost/?device=TL-WR841N`  |
| Repetidor Wi-Fi | `http://localhost/?device=TL-WA850RE` |
| AP Corporativo  | `http://localhost/?device=EAP225`     |
| Gateway IoT     | `http://localhost/?device=Tapo-H100`  |
| Multi-WAN       | `http://localhost/?device=TL-R470T`   |

Esses parâmetros estão definidos na versão original do README.

> **Observação:** os códigos-fonte consultados confirmam a existência dos simuladores MikroTik e pfSense, mas o material recuperado não fornece, de forma suficiente, os respectivos parâmetros `device=` ou domínios `hosts`. Por isso, esses endereços não são inventados neste README.

---

# 🗺️ 5. Mapa de Endereçamento IP da Topologia

Para evitar colisões e representar uma infraestrutura de rede, os equipamentos principais utilizam os seguintes endereços:

| Equipamento | Função                                    | Endereço IP      | Máscara          |
| ----------- | ------------------------------------------- | ----------------- | ----------------- |
| TX-6610     | Terminal Óptico / Demarcação do Provedor | `192.168.1.254` | `255.255.255.0` |
| TD-W8961ND  | Modem DSL de Entrada                        | `192.168.1.1`   | `255.255.255.0` |
| TL-R470T+   | Gateway Corporativo / Multi-WAN             | `192.168.10.1`  | `255.255.255.0` |
| TL-WR841N   | Gateway Residencial / NAT                   | `192.168.0.1`   | `255.255.255.0` |
| TL-SG3210   | Switch de Distribuição / VLAN 1           | `192.168.0.2`   | `255.255.255.0` |
| EAP225      | Access Point PoE                            | `192.168.0.3`   | `255.255.255.0` |
| Tapo-H100   | Gateway IoT                                 | `192.168.0.150` | `255.255.255.0` |
| TL-WA850RE  | Extensor Wi-Fi                              | `192.168.0.254` | `255.255.255.0` |

### MikroTik hEX

O MikroTik possui uma topologia própria no simulador:

```text
WAN
203.0.113.2/30
     │
     │ ether1-WAN
     │
┌─────────────────────┐
│ MikroTik hEX        │
│ RB750Gr3             │
│ RouterOS 7.14.3      │
└─────────────────────┘
     │
     │ ether2-LAN
     │
192.168.88.1/24
```

A rota padrão aponta para:

```text
203.0.113.1
```

---

# 🔐 6. Credenciais Padrão

Nos equipamentos que utilizam a interface web padrão do laboratório:

```text
Usuário: admin
Senha: admin
```

Essas são as credenciais padrão documentadas no README original.

---

# 📌 7. Parâmetros e Regras Técnicas de Validação Didática

## 7.1 Atenuação da Fibra Óptica — TX-6610 GPON

### Sinal ideal — Classe B+

```text
-15,00 dBm até -24,00 dBm
```

Estado esperado:

```text
O5 — Operacional
```

### Alerta de atenuação

```text
-24,01 dBm até -27,00 dBm
```

Representa uma situação de atenção, como:

* conector sujo;
* curva acentuada;
* aumento da perda óptica.

### Falha crítica

```text
Abaixo de -27,01 dBm
```

Representa:

* fibra excessivamente atenuada;
* perda de quadros;
* possível queda do enlace.

### Saturação do receptor

```text
Acima de -8,00 dBm
```

Representa risco de saturação do receptor óptico.

---

# ☎️ 8. Circuito ADSL Brasileiro — TD-W8961ND

O simulador contém regras didáticas de VPI/VCI para diferentes grupos de operadoras/regiões.

| Operadora / Grupo                              |   VPI |    VCI | Encapsulamento |
| ---------------------------------------------- | ----: | -----: | -------------- |
| Oi Velox Grupo 1 — RS                         | `1` | `32` | PPPoE LLC      |
| Oi Velox Grupo 2 — Centro-Oeste / Sul         | `0` | `35` | PPPoE LLC      |
| Oi Velox Grupo 3 — Sudeste / Nordeste / Norte | `0` | `33` | PPPoE LLC      |
| Telefônica / Speedy / Vivo — SP              | `8` | `35` | PPPoE LLC      |
| GVT Nacional — Legado                         | `0` | `35` | PPPoE LLC      |

Essas regras fazem parte da validação didática do simulador ADSL.

---

# 🔄 9. Persistência e Reinicialização da Sessão

O simulador utiliza `sessionStorage` para manter o estado dos equipamentos durante a sessão.

As informações são armazenadas utilizando chaves independentes no formato:

```text
BARTLINK_SESSION_Dispositivo
```

As alterações realizadas pelo aluno são mantidas durante a navegação dentro da mesma aba do navegador.

Para restaurar a bancada para o estado inicial de fábrica:

1. Feche a aba do navegador;
2. Abra novamente o simulador.

A sessão anterior será encerrada e o estado poderá ser reinicializado.

---

# 🎓 10. Objetivo Didático

O BART-LINK foi desenvolvido para permitir que conceitos de redes sejam explorados de forma prática e interativa.

A bancada permite trabalhar diferentes níveis da infraestrutura:

```text
Acesso físico
    ↓
ADSL / GPON / FTTH
    ↓
VLAN / Ethernet / Switching
    ↓
Wi-Fi
    ↓
Roteamento / NAT
    ↓
Multi-WAN
    ↓
Roteamento L3 / RouterOS
    ↓
Firewall / NAT / Stateful Inspection
    ↓
VPN
    ↓
IoT / Automação
```

Dessa forma, o laboratório permite conectar conceitos normalmente estudados de maneira separada, mostrando como diferentes equipamentos participam de uma mesma infraestrutura de redes.

---

# 🧩 11. Resumo dos Simuladores

|  # | Simulador              | Principal conceito                   |
| -: | ---------------------- | ------------------------------------ |
|  1 | **TD-W8961ND**   | ADSL / ATM / VPI / VCI / PPPoE       |
|  2 | **TX-6610**      | GPON / FTTH / Fibra Óptica          |
|  3 | **TL-SG3210**    | Switch L2 / VLAN / 802.1Q            |
|  4 | **TL-WR841N**    | Roteamento / NAT / Wi-Fi             |
|  5 | **TL-WA850RE**   | Repetição Wi-Fi                    |
|  6 | **EAP225**       | Wi-Fi Corporativo / VLAN / Portal    |
|  7 | **Tapo-H100**    | IoT / Matter / Automação           |
|  8 | **TL-R470T+**    | Multi-WAN / Failover / Balanceamento |
|  9 | **MikroTik hEX** | RouterOS / L3 / Rotas / CLI          |
| 10 | **pfSense Plus** | Firewall / Stateful / NAT / VPN      |

---

# 🚀 12. Visão Geral

O BART-LINK reúne em um único ambiente de laboratório simuladores que representam diferentes funções de uma infraestrutura de redes.

Os equipamentos podem ser utilizados individualmente para aulas específicas ou combinados em atividades práticas envolvendo:

* Endereçamento IP;
* Sub-redes;
* VLANs;
* Switching;
* Roteamento;
* NAT;
* Wi-Fi;
* ADSL;
* GPON;
* Fibra óptica;
* Multi-WAN;
* Firewall;
* DMZ;
* VPN;
* IoT;
* Automação;
* Diagnóstico de conectividade;
* Análise de estados e tráfego.

O objetivo é proporcionar uma bancada virtual na qual o aluno possa **configurar, testar, observar e compreender o comportamento dos equipamentos de rede**, aproximando a experiência de um laboratório físico.
