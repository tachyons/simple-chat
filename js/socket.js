$(document).ready(function(){
    $('#username_modal').modal('show');
    var reciever="all"
    $('#continue_button').click(function() {
        var username=$('#inputUsername').val();
        $('#username_modal').modal('toggle');
        alert(username);
        //Open a WebSocket connection.
        var wsUri = "ws://192.168.1.211:8080/"+username;   
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
            var json =  jQuery.parseJSON(ev.data);
            var time,cur_time;
            time=new Date($.now());
            cur_time=time.getHours() + ":" + time.getMinutes() + ":" + time.getSeconds();
            var message="<div class=\"message well\"><p>"+json.message+"</p> <p class=\"pull-right\">"+json.user+"</p>    <li><span><i class=\"glyphicon glyphicon-calendar\"></i> "+cur_time+" </span></li></div>";
            $('.chat_area').append(message);
            //alert(message);
            $('#connected_users').text("")
            $('#sendto')
                .empty()
                //.append('<option selected="selected" value="all">All</option>')
            ;
            for (index = 0; index < json.users.length; ++index) {
                $('#connected_users').append("<li>"+json.users[index]+"</li>");
                $("#sendto").append('<option value='+json.users[index]+'>'+json.users[index]+'</option>');
                $('#sendto').multiSelect('refresh');                
            }
            $('#sendto').multiSelect()
            //alert('Message '+ev.data);
        };
        
        //Error
        websocket.onerror = function(ev) { 
            alert('Error '+ev.data);
        };
        
         //Send a Message
        $('#send').click(function(){ 
            var mymessage = $('#post_input').val();
            $('#post_input').val('');
            //websocket.send(JSON.stringify('user_message', {name: 'UserName', message: mymessage}) );
            var msg=JSON.stringify({ message: mymessage,user: username ,to:reciever}); 
            websocket.send(msg);
        });
        $( "#sendto" ).change(function() {
          reciever=$( "#sendto" ).val();
          //alert(reciever);
        });
        $('#create_chat_button').click(function(){
            var selected_users=$( "#sendto" ).val();
            alert(selected_users);
            $('#myModal').modal('hide');
        });

        //$('#sendto').multiSelect()
    });
});
