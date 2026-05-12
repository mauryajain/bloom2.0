import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'bloom-secure-storage-key';

const dataToSave = JSON.stringify({ state: { conversations: [{ id: "1", messages: ["hello"] }] } });
console.log("Original:", dataToSave);

const encrypted = CryptoJS.AES.encrypt(dataToSave, ENCRYPTION_KEY).toString();
console.log("Encrypted:", encrypted);

try {
  const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  console.log("Decrypted:", decrypted);
} catch (e) {
  console.error("Decryption error:", e);
}
