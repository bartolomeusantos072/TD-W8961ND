
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
