package org.medilink.paymentservice.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import jakarta.annotation.PostConstruct;
import org.json.JSONObject;
import org.medilink.paymentservice.dto.PaymentRequest;
import org.medilink.paymentservice.dto.PaymentResponse;
import org.medilink.paymentservice.dto.PaymentVerificationRequest;
import org.medilink.paymentservice.kafka.KafkaProducer;
import org.medilink.paymentservice.model.Payment;
import org.medilink.paymentservice.model.PaymentStatus;
import org.medilink.paymentservice.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SignatureException;
import java.time.LocalDate;
import java.util.Formatter;
import java.util.Optional;

@Service
public class RazorpayService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(RazorpayService.class);

    @Value("${razorpay.api.key}")
    private String apiKey;

    @Value("${razorpay.api.secret}")
    private String apiSecret;

    @Value("${razorpay.webhook.secret}")
    private String webhookSecret;

    private final PaymentRepository paymentRepository;
    private RazorpayClient razorpayClient;
    private final KafkaProducer kafkaProducer;

    @Autowired
    public RazorpayService(PaymentRepository paymentRepository, KafkaProducer kafkaProducer){
        this.paymentRepository = paymentRepository;
        this.kafkaProducer = kafkaProducer;
    }

    @PostConstruct
    public void init() throws RazorpayException {
        this.razorpayClient = new RazorpayClient(apiKey, apiSecret);
    }

    @Transactional
    public PaymentResponse createPayment(PaymentRequest request){
       try{
           logger.info("Creating payment for booking {}", request.getBookingId());
           return paymentRepository.findByOrderId(request.getBookingId())
                   .map(this::buildPaymentResponse)
                   .orElseGet(()-> createNewPayment(request));
       } catch(Exception e){
           logger.error("Error creating payment: {}", e.getMessage());
           Payment payment = new Payment();
           payment.setOrderId(request.getBookingId());
           payment.setAmount(request.getAmount());
           payment.setLastUpdated(LocalDate.now());
           payment.setStatus(PaymentStatus.REJECTED);
           kafkaProducer.sendPaymentEvent(payment);
           throw new RuntimeException("Failed to create payment", e);
       }
    }

    private PaymentResponse createNewPayment(PaymentRequest request){
        try{
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", request.getAmount()*100); //RazorPay expects in paise.
            orderRequest.put("currency", request.getCurrency());
            orderRequest.put("receipt", request.getBookingId());

            Order order = razorpayClient.orders.create(orderRequest);
            logger.info("Created RazorPay order: {}", order);

            Payment payment = new Payment();
            payment.setOrderId(request.getBookingId());
            payment.setRazorpayOrderId(order.get("id"));
            payment.setAmount(request.getAmount());
            payment.setCurrency(request.getCurrency());
            payment.setStatus(PaymentStatus.CREATED);
            paymentRepository.save(payment);
            return buildPaymentResponse(payment);
        } catch(RazorpayException e){
            logger.error("Error creating RazorPay order: {}", e.getMessage());
            throw new RuntimeException("Failed to create payment", e);
        }
    }

    public PaymentResponse buildPaymentResponse(Payment payment){
        return PaymentResponse.builder()
                .razorpayOrderId(payment.getRazorpayOrderId())
                .paymentUrl(buildCheckoutUrl(payment))
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .razorpayKey(apiKey)
                .build();
    }

    private String buildCheckoutUrl(Payment payment){
        return String.format("https://checkout.razorpay.com/v1/checkout.js?key=%s&order_id=%s",apiKey,payment.getRazorpayOrderId());
    }

    public void handleWebhook(String payload, String signature){
        try {
            String expectedSignature = generateSignature(payload, webhookSecret);
            if (!expectedSignature.equals(signature)) {
                logger.warn("Invalid webhook signature: {}", signature);
                throw new SignatureException("Invalid webhook signature");
            }

            JSONObject paymentResponse = new JSONObject(payload);
            String event = paymentResponse.getString("event");
            JSONObject paymentEntity = paymentResponse.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");

            String razorpayOrderId = paymentEntity.getString("order_id");
            Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElseThrow(() -> new RuntimeException("Payment not found"));
            handlePaymentEvent(event, paymentEntity, payment);
        } catch(Exception e){
            logger.error("Error handling webhook: {}", e.getMessage());
            throw new RuntimeException("Failed to handle webhook", e);
        }
    }

    private void handlePaymentEvent(String event, JSONObject paymentEntity, Payment payment) {
        switch(event){
            case "payout.processed":
                logger.info("Payment processed: {}", event);
                updatePaymentStatus(payment,PaymentStatus.PROCESSED,paymentEntity);
                break;
            case "payout.rejected":
                logger.info("Payment rejected: {}", event);
                updatePaymentStatus(payment,PaymentStatus.REJECTED,paymentEntity);
                break;
            case "payout.initiated":
                logger.info("Payment initiated: {}", event);
                updatePaymentStatus(payment,PaymentStatus.INITIATED,paymentEntity);
                break;
            default:
                logger.warn("Unhandled payment event: {}", event);
        }
    }

    public void updatePaymentStatus(Payment payment,PaymentStatus status, JSONObject paymentEntity){
        payment.setStatus(status);
        payment.setRazorpayPaymentId(paymentEntity.getString("id"));
        payment.setLastUpdated(LocalDate.now());
        paymentRepository.save(payment);
        logger.info("Payment status updated: {}", payment);
        kafkaProducer.sendPaymentEvent(payment);
    }

    @Transactional
    public boolean verifyPayment(PaymentVerificationRequest request) throws SignatureException {
        String data = request.getOrderId() + "|" + request.getPaymentId();
        String generatedSignature = generateSignature(data, apiSecret);

        logger.info("Payment verification request: {}", request);
        logger.info("Verifying payment signature: {} | {}", request.getSignature(), generatedSignature);

        if(generatedSignature.equals(request.getSignature())){
            Payment payment = paymentRepository.findByRazorpayOrderId(request.getOrderId()).orElseThrow(() -> new RuntimeException("Payment not found"));

            payment.setRazorpayPaymentId(request.getPaymentId());
            payment.setStatus(PaymentStatus.PROCESSED);
            payment.setLastUpdated(LocalDate.now());
            paymentRepository.save(payment);
            kafkaProducer.sendPaymentEvent(payment);

            logger.info("Payment verified: {}", payment);
            return true;
        }
        logger.warn("Invalid payment signature: {}", request.getSignature());
        return false;
    }

    public Optional<Payment> getPaymentByOrderId(String orderId){
        return paymentRepository.findByOrderId(orderId);
    }

    private String generateSignature(String data, String secret) throws SignatureException {
        try{
            Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
            SecretKeySpec secret_key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            sha256_HMAC.init(secret_key);
            return bytesToHex(sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e){
            logger.error("Failed to generate signature: {}", e.getMessage());
            throw new SignatureException("Failed to generate signature", e);
        }
    }

    private String bytesToHex(byte[] bytes){
        Formatter formatter = new Formatter();
        for(byte b : bytes){
            formatter.format("%02x", b);
        }
        return formatter.toString();
    }
}
