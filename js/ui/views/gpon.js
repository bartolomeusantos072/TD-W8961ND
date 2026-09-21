/**
 * BART-LINK Simulator — Vista da ONT GPON de Fibra Óptica (TX-6610)
 * Potência Óptica RX/TX (dBm), Estados de Ativação O1 a O5 e Autenticação PLOAM.
 */

import { appState, saveState } from '../../state.js';
import { triggerReboot } from '../../services/networkSim.js';

export function renderGponView(tab, titleEl, container, onRefresh) {
  const d = appState.deviceData;
  if (!d) return;

  const g = d.gpon;

  // --- 1. STATUS E PARÂMETROS ÓPTICOS ---
  if (tab === 'gpon_status') {
    titleEl.innerText = 'Status da Conexão Óptica GPON (Sinal e Potência)';

    // Diagnóstico didático da atenuação do laser
    const rx = g.rxPowerDbm;
    let rxQualityColor = '#10b981';
    let rxDiagnosis = 'Sinal Óptico Excelente (Dentro do padrão GPON Classe B+)';

    if (rx > -8.0) {
      rxQualityColor = '#ef4444';
      rxDiagnosis = 'Aviso: Potência Alta Demais! Risco de danificar o fotodiodo receptor (Falta atenuador).';
    } else if (rx < -27.0) {
      rxQualityColor = '#ef4444';
      rxDiagnosis = 'Crítico: Fibra com alta atenuação (Dobra excessiva, fusão suja ou rompimento parcial).';
    } else if (rx < -24.0) {
      rxQualityColor = '#f59e0b';
      rxDiagnosis = 'Alerta: Sinal no limite aceitável (-24 dBm a -27 dBm).';
    }

    container.innerHTML = `
      <div style="background: #0f172a; color: #fff; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">Estado de Ativação GPON (ITU-T G.984):</div>
          <div style="font-size: 18px; font-weight: bold; margin-top: 4px; color: ${g.status.includes('O5') ? '#4ade80' : '#ef4444'};">${g.status}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">OLT Remota Conectada: <strong>${g.oltVendor}</strong> (Distância estimada: ${g.distanceMeters} metros)</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: #94a3b8;">Potência de Recepção (RX):</div>
          <div style="font-size: 24px; font-weight: bold; color: ${rxQualityColor};">${rx.toFixed(2)} dBm</div>
        </div>
      </div>

      <div style="background: #f8fafc; border-left: 4px solid ${rxQualityColor}; padding: 10px; margin-bottom: 15px; font-size: 11px;">
        <strong>Diagnóstico da Linha:</strong> ${rxDiagnosis}
      </div>

      <table class="data-table">
        <thead><tr><th colspan="2">Diagnósticos do Transceptor Óptico (DDM / BOSA)</th></tr></thead>
        <tbody>
          <tr><td width="240">Potência Óptica Recebida (RX Power):</td><td><strong>${g.rxPowerDbm} dBm</strong> (Ideal: -15 a -25 dBm)</td></tr>
          <tr><td>Potência Óptica Emitida (TX Power):</td><td><strong>${g.txPowerDbm} dBm</strong> (Laser 1310nm)</td></tr>
          <tr><td>Tensão de Alimentação do Laser:</td><td>${g.opticalVoltage} V</td></tr>
          <tr><td>Corrente de Polarização (Bias Current):</td><td>${g.biasCurrentMa} mA</td></tr>
          <tr><td>Temperatura Interna do Módulo:</td><td>${g.laserTempC} °C</td></tr>
        </tbody>
      </table>

      <table class="data-table" style="margin-top: 15px;">
        <thead><tr><th colspan="2">Porta Local Ethernet (LAN RJ45)</th></tr></thead>
        <tbody>
          <tr><td width="240">Estado da Porta:</td><td><strong style="color:green;">${d.lan.portStatus}</strong></td></tr>
          <tr><td>Velocidade do Enlace:</td><td>${d.lan.portSpeed}</td></tr>
        </tbody>
      </table>
    `;
    return;
  }

  // --- 2. IDENTIFICAÇÃO E AUTENTICAÇÃO GPON ---
  if (tab === 'gpon_config') {
    titleEl.innerText = 'Identificação e Registro na OLT (GPON SN / PLOAM)';

    container.innerHTML = `
      <div style="background: #f8fafc; border-left: 4px solid #0284c7; padding: 10px; margin-bottom: 15px; font-size: 11px;">
        <strong>Conceito Didático:</strong> Provedores FTTH autorizam a ONT na OLT pelo seu endereço serial (GPON Serial Number) ou por uma senha de autenticação PLOAM (SLID).
      </div>

      <div class="form-grid">
        <label>GPON Serial Number (Vendor ID + SN):</label>
        <input type="text" id="gponSnInput" value="${g.gponSn}" style="font-weight: bold; font-family: monospace;">

        <label>Senha de Autenticação PLOAM / SLID:</label>
        <input type="text" id="gponPloamInput" placeholder="Vazia ou código fornecido pelo provedor" value="${g.ploamPassword || ''}">
      </div>

      <button class="btn-tplink" id="btnSaveGponAuth" style="margin-top: 15px;">SALVAR E REINICIALIZAR REGISTRO</button>
    `;

    container.querySelector('#btnSaveGponAuth').addEventListener('click', () => {
      const sn = container.querySelector('#gponSnInput').value.trim().toUpperCase();
      const ploam = container.querySelector('#gponPloamInput').value.trim();

      if (!sn || sn.length < 12) return alert('O GPON Serial Number precisa ter pelo menos 12 caracteres hexadecimais (ex: TPLG4A1E5A20).');

      g.gponSn = sn;
      g.ploamPassword = ploam;

      triggerReboot('Enviando PLOAM Serial Number para a OLT MA5608T e negociando estado O5...', () => {
        g.status = 'O5 (Operational)';
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // --- 3. SERVIÇO WAN (BRIDGE / VLAN TAGGING) ---
  if (tab === 'gpon_wan') {
    titleEl.innerText = 'Configuração de Entrega do Serviço WAN';
    const w = d.wan;

    container.innerHTML = `
      <div class="form-grid">
        <label>Modo de Operação do Terminal:</label>
        <select id="selGponWanMode">
          <option value="Bridge" ${w.mode === 'Bridge' ? 'selected' : ''}>Bridge (Ponte Transparente para o Roteador do Cliente)</option>
          <option value="Router" ${w.mode === 'Router' ? 'selected' : ''}>Router (A ONT disca o PPPoE e faz NAT)</option>
        </select>

        <label>Marcação de VLAN (VLAN Tagging 802.1Q):</label>
        <div>
          <input type="checkbox" id="chkGponVlanTag" ${w.vlanTagging ? 'checked' : ''}>
          <span style="font-size:11px; color:#666;">(Ativar se a OLT exigir o tráfego marcado com a VLAN de Internet)</span>
        </div>

        <label>VLAN do Provedor (Service VID):</label>
        <input type="number" id="txtGponVlan" value="${w.serviceVlan}" style="width: 80px;" ${!w.vlanTagging ? 'disabled' : ''}>

        <label>Prioridade 802.1p (CoS):</label>
        <select id="selGponCos" ${!w.vlanTagging ? 'disabled' : ''}>
          <option value="0" ${w.priority === 0 ? 'selected' : ''}>0 - Best Effort (Padrão)</option>
          <option value="1" ${w.priority === 1 ? 'selected' : ''}>1 - Background</option>
          <option value="5" ${w.priority === 5 ? 'selected' : ''}>5 - Voz / Baixa Latência</option>
        </select>
      </div>

      <button class="btn-tplink" id="btnSaveGponWan" style="margin-top: 15px;">SALVAR SERVIÇO WAN</button>
    `;

    const chkVlan = container.querySelector('#chkGponVlanTag');
    const txtVlan = container.querySelector('#txtGponVlan');
    const selCos = container.querySelector('#selGponCos');

    chkVlan.addEventListener('change', () => {
      txtVlan.disabled = !chkVlan.checked;
      selCos.disabled = !chkVlan.checked;
    });

    container.querySelector('#btnSaveGponWan').addEventListener('click', () => {
      w.mode = container.querySelector('#selGponWanMode').value;
      w.vlanTagging = chkVlan.checked;
      w.serviceVlan = parseInt(txtVlan.value, 10) || 100;
      w.priority = parseInt(selCos.value, 10) || 0;

      triggerReboot('Configurando parâmetros de GEM Port e encapsulamento de VLAN...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }
}