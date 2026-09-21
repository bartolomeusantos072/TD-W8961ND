/**
 * BART-LINK Simulator — Vista do Gateway IoT (Tapo-H100)
 * Topologia de Sensores, Diferenciação Mesh vs Bateria, Automações Locais e Matter.
 */

import { appState, saveState } from '../../state.js';
import { triggerReboot } from '../../services/networkSim.js';

export function renderIoTView(tab, titleEl, container, onRefresh) {
  const d = appState.deviceData;
  if (!d) return;

  // ===========================================================================
  // 1. STATUS GERAL E ENLACE COM A REDE LOCAL
  // ===========================================================================
  if (tab === 'iot_status') {
    titleEl.innerText = 'Status Operacional do Gateway IoT';

    container.innerHTML = `
      <div style="background: #0f172a; color: #fff; padding: 16px; border-radius: 8px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="font-size: 15px; font-weight: bold; color: #38bdf8;">Tapo H100 Smart Hub</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Rádio RF dos Sensores: <strong>${d.hubHardware.rfFrequency}</strong></div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">Sub-dispositivos Pareados: <strong>${d.subDevices.length} dispositivos</strong></div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: #94a3b8;">Status Nuvem / MQTT:</div>
          <div style="font-size: 16px; font-weight: bold; color: #4ade80;">${d.network.cloudStatus}</div>
        </div>
      </div>

      <table class="data-table">
        <thead><tr><th colspan="2">Parâmetros de Rede IP (Uplink Wi-Fi)</th></tr></thead>
        <tbody>
          <tr><td width="240">Ponto de Acesso Conectado (SSID):</td><td><strong>${d.network.uplinkSsid}</strong> (${d.network.signalRssi})</td></tr>
          <tr><td>Endereço IP na LAN:</td><td><strong>${d.network.ip}</strong> (Apenas 1 IP consome no DHCP do roteador)</td></tr>
          <tr><td>Máscara de Sub-rede / Gateway:</td><td>${d.network.netmask} / ${d.network.gateway}</td></tr>
          <tr><td>Endereço MAC Wi-Fi:</td><td><code>${d.network.mac}</code></td></tr>
        </tbody>
      </table>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Sirene Integrada do Hub</h4>
      <div class="form-grid">
        <label>Volume do Alarme:</label>
        <select id="selHubVol">
          <option value="Low" ${d.hubHardware.sirenVolume === 'Low' ? 'selected' : ''}>Baixo</option>
          <option value="Normal" ${d.hubHardware.sirenVolume === 'Normal' ? 'selected' : ''}>Normal</option>
          <option value="High" ${d.hubHardware.sirenVolume === 'High' ? 'selected' : ''}>Alto (90 dB)</option>
        </select>

        <label>Toque do Alarme:</label>
        <select id="selHubTone">
          <option value="Alarm_1" ${d.hubHardware.sirenRingtone === 'Alarm_1' ? 'selected' : ''}>Sirene de Emergência</option>
          <option value="Doorbell" ${d.hubHardware.sirenRingtone === 'Doorbell' ? 'selected' : ''}>Campainha Ding-Dong</option>
        </select>

        <label>Estado da Sirene:</label>
        <div>
          <button class="btn-tplink" id="btnToggleSiren" style="background:${d.hubHardware.sirenActive ? '#ef4444' : '#0284c7'};">
            ${d.hubHardware.sirenActive ? 'PARAR SIRENE (DISPARADA)' : 'TESTAR DISPARO DE SIRENE'}
          </button>
        </div>
      </div>
    `;

    container.querySelector('#btnToggleSiren').addEventListener('click', () => {
      d.hubHardware.sirenActive = !d.hubHardware.sirenActive;
      saveState();
      onRefresh();
    });

    container.querySelector('#selHubVol').addEventListener('change', (e) => {
      d.hubHardware.sirenVolume = e.target.value;
      saveState();
    });

    container.querySelector('#selHubTone').addEventListener('change', (e) => {
      d.hubHardware.sirenRingtone = e.target.value;
      saveState();
    });
    return;
  }

  // ===========================================================================
  // 2. PAINEL DE SUB-DISPOSITIVOS (TOPOLOGIA MESH VS BATERIA)
  // ===========================================================================
  if (tab === 'iot_devices') {
    titleEl.innerText = 'Sub-dispositivos Pareados (Topologia e Sensores)';

    const rows = d.subDevices.map((dev, idx) => {
      let stateDisplay = '';
      if (dev.category.includes('Plug')) {
        stateDisplay = `
          <button class="btn-tplink btn-toggle-plug" data-idx="${idx}" style="padding: 3px 8px; font-size: 10px; background:${dev.state.power ? '#10b981' : '#64748b'};">
            ${dev.state.power ? 'LIGADO (' + dev.state.currentWatts + 'W)' : 'DESLIGADO'}
          </button>
        `;
      } else if (dev.category.includes('Door')) {
        stateDisplay = `
          <button class="btn-tplink btn-toggle-door" data-idx="${idx}" style="padding: 3px 8px; font-size: 10px; background:${dev.state.open ? '#ef4444' : '#10b981'};">
            ${dev.state.open ? 'PORTA ABERTA' : 'FECHADA'}
          </button>
        `;
      } else if (dev.category.includes('Motion')) {
        stateDisplay = `
          <button class="btn-tplink btn-toggle-motion" data-idx="${idx}" style="padding: 3px 8px; font-size: 10px; background:${dev.state.motion ? '#f59e0b' : '#64748b'};">
            ${dev.state.motion ? 'MOVIMENTO DETECTADO' : 'SEM MOVIMENTO'}
          </button>
        `;
      } else if (dev.category.includes('Climate')) {
        stateDisplay = `<strong>${dev.state.temperature}°C</strong> | ${dev.state.humidity}% UR`;
      }

      return `
        <tr>
          <td><strong>${dev.name}</strong><br><span style="font-size:10px; color:#666;">${dev.model}</span></td>
          <td>${dev.category}</td>
          <td>
            <span style="font-size:11px; font-weight:bold; color:${dev.powerType.includes('Mesh') ? '#0284c7' : '#059669'};">
              ${dev.powerType}
            </span>
          </td>
          <td>${dev.battery}</td>
          <td>${dev.signal}</td>
          <td style="text-align:center;">${stateDisplay}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <div style="background:#f8fafc; border-left:4px solid #0284c7; padding:10px; margin-bottom:15px; font-size:11px;">
        <strong>Conceito Didático de Redes IoT:</strong> Note que dispositivos alimentados na tomada atuam como <em>Mesh Routers</em> repetindo o sinal para os cantos da casa, enquanto sensores funcionam em sono profundo (<em>Sleepy End Devices</em>) preservando a bateria CR2032.
      </div>

      <table class="data-table">
        <thead>
          <tr>
            <th>Dispositivo</th>
            <th>Categoria</th>
            <th>Tipo de Energia (Papel de Rede)</th>
            <th>Bateria</th>
            <th>Sinal RF</th>
            <th>Estado Atual (Interativo)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    // Interatividade para simular abertura de porta / clique na tomada
    container.querySelectorAll('.btn-toggle-plug').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        d.subDevices[idx].state.power = !d.subDevices[idx].state.power;
        saveState();
        onRefresh();
      });
    });

    container.querySelectorAll('.btn-toggle-door').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        d.subDevices[idx].state.open = !d.subDevices[idx].state.open;
        
        // Verifica se dispara automação local
        if (d.subDevices[idx].state.open) {
          const auto = d.automations.find(a => a.triggerDevice === d.subDevices[idx].id && a.enabled);
          if (auto && auto.actionTarget === 'hub_siren') {
            d.hubHardware.sirenActive = true;
          }
        }
        saveState();
        onRefresh();
      });
    });

    container.querySelectorAll('.btn-toggle-motion').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.target.getAttribute('data-idx'), 10);
        d.subDevices[idx].state.motion = !d.subDevices[idx].state.motion;

        if (d.subDevices[idx].state.motion) {
          const auto = d.automations.find(a => a.triggerDevice === d.subDevices[idx].id && a.enabled);
          if (auto && auto.actionTarget === 'dev_01') {
            const plug = d.subDevices.find(x => x.id === 'dev_01');
            if (plug) plug.state.power = true;
          }
        }
        saveState();
        onRefresh();
      });
    });
    return;
  }

  // ===========================================================================
  // 3. MOTOR DE AUTOMAÇÕES LOCAIS (SMART ACTIONS)
  // ===========================================================================
  if (tab === 'iot_automations') {
    titleEl.innerText = 'Central de Ações Inteligentes (Automação Local Edge)';

    const autoRows = d.automations.map((a, i) => `
      <tr>
        <td><strong>${a.name}</strong></td>
        <td>Gatilho: <code>${a.triggerDevice} (${a.condition})</code></td>
        <td>Ação: <code>${a.actionTarget} &rarr; ${a.actionValue}</code></td>
        <td><strong style="color:green;">${a.enabled ? 'Ativo (Local no Hub)' : 'Pausado'}</strong></td>
        <td><button class="btn-tplink btn-del-auto" data-idx="${i}">Excluir</button></td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div style="background:#f8fafc; border-left:4px solid #10b981; padding:10px; margin-bottom:15px; font-size:11px;">
        <strong>Execução Local (Edge Computing):</strong> Estas regras são processadas pelo microcontrolador do próprio Hub. Mesmo se a internet do provedor cair completamente, as lâmpadas acendem e a sirene toca normalmente.
      </div>

      <table class="data-table">
        <thead><tr><th>Nome da Regra</th><th>Gatilho (IF)</th><th>Ação Resultante (THEN)</th><th>Execução</th><th>Ação</th></tr></thead>
        <tbody>${autoRows.length > 0 ? autoRows : '<tr><td colspan="5" style="text-align:center;">Nenhuma automação cadastrada.</td></tr>'}</tbody>
      </table>

      <h4 style="color:#004466; margin: 20px 0 10px 0;">Criar Nova Automação Local</h4>
      <div class="form-grid">
        <label>Nome da Automação:</label>
        <input type="text" id="newAutoName" placeholder="Ex: Acender Luz ao Entrar">

        <label>Sensor Gatilho (Trigger):</label>
        <select id="newAutoTrigger">
          ${d.subDevices.filter(x => !x.category.includes('Plug')).map(x => `<option value="${x.id}">${x.name}</option>`).join('')}
        </select>

        <label>Ação no Dispositivo de Destino:</label>
        <select id="newAutoAction">
          <option value="dev_01:turn_on">Ligar Tomada da Sala (dev_01)</option>
          <option value="dev_01:turn_off">Desligar Tomada da Sala (dev_01)</option>
          <option value="hub_siren:start_alarm">Disparar Alarme Sonoro do Hub</option>
        </select>
      </div>
      <button class="btn-tplink" id="btnAddAuto" style="margin-top: 10px;">SALVAR REGRA NO HUB</button>
    `;

    container.querySelectorAll('.btn-del-auto').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        d.automations.splice(idx, 1);
        saveState();
        onRefresh();
      });
    });

    container.querySelector('#btnAddAuto').addEventListener('click', () => {
      const name = container.querySelector('#newAutoName').value.trim();
      const trig = container.querySelector('#newAutoTrigger').value;
      const [target, val] = container.querySelector('#newAutoAction').value.split(':');

      if (!name) return alert('Digite um nome para a regra.');

      d.automations.push({
        id: d.automations.length + 1,
        name,
        enabled: true,
        triggerDevice: trig,
        condition: 'status == true',
        actionTarget: target,
        actionValue: val
      });
      saveState();
      onRefresh();
    });
    return;
  }

  // ===========================================================================
  // 4. PADRÃO MATTER / INTEGRAÇÃO LOCAL
  // ===========================================================================
  if (tab === 'iot_matter') {
    titleEl.innerText = 'Padrão Matter e Ponte de Integração Local (Bridges)';
    const m = d.matter;

    container.innerHTML = `
      <div style="background:#f8fafc; border-left:4px solid #a855f7; padding:10px; margin-bottom:15px; font-size:11px;">
        <strong>O que é o Matter?</strong> É o padrão universal da conectividade IoT. Ele permite que o Hub Tapo H100 exponha todos os seus sensores Sub-1GHz para a Apple Home, Google Home, Alexa e Home Assistant simultaneamente, operando na rede local sem depender de servidores em nuvem.
      </div>

      <table class="data-table">
        <thead><tr><th colspan="2">Configuração do Matter Bridge</th></tr></thead>
        <tbody>
          <tr><td width="220">Status do Protocolo Matter:</td><td><strong style="color:green;">Ativo e Comissionado</strong></td></tr>
          <tr><td>Código de Emparelhamento Manual:</td><td><code>${m.pairingCode}</code></td></tr>
          <tr><td>Número de Plataformas (Fabrics):</td><td><strong>${m.fabricCount} ecossistemas conectados</strong></td></tr>
          <tr><td>Ecossistemas Sincronizados:</td><td>${m.fabrics.join(', ')}</td></tr>
        </tbody>
      </table>

      <button class="btn-tplink" id="btnResetMatter" style="margin-top: 15px;">GERAR NOVO CÓDIGO DE COMISSIONAMENTO</button>
    `;

    container.querySelector('#btnResetMatter').addEventListener('click', () => {
      const code1 = Math.floor(1000 + Math.random() * 9000);
      const code2 = Math.floor(100 + Math.random() * 900);
      const code3 = Math.floor(1000 + Math.random() * 9000);
      m.pairingCode = `${code1}-${code2}-${code3}`;

      triggerReboot('Reiniciando stack Matter e gerando novo QR Code de emparelhamento...', () => {
        saveState();
        onRefresh();
      });
    });
    return;
  }
}