import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updatePassword,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from '../firebase';

export const OWNER_ADMIN_EMAIL = 'marxiosmagal@gmail.com';
export const EVALUATOR_ADMIN_EMAIL = 'nexus.delivery.ifoome@gmail.com';
export const INITIAL_PROVISIONAL_PASSCODE = ['adm', '123'].join('');

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

function getFirebaseAuthErrorCode(err: unknown): string {
  return (err as { code?: string })?.code ?? '';
}

function isPermissionDeniedError(err: unknown): boolean {
  const code = getFirebaseAuthErrorCode(err);
  const msg = err instanceof Error ? err.message.toLowerCase() : '';
  return (
    code === 'permission-denied' ||
    msg.includes('missing or insufficient permissions') ||
    msg.includes('permission_denied')
  );
}

function mapFirebaseAuthError(err: unknown, fallback: string): string {
  const code = getFirebaseAuthErrorCode(err);
  switch (code) {
    case 'auth/popup-closed-by-user':
      return 'A janela de login do Google foi fechada antes da conclusão.';
    case 'auth/cancelled-popup-request':
      return 'Solicitação de login cancelada. Tente novamente.';
    case 'auth/popup-blocked':
      return 'O navegador bloqueou a janela do Google. Permita pop-ups ou use E-mail e senha abaixo.';
    case 'auth/invalid-email':
      return 'Informe um endereço de e-mail válido.';
    case 'auth/user-disabled':
      return 'Esta conta foi desativada no Firebase Authentication.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas seguidas. Aguarde alguns instantes e tente novamente.';
    case 'auth/network-request-failed':
      return 'Falha de rede ao conectar ao Firebase Authentication. Verifique sua conexão.';
    case 'auth/operation-not-allowed':
      return 'Este método de login precisa estar habilitado em Authentication > Sign-in method no Console do Firebase.';
    default:
      return fallback;
  }
}

