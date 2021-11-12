var interface_configuration = [];
var supported_element_types = [];

(function checkSlotConfiguration(){
	//console.log("Running");
	$.ajax({
		type: 'GET',
		url:'getSlotConfiguration',
		success: function(data) {
			var coreSlots = $('#slots').find('div.slot');
			var json = jQuery.parseJSON(data);
			interface_configuration = json;
			//console.log(json);
			for(var i = 0; i<13; i++){
				var slot = json[i];
				var sel_slot = $("div.slot").get(i);
				
				var status = slot.status;
				if(!status){
					$("div.slot").get(i).style.setProperty("background-color","#0E1B2A");
					$(sel_slot).attr({
					'data-toggle':"popover",
					'data-placement': "right",
					'data-content': 
						'<button class="btn btn-sm btn-success slot_btn"  type="button" sytle="background-color:gray;color: black;">activate</button>'
					});
				}else{
					//console.log("1 Off");
					$("div.slot").get(i).style.setProperty("background-color","#173959");
					$(sel_slot).attr({
					'data-toggle':"popover",
					'data-placement': "right",
					'data-content': 
						'<button class="btn btn-sm btn-danger slot_btn"  type="button" sytle="background-color:gray;color: black;">deactivate</button>'
					});
					
				}
				
				var name = slot.given_name;
				if(name != null && name != ""){
					$(sel_slot).find(".slot_label").val(name);
				}
				
				//var filter = slot.filters.get(i);
			}
			//console.log(interface_configuration);
		}
		
	});
})();

(function getSupportedElements(){
	$.ajax({
		type: 'GET',
		url:'getSupportedElementTypes',
		data: {t:"full"},
		success: function(data){
			supported_element_types = data;
			//console.log(supported_element_types);
		}
	});
})();

var current_slot;
var current_filter;
var current_lua = "";

$(".slot:not(#library):not(#system):not(#unit)").popover({
    trigger: "manual",
    container: 'body',
    html: true,
    sanitize: false,
    animation: false
  })
  .on("mouseenter", function slotActivationToggle_show() {
	  current_slot = this;
    var _this = this;
    $(this).popover("show");
    $(".popover").on("mouseleave", function() {
      $(_this).popover('hide');
    });
  }).on("mouseleave", function slotActivationToggle_hide() {
	 
    var _this = this;
   // setTimeout(function() {
      if (!$(".popover:hover").length) {
        $(_this).popover("hide");
      }
    //});
 });

$(document).ready(function toggleSlotStatus(){	
	$("div.slot").click(function(ev){
		ev.preventDefault();
		var this_slot = this;
		var border = $(this_slot).get(0).style.border
		$("div.slot").each(function(){
			if(this != this_slot){
				if($(this).get(0).style.border == "0.25px solid white"){
						updateSlotConfig();
				}
				$(this).get(0).style.border = "none";
				$(myCodeMirror.getWrapperElement()).hide();
				$(".sel_event").remove();
			}
		});
		
		if (border == "0.25px solid white"){
			
			$(this_slot).get(0).style.border = "none";
			$(myCodeMirror.getWrapperElement()).hide();
			
			$(".sel_event").remove();
		}else{
			
			$(this_slot).get(0).style.border = "0.25px solid white";

			$.ajax({
				type: 'GET',
				url:'getFilters',
				data: {slot: $(this_slot).attr("id") },
				success: function(data) {
					var filter = JSON.parse(data);
					//console.log("Filter Data");
					//console.log(filter);
					for( var i in filter){
						putFilter(filter[i].given_name);
					}
				}
			});
		}
	});
});

$(document.body).on('click', '.sel_event' ,function toggleFilters (ev){
	ev.preventDefault();
	var this_slot = "";
	//Find the active slot
	$("div.slot").each(function(){
		if($(this).get(0).style.border == "0.25px solid white"){
			this_slot = this;
		}
	});
	
	var this_filter = this;
	var border = $(this_filter).get(0).style.border
	$("div.sel_event").each(function(){
		if(this != this_filter){
			if($(this).get(0).style.border == "0.25px solid white"){
				//updateInterfaceConfiguration($(this_slot).attr("id"),"lua",current_lua);
				//updateSlotConfig();
				//sleep(500);
				//myCodeMirror.setValue("");
				//$(myCodeMirror.getWrapperElement()).hide();
			}
			$(this).get(0).style.border = "none";
		}
	});
	
	//myCodeMirror.setValue("");
	//$(myCodeMirror.getWrapperElement()).hide();
	
	if (border == "0.25px solid white"){
		$(this_filter).get(0).style.border = "none";
		$(myCodeMirror.getWrapperElement()).hide();
	}else{
		//console.log("active");
		$(this_filter).get(0).style.border = "0.25px solid white";
		//console.log($(this_filter).attr("id"));
		$(myCodeMirror.getWrapperElement()).show();
		//myCodeMirror.setValue("");
		sleep(100);
		var code = getFilterLua($(this_slot).attr("id"));
		//console.log(code);
		myCodeMirror.setValue(code);
		
	}
	console.log(interface_configuration);
});

