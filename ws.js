const WebSocket = require('ws');
const clients = new Map();

exports.handler = async (event) => {
    const { requestContext } = event;
    
    if (requestContext.eventType === 'CONNECT') {
        console.log('Client connected:', requestContext.connectionId);
        return { statusCode: 200, body: 'Connected' };
    }
    
    if (requestContext.eventType === 'MESSAGE') {
        try {
            const body = JSON.parse(event.body);
            const { action, clientId, coordinates, key, command } = body;
            
            switch(action) {
                case 'GET_SCREEN':
                    // Broadcast to all clients to capture screen
                    broadcast({ action: 'CAPTURE_SCREEN', clientId });
                    break;
                    
                case 'MOUSE_DOWN':
                case 'MOUSE_MOVE':
                case 'MOUSE_UP':
                    broadcast({ 
                        action: 'MOUSE_EVENT', 
                        clientId,
                        coordinates,
                        type: action
                    });
                    break;
                    
                case 'KEY_PRESS':
                    broadcast({
                        action: 'KEY_EVENT',
                        clientId,
                        key: key
                    });
                    break;
                    
                case 'SPECIAL_COMMAND':
                    broadcast({
                        action: 'SPECIAL_COMMAND',
                        clientId,
                        command: command
                    });
                    break;
                    
                case 'PING':
                    // Keep connection alive
                    break;
            }
            
            return { statusCode: 200, body: 'OK' };
            
        } catch (error) {
            console.error('Message handling error:', error);
            return { statusCode: 500, body: 'Error' };
        }
    }
    
    if (requestContext.eventType === 'DISCONNECT') {
        console.log('Client disconnected:', requestContext.connectionId);
        return { statusCode: 200, body: 'Disconnected' };
    }
    
    return { statusCode: 400, body: 'Unknown event type' };
};

function broadcast(message) {
    clients.forEach((client, clientId) => {
        try {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message));
            }
        } catch (error) {
            console.error('Broadcast error to client', clientId, error);
        }
    });
}
