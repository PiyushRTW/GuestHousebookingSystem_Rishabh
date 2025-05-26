package com.Application.GuestHouseBooking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GuestHouseBookingApplication {

	public static void main(String[] args) {
		SpringApplication.run(GuestHouseBookingApplication.class, args);
	}

}
