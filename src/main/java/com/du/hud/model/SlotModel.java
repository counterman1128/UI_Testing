package com.du.hud.model;

import java.util.ArrayList;
import java.util.List;

import com.du.hud.service.ElementType;
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonRootName;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

@JsonRootName(value = "slotModel")
public class SlotModel {
	private String name;
	private String given_name;
	private ElementType type;
	private boolean status;
	private List<FilterModel> filters = new ArrayList<FilterModel>();
	
	public SlotModel() {};
	public SlotModel(String name,String given_name, ElementType type, 
			boolean status) {
		this.setName(name);
		this.given_name = given_name;
		this.setType(type);
		this.setStatus(status);
		
		List<String> args = new ArrayList<String>();
		
	}

	@JsonGetter("status") public boolean getStatus() {
		return status;
	}

	@JsonSetter("status") public void setStatus(boolean status) {
		this.status = status;
	}

	@JsonGetter("name") public String getName() {
		return name;
	}

	@JsonSetter("name") public void setName(String name) {
		this.name = name;
	}
	
	@JsonGetter("given_name") public String getGivenName() {
		return given_name;
	}

	@JsonSetter("given_name") public void setGivenName(String name) {
		this.given_name = name;
	}

	@JsonGetter("filters") 
	//@JsonDeserialize(contentAs = FilterModel.class, as = ArrayList.class)
	public List<FilterModel> getFilters() {
		return filters;
	}

	@JsonSetter("filters") 
	//@JsonDeserialize(contentAs = FilterModel.class, as = ArrayList.class)
	public void setFilters(List<FilterModel> filters) {
		this.filters = filters;
	}
	public ElementType getType() {
		return type;
	}
	public void setType(ElementType type) {
		this.type = type;
	}
}
