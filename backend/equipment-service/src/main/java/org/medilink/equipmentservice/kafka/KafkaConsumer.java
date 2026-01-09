package org.medilink.equipmentservice.kafka;

import org.medilink.equipmentservice.service.EquipmentService;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import equipment.events.BookingStatusEvent;
import com.google.protobuf.GeneratedMessageV3;

@Service
public class KafkaConsumer {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(KafkaConsumer.class);

    private final EquipmentService equipmentService;

    public KafkaConsumer(EquipmentService equipmentService){
        this.equipmentService = equipmentService;
    }

    @KafkaListener(topics = "booking-status", groupId = "equipment-service")
    public void consumeEvent(byte[] event){
        try{
            BookingStatusEvent bookingEvent = BookingStatusEvent.parseFrom(event);
            logger.info("Received booking event: {}", bookingEvent);
            equipmentService.updateEquipmentAvailability(bookingEvent);
        } catch (Exception e) {
            logger.error("Error parsing booking event", e);
        }
    }

}