$(document.body).on('change', '.slot_label' ,function updateSlotName (ev){
	ev.preventDefault();
	
	var sel_slot = $(this).parent();
	updateInterfaceConfiguration($(sel_slot).attr("id"),"given_name",$(this).val());
	
});

$(document).on('click','.slot_btn',function toggleSlotActivation(ev){
	ev.preventDefault();
		var sel_slot = current_slot;
		var pop = $(this).parent();
		//console.log($(pop));
		if($(this).text() == 'activate'){
			//Get Supported Element types
			
			//Populate popup div
			var title = "";
			
			$.ajax({
				type: 'GET',
				url:'getSupportedElementTypes',
				success: function(data){
					for(var i in data){
						var option = "<option>"+data[i]+"</option>"
						$("#choose_element").append(option);
					}
					//console.log("Updating select statement");
					//console.log($("#choose_element").html());
					$("#selectPopup").dialog({modal: true, height: 200, width: 400 ,
						buttons :{
							"Confirm" : function (){
								
								$.ajax({
									type: 'POST',
									url:'setSlotType',
									data: {slot: $(sel_slot).attr("id"), 
										type: $("#choose_element option:selected").text()}
								});
								$(this).dialog("close");
							}
						}});
				}
			});
		}
		
		$.ajax({
			type: 'POST',
			url:'toggleSlotActivation',
			data: {slot: $(sel_slot).attr("id")}
		});	
		
		
});

$(document).ready(function executeLua(){
	$('#run').click(function(ev){
		ev.preventDefault();
		$.ajax({
			type: 'POST',
			url:'testLua',
			data: {code: myCodeMirror.getValue()},
			success: function(){
				//$('#run').hide();
				//$('#stop').show();
			}
		});
	});
});

$(document).ready(function addFilter(){
	$('#add_filter').click(function(ev){
		ev.preventDefault();
		
		var this_slot = null;
		$("div.slot").each(function(){
			console.log(this);
			if($(this).get(0).style.border == "0.25px solid white" && $(this).attr("id") != "lua"){
				this_slot = this;
			}
		});
		if(this_slot != null){
		//If slot is active
		var filterCount = $('.sel_event').find().prevObject.length;
		var new_filter = '<div style="hidden;" class="filter sel_event" id="filter_'+filterCount+'">'+
		'<div class="filter_play"> &#9658;</div>  <div class="filter_text">Select event()</div>'+
		'<div class="filter_close">&#x274C;</div></div>';
		
		
		$(".filter").last().after(new_filter)
		$(".filter_close").css('cursor', 'pointer');
		
		$(".filter_play").css('cursor', 'pointer');
		$(".filter_play").css('font-size', '20px');
		
		//font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif;
		$(".filter_text").css('font-family', '"Lucida Sans Unicode", "Lucida Grande", sans-serif');
		$(".filter_text").css('width', '200px');
		
		
		var popup_content = '';
		
		console.log("add filter: "+$(this_slot).attr("id"))
		$.ajax({
			type: 'GET',
			url:'filterTypes',
			data: {
				slot: $(this_slot).attr("id")
				},
			success: function(data){
				if (data != null){
					var json = jQuery.parseJSON(data);
					//console.log(json);
					for(var i in json){
						//console.log(json[i].given_name);
						popup_content += '<button class="btn btn-sm btn-primary filter_type_btn"  type="button" sytle="background-color:gray;color: black;">'+json[i].given_name+'</button>';
					}
					//console.log(popup_content);
					$(".filter_play").attr({
						'data-toggle':"popover",
						'data-placement': "bottom",
						'data-content': popup_content
						});
					//console.log($('#filter_'+filterCount).find(".filter_play"));
					$(".filter_play").popover({
					    trigger: "manual",
					    container: 'body',
					    html: true,
					    sanitize: false,
					    animation: false
					  })
					  .on("mouseenter", function filterPopup_show() {
						  current_filter = $(this).parent();
					    var _this = this;
					    $(this).popover("show");
					    $(".popover").on("mouseleave", function() {
					      $(_this).popover('hide');
					    });
					  }).on("mouseleave", function filterPopup_hide() {
						 
					    var _this = this;
					   // setTimeout(function() {
					      if (!$(".popover:hover").length) {
					        $(_this).popover("hide");
					      }
					    //});
					 });
				}
				
				updateSlotConfig();
			}
		});
	}	
		
	});
	
});

