import { Client } from 'pg';
import { writeFile, unlink } from 'fs/promises';
import { exec } from 'child_process';
import * as os from 'os';
import dotenv from 'dotenv';
import { file } from 'tmp-promise';
dotenv.config({ path: './config/.env' });
import { promisify } from 'util';
const execAsync = promisify(exec);

const host = process.argv[2] || process.env.PG_HOST;
const port = Number(process.argv[3] || process.env.PG_PORT);

const client = new Client({
    host,
    port,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE
});

(async () => {
    console.log('Attempting to connect...');

    try {
        await client.connect();
    } catch (error) {
        throw new Error('Connection failure');
    }

    console.log('Connected');
    console.log('Generating Mermaid diagram and images...');

    const res = await client.query(`
    SELECT r1.r_id, r1.r_name AS name, r1.r_parent, r2.r_name AS parent_name
    FROM ranks AS r1
    LEFT JOIN ranks AS r2 ON r1.r_parent = r2.r_id;
  `);

    let mmd = 'graph BT\nsubgraph Church\ndirection BT\n';
    res.rows.forEach((row) => {
        if (row.parent_name)
            mmd += `${row.name.replace(/ /g, '_')} --> ${row.parent_name.replace(/ /g, '_')}\n`;
        else mmd += `${row.name.replace(/ /g, '_')}\n`;
    });
    mmd += 'end\n';

    const runMmdc = async (output, scale) => {
        const scaleOption = scale ? `-s ${scale}` : '';
        const tmpFile = await file({ postfix: '.mmd' });
        try {
            await writeFile(tmpFile.path, mmd, 'utf-8');

            const command = os.platform() === 'win32'
                ? `npx mmdc.cmd -i "${tmpFile.path}" -o "${output}" ${scaleOption}`
                : `./node_modules/.bin/mmdc -i "${tmpFile.path}" -o "${output}" ${scaleOption}`;
            //console.log(command);
            const { stdout, stderr } = await execAsync(command, { shell: true });
            if (stdout) console.log(stdout);
            if (stderr) console.error(stderr);

        } finally {
            await tmpFile.cleanup();
        }
    };

    await runMmdc('test.png', 5);
    await runMmdc('test.svg');

    await client.end();
})();
