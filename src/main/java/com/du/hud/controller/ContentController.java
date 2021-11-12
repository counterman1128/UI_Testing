package com.du.hud.controller;

import java.io.IOException;
import java.io.PipedInputStream;
import java.io.PipedOutputStream;
import java.util.ArrayList;
import java.util.List;

import org.classdump.luna.StateContext;
import org.classdump.luna.Table;
import org.classdump.luna.Variable;
import org.classdump.luna.compiler.CompilerChunkLoader;
import org.classdump.luna.env.RuntimeEnvironment;
import org.classdump.luna.env.RuntimeEnvironments;
import org.classdump.luna.exec.CallException;
import org.classdump.luna.exec.CallPausedException;
import org.classdump.luna.exec.DirectCallExecutor;
import org.classdump.luna.impl.StateContexts;
import org.classdump.luna.lib.BasicLib;
import org.classdump.luna.lib.CoroutineLib;
import org.classdump.luna.lib.MathLib;
import org.classdump.luna.lib.ModuleLib;
import org.classdump.luna.lib.StringLib;
import org.classdump.luna.lib.TableLib;
import org.classdump.luna.lib.Utf8Lib;
import org.classdump.luna.load.ChunkLoader;
import org.classdump.luna.load.LoaderException;
import org.classdump.luna.runtime.LuaFunction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.support.GenericMessage;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import com.du.hud.model.FilterModel;
import com.du.hud.model.SlotModel;
import com.du.hud.service.ElementType;
import com.du.hud.service.LuaInterfaceContainer;
import com.du.hud.service.UIModel;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@CrossOrigin
public class ContentController {
	
	PipedOutputStream out = new PipedOutputStream();
	PipedOutputStream err = new PipedOutputStream();
	PipedInputStream in = new PipedInputStream();
	DirectCallExecutor exe;
	
	@Autowired
	private SimpMessageSendingOperations msg;
	
	
	@Autowired
	private UIModel ui;
	
	@Autowired
	private LuaInterfaceContainer du_interface;
	
	@PostMapping(path= "/setHTML", consumes = MediaType.TEXT_HTML_VALUE)
	public void setHTML(@RequestBody String html) {
		ui.htmlContent = html;
	}
	
	@GetMapping(path="/getHTML")
	public @ResponseBody String getHTML() {
		return ui.htmlContent;
	}
	
	@GetMapping(path="/getDefaultConfig")
	public LuaInterfaceContainer defaultConfig() {
		return du_interface;
	}
	
	@PostMapping(path="/loadConfig")
	public LuaInterfaceContainer loadConfig(LuaInterfaceContainer user_interface) {
		du_interface = user_interface;
		return du_interface;
	}
	
	@GetMapping(path="/getSupportedElementTypes")
	public List<String> getElementTypes(@RequestParam(required=false) String t){
		String st = "";
		try {
			st = t;
		}catch(Exception e) {
			st = "";
		}
		List<String> list = new ArrayList<String>();
		for(ElementType e: ElementType.values()) {
			if(e != ElementType.Library && e != ElementType.System && e != ElementType.Unit && e != ElementType.Empty && (!st.equals("full"))) {
				list.add(e.name());
			}else {
				list.add(e.name());
			}
		}
		return list;
	}
	
	@PostMapping(path="/toggleSlotActivation")
	public void toggleSlotActivation(@RequestParam String slot) {
		SlotModel sel_slot = du_interface.slots.get(slot);
		if(sel_slot.getStatus() == true) {
			sel_slot.setStatus(false);
		}else {
			sel_slot.setStatus(true);
		}
		
		if(sel_slot.getName() == "unit" || sel_slot.getName() == "system" || sel_slot.getName() == "library") {
			sel_slot.setStatus(true);
		}
		
		du_interface.slots.put(slot, sel_slot);
		byte[] str = (slot + "," + String.valueOf(sel_slot.getStatus())).getBytes();
		
		msg.send("/message/slot_status", 
				new GenericMessage<byte[]>(str));
	}
	
	@GetMapping(path="/getSlotStatuses")
	public List<Boolean> getSlotStatuses(){
		List<Boolean> slots = new ArrayList<Boolean>();
		slots.add(du_interface.slots.get("library").getStatus());
		slots.add(du_interface.slots.get("system").getStatus());
		slots.add(du_interface.slots.get("unit").getStatus());
		for(int i = 1; i<=10; i++) {
			slots.add(du_interface.slots.get("slot"+Integer.toString(i)).getStatus());
		}
		
		return slots;
	}
	
	@GetMapping(path="/getUniqueSlotStatus")
	public Boolean getUniqueSlotStatus(@RequestParam String slot) {
		return du_interface.slots.get(slot).getStatus();
	}
	
