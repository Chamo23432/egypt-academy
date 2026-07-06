/* ============================================
   EGYPT ACADEMY — auth.js
   Simple client-side account system (localStorage-based).
   NOTE: this is NOT secure server-side auth — passwords are stored
   locally in the browser. It's meant for a local/offline student app,
   not for protecting sensitive data.
   ============================================ */

const EgyptAuth = (() => {
  const ACCOUNT_KEY = "egyptAcademyAccount";
  // Simple non-cryptographic hash so we don't store the raw password.
  // Good enough for a local student app; not for real security.
  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return "h" + Math.abs(hash).toString(36) + str.length;
  }

  function generateRecoveryCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous chars
    let code = "";
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) code += "-";
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  function getAccount() {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNT_KEY));
    } catch {
      return null;
    }
  }

  function saveAccount(account) {
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
  }

  function accountExists() {
    return !!getAccount();
  }

  function hasPassword() {
    const acc = getAccount();
    return !!(acc && acc.passwordHash);
  }

  // Create a brand new account with just a name (password optional/later)
  function createAccount(name) {
    const account = {
      name: name.trim(),
      passwordHash: null,
      recoveryCodeHash: null
    };
    saveAccount(account);
    // A brand new account should start with a clean slate — any dev/credits
    // reveal state from a previous account on this browser shouldn't carry over.
    localStorage.removeItem("egyptAcademyDevToolsRevealed");
    localStorage.removeItem("egyptAcademyCreditsUnlocked");
    localStorage.removeItem("egyptAcademyProgress");
    return account;
  }

  // Set or change password. Returns the plaintext recovery code (shown once).
  function setPassword(password) {
    const acc = getAccount();
    if (!acc) return null;
    const recoveryCode = generateRecoveryCode();
    acc.passwordHash = simpleHash(password);
    acc.recoveryCodeHash = simpleHash(recoveryCode);
    saveAccount(acc);
    return recoveryCode;
  }

  function removePassword() {
    const acc = getAccount();
    if (!acc) return;
    acc.passwordHash = null;
    acc.recoveryCodeHash = null;
    saveAccount(acc);
  }

  function checkPassword(password) {
    const acc = getAccount();
    if (!acc || !acc.passwordHash) return false;
    return acc.passwordHash === simpleHash(password);
  }

  function updateName(newName) {
    const acc = getAccount();
    if (!acc) return;
    acc.name = newName.trim();
    saveAccount(acc);
  }

  // Verify a recovery file (parsed JSON) matches this account's stored name
  // and recovery code hash.
  function verifyRecoveryFile(fileData) {
    const acc = getAccount();
    if (!acc || !acc.recoveryCodeHash) return false;
    if (!fileData || !fileData.studentName || !fileData.recoveryCode) return false;
    if (fileData.studentName.trim().toLowerCase() !== acc.name.trim().toLowerCase()) return false;
    return simpleHash(fileData.recoveryCode) === acc.recoveryCodeHash;
  }

  // Reset password after successful recovery-file verification
  function resetPasswordAfterRecovery(newPassword) {
    return setPassword(newPassword);
  }

  return {
    accountExists,
    hasPassword,
    createAccount,
    setPassword,
    removePassword,
    checkPassword,
    updateName,
    getAccount,
    verifyRecoveryFile,
    resetPasswordAfterRecovery,
    generateRecoveryCode
  };
})();

window.EgyptAuth = EgyptAuth;
