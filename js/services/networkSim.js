/**
 * BART-LINK Simulator — Motor de Simulação de Redes
 * Validações de circuitos físicos, diagnósticos ICMP e temporizadores de hardware.
 */

import { REGRAS_DSLAM, UF_AULA } from '../constants.js';

/**
 * Valida os parâmetros de circuito ADSL com base no DSLAM simulado
 * @param {Object} params
 * @param {number} params.vpi
 * @param {number} params.vci
 * @param {string} params.operadora
 * @param {string} params.wanType
 * @param {string} [params.user]
 * @param {string} [params.pass]
 * @returns {{ success: boolean, status: string, ip: string }}
 */
export function validateAdslConnection({ vpi, vci, operadora, wanType, user = '', pass = '' }) {
  const op = operadora || "Oi Velox - Grupo 3";
  const regra = REGRAS_DSLAM[op];

  const circuitoValido = (
    (regra && regra.vpi === vpi && regra.vci === vci && (regra.aceita === "Nacional" || regra.aceita.includes(UF_AULA))) ||
    (UF_AULA === "MG" && vpi === 0 && vci === 33)
  );

  if (!circuitoValido) {
    return {
      success: false,
      status: `Desconectado (Timeout LCP - VPI/VCI ${vpi}/${vci} inválido para ${UF_AULA})`,
      ip: '0.0.0.0'
    };
  }

  // Se for PPPoE, exige usuário e senha preenchidos
  if (wanType === 'PPPoE') {
    const credenciaisPreenchidas = user.trim().length > 0 && pass.trim().length > 0;
    if (!credenciaisPreenchidas) {
      return {
        success: false,
        status: 'Falha de Autenticação (Usuário ou senha vazios)',
        ip: '0.0.0.0'
      };
    }
  }

  // Modos válidos
  if (wanType === 'Bridge') {
    return {
      success: true,
      status: 'Bridge Ativo (Repassando Camada 2)',
      ip: '0.0.0.0'
    };
  }

  return {
    success: true,
    status: 'Conectado',
    ip: '189.40.122.50'
  };
}

/**
 * Simula a reinicialização e gravação de parâmetros na memória Flash
 * @param {string} message Mensagem exibida no overlay
 * @param {Function} callback Executado após conclusão da barra de progresso
 */
export function triggerReboot(message, callback) {
  const overlay = document.getElementById('rebootOverlay');
  const fill = document.getElementById('rebootProgressFill');
  const txt = document.getElementById('rebootPercentText');
  const title = document.getElementById('rebootTitle');

  if (title) title.innerText = message;
  if (overlay) overlay.style.display = 'flex';
  if (fill) fill.style.width = '0%';
  if (txt) txt.innerText = '0';

  let progress = 0;
  const interval = setInterval(() => {
    progress += 2;
    if (fill) fill.style.width = `${progress}%`;
    if (txt) txt.innerText = progress.toString();

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        if (overlay) overlay.style.display = 'none';
        if (typeof callback === 'function') callback();
      }, 300);
    }
  }, 30);
}

/**
 * Simula diagnósticos de Ping e Traceroute escrevendo no elemento de console
 * @param {Object} options
 * @param {string} options.tool 'ping' ou 'traceroute'
 * @param {string} options.target IP ou domínio de destino
 * @param {string} options.iface Interface de rede de saída
 * @param {HTMLElement} options.outputElement Elemento de destino dos logs
 */
export function runNetworkDiagnostic({ tool, target, iface, outputElement }) {
  if (!outputElement) return;
  outputElement.innerHTML = `[${iface}] Executando ${tool.toUpperCase()} para ${target}...<br>`;

  let step = 1;
  const interval = setInterval(() => {
    if (tool === 'ping') {
      const ms = Math.floor(Math.random() * 15 + 8);
      outputElement.innerHTML += `Resposta de ${target}: bytes=32 tempo=${ms}ms TTL=54 (via ${iface})<br>`;
    } else {
      const ms1 = Math.floor(Math.random() * 10 + 5);
      const ms2 = Math.floor(Math.random() * 10 + 5);
      outputElement.innerHTML += `salto ${step}:  10.${step}.0.1  ${ms1}ms  ${ms2}ms<br>`;
    }
    step++;

    if (step > 4) {
      clearInterval(interval);
      outputElement.innerHTML += `<strong>${tool.toUpperCase()} finalizado com sucesso.</strong>`;
    }
  }, 400);
}