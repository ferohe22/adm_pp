const bcrypt = require('bcrypt');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Por favor, ingresa la contraseña que deseas hashear: ', (password) => {
  // Número de rondas de salt, 10 es un buen valor por defecto
  const saltRounds = 10;

  bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
      console.error('Ocurrió un error al hashear la contraseña:', err);
    } else {
      console.log('Contraseña hasheada:');
      console.log(hash);
    }
    rl.close();
  });
});