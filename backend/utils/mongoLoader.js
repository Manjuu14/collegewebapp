const net = require('net');
const { spawn } = require('child_process');

function checkMongoPort(port = 27017) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        
        socket.setTimeout(1000);
        
        socket.once('connect', () => {
            socket.destroy();
            resolve(true); // Port is active
        });
        
        socket.once('error', () => {
            socket.destroy();
            resolve(false); // Port is not active
        });
        
        socket.once('timeout', () => {
            socket.destroy();
            resolve(false); // Port is not active
        });
        
        socket.connect(port, '127.0.0.1');
    });
}

function startMongo() {
    return new Promise(async (resolve, reject) => {
        try {
            const isActive = await checkMongoPort();
            if (isActive) {
                console.log('MongoDB is already running on port 27017.');
                return resolve();
            }
            
            console.log('MongoDB is not running. Attempting to start mongod automatically...');
            
            const mongoProcess = spawn('mongod', ['--port', '27017'], {
                detached: true,
                stdio: 'ignore',
                shell: true
            });
            
            mongoProcess.unref();
            
            // Wait for mongod to start up and listen
            let attempts = 0;
            const interval = setInterval(async () => {
                attempts++;
                const connected = await checkMongoPort();
                if (connected) {
                    clearInterval(interval);
                    console.log('✓ MongoDB started successfully.');
                    resolve();
                } else if (attempts >= 10) {
                    clearInterval(interval);
                    reject(new Error('Failed to start MongoDB after 10 attempts. Please run "mongod" manually.'));
                }
            }, 1000);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = { startMongo };
