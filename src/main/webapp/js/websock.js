var sc_sysout = null;

var element_dialog =  $('#selectPopup')
	.dialog({
		autoOpen: false,
		width: 600,
        buttons:[ {
           "OK": function () {
                $(this).dialog("close");
            }
        }]
	});


function connect() {
    var socket = new SockJS('/websocket');
    sc_sysout = Stomp.over(socket);
    sc_sysout.debug = null;
    sc_sysout.connect({}, function () {
       // console.log('Connected: ' + frame);
        sc_sysout.subscribe('/message/sysout', function (message) {
        	console.log("Received");
        	$('#output_area').append(message.body.replace(/\n/g, "<br />"));
        });
        sc_sysout.subscribe('/message/slot_status', function (message) {
        	
        	message = message.body.split(",");
        	
        	var slot = message[0];
        	var status = (message[1] == 'true');
        	//console.log($('#'+slot))
        	if(status){
        		console.log("Turning on");
        		$('#'+slot).get(0).style.setProperty("background-color","#173959");
        		$('#'+slot).attr('data-content',
					
						'<button class="btn btn-sm btn-danger slot_btn"  type="button" sytle="background-color:gray;color: black;">deactivate</button>'
					);
        		$('#'+slot).popover("show");
        		var target = $('#'+slot);
        		//Popup to select element type
        		element_dialog.dialog("widget").position({
        		       my: 'left',
        		       at: 'right',
        		       of: target
        		    });
       		
        			updateInterfaceConfiguration($('#'+slot).attr("id"),"status",true);
        	}else{
        		console.log("Turning off");
        		$('#'+slot).get(0).style.setProperty("background-color","#0E1B2A");
        		$('#'+slot).attr('data-content',
					
						'<button class="btn btn-sm btn-success slot_btn"  type="button" sytle="background-color:gray;color: black;">activate</button>'
					);
        		$('#'+slot).popover("show");
        	
     			updateInterfaceConfiguration($('#'+slot).attr("id"),"status",false);
        	}
        });
    });
}

function disconnect() {
    if (sc_sysout !== null) {
    	sc_sysout.disconnect();
    }
    //console.log("Disconnected");
}

$(function initiate() {
  //  $("form").on('submit', function (e) {
  //      e.preventDefault();
  //  });
   // $( "#connect" ).click(function() { connect(); });
  //  $( "#disconnect" ).click(function() { disconnect(); });
   // $( "#send" ).click(function() { sendName(); });
	//console.log("Connecting");
	connect();
	$('#stop').hide();
});