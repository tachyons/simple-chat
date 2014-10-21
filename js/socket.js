$(document).ready(function(){
    //Open a WebSocket connection.
    var wsUri = "ws://localhost:8080";   
    websocket = new WebSocket(wsUri); 
    
    //Connected to server
    websocket.onopen = function(ev) {
        alert('Connected to server ');
    }
    
    //Connection close
    websocket.onclose = function(ev) { 
        alert('Disconnected');
    };
    
    //Message Receved
    websocket.onmessage = function(ev) { 
        alert('Message '+ev.data);
    };
    
    //Error
    websocket.onerror = function(ev) { 
        alert('Error '+ev.data);
    };
    
     //Send a Message
    $('#send').click(function(){ 
        var mymessage = 'This is a test message'; 
        websocket.send(mymessage);
    });
});
