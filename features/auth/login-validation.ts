export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginErrors = Partial<Record<keyof LoginCredentials, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(
  credentials: LoginCredentials,
): LoginErrors {
  const email = credentials.email.trim();
  const password = credentials.password;
  const errors: LoginErrors = {};

  if (!email) {
    errors.email = "Ingresa tu correo corporativo.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Ingresa un correo válido.";
  }

  if (!password) {
    errors.password = "Ingresa tu contraseña.";
  } else if (password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres.";
  }

  return errors;
}
