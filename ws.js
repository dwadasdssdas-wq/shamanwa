const WebSocket = require('ws');

const connections = new Map();

exports.handler = async (event, context) => {
    const { requestContext } = event;
    
    if (requestContext.eventType === 'CONNECT') {
        console.log('Direct connection established:', requestContext.connectionId);
        connections.set(requestContext.connectionId, {
            connectedAt: new Date(),
            clientId: null
        });
        return { statusCode: 200, body: 'Connected' };
    }
    
    if (requestContext.eventType === 'MESSAGE') {
        try {
            const body = JSON.parse(event.body);
            const { type, clientId, x, y, key, command, event: eventType } = body;
            const connectionId = requestContext.connectionId;
            
            
            if (clientId && !connections.get(connectionId).clientId) {
                connections.get(connectionId).clientId = clientId;
            }
            
            
            broadcastToAll({
                type: 'COMMAND',
                clientId: clientId,
                data: body,
                timestamp: new Date().toISOString()
            });
            
            return { statusCode: 200, body: 'OK' };
            
        } catch (error) {
            console.error('Message processing error:', error);
            return { statusCode: 500, body: 'Error' };
        }
    }
    
    if (requestContext.eventType === 'DISCONNECT') {
        console.log('Connection closed:', requestContext.connectionId);
        connections.delete(requestContext.connectionId);
        return { statusCode: 200, body: 'Disconnected' };
    }
    
    return { statusCode: 400, body: 'Unknown event' };
};

function broadcastToAll(message) {
    connections.forEach((info, connectionId) => {
        try {
         
            console.log('Broadcasting to:', connectionId, message);
        } catch (error) {
            console.error('Broadcast error:', error);
        }
    });
}

