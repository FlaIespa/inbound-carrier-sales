// In-memory storage for call sessions
const callStates = {};

/**
 * Retrieve the session state for a given call ID.
 *
 * @param {string} callId - Unique identifier for the call session.
 * @returns {object} The current state object for the call, or an empty object if none exists.
 */
export function getState(callId) {
  return callStates[callId] || {};
}

/**
 * Merge and update the session state for a given call ID.
 *
 * @param {string} callId - Unique identifier for the call session.
 * @param {object} state  - Partial state to merge into the existing session state.
 * @returns {void}
 */
export function setState(callId, state) {
  callStates[callId] = { ...callStates[callId], ...state };
}

/**
 * Remove the session state for a given call ID.
 *
 * @param {string} callId - Unique identifier for the call session to clear.
 * @returns {void}
 */
export function clearState(callId) {
  delete callStates[callId];
}

// For direct access if needed
export default callStates;
