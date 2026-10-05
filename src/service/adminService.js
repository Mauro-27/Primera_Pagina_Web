import administradores from "../data/admin.json";

const login = (user, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const encontrado = administradores.find(
        (admin) => admin.user.toLowerCase() === user.toLowerCase() && admin.password === password
      );

      if (encontrado) {
        resolve({
          id: encontrado.id,
          nombre: encontrado.nombre,
          sector: encontrado.sector,
        });
      } else {
        reject(new Error("El usuario o la contraseña no coinciden. Intente nuevamente."));
      }
    }, 800);
  });
};

export default { login };
