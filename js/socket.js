$(document).ready(function(){
    $('#username_modal').modal('show');
    var group="all"
    var recievers=[]
    var id_num=0;
    recievers[0]="all"
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
            var msg =  jQuery.parseJSON(ev.data);
            var time,cur_time;
            var time = new Date(msg.date);
            var timeStr = time.toLocaleTimeString();
            //time=new Date($.now());
            var text="";
            switch(msg.type) {
                case "id":
                    clientID = msg.id;
                    setUsername();
                    break;
                case "username":
                    text = "<b>User <em>" + msg.name + "</em> signed in at " + timeStr + "</b><br>";
                    break;
                case "message":
                    msg_text = "(" + timeStr + ") <b>" + msg.name + "</b>: " + msg.message + "<br>";
                    if(msg.group=="all"){
                        $("#chatroom").append(msg_text);
                    } else {
                        $("#chat_area_"+msg.group).append(msg_text);
                    }
                    break;
                case "rejectusername":
                    text = "<b>Your username has been set to <em>" + msg.name + "</em> because the name you chose is in use.</b><br>"
                    break;
                case "userlist":
                    $('#connected_users').text("");
                    $('#sendto').empty();
                    for (i=0; i < msg.users.length; i++) {
                        //ul += msg.users[i] + "<br>";
                        $('#connected_users').append("<li>"+msg.users[i]+"</li>");
                        $("#sendto").append('<option value='+msg.users[i]+'>'+msg.users[i]+'</option>');
                    }
                    $('#sendto').multiSelect('refresh');
                     break;
                case "newgroup":
                    //var id = $(".nav-tabs").children().length;
                    var id=msg.id;
                    //alert(msg.id);
                    var tabId = 'chat_' + id;
                    $('#all').closest('li').before('<li id="chat_li_'+id+'"><a id="chat_li_'+id+'" href="#chat_' + id + '">'+id+'</a> <span> x </span></li>');
                    $('.tab-content').append('<div class="tab-pane" id="' + tabId + '"> Members: ' + msg.members + '<div class="chat_area" id="chat_area_'+id+'" ></div>'+'</div>');
                    $('.nav-tabs li:nth-child(' + id + ') a').click();
                break;
            }
            if (text.length) {
                $('.chat_area').append(text);
            }
            
            $('#sendto').multiSelect()
            
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
            var msg_array={ type:"message",message: mymessage,user: username ,group:group};
            var msg=JSON.stringify(msg_array); 
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

            /*var id = $(".nav-tabs").children().length;
            recievers[id]=selected_users;
            var tabId = 'chat_' + id;
            $('#all').closest('li').before('<li id="chat_li_'+id+'"><a id="chat_li_'+id+'" href="#chat_' + id + '">'+id+'</a> <span> x </span></li>');
            $('.tab-content').append('<div class="tab-pane" id="' + tabId + '"> Members: ' + recievers[id] + '<div class="chat_area" id="chat_area_'+id+'" ></div>'+'</div>');
            $('.nav-tabs li:nth-child(' + id + ') a').click();*/
            var msg_array={ type:"newgroup",user: username ,members:selected_users};
            var msg=JSON.stringify(msg_array); 
            websocket.send(msg);

        });
        $(".nav-tabs").on("click", "a", function (e) {
            e.preventDefault();
            //alert(e.toSource())
            var id=$(this).tab().parent().attr('id')
            if(id!="all") {
                id_num=parseInt(id.replace("chat_li_", ""));
                group=id_num;
            }
            else
            {
                group="all";
            }
            if (!$(this).hasClass('add-contact')) {
                $(this).tab('show');
            }
        })
        .on("click", "span", function () {
            var anchor = $(this).siblings('a');
            $(anchor.attr('href')).remove();
            $(this).parent().remove();
            $(".nav-tabs li").children('a').first().click();
        });

        $('.add-contact').click(function (e) {
            e.preventDefault();
            var id = $(".nav-tabs").children().length; //think about it ;)
            var tabId = 'contact_' + id;
            $(this).closest('li').before('<li><a href="#contact_' + id + '">New Tab</a> <span> x </span></li>');
            $('.tab-content').append('<div class="tab-pane" id="' + tabId + '">Contact Form: New Contact ' + id + '</div>');
           $('.nav-tabs li:nth-child(' + id + ') a').click();
        });
        //$('#sendto').multiSelect()
    });
});


