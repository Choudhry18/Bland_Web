const express = require('express');
const { spawn } = require('child_process');
const bodyParser = require('body-parser');
const path = require('path'); // Import path module
const app = express();
const port = 3000;

// Serve the static files from the public directory
app.use(express.static('public'));

// Middleware to parse JSON request body
app.use(bodyParser.json());

// GET endpoint to serve the HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve the HTML file
});

// POST endpoint to run the Haskell interpreter
app.post('/run', (req, res) => {
    const icode = req.body.code; // Get the code from the request body
    const code = icode.concat("\n", ":quit")
    // Spawn a new child process to run the interpreter
    const interpreter = spawn('./bland');

    // Send the code to the interpreter's stdin
    interpreter.stdin.write(code);
    interpreter.stdin.end();

    let output = '';
    let errorOutput = '';

    // Collect output from the interpreter's stdout
    interpreter.stdout.on('data', (data) => {
        output += data;
    });

    // Collect errors from the interpreter's stderr
    interpreter.stderr.on('data', (data) => {
        errorOutput += data;
    });

    // Handle the process exit
    interpreter.on('close', (code) => {
        if (code !== 0) {
            console.error(`Interpreter error: ${errorOutput}`);
            return res.status(500).send(`Execution error: ${errorOutput}`);
        }
        res.send(output); // Send the output back to the client
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
