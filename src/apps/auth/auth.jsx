import { Stack, Alert } from "@mui/material";
import { useAuth } from "../../services/auth/firebase/AuthContext";
import LoginModal from "../../components/LoginModal";
import { useAuthMode } from "./hooks/useAuthMode";
import LoginForm from "./sections/LoginForm";
import RegisterForm from "./sections/RegisterForm";
import ResetForm from "./sections/ResetForm";
import { useEffect } from "react";
import { getLogger } from "../../services/logs";
const gateLog = getLogger("auth.gate");

export default function Auth({ children }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) gateLog.info("unauthenticated_show_modal");
    else gateLog.info("authenticated_render", { uid: user.uid });
  }, [user, loading]);

  if (loading) return null;
  if (!user) return <LoginModal open disableClose onClose={() => {}} />;
  return children;
}

export function AuthForms({ onLoginSuccess }) {
  const { mode, setMode, msg, setMsg } = useAuthMode();
  return (
    <Stack spacing={2}>
      {msg.text ? (
        <Alert severity={msg.type || "info"}>{msg.text}</Alert>
      ) : null}
      {mode === "login" && (
        <LoginForm
          setMode={setMode}
          setMsg={setMsg}
          onSuccess={onLoginSuccess}
        />
      )}
      {mode === "register" && (
        <RegisterForm setMode={setMode} setMsg={setMsg} />
      )}
      {mode === "reset" && <ResetForm setMode={setMode} setMsg={setMsg} />}
    </Stack>
  );
}
