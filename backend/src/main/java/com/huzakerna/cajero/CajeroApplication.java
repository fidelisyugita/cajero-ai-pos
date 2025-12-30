package com.huzakerna.cajero;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class CajeroApplication {

	public static void main(String[] args) {
		SpringApplication.run(CajeroApplication.class, args);
	}

}
