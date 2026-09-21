/**
 * BART-LINK Simulator — Gestor de Estado Central (Store)
 * Responsável pelo ciclo de vida dos dados e persistência na sessão.
 */

import { CONFIG } from './constants.js';

// Estado global da aplicação
export const appState = {
  targetDeviceKey: CONFIG.defaultDevice,
  deviceData: null,
  ispPresets: [],
  wdsSurvey: [],
  activeTab: 'status',
  quickStep: 1
};

// Dados voláteis temporários do assistente de configuração
export let wizardTempData = {};

/**
 * Redefine ou limpa os dados temporários do assistente ADSL
 */
export function resetWizardTempData() {
  wizardTempData = {};
}

/**
 * Atualiza campos parciais nos dados temporários do assistente
 * @param {Object} partialData 
 */
export function updateWizardTempData(partialData) {
  wizardTempData = { ...wizardTempData, ...partialData };
}

/**
 * Persiste o estado atual do dispositivo na sessão do navegador
 */
export function saveState() {
  const storageKey = `BARTLINK_SESSION_${appState.targetDeviceKey}`;
  sessionStorage.setItem(storageKey, JSON.stringify(appState.deviceData));
}

/**
 * Atualiza o objeto de dados do equipamento e persiste automaticamente
 * @param {Object} updatedDeviceData 
 */
export function setDeviceData(updatedDeviceData) {
  appState.deviceData = updatedDeviceData;
  saveState();
}

/**
 * Determina o dispositivo alvo com base na URL ou hostname
 * @returns {string} Chave identificadora do dispositivo
 */
function resolveTargetDevice() {
  const urlParams = new URLSearchParams(window.location.search);
  const host = window.location.hostname.toLowerCase();

  let target = urlParams.get('device') || CONFIG.defaultDevice;
  if (host.includes('adsl')) target = 'TD-W8961ND';
  if (host.includes('loadbalance')) target = 'TL-R470T';
  if (host.includes('roteador') || host.includes('wr841')) target = 'TL-WR841N';
  if (host.includes('switch') || urlParams.get('device') === 'TL-SG3210') target = 'TL-SG3210';
  return target;
}

/**
 * Inicializa os dados da aplicação a partir do devices.json ou da sessão existente
 */
export async function initAppState() {
  const target = resolveTargetDevice();
  appState.targetDeviceKey = target;

  const storageKey = `BARTLINK_SESSION_${target}`;
  const sessionData = sessionStorage.getItem(storageKey);

  try {
    const res = await fetch('devices.json');
    if (!res.ok) {
      throw new Error(`Erro HTTP ao carregar devices.json: ${res.status}`);
    }

    const json = await res.json();
    appState.ispPresets = json.ispPresets || [];
    appState.wdsSurvey = json.wdsScanSurvey || [];

    if (sessionData) {
      appState.deviceData = JSON.parse(sessionData);
    } else {
      const factory = json.devices[target] || json.devices[CONFIG.defaultDevice];
      appState.deviceData = JSON.parse(JSON.stringify(factory));
      saveState();
    }
  } catch (err) {
    console.error('Falha ao inicializar o estado da aplicação:', err);
  }
}