const { join, resolve } = require('path');
const { existsSync, readdirSync } = require('fs');
const { createInterface } = require('readline/promises');

/** @type {typeof import('open')|null} */
let open = null;
try {
    // open is used to run the fmp:// protocol
    open = require('open');
} catch {
    console.log(`${redText}The 'open' package is required to run this script. Please run 'npm install open' first.`);
    process.exit(1);
}

const redText = '\x1b[31m';
const greenText = '\x1b[32m';
const yellowText = '\x1b[33m';
const cyanText = '\x1b[36m';
const resetText = '\x1b[0m';

const stdInterface = createInterface({
    input: process.stdin,
    output: process.stdout
});

(async () => {
    const widgetFiles = readdirSync(__dirname)
        .filter(name => /^widget.*\.json$/.test(name));

    let widgetFile = widgetFiles[0];
    if (!widgetFile)
        throw new Error('No widget JSON file was found');

    // If there are more than one widget*.json file, ask the user to choose one
    if (widgetFiles.length > 1) {
        console.log(`${yellowText}More than one widget JSON file was found`);
        console.log(
            widgetFiles.map((file, i) => `${cyanText}[${i + 1}]${resetText} ${file}`)
                .join('\n')
        );

        let answer = Number((await stdInterface.question(`${greenText}Choose a JSON file:${resetText} `))
            .trim());
        
        while (!Number.isFinite(answer) || answer <= 0 || answer > widgetFiles.length) {
            console.log(`${yellowText}You must choose a valid JSON file${resetText}`);
            answer = Number((await stdInterface.question(`${greenText}Choose a JSON file:${resetText} `))
                .trim()
            );
        }

        widgetFile = widgetFiles[answer - 1];
    }

    stdInterface.close();
    const config = require(`./${widgetFile}`);

    if (typeof config !== 'object')
        throw new Error(`${widgetFile} was not parsed as an object`);

    // Map the values of the config
    const {
        name,
        file,
        server,
        uploadScript,
        ...extra
    } = config;

    // Construct the base FMP URL
    const fmpUrl = `fmp://${server}/${file}`;

    // Get the path to the distribution index.html
    const builtPath = join(__dirname, 'dist', 'index.html');

    // Default to the original if no built index.html was found
    const filePath = existsSync(builtPath)
        ? builtPath
        : resolve(__dirname, '..', 'form.html');

    if (!existsSync(filePath))
        throw new Error(`The module HTML-file was not found. The following paths were checked: ${builtPath}, ${filePath}`);

    // Parameters to pass to the script
    const params = { name, filePath, ...extra };

    // Add parameters to the FMP URL
    const url = `${fmpUrl}?script=${uploadScript}&param=${encodeURIComponent(JSON.stringify(params))}`;

    // Finally, open the FMP URL
    console.log(`${cyanText}Uploading the HTML using ${widgetFile}...${resetText}`);
    open(url).then(childProcess => {
        childProcess.on('exit', () => {
            process.exit(0);
        });
    });
})();