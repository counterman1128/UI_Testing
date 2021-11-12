package com.du.hud.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.du.hud.model.FilterModel;
import com.du.hud.model.SlotModel;

@Service
public class LuaInterfaceContainer {
	
	private SlotModel library;
	private SlotModel system;
	private SlotModel unit;
	
	public Map<String,SlotModel> slots;
	
	public LuaInterfaceContainer() {
		slots = new HashMap<String,SlotModel>();
		library = new SlotModel(
				"library",
				null,
				ElementType.Library,
				true);
		
		system = new SlotModel(
				"system",
				null,
				ElementType.System,
				true);
		
		unit = new SlotModel(
				"unit",
				null,
				ElementType.Unit,
				true);
		
		slots.put("library", library);
		slots.put("system", system);
		slots.put("unit", unit);
		
		for(int i = 1; i<=10; i++) {
			SlotModel s = new SlotModel(
					"slot"+Integer.toString(i),
					null,
					ElementType.Empty,
					false);
			slots.put("slot"+Integer.toString(i), s);
		}
	}
	
	public List<FilterModel> getFilters(ElementType type) {
		List<String> args = new ArrayList<String>();
		List<FilterModel> filters = new ArrayList<FilterModel>();
		switch(type) {
		case Library: 
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"start",0,args,""));
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"stop",0,args,""));
			break;
		case Unit:
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"start",0,args,""));
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"stop",0,args,""));
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"tick",0,args,""));
			break;
		case System:
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"start",0,args,""));
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"stop",0,args,""));
			args = new ArrayList<String>();
			args.add("arg1");
			filters.add(new FilterModel(null,"actionStart",0,args,""));
			args = new ArrayList<String>();
			args.add("arg1");
			filters.add(new FilterModel(null,"actionStop",0,args,""));
			args = new ArrayList<String>();
			args.add("arg1");
			filters.add(new FilterModel(null,"actionLoop",0,args,""));
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"update",0,args,""));
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"flush",0,args,""));
			break;
		case ScreenUnit:
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"start",0,args,""));
			
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"stop",0,args,""));
			
			break;
		default:
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"start",0,args,""));
			args = new ArrayList<String>();
			filters.add(new FilterModel(null,"stop",0,args,""));
			break;
		}
		return filters;
	}
	
}