$(document.body).on('click', '.filter_close' ,function close_filter (ev){
	
	//console.log($(myCodeMirror.getWrapperElement()));
	//console.log($(this).parent().get(0).style.border);
	if($(this).parent().get(0).style.border != '0.25px solid white'){
		$(this).parent().remove();
		$(myCodeMirror.getWrapperElement()).hide();
	}
	$(this).parent().remove();
	updateSlotConfig();
});

$(document.body).on('click','.filter_type_btn', function selectFilterType(){
		var filter_name = $(this).text();
		var filter_text = $(current_filter).find(".filter_text");
		$(filter_text).text(filter_name+"()");
		
		var filter_list = $("#filter_container").find(".sel_event");
		
		var filters = [];
		//console.log($(filter_list));
		$(filter_list).each(function(){
			var filter = {};
			var item =  $(this).get(0);
			//console.log(item.id);
			filter.name = item.id;
			filter.given_name = $(item).find(".filter_text").text();
			//console.log(filter.given_name);
			filter.args = [];
			var args_list = $(item).find("input");
			//console.log(args_list);
			filter.arg_count = args_list.length;
			args_list.each(function(){
				filter.args.push($(this).get(0));
			});
			
			filter.lua = myCodeMirror.getValue();
			filters.push(filter);
		});
		
		var this_slot = null;
		$("div.slot").each(function(){
			if($(this).get(0).style.border == "0.25px solid white"){
				this_slot = this;
			}
		});
		//console.log(filters);
		updateInterfaceConfiguration($(this_slot).attr("id"),"filters",filters);
});

function updateSlotConfig(){
	var this_slot = null;
	$("div.slot").each(function(){
		if($(this).get(0).style.border == "0.25px solid white"){
			this_slot = this;
		}
	});
	//console.log("Updating: "+$(this_slot).attr("id"));
	var this_filter = null;
	$("div.sel_event").each(function(){
		if($(this).get(0).style.border == "0.25px solid white"){
			this_filter = this;
		}
	});
	//console.log("On Filter: "+$(this_filter).attr("id"));
	//console.log(this_filter)
	var slot_obj = {};
	var filter_list = $("#filter_container").find(".sel_event");
	
	var slot_id = $(this_slot).attr("id");
	updateInterfaceConfiguration(slot_id,"given_name",$(this_slot).find(".slot_label").val());

	var filters = [];
	$(filter_list).each(function(){
		var filter = {};
		var item =  $(this).get(0);
		//console.log(item);
		filter.name = item.id;
		filter.given_name = $(item).find(".filter_text").text();
		//console.log(filter.id);
		filter.args = [];
		var args_list = $(item).find("input");
		filter.arg_count = args_list.length;
		args_list.each(function(){
			filter.args.push($(this).get(0));
		});
		
		if(filter.name = $(this_filter).attr("id")){
			filter.lua = myCodeMirror.getValue();
		}else{
			filter.lua = "";
		}
		
		filters.push(filter);
	});
	
	updateInterfaceConfiguration(slot_id,"filters",filters);
}

