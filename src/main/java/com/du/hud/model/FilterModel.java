package com.du.hud.model;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonRootName;
import com.fasterxml.jackson.annotation.JsonSetter;

@JsonRootName(value = "filter")
public class FilterModel {
	private String name;
	private String given_name;
	private int arg_count;
	private List<String> arguments = new ArrayList<String>();
	private String luaCode;
	
	private FilterModel() {};
	public FilterModel(String name,String given_name, int num, List<String> args, String luaCode) {
		this.setName(name);
		this.setGivenName(given_name);
		this.setArgCount(num);
		this.setArguments(args);
		this.setLuaCode(luaCode);
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
	
	@JsonGetter("args")
	public List<String> getArguments() {
		return arguments;
	}
	@JsonSetter("args")
	public void setArguments(List<String> arguments) {
		this.arguments = arguments;
	}
	
	@JsonGetter("lua")public String getLuaCode() {
		return luaCode;
	}
	@JsonSetter("lua") public void setLuaCode(String luaCode) {
		this.luaCode = luaCode;
	}
	@JsonIgnore public int getArgsCount() {
		return arguments.size();
	}
	@JsonGetter("arg_count") public int getArgCount() {
		return arg_count;
	}
	@JsonSetter("arg_count") public void setArgCount(int num_of_args) {
		this.arg_count = num_of_args;
	}
}
