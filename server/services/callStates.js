// In-memory storage for call sessions
const callStates = {};

/**
 * Retrieve state for a given callId.
 * @param {string} callId
 * @returns {object}
 */
export function getState(callId) {
  return callStates[callId] || {};
}

/**
 * Update or set state for a given callId.
 * @param {string} callId
 * @param {object} state
 */
export function setState(callId, state) {
  callStates[callId] = { ...callStates[callId], ...state };
}

/**
 * Remove state for a given callId.
 * @param {string} callId
 */
export function clearState(callId) {
  delete callStates[callId];
}

// For direct access if needed
export default callStates;
