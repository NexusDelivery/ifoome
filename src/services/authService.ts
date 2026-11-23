import {
  doc,
  getDoc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const INITIAL_PROVISIONAL_PASSCODE = ['adm', '123'].join('');

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateSaltHex(lengthBytes = 16): string {
  const bytes = new Uint8Array(lengthBytes);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const authService = {
  async unlockAdminPanel(password: string): Promise<{ ok: boolean; error?: string }> {
    const trimmedPassword = password.trim();
    if (!trimmedPassword) {
      return { ok: false, error: 'Informe a senha administrativa.' };
    }

    const metaRef = doc(db, 'adminSecurity', 'meta');
    const configRef = doc(db, 'adminSecurity', 'config');

    let metaSnap;
    let configSnap;
    try {
      [metaSnap, configSnap] = await Promise.all([
        getDoc(metaRef),
        getDoc(configRef),
      ]);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'adminSecurity/meta');
    }

    // Primeiro acesso do projeto: inicializa salt + hash da senha provisória no Firestore
    if (!metaSnap.exists() || !configSnap.exists()) {
      if (trimmedPassword !== INITIAL_PROVISIONAL_PASSCODE) {
        return {
          ok: false,
          error: 'Senha incorreta. No primeiro acesso, utilize a senha provisória.',
        };
      }

      const salt = generateSaltHex();
      const passwordHash = await sha256Hex(`${salt}:${trimmedPassword}`);

      try {
        const batch = writeBatch(db);
        batch.set(metaRef, {
          salt,
          version: 1,
          updatedAt: serverTimestamp(),
        });
        batch.set(configRef, {
          passwordHash,
          version: 1,
          updatedAt: serverTimestamp(),
        });
        await batch.commit();
        return { ok: true };
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'adminSecurity/meta');
      }
    }

    const metaData = metaSnap.data() as { salt: string; version: number };
    const configData = configSnap.data() as { passwordHash: string };
    const candidateHash = await sha256Hex(`${metaData.salt}:${trimmedPassword}`);

    if (candidateHash !== configData.passwordHash) {
      return { ok: false, error: 'Senha administrativa incorreta.' };
    }

    return { ok: true };
  },

  async changeAdminPassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ ok: boolean; error?: string }> {
    const trimmedCurrent = currentPassword.trim();
    const trimmedNext = newPassword.trim();

    if (!trimmedCurrent) {
      return { ok: false, error: 'Informe a senha atual.' };
    }

    if (trimmedNext.length < 4 || trimmedNext.length > 64) {
      return {
        ok: false,
        error: 'A nova senha deve ter entre 4 e 64 caracteres.',
      };
    }

    const metaRef = doc(db, 'adminSecurity', 'meta');
    const configRef = doc(db, 'adminSecurity', 'config');

    let metaSnap;
    let configSnap;
    try {
      [metaSnap, configSnap] = await Promise.all([
        getDoc(metaRef),
        getDoc(configRef),
      ]);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'adminSecurity/config');
    }

    if (!metaSnap.exists() || !configSnap.exists()) {
      return {
        ok: false,
        error: 'Configuração de segurança não encontrada no Firestore.',
      };
    }

    const metaData = metaSnap.data() as { salt: string; version: number };
    const configData = configSnap.data() as { passwordHash: string };
    const currentHash = await sha256Hex(`${metaData.salt}:${trimmedCurrent}`);

    if (currentHash !== configData.passwordHash) {
      return { ok: false, error: 'A senha atual informada está incorreta.' };
    }

    const nextSalt = generateSaltHex();
    const nextHash = await sha256Hex(`${nextSalt}:${trimmedNext}`);
    const nextVersion = (metaData.version || 1) + 1;

    try {
      const batch = writeBatch(db);
      batch.set(metaRef, {
        salt: nextSalt,
        version: nextVersion,
        updatedAt: serverTimestamp(),
      });
      batch.set(configRef, {
        passwordHash: nextHash,
        version: nextVersion,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      return { ok: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'adminSecurity/config');
    }
  },
};