	@PostMapping(path="/testLua")
	public void executeLua(@RequestParam String code) throws LoaderException, CallException, CallPausedException, InterruptedException, MessagingException, IOException {
		try {
			//err.connect(in);
			out.connect(in);
		}catch(IOException e) {
			//do nothing
		}
		StateContext state = StateContexts.newDefaultInstance();
		ChunkLoader loader = CompilerChunkLoader.of("content_controller");
		//Table env = StandardLibrary.in(
		//		RuntimeEnvironments
		//		.system(in, out, luaOutput.err)).installInto(state);
		Table env = state.newTable();
		RuntimeEnvironment environment = RuntimeEnvironments
						.system(in,out,null);
		BasicLib.installInto(state, env, environment, loader);
	    ModuleLib.installInto(state, env, environment, loader, null);
	    CoroutineLib.installInto(state, env);
	    StringLib.installInto(state, env);
	    MathLib.installInto(state, env);
	    TableLib.installInto(state, env);
	   // IoLib.installInto(state, env, environment);
	   // OsLib.installInto(state, env, environment);
	    Utf8Lib.installInto(state, env);
	   
		//ChunkLoader loader = CompilerChunkLoader.of("content_controller");
		LuaFunction main = loader.loadTextChunk(new Variable(env), "content", code);
		
		exe = DirectCallExecutor.newExecutor();
		//exe.schedulingContextFactory().
		try {
			Object[] obj = exe.call(state, main);
			//exe.execute(, schedulingContext, true)
			int c;
			byte[] b = new byte[1024];
			if((c = in.read(b)) > 0) {
				msg.send("/message/sysout", 
					new GenericMessage<byte[]>(b));
					
			}
			for(Object o : obj) {
				System.out.println(o);
			}
		}catch(Exception e) {
			String error = e.getLocalizedMessage();
			int x = error.indexOf("content");
			error = "<div style=\"color: red;\">" + error.substring(x+8)+"</div>";
			msg.send("/message/sysout", 
					new GenericMessage<byte[]>(error.getBytes()));
		}
	}
	
	@GetMapping(path="/getSlotData")
	public String getSlotData(@RequestParam String slot) {
		SlotModel main_slot = du_interface.slots.get(slot);
		
		//ObjectMapper mapper = 
		
		String json = "";
		try {
			json = new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(main_slot);
			//System.out.print(json);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return json;
	}
	@GetMapping(path="/getSlotConfiguration")
	public String getSlotConfiguration() {
		List<SlotModel> slots = new ArrayList<SlotModel>();
		slots.add(du_interface.slots.get("library"));
		slots.add(du_interface.slots.get("system"));
		slots.add(du_interface.slots.get("unit"));
		for(int i = 1; i < 11; i++ ) {
			slots.add(du_interface.slots.get("slot"+i));
		}
		
		
		String json = "";
		try {
			json = new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(slots);
			//System.out.print(json);
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
		
		return json;
	}
	
	@PostMapping(path="/setSlotConfiguration")
	public void setSlotConfiguration(@RequestBody List<SlotModel> new_interface) {
		for(SlotModel slot : new_interface) {
			du_interface.slots.put(slot.getName(),slot);
		}
	}
	
	@GetMapping(path="/filterTypes")
	public String filterTypes(@RequestParam String slot){
		System.out.println(slot);
		SlotModel main_slot = du_interface.slots.get(slot);
		System.out.print(main_slot.getName());
		String elementType = main_slot.getType().name();
		if(ElementType.Empty == main_slot.getType()) {
			return null;
		}
		List<FilterModel> filterTypes = new ArrayList<FilterModel>();
		for(ElementType e : ElementType.values()) {
			if(e.name().equals(elementType)) {
				filterTypes = du_interface.getFilters(e);
				break;
			}
		}
		String json = "";
		try {
			json = new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(filterTypes);
		} catch (JsonProcessingException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		return json;
	}
	
	@PostMapping(path = "/setSlotType")
	public void setSlotType(@RequestParam String slot, @RequestParam String type) {
		SlotModel main_slot = du_interface.slots.get(slot);
		main_slot.setType(ElementType.valueOf(type));
		du_interface.slots.put(slot, main_slot);
	}
	
	@PostMapping(path = "/setSlotName")
	public void setSlotName(@RequestParam String slot, @RequestParam String name) {
		SlotModel main_slot = du_interface.slots.get(slot);
		main_slot.setGivenName(name);
		du_interface.slots.put(slot, main_slot);
	}
	
	@PostMapping(path = "/setSlotConfig")
	public void setSlotFilters(@RequestBody SlotModel slotModel) {
		for(ElementType e : ElementType.values()) {
			if(e.name().toLowerCase().equals(slotModel.getName().toLowerCase())) {
				slotModel.setType(e);
				break;
			}
		}
		du_interface.slots.put(slotModel.getName(), slotModel);
	}
	
	@GetMapping(path = "/getFilters")
	public String getFilters(@RequestParam String slot) {
		SlotModel main_slot = du_interface.slots.get(slot);
		
		try {
			return new ObjectMapper().writeValueAsString(main_slot.getFilters());
		} catch (JsonProcessingException e) {
			// TODO Auto-generated catch block
			//e.printStackTrace();
		}
		return null;
	}
	
	public void updateLua() {
		
	}
}