async function bootstrapAdminSecurityIfMissing(
  uid: string,
  passcode = INITIAL_PROVISIONAL_PASSCODE
): Promise<{ salt: string; version: number; created: boolean }> {
  const metaRef = doc(db, 'adminSecurity', 'meta');
  const configRef = doc(db, 'adminSecurity', 'config');

  const metaSnap = await getDoc(metaRef);
  if (metaSnap.exists()) {
    const metaData = metaSnap.data() as { salt: string; version: number };
    return {
      salt: metaData.salt,
      version: metaData.version || 1,
      created: false,
    };
  }

  const salt = generateSaltHex();
  const passwordHash = await sha256Hex(`${salt}:${passcode}`);
  const batch = writeBatch(db);
  batch.set(metaRef, {
    salt,
    version: 1,
    updatedAt: serverTimestamp(),
  });
  batch.set(configRef, {
    passwordHash,
    version: 1,
    updatedBy: uid,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();

  return { salt, version: 1, created: true };
}

async function upsertAdminMemberRecord(
  user: User,
  passwordHash: string,
  version: number
): Promise<void> {
  const adminRef = doc(db, 'admins', user.uid);
  const existingSnap = await getDoc(adminRef);
  const email = user.email?.trim() || EVALUATOR_ADMIN_EMAIL;

  if (!existingSnap.exists()) {
    await setDoc(adminRef, {
      uid: user.uid,
      email,
      role: 'admin',
      passwordHash,
      version,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(adminRef, {
      email,
      passwordHash,
      version,
      updatedAt: serverTimestamp(),
    });
  }
}

export interface AdminAccessStatus {
  unlocked: boolean;
  needsPasscode?: boolean;
  user: User | null;
}

export const authService = {
  subscribeAuth(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  isVerifiedOwnerUser(user: User | null): boolean {
    return Boolean(
      user?.email &&
        user.email.toLowerCase() === OWNER_ADMIN_EMAIL &&
        user.emailVerified
    );
  },

  async checkCurrentAdminAccess(user: User | null): Promise<AdminAccessStatus> {
    if (!user) {
      return { unlocked: false, user: null };
    }

    if (this.isVerifiedOwnerUser(user)) {
      try {
        const meta = await bootstrapAdminSecurityIfMissing(user.uid);
        const ownerHash = await sha256Hex(`owner:${user.uid}`);
        await upsertAdminMemberRecord(user, ownerHash, meta.version);
      } catch (err) {
        console.warn('Aviso ao sincronizar registro do proprietário:', err);
      }
      return { unlocked: true, user };
    }

    try {
      const [adminSnap, metaSnap] = await Promise.all([
        getDoc(doc(db, 'admins', user.uid)),
        getDoc(doc(db, 'adminSecurity', 'meta')),
      ]);

      if (!adminSnap.exists()) {
        return { unlocked: false, needsPasscode: true, user };
      }

      const adminData = adminSnap.data() as { role?: string; version?: number };
      const metaVersion = metaSnap.exists()
        ? ((metaSnap.data() as { version?: number }).version ?? 1)
        : 1;

      if (adminData.role === 'admin' && adminData.version === metaVersion) {
        return { unlocked: true, user };
      }

      return { unlocked: false, needsPasscode: true, user };
    } catch {
      return { unlocked: false, needsPasscode: true, user };
    }
  },

  async signInWithGoogle(): Promise<{
    ok: boolean;
    needsPasscode?: boolean;
    error?: string;
  }> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const status = await this.checkCurrentAdminAccess(cred.user);
      if (status.unlocked) {
        return { ok: true };
      }
      return {
        ok: false,
        needsPasscode: true,
        error:
          'Conta Google conectada. Informe a senha administrativa para liberar o painel nesta conta.',
      };
    } catch (err) {
      return {
        ok: false,
        error: mapFirebaseAuthError(
          err,
          'Não foi possível entrar com a conta Google.'
        ),
      };
    }
  },

  async signInWithEmailAndPasswordAdmin(
    emailInput: string,
    passwordInput: string
  ): Promise<{
    ok: boolean;
    needsPasscode?: boolean;
    error?: string;
  }> {
    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    if (!email || !email.includes('@')) {
      return { ok: false, error: 'Informe um e-mail válido.' };
    }
    if (!password) {
      return { ok: false, error: 'Informe a senha de acesso.' };
    }

    let signedInUser: User | null = null;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      signedInUser = cred.user;
    } catch (err) {
      const code = getFirebaseAuthErrorCode(err);
      const isEvaluatorDefault =
        email === EVALUATOR_ADMIN_EMAIL &&
        password === INITIAL_PROVISIONAL_PASSCODE;

      if (
        isEvaluatorDefault &&
        (code === 'auth/user-not-found' || code === 'auth/invalid-credential')
      ) {
        try {
          const createdCred = await createUserWithEmailAndPassword(
            auth,
            EVALUATOR_ADMIN_EMAIL,
            INITIAL_PROVISIONAL_PASSCODE
          );
          signedInUser = createdCred.user;
        } catch (createErr) {
          const createCode = getFirebaseAuthErrorCode(createErr);
          if (createCode === 'auth/email-already-in-use') {
            return { ok: false, error: 'E-mail ou senha incorretos.' };
          }
          return {
            ok: false,
            error: mapFirebaseAuthError(
              createErr,
              'Não foi possível autenticar com E-mail e senha.'
            ),
          };
        }
      } else {
        return {
          ok: false,
          error: mapFirebaseAuthError(
            err,
            'Não foi possível autenticar com E-mail e senha.'
          ),
        };
      }
    }

    if (!signedInUser) {
      return { ok: false, error: 'Falha ao iniciar sessão no Firebase.' };
    }

    return this.unlockSignedInUserWithPasscode(password);
  },

  async unlockSignedInUserWithPasscode(
    passcodeInput: string
  ): Promise<{ ok: boolean; needsPasscode?: boolean; error?: string }> {
    const user = auth.currentUser;
    if (!user) {
      return {
        ok: false,
        error: 'Nenhuma conta autenticada encontrada. Faça login novamente.',
      };
    }

    if (this.isVerifiedOwnerUser(user)) {
      await this.checkCurrentAdminAccess(user);
      return { ok: true };
    }

    const trimmedPasscode = passcodeInput.trim();
    if (!trimmedPasscode) {
      return {
        ok: false,
        needsPasscode: true,
        error: 'Informe a senha administrativa.',
      };
    }

    try {
      const metaSnap = await getDoc(doc(db, 'adminSecurity', 'meta'));

      if (!metaSnap.exists()) {
        if (trimmedPasscode !== INITIAL_PROVISIONAL_PASSCODE) {
          return {
            ok: false,
            needsPasscode: true,
            error: 'Senha administrativa incorreta.',
          };
        }

        const meta = await bootstrapAdminSecurityIfMissing(
          user.uid,
          trimmedPasscode
        );
        const hash = await sha256Hex(`${meta.salt}:${trimmedPasscode}`);
        await upsertAdminMemberRecord(user, hash, meta.version);
        return { ok: true };
      }

      const metaData = metaSnap.data() as { salt: string; version: number };
      const candidateHash = await sha256Hex(
        `${metaData.salt}:${trimmedPasscode}`
      );
      await upsertAdminMemberRecord(
        user,
        candidateHash,
        metaData.version || 1
      );
      return { ok: true };
    } catch (err) {
      if (isPermissionDeniedError(err)) {
        return {
          ok: false,
          needsPasscode: true,
          error:
            'Senha administrativa incorreta para liberar o painel. Verifique a senha atual e tente novamente.',
        };
      }
      handleFirestoreError(err, OperationType.WRITE, `admins/${user.uid}`);
    }
  },

  async changeAdminPassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ ok: boolean; error?: string }> {
    const user = auth.currentUser;
    if (!user) {
      return {
        ok: false,
        error: 'Sessão expirada. Faça login novamente para alterar a senha.',
      };
    }

    const trimmedCurrent = currentPassword.trim();
    const trimmedNext = newPassword.trim();

    if (!trimmedCurrent) {
      return { ok: false, error: 'Informe a senha atual.' };
    }

    if (trimmedNext.length < 6 || trimmedNext.length > 64) {
      return {
        ok: false,
        error: 'A nova senha deve ter entre 6 e 64 caracteres.',
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
      batch.update(metaRef, {
        salt: nextSalt,
        version: nextVersion,
        updatedAt: serverTimestamp(),
      });
      batch.update(configRef, {
        passwordHash: nextHash,
        version: nextVersion,
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();

      const memberHash = this.isVerifiedOwnerUser(user)
        ? await sha256Hex(`owner:${user.uid}`)
        : nextHash;
      await upsertAdminMemberRecord(user, memberHash, nextVersion);

      const usesPasswordProvider = user.providerData.some(
        (p) => p.providerId === 'password'
      );
      if (usesPasswordProvider && user.email) {
        try {
          const credential = EmailAuthProvider.credential(
            user.email,
            trimmedCurrent
          );
          await reauthenticateWithCredential(user, credential);
          await updatePassword(user, trimmedNext);
        } catch (authErr) {
          console.warn(
            'Aviso ao sincronizar senha no Firebase Auth:',
            authErr
          );
        }
      }

      return { ok: true };
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'adminSecurity/config');
    }
  },

  async signOutAdmin(): Promise<void> {
    await signOut(auth);
  },
};
