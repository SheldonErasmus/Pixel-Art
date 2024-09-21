// @ts-check
const {spawn} = require('child_process');


// Parse the arg and run the command
function cmd(program, args = [])
{
    const spawnOptions = { "shell": true };
    console.log(`CMD: ${program}`, args.flat(), spawnOptions);

    const ls = spawn(program, args.flat(), spawnOptions);

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });
    
    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });
    
    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}

cmd("npx", ['http-server', ['-p', '6969', '-s', '-c-1', '-d', 'false']]);
cmd("node", ['server.mjs']);

