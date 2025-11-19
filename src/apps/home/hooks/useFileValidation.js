import { useState, useEffect } from "react";
import { getLogger } from "../../../services/logs";
const log = getLogger("files.validation");

const useFileValidation = (file, { types, maxSize }) => {
  const [valid, setValid] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!file) {
      setValid(false);
      setError(null);
      return;
    }
    if (!types.includes(file.type)) {
      setValid(false);
      setError("Formato no soportado");
      log.warn("invalid_type", { mime: file.type, allowed: types });
      return;
    }
    if (file.size > maxSize) {
      setValid(false);
      setError("Archivo muy grande");
      log.warn("too_big", { size: file.size, max: maxSize });
      return;
    }
    setValid(true);
    setError(null);
    log.debug("valid_file", { mime: file.type, size: file.size });
  }, [file, types, maxSize]);

  return { valid, error };
};

export default useFileValidation;
