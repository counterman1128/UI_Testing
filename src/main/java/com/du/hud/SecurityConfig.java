package com.du.hud;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter{
	private Logger logger = LoggerFactory.getLogger(SecurityConfig.class);
	public boolean clientInfo(HttpServletRequest request) {
		//logger.info("Client IP      -> "+request.getRemoteAddr());
		//logger.info("Client Request -> "+request.getRequestURI());
		//logger.info("Type           -> "+request.getContentType());
		//logger.info("Length         -> "+request.getContentLength());
		return true;
	}
	
	@Override
	public void configure(HttpSecurity http) throws Exception{
		http
		.csrf().disable()
		.authorizeRequests()
		.antMatchers("/**").access("@securityConfig.clientInfo(request) and permitAll()")
		.anyRequest().anonymous();
	}
}
