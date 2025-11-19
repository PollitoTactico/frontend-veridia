export function mapAuthError(code, fallback) {
  // Firebase Auth Error Mapping
  const M = {
    "auth/invalid-credential": "Credenciales inválidas.",
    "auth/user-not-found": "Usuario no encontrado.",
    "auth/wrong-password": "Contraseña incorrecta.",
    "auth/too-many-requests": "Demasiados intentos; inténtalo luego.",
    "auth/email-already-in-use": "Ese correo ya está en uso.",
    "auth/weak-password": "La contraseña es muy débil.",
    "auth/invalid-email": "Correo inválido.",
    "auth/network-request-failed": "Problema de red. Revisa tu conexión.",
    "auth/popup-closed-by-user": "Cerraste la ventana antes de completar.",
  };
  return M[code] || fallback || "Error inesperado. Intenta de nuevo.";
}