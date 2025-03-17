package com.medilink.shared_medical_platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.medilink.shared_medical_platform.repository")
@EntityScan(basePackages = "com.medilink.shared_medical_platform.model")

public class SharedMedicalPlatformApplication {

	public static void main(String[] args) {
		SpringApplication.run(SharedMedicalPlatformApplication.class, args);
	}

}
