import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  getIdToken,
  onIdTokenChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth, googleProvider, actionCodeSettings } from "./firebaseConfig";
import { getLogger } from "../../logs";
const log = getLogger("auth.ctx");

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence).catch(() => {});
    const unsub = onIdTokenChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          const t = await getIdToken(u, false);
          setToken(t);
          log.info("signed_in", {
            uid: u.uid,
            providerId: u.providerData?.[0]?.providerId || "unknown",
          });
        } catch {
          setToken(null);
          log.warn("token_fetch_failed");
        }
      } else {
        setToken(null);
        log.info("signed_out");
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const getTokenSafe = useCallback(
    (force = false) =>
      auth.currentUser
        ? getIdToken(auth.currentUser, force)
        : Promise.resolve(null),
    []
  );

  const refreshToken = useCallback(async () => {
    if (!auth.currentUser) return null;
    try {
      const t = await getIdToken(auth.currentUser, true);
      setToken(t);
      log.debug("token_refreshed", { uid: auth.currentUser.uid });
      return t;
    } catch (e) {
      log.warn("token_refresh_failed", { message: String(e) });
      return null;
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      log.info("login_google_success");
    } catch (e) {
      log.warn("login_google_failed", { code: e?.code || "unknown" });
      throw e;
    }
  }, []);

  const loginWithGoogleRedirect = useCallback(async () => {
    try {
      await signInWithRedirect(auth, googleProvider);
      log.info("login_google_redirect_start");
    } catch (e) {
      log.warn("login_google_redirect_failed", { code: e?.code || "unknown" });
      throw e;
    }
  }, []);

  const loginWithEmail = useCallback(async (email, pass) => {
    const emailDomain = (email?.split("@")[1] || "").toLowerCase();
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      log.info("login_email_success", { emailDomain });
    } catch (e) {
      log.warn("login_email_failed", {
        emailDomain,
        code: e?.code || "unknown",
      });
      throw e;
    }
  }, []);

  const registerWithEmail = useCallback(async (email, pass) => {
    const emailDomain = (email?.split("@")[1] || "").toLowerCase();
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await sendEmailVerification(cred.user, actionCodeSettings);
      log.info("register_success", { emailDomain });
      return cred;
    } catch (e) {
      log.warn("register_failed", { emailDomain, code: e?.code || "unknown" });
      throw e;
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    const emailDomain = (email?.split("@")[1] || "").toLowerCase();
    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      log.info("reset_email_sent", { emailDomain });
    } catch (e) {
      log.warn("reset_failed", { emailDomain, code: e?.code || "unknown" });
      throw e;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      log.info("logout");
    } catch (e) {
      log.warn("logout_failed", { message: String(e) });
      throw e;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      loginWithGoogle,
      loginWithGoogleRedirect,
      loginWithEmail,
      registerWithEmail,
      resetPassword,
      logout,
      getToken: getTokenSafe,
      refreshToken,
    }),
    [
      user,
      token,
      loading,
      loginWithGoogle,
      loginWithGoogleRedirect,
      loginWithEmail,
      registerWithEmail,
      resetPassword,
      logout,
      getTokenSafe,
      refreshToken,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
