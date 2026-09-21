/**
 * BART-LINK Simulator — Assistente de Configuração Rápida ADSL
 */

import { appState, wizardTempData, updateWizardTempData, saveState } from '../../state.js';
import { validateAdslConnection, triggerReboot } from '../../services/networkSim.js';

export function renderWizardView(container, onRefresh) {
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
      <button class="btn-tplink" id="btnWzNext1">PRÓXIMO</button>
    `;
    container.innerHTML = html;
    container.querySelector('#btnWzNext1').addEventListener('click', () => {
      appState.quickStep = 2;
      onRefresh();
    });
  } else if (step === 2) {
    const presetOptions = `<option value="">-- Selecione uma Região/Operadora --</option>` +
      appState.ispPresets.map((p, idx) => `<option value="${idx}">${p.name}</option>`).join('');

    const currentWanType = wizardTempData.wanType || appState.deviceData.wan.type || 'PPPoE';

    html += `
      <div class="form-grid">
        <label>Perfil de Operadora:</label>
        <select id="wzPreset">${presetOptions}</select>

        <label>Tipo de Conexão WAN:</label>
        <select id="wzWanType">
          <option value="PPPoE" ${currentWanType === 'PPPoE' ? 'selected' : ''}>PPPoE / PPPoA (Usuário e Senha)</option>
          <option value="Dynamic" ${currentWanType === 'Dynamic' ? 'selected' : ''}>IP Dinâmico (DHCP)</option>
          <option value="Static" ${currentWanType === 'Static' ? 'selected' : ''}>IP Estático</option>
          <option value="Bridge" ${currentWanType === 'Bridge' ? 'selected' : ''}>Modo Bridge</option>
        </select>
      </div>

      <div id="wzWanFieldsContainer" class="form-grid"></div>

      <div style="margin-top:15px;">
        <button class="btn-tplink" id="btnWzBack2">VOLTAR</button>
        <button class="btn-tplink" id="btnWzNext2">PRÓXIMO</button>
      </div>
    `;
    container.innerHTML = html;

    const fieldsContainer = container.querySelector('#wzWanFieldsContainer');
    const selectPreset = container.querySelector('#wzPreset');
    const selectWanType = container.querySelector('#wzWanType');

    function renderDynamicWanSubFields(type) {
      const curVpi = wizardTempData.vpi !== undefined ? wizardTempData.vpi : (appState.deviceData.wan.vpi || '0');
      const curVci = wizardTempData.vci !== undefined ? wizardTempData.vci : (appState.deviceData.wan.vci || '33');

      if (type === 'PPPoE') {
        fieldsContainer.innerHTML = `
          <label>Nome de Usuário:</label>
          <input type="text" id="wzUser" placeholder="Ex: cliente@provedor.com.br" value="${wizardTempData.username || ''}">

          <label>Senha:</label>
          <input type="password" id="wzPass" placeholder="Senha do provedor" value="${wizardTempData.password || ''}">

          <label>Circuito ATM (VPI/VCI):</label>
          <div>
            <input type="text" id="wzVpi" placeholder="VPI" value="${curVpi}" style="width:50px;"> /
            <input type="text" id="wzVci" placeholder="VCI" value="${curVci}" style="width:50px;">
          </div>
        `;
      } else if (type === 'Dynamic') {
        fieldsContainer.innerHTML = `
          <label>Circuito ATM (VPI/VCI):</label>
          <div>
            <input type="text" id="wzVpi" placeholder="VPI" value="${curVpi}" style="width:50px;"> /
            <input type="text" id="wzVci" placeholder="VCI" value="${curVci}" style="width:50px;">
          </div>
          <p style="font-size:11px; color:#666; margin-top:5px;">O roteador obterá o endereço IP automaticamente do provedor via DHCP.</p>
        `;
      } else if (type === 'Static') {
        fieldsContainer.innerHTML = `
          <label>Endereço IP Fixo:</label>
          <input type="text" id="wzStaticIp" placeholder="Ex: 200.100.50.10" value="${wizardTempData.ip || ''}">

          <label>Máscara de Sub-rede:</label>
          <input type="text" id="wzStaticMask" placeholder="255.255.255.0" value="${wizardTempData.netmask || '255.255.255.0'}">

          <label>Gateway Padrão:</label>
          <input type="text" id="wzStaticGw" placeholder="Ex: 200.100.50.1" value="${wizardTempData.gateway || ''}">

          <label>Circuito ATM (VPI/VCI):</label>
          <div>
            <input type="text" id="wzVpi" placeholder="VPI" value="${curVpi}" style="width:50px;"> /
            <input type="text" id="wzVci" placeholder="VCI" value="${curVci}" style="width:50px;">
          </div>
        `;
      } else if (type === 'Bridge') {
        fieldsContainer.innerHTML = `
          <label>Circuito ATM (VPI/VCI):</label>
          <div>
            <input type="text" id="wzVpi" placeholder="VPI" value="${curVpi}" style="width:50px;"> /
            <input type="text" id="wzVci" placeholder="VCI" value="${curVci}" style="width:50px;">
          </div>
          <p style="font-size:11px; color:#a00; margin-top:5px;"><strong>Modo Bridge:</strong> O modem funcionará apenas como ponte transparente de Camada 2.</p>
        `;
      }
    }

    renderDynamicWanSubFields(currentWanType);

    selectWanType.addEventListener('change', (e) => {
      wizardTempData.wanType = e.target.value;
      renderDynamicWanSubFields(e.target.value);
    });

    selectPreset.addEventListener('change', (e) => {
      if (e.target.value === '') return;
      const p = appState.ispPresets[parseInt(e.target.value, 10)];
      if (p) {
        wizardTempData.operadora = p.name.split(' (')[0].trim();
        const vpiEl = container.querySelector('#wzVpi');
        const vciEl = container.querySelector('#wzVci');
        if (vpiEl) vpiEl.value = p.vpi;
        if (vciEl) vciEl.value = p.vci;
        wizardTempData.vpi = p.vpi;
        wizardTempData.vci = p.vci;
      }
    });

    container.querySelector('#btnWzBack2').addEventListener('click', () => {
      appState.quickStep = 1;
      onRefresh();
    });

    container.querySelector('#btnWzNext2').addEventListener('click', () => {
      const vpiEl = container.querySelector('#wzVpi');
      const vciEl = container.querySelector('#wzVci');
      const userEl = container.querySelector('#wzUser');
      const passEl = container.querySelector('#wzPass');
      const staticIpEl = container.querySelector('#wzStaticIp');
      const staticMaskEl = container.querySelector('#wzStaticMask');
      const staticGwEl = container.querySelector('#wzStaticGw');

      updateWizardTempData({
        wanType: selectWanType.value,
        vpi: vpiEl ? parseInt(vpiEl.value, 10) : wizardTempData.vpi,
        vci: vciEl ? parseInt(vciEl.value, 10) : wizardTempData.vci,
        username: userEl ? userEl.value.trim() : wizardTempData.username,
        password: passEl ? passEl.value.trim() : wizardTempData.password,
        ip: staticIpEl ? staticIpEl.value.trim() : wizardTempData.ip,
        netmask: staticMaskEl ? staticMaskEl.value.trim() : wizardTempData.netmask,
        gateway: staticGwEl ? staticGwEl.value.trim() : wizardTempData.gateway
      });

      appState.quickStep = 3;
      onRefresh();
    });
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
        <button class="btn-tplink" id="btnWzBack3">VOLTAR</button>
        <button class="btn-tplink" id="btnWzFinish">SALVAR & REINICIAR</button>
      </div>
    `;
    container.innerHTML = html;

    container.querySelector('#btnWzBack3').addEventListener('click', () => {
      appState.quickStep = 2;
      onRefresh();
    });

    container.querySelector('#btnWzFinish').addEventListener('click', () => {
      const vpi = wizardTempData.vpi !== undefined ? wizardTempData.vpi : appState.deviceData.wan.vpi;
      const vci = wizardTempData.vci !== undefined ? wizardTempData.vci : appState.deviceData.wan.vci;
      const user = wizardTempData.username !== undefined ? wizardTempData.username : (appState.deviceData.wan.username || '');
      const pass = wizardTempData.password !== undefined ? wizardTempData.password : (appState.deviceData.wan.password || '');
      const wanType = wizardTempData.wanType || appState.deviceData.wan.type || 'PPPoE';

      appState.deviceData.wan.type = wanType;
      appState.deviceData.wan.vpi = vpi;
      appState.deviceData.wan.vci = vci;
      appState.deviceData.wan.username = user;
      appState.deviceData.wan.password = pass;

      const result = validateAdslConnection({
        vpi,
        vci,
        operadora: wizardTempData.operadora,
        wanType,
        user,
        pass
      });

      triggerReboot('Sincronizando modulação DSL e estabelecendo sessão PPP...', () => {
        appState.quickStep = 1;
        appState.activeTab = 'status';
        appState.deviceData.wan.status = result.status;
        appState.deviceData.wan.ip = (wanType === 'Static' && wizardTempData.ip) ? wizardTempData.ip : result.ip;

        saveState();
        onRefresh();
      });
    });
  }
}