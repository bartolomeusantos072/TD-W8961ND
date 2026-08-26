# Cronograma Intensivo — Prova Objetiva IFSULDEMINAS (Informática)

**Prova prevista para 12 e/ou 13 de setembro de 2026** (Edital 188/2026). Hoje é 25/08/2026 — restam ~19 dias.

**Lógica do cronograma:** em vez de estudar os 8 tópicos do edital isoladamente, eles foram agrupados em **3 blocos combinados** (do jeito que a banca historicamente mistura os assuntos nas questões), com um dia de simulado ao final de cada bloco. **Legislação** não tem bloco próprio — reserve 20-30 min todo dia para revisá-la em paralelo (ver observação no fim).

---

## BLOCO 1 — C/C++ + Testes de Software + Reusabilidade (7 dias)
*Prioridade máxima: é o bloco com mais questões nas duas provas anteriores e o que mais historicamente mistura código + teoria de teste na mesma questão.*

| Data | Dia | Foco do dia |
|---|---|---|
| 25/08 (ter) | 1 | C — tipos de dados, operadores, ponteiros: o que é endereço x valor, como declarar e usar `*` |
| 26/08 (qua) | 2 | C — strings (vetores de char), arrays, structs (declaração e acesso com `.`) |
| 27/08 (qui) | 3 | C — manipulação de arquivos (`fopen` e seus modos: r, w, a, r+), recursão (contar chamadas) |
| 28/08 (sex) | 4 | C — funções e modularização (parâmetros, retorno, escopo) + `#include` de bibliotecas próprias (`""` x `<>`) — essa é a base prática de "Reusabilidade" |
| 29/08 (sáb) | 5 | Teste de Software — conceitos de V&V (verificação x validação), terminologia erro x defeito x falha, tipos de teste (unidade, integração, sistema, aceitação) |
| 30/08 (dom) | 6 | Teste de Software — caixa-branca x caixa-preta, teste de regressão, teste de performance (carga, estresse, estabilidade) — sempre pensando em como isso apareceria aplicado a uma função em C |
| 31/08 (seg) | 7 | **Simulado parcial:** refaça todas as questões de C e Testes de Software das provas de 2024 e 2025 sem consultar nada; depois confira e anote os erros |

---

## BLOCO 2 — Python + OpenCV + IoT + Cibersegurança (6 dias)
*Linguagem/tecnologia aplicada — sempre cai como script pra interpretar linha a linha, e a segurança historicamente aparece dentro do contexto de IoT.*

| Data | Dia | Foco do dia |
|---|---|---|
| 01/09 (ter) | 8 | Python básico (se precisar reforçar sintaxe) + OpenCV: `cv2.imread`, `cv2.imwrite`, NumPy `np.zeros` (o que cada dimensão do array representa) |
| 02/09 (qua) | 9 | OpenCV: `cv2.rectangle` (cores em BGR, espessura de linha, coordenadas), `cv2.imshow`, `cv2.waitKey`, `cv2.VideoCapture` |
| 03/09 (qui) | 10 | IoT — protocolos por camada (MQTT = aplicação, TCP = transporte, 6LoWPAN = rede), Zigbee (rede em malha), IPv6 para IoT |
| 04/09 (sex) | 11 | IoT/Robótica — GPIO, ESP8266/Arduino (`WiFi.begin`), sensores (colisão, infravermelho, sonar) x atuadores (relé, servomotor, motor de passo, shields) |
| 05/09 (sáb) | 12 | Cibersegurança — tríade CIA (confidencialidade, integridade, disponibilidade), segurança de infraestrutura e sistemas de forma mais ampla (não só IoT: redes, hardening básico) |
| 06/09 (dom) | 13 | **Simulado parcial:** refaça as questões de Python/OpenCV e IoT das provas de 2024 e 2025; identifique se ainda troca conceito de sensor x atuador ou confunde os parâmetros do OpenCV |

---

## BLOCO 3 — Sistemas Operacionais + Nuvem/IaC + IA (LLM/RAG/MCP) (4 dias)
*SO já tem histórico de cobrança; Nuvem/IaC e IA são 100% novos no programa — aqui é estudo mais teórico/conceitual, sem precisar "rodar código".*

| Data | Dia | Foco do dia |
|---|---|---|
| 07/09 (seg) | 14 | Sistemas Operacionais — gerenciamento de memória, hierarquia de armazenamento (registrador → cache → RAM → SSD/HDD), VFS |
| 08/09 (ter) | 15 | Sistemas Operacionais — concorrência (condição de corrida, região crítica, thread x processo), algoritmos de substituição de página (FIFO, Segunda Chance) |
| 09/09 (qua) | 16 | Nuvem + Infraestrutura como Código — características do NIST para computação em nuvem, o que é IaC (Terraform/Ansible: conceito de provisionamento automatizado e versionado) |
| 10/09 (qui) | 17 | Inteligência Artificial — o que é um LLM, como funciona RAG (busca + geração), o que é o MCP (Model Context Protocol) e para que serve — conteúdo novo, sem prova anterior pra referência, então foque em entender o conceito, não decorar detalhes técnicos profundos |

---

## RETA FINAL (2 dias)

| Data | Dia | Foco do dia |
|---|---|---|
| 11/09 (sex) | 18 | **Simulado completo:** 50 questões cronometradas (misture as duas provas antigas + Legislação) simulando as 3h de prova real |
| 12/09 (sáb) | 19 | Revisão leve dos pontos que mais errou no simulado + revisão final de Legislação + descanso mental à noite |

**13/09 (dom) — dia da prova** *(ou 12/09, dependendo de qual data for confirmada para sua área — confira a convocação)*

---

## Observação sobre Legislação (10 questões — não subestime)

Reserve 20-30 minutos por dia (pode ser à noite, como "esfriar a cabeça" depois do bloco técnico) para revisar em ciclo:
- Lei nº 8.112/1990 (regime jurídico do servidor)
- Lei nº 9.784/1999 (processo administrativo federal)
- Lei nº 8.429/1992 (improbidade administrativa)
- Lei nº 12.772/2012 (carreira do magistério federal)
- Lei nº 11.892/2008 (criação/natureza jurídica dos IFs)
- Decreto nº 1.171/1994 (Código de Ética do servidor)
- Lei nº 9.394/1996 (LDB)
- **Novidades do Edital 2026:** Lei nº 7.716/1989 (crimes de racismo), Lei nº 13.709/2018 (LGPD), Lei nº 14.540/2023 (prevenção ao assédio sexual), Decreto nº 12.374/2025 (avaliação no estágio probatório)

---

*Dica geral: para cada assunto, prefira reler as questões ANTIGAS de 2024/2025 e tentar refazê-las do zero antes de ler teoria nova — o formato das provas dessa banca (FUNDATEC) se repete bastante, então treinar com o padrão de pergunta real rende mais do que só ler livro.*