function putFilter(name){
	if(name == null){
		name == 'Select event()';
	}
	var this_slot = null;
	$("div.slot").each(function(){
		if($(this).get(0).style.border == "0.25px solid white"){
			this_slot = this;
		}
	});
	if(this_slot != null){
	//If slot is active
	var filterCount = $('.sel_event').find().prevObject.length;
	var new_filter = '<div style="hidden;" class="filter sel_event" id="filter_'+filterCount+'">'+
	'<div class="filter_play"> &#9658;</div>  <div class="filter_text">'+name+'</div>'+
	'<div class="filter_close">&#x274C;</div></div>';
	
	
	$(".filter").last().after(new_filter)
	$(".filter_close").css('cursor', 'pointer');
	
	$(".filter_play").css('cursor', 'pointer');
	$(".filter_play").css('font-size', '20px');
	
	//font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif;
	$(".filter_text").css('font-family', '"Lucida Sans Unicode", "Lucida Grande", sans-serif');
	$(".filter_text").css('width', '200px');
	
	
	var popup_content = '';
	console.log("put filter: "+$(this_slot).attr("id"))
	$.ajax({
		type: 'GET',
		url:'filterTypes',
		data: {
			slot: $(this_slot).attr("id")
			},
		success: function(data){
			if (data != null){
				var json = jQuery.parseJSON(data);
				//console.log(json);
				for(var i in json){
					//console.log(json[i].given_name);
					popup_content += '<button class="btn btn-sm btn-primary filter_type_btn"  type="button" sytle="background-color:gray;color: black;">'+json[i].given_name+'</button>';
				}
				//console.log(popup_content);
				$(".filter_play").attr({
					'data-toggle':"popover",
					'data-placement': "bottom",
					'data-content': popup_content
					});
				//console.log($('#filter_'+filterCount).find(".filter_play"));
				$(".filter_play").popover({
				    trigger: "manual",
				    container: 'body',
				    html: true,
				    sanitize: false,
				    animation: false
				  })
				  .on("mouseenter", function filterPopup_show() {
					  current_filter = $(this).parent();
				    var _this = this;
				    $(this).popover("show");
				    $(".popover").on("mouseleave", function() {
				      $(_this).popover('hide');
				    });
				  }).on("mouseleave", function filterPopup_hide() {
					 
				    var _this = this;
				   // setTimeout(function() {
				      if (!$(".popover:hover").length) {
				        $(_this).popover("hide");
				      }
				    //});
				 });
			}
			
			//Update interface object
			updateSlotConfig();
		}
	});
}	
}

myCodeMirror.on("change",function updateFilterLua(){
	//Get slot
	var this_slot = null;
	$("div.slot").each(function(){
		if($(this).get(0).style.border == "0.25px solid white"){
			this_slot = this;
		}
	});
	
	//Get filter
	var this_filter = null;
	$("div.sel_event").each(function(){
		if($(this).get(0).style.border == "0.25px solid white"){
			this_filter = this;
		}
	});
	
	if(this_filter != null && this_slot != null){
		current_lua = myCodeMirror.getValue();
		updateInterfaceConfiguration($(this_slot).attr("id"),"lua",myCodeMirror.getValue());
	}
	console.log(current_lua);
	updateInterfaceConfiguration($(this_slot).attr("id"),"lua",current_lua);
});

function getFilterLua(slot_id){
	var code = "";
	
$.each(interface_configuration,function(index,slot){
		
		if(slot.name == slot_id){

			//Get active filter
			var this_filter = null;
			$("div.sel_event").each(function(){
				if($(this).get(0).style.border == "0.25px solid white"){
					this_filter = this;
				}
			});
			
			$.each(slot.filters, function(x,filter){
				//console.log(filter);
				//console.log(filter.name);
				//console.log(filter.arg_count);
				//console.log(filter.give_name);
				//console.log(filter.lua);
				if(filter.name == $(this_filter).attr("id")){
					code = filter.lua;
					return code;
				}
			});
			
		}		
	});
	return code;
}

function updateInterfaceConfiguration(id,attribute,value){
	$.each(interface_configuration,function(index,slot){
		
		if(slot.name == id && attribute != "name"){
			if(attribute == "type"){
				for(var i in supported_element_types){
					if(supported_element_types[i] == value){
						slot.type = value;
					}
				}
			}else if(attribute == "given_name"){
				slot.given_name = value;
			}else if(attribute == "filters"){
				slot.filters = value;
			}else if(attribute == "status"){
				slot.status = value;
			}else if(attribute == "lua"){
				//Get filter
				var this_filter = null;
				$("div.sel_event").each(function(){
					if($(this).get(0).style.border == "0.25px solid white"){
						this_filter = this;
					}
				});
				
				$.each(slot.filters, function(x,filter){
					if(filter.name == $(this_filter).attr("id")){
						filter.lua = value;
					}
					slot.filters[x] = filter;
				});
			}

			if(attribute == "slot"){
				interface_configuration[index] = value;
			}else{
				interface_configuration[index] = slot;
			}
		}		
	});
	//console.log(interface_configuration);
	$.ajax({
		type: 'POST',
		url:'setSlotConfiguration',
		contentType: "application/json",
		data: JSON.stringify(interface_configuration)
	});
	sleep(250);
}
function sleep(ms) {
	  return new Promise(resolve => setTimeout(resolve, ms));
	}
