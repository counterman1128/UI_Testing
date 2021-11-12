package com.du.hud.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;

@CrossOrigin
@Controller
public class WebController {
	@RequestMapping("/")
	public String index() {
		return "index";
	}
}