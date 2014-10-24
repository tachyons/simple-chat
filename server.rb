require 'em-websocket'
require 'eventmachine'
require 'json'

EM.run {
    @clients = []
    @user_list= []
  EM::WebSocket.run(:host => "0.0.0.0", :port => 8080 ,:debug => true) do |ws|
    ws.onopen { |handshake|
      @clients << ws
      @user_list << handshake.path.sub!('/', '')
      puts "WebSocket connection open"
      json={:message => "Hello Client, you connected",:user=>"admin",:users=>@user_list}.to_json
      ws.send json
      #ws.send "Hello Client, you connected"
      @clients.each do |socket|
        json={:message => " #{handshake.path} Logged In",:user=>"admin",:users=>@user_list}.to_json
        socket.send json
        #socket.send " #{handshake.path} Logged In" 
      end
    }

    ws.onclose { 
      puts "Connection closed"
      @user_list.delete_at( @clients.index(ws))
      @clients.delete ws
      @clients.each do |socket|
        socket.send "A user logged out"
      end
    }

    ws.onmessage { |msg|
      puts "Recieved message: #{msg}"
      obj = JSON.parse(msg)
      if obj['to']=="all"
        @clients.each do |socket|
          json={:type=>"message",:message => obj['message'],:user=>obj['user'],:users=>@user_list}.to_json
          socket.send json
          #socket.send msg
        end
      else
        obj['to'].each do |to_obj|
          socket=@clients[@user_list.index(to_obj)]
          json={:type=>"message",:message => obj['message'],:user=>obj['user'],:users=>@user_list}.to_json
          socket.send json
        end
      end
        #ws.send "#{msg}"
    }
    ws.onerror {
      puts 'ERRORRRRR'
    }
  end
}