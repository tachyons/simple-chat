require 'em-websocket'
require 'eventmachine'
require 'json'

EM.run {
    @clients = []
    @user_list= []
    @groups=[]
  EM::WebSocket.run(:host => "0.0.0.0", :port => 8080 ,:debug => true) do |ws|
    ws.onopen { |handshake|
      @clients << ws
      @user_list << handshake.path.sub!('/', '')
      @name=handshake.path.sub!('/', '');
      puts "WebSocket connection open"
      @clients.each do |socket|
        user_list_array={:type=>"userlist",:date=>Time.new,:users=>@user_list}.to_json
        socket.send user_list_array
        username_array={:type=>"username",:date=>Time.new,:name=>@name}.to_json
        socket.send username_array
      end
    }

    ws.onclose { 
      puts "Connection closed"
      @user_list.delete_at( @clients.index(ws))
      @clients.delete ws
      @clients.each do |socket|
        user_list_array={:type=>"userlist",:date=>Time.new,:users=>@user_list}.to_json
        socket.send user_list_array
        socket.send "A user logged out"
      end
    }

    ws.onmessage { |msg|
      puts "Recieved message: #{msg}"
      obj = JSON.parse(msg)
      case obj['type']
        when 'message'
          if obj['group']=="all"
            @clients.each do |socket|
              json={:type=>"message",:date=>Time.new,:message => obj['message'],:name=>obj['user'],:users=>@user_list,:group=>"all"}.to_json
              socket.send json
              #socket.send msg
            end
          else
            puts @groups.inspect;
            group=@groups[obj['group'].to_i-1]
            group['members'].each do |to_obj|
              socket=@clients[@user_list.index(to_obj)]
              json={:type=>"message",:date=>Time.new,:message => obj['message'],:name=>obj['user'],:users=>@user_list,:group=>obj['group'].to_i}.to_json
              socket.send json
            end
          end
        when 'newgroup'
          group=Hash.new
          group["members"]=obj['members']
          @groups<< group
          puts @groups.inspect
          group["members"].each do |member |
            socket=@clients[@user_list.index(member)]
            json={:type=>"newgroup",:date=>Time.new,:members=>group["members"],:id=>@groups.length}.to_json
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