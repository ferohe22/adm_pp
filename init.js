const fs = require('fs');
const path = require('path');

const sessionsDir = path.join(__dirname, 'sessions');

// Crear el directorio sessions si no existe
if (!fs.existsSync(sessionsDir)) {
    fs.mkdirSync(sessionsDir, { recursive: true });
    console.log('Directorio de sesiones creado:', sessionsDir);
}

// Verificar permisos del directorio
try {
    fs.accessSync(sessionsDir, fs.constants.R_OK | fs.constants.W_OK);
    console.log('Permisos del directorio de sesiones verificados correctamente.');
} catch (err) {
    console.error('Error: No se tienen los permisos necesarios para el directorio de sesiones.');
    console.error('Por favor, asegúrese de que el proceso tiene permisos de lectura y escritura para:', sessionsDir);
    process.exit(1);
}

console.log('Inicialización completada con éxito.');