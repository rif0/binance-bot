const ccxt = require('ccxt');
const dotenv = require('dotenv');
const chalk = require('chalk');
const cowsay = require('cowsay');

dotenv.config();

console.log(chalk.yellow(cowsay.say({
    text: "Bot de Trading Alpha-Senior Inicializado",
    e: "oO",
    T: "U "
})));

async function main() {
    console.log(chalk.blue('--- Iniciando monitoreo autónomo ---'));

    // Aquí irá la lógica de conexión y estrategia senior

    console.log(chalk.gray('Nota: Configura tus llaves API en el archivo .env para operar.'));
}

main().catch(err => {
    console.error(chalk.red('Error crítico:'), err);
});
