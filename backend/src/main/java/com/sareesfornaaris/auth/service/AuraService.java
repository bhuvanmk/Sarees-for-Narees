package com.sareesfornaaris.auth.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sareesfornaaris.auth.dto.AuraChatRequest;
import com.sareesfornaaris.auth.dto.AuraChatResponse;
import com.sareesfornaaris.auth.dto.ProductSummary;

import com.sareesfornaaris.auth.entity.Order;
import com.sareesfornaaris.auth.entity.Product;
import com.sareesfornaaris.auth.entity.User;
import com.sareesfornaaris.auth.repository.OrderRepository;
import com.sareesfornaaris.auth.repository.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AuraService {

    private static final Logger logger = LoggerFactory.getLogger(AuraService.class);

    @Value("${app.huggingface.apiKey}")
    private String apiKey;

    @Value("${app.huggingface.modelId:mistralai/Mistral-7B-Instruct-v0.3}")
    private String modelId;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT =
            "You are Aura, the friendly AI shopping assistant for Sarees For Naris, a handloom saree e-commerce brand. " +
            "Help customers find sarees, answer questions about fabric types (Banarasi, Kanjivaram, Chanderi, Paithani, cotton, silk, etc.), " +
            "occasions (wedding, party, casual, traditional), and general saree care. Be warm, concise, and helpful. " +
            "If asked about specific products, only reference products provided in the context below — never invent product names, prices, or stock availability. " +
            "If you don't have information to answer something, say so honestly and suggest the customer browse the site or contact support, rather than guessing.";

    public AuraChatResponse processChat(AuraChatRequest request, User authenticatedUser) {
        String userMsg = request.getMessage() != null ? request.getMessage().trim() : "";
        String lowerMsg = userMsg.toLowerCase();

        // 1. Direct answer for "how to order / how to buy"
        if (isHowToOrderQuery(lowerMsg)) {
            return new AuraChatResponse(
                    "To place an order on Sarees For Naris:\n\n" +
                    "1. 🛍️ **Browse Sarees**: Find your favorite saree by category, fabric, or price.\n" +
                    "2. 🛒 **Add to Bag**: Click 'Add to Bag' or 'Buy Now' on the product page.\n" +
                    "3. 📝 **Checkout**: Go to your Shopping Cart, click Checkout, and enter your delivery address.\n" +
                    "4. 💳 **Payment**: Select your payment method (Razorpay, UPI, Credit/Debit Card, NetBanking) and confirm!\n\n" +
                    "If you need saree recommendations, ask me for Banarasi, Kanjivaram, or Silk sarees!",
                    Collections.emptyList(),
                    false,
                    false
            );
        }

        boolean isOrderQuery = isOrderTrackingQuery(lowerMsg);
        boolean isProductQuery = isProductQuery(lowerMsg);
        boolean requiresLogin = false;
        boolean showOrdersButton = false;

        StringBuilder contextBuilder = new StringBuilder();

        // Include current page context if provided
        if (request.getPageContext() != null && !request.getPageContext().isBlank()) {
            contextBuilder.append("Current Page Context: ").append(request.getPageContext()).append("\n\n");
        }

        List<ProductSummary> suggestedProducts = new ArrayList<>();


        // Order tracking retrieval logic
        if (isOrderQuery) {
            if (authenticatedUser == null) {
                return new AuraChatResponse(
                        "To check your order status, please log in to your account! Once logged in, I'd be happy to track your recent purchases and delivery updates.",
                        Collections.emptyList(),
                        true,
                        false
                );
            } else {
                List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(authenticatedUser);
                showOrdersButton = true;
                if (orders.isEmpty()) {
                    return new AuraChatResponse(
                            "You don't have any placed orders yet! Browse our saree collection and place your first order.",
                            Collections.emptyList(),
                            false,
                            true
                    );
                } else {
                    StringBuilder sb = new StringBuilder("Here is your recent order status:\n\n");
                    int count = 0;
                    for (Order order : orders) {
                        if (count++ >= 3) break;
                        sb.append("📦 **Order #").append(order.getOrderId()).append("**\n")
                          .append("• **Status**: ").append(order.getStatus()).append("\n")
                          .append("• **Total Amount**: ₹").append(order.getTotalAmount()).append("\n")
                          .append("• **Date**: ").append(order.getCreatedAt() != null ? order.getCreatedAt().toLocalDate().toString() : "Recent").append("\n\n");
                    }
                    sb.append("Click the button below to view full details on your My Orders page!");
                    return new AuraChatResponse(sb.toString(), Collections.emptyList(), false, true);
                }
            }
        }


        // Product RAG retrieval logic
        if (isProductQuery || lowerMsg.contains("recommend") || lowerMsg.contains("show") || lowerMsg.contains("saree")) {
            List<Product> matchedProducts = fetchRelevantProducts(userMsg);
            if (!matchedProducts.isEmpty()) {
                contextBuilder.append("Available Catalog Products matching query:\n");
                for (Product p : matchedProducts) {
                    String categoryName = p.getCategory() != null ? p.getCategory().getCategoryName() : "Saree";
                    String subcategoryName = p.getSubcategory() != null ? p.getSubcategory().getSubcategoryName() : "";
                    String imgUrl = (p.getImages() != null && !p.getImages().isEmpty()) ? p.getImages().get(0).getImageUrl() : "";
                    boolean inStock = p.getStock() != null && p.getStock() > 0;

                    contextBuilder.append("- Product ID ").append(p.getProductId())
                            .append(": ").append(p.getName())
                            .append(" (₹").append(p.getPrice()).append(", Category: ").append(categoryName)
                            .append(", Stock: ").append(inStock ? "In Stock (" + p.getStock() + ")" : "Out of Stock").append(")")
                            .append(" - ").append(p.getDescription() != null ? shorten(p.getDescription(), 80) : "")
                            .append("\n");

                    suggestedProducts.add(new ProductSummary(

                            p.getProductId(),
                            p.getName(),
                            p.getPrice(),
                            categoryName,
                            subcategoryName,
                            imgUrl,
                            inStock
                    ));
                }
                contextBuilder.append("\n");
            }
        }

        // Call Hugging Face API
        String reply = callHuggingFaceAPI(userMsg, contextBuilder.toString(), request.getHistory());

        // Fallback if HF failed or returned empty
        if (reply == null || reply.isBlank()) {
            reply = generateFallbackReply(userMsg, suggestedProducts, isOrderQuery, authenticatedUser);
        }

        return new AuraChatResponse(reply, suggestedProducts, requiresLogin, showOrdersButton);
    }

    private boolean isHowToOrderQuery(String msg) {
        return msg.contains("how order") || msg.contains("how to order") ||
               msg.contains("how to buy") || msg.contains("how do i order") ||
               msg.contains("how do i buy") || msg.contains("how can i order") ||
               msg.contains("how to purchase") || msg.contains("steps to order") ||
               msg.contains("how to place");
    }

    private boolean isOrderTrackingQuery(String msg) {
        return msg.contains("where is my order") || msg.contains("track my order") ||
               msg.contains("order status") || msg.contains("status of my order") ||
               msg.contains("where is my package") || msg.contains("delivery status") ||
               msg.contains("my order") || msg.contains("track order") ||
               msg.contains("order details");
    }

    private boolean isProductQuery(String msg) {
        return msg.contains("saree") || msg.contains("banarasi") || msg.contains("kanjivaram") ||
               msg.contains("chanderi") || msg.contains("paithani") || msg.contains("silk") ||
               msg.contains("cotton") || msg.contains("wedding") || msg.contains("party") ||
               msg.contains("under") || msg.contains("below") || msg.contains("buy") ||
               msg.contains("price") || msg.contains("cost") || msg.contains("casual") ||
               msg.contains("heavy") || msg.contains("georgette") || msg.contains("organza");
    }

    private List<Product> fetchRelevantProducts(String userMsg) {
        String lower = userMsg.toLowerCase();
        BigDecimal maxPrice = null;

        // Simple price extraction (e.g. "under 5000" or "below 3000")
        Pattern pattern = Pattern.compile("(under|below|<|rs|₹)\\s*(\\d{3,6})");
        Matcher matcher = pattern.matcher(lower);
        if (matcher.find()) {
            try {
                maxPrice = new BigDecimal(matcher.group(2));
            } catch (Exception ignored) {}
        }

        // Keywords search
        String searchTerm = null;
        String[] keywords = {"banarasi", "kanjivaram", "chanderi", "paithani", "silk", "cotton", "georgette", "organza", "linen", "tussar", "wedding", "party", "designer"};
        for (String kw : keywords) {
            if (lower.contains(kw)) {
                searchTerm = kw;
                break;
            }
        }

        List<Product> products = productRepository.filterProducts(null, null, searchTerm, null, maxPrice, true);

        if (products.isEmpty()) {
            // Fallback to recent active products
            products = productRepository.findAllByOrderByCreatedAtDesc();
        }

        return products.stream().limit(5).collect(Collectors.toList());
    }

    private String callHuggingFaceAPI(String userMsg, String retrievedContext, List<AuraChatRequest.ChatMessage> history) {
        try {
            // Format full prompt using Instruct style format
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("<s>[INST] <<SYS>>\n").append(SYSTEM_PROMPT).append("\n<</SYS>>\n\n");

            if (!retrievedContext.isBlank()) {
                promptBuilder.append("Context Data:\n").append(retrievedContext).append("\n");
            }

            if (history != null && !history.isEmpty()) {
                promptBuilder.append("Recent Conversation History:\n");
                int start = Math.max(0, history.size() - 4);
                for (int i = start; i < history.size(); i++) {
                    AuraChatRequest.ChatMessage msg = history.get(i);
                    promptBuilder.append(msg.getRole().equalsIgnoreCase("user") ? "User: " : "Aura: ")
                            .append(msg.getContent()).append("\n");
                }
                promptBuilder.append("\n");
            }

            promptBuilder.append("User Question: ").append(userMsg).append(" [/INST]");

            String fullPrompt = promptBuilder.toString();

            // Try standard HF Inference API URL
            String url = "https://api-inference.huggingface.co/models/" + modelId;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey.trim());

            Map<String, Object> parameters = new HashMap<>();
            parameters.put("max_new_tokens", 300);
            parameters.put("temperature", 0.7);
            parameters.put("return_full_text", false);

            Map<String, Object> body = new HashMap<>();
            body.put("inputs", fullPrompt);
            body.put("parameters", parameters);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            logger.info("Calling Hugging Face API for model {}", modelId);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode jsonNode = objectMapper.readTree(response.getBody());
                if (jsonNode.isArray() && jsonNode.size() > 0) {
                    JsonNode first = jsonNode.get(0);
                    if (first.has("generated_text")) {
                        String generated = first.get("generated_text").asText().trim();
                        // Strip residual INST tags if model repeated them
                        if (generated.contains("[/INST]")) {
                            generated = generated.substring(generated.lastIndexOf("[/INST]") + 7).trim();
                        }
                        return generated;
                    }
                } else if (jsonNode.has("generated_text")) {
                    return jsonNode.get("generated_text").asText().trim();
                }
            }
        } catch (Exception e) {
            logger.warn("Hugging Face API call encountered error/timeout: {}", e.getMessage());
        }

        return null;
    }

    private String generateFallbackReply(String userMsg, List<ProductSummary> products, boolean isOrderQuery, User authenticatedUser) {

        String lower = userMsg.toLowerCase();

        if (isOrderQuery && authenticatedUser != null) {
            List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(authenticatedUser);
            if (orders.isEmpty()) {
                return "You don't have any placed orders yet! Browse our saree collection and place your first order.";
            }
            StringBuilder sb = new StringBuilder("Here is the status of your recent order(s):\n\n");
            int count = 0;
            for (Order order : orders) {
                if (count++ >= 3) break;
                sb.append("📦 **Order #").append(order.getOrderId()).append("**\n")
                  .append("• **Status**: ").append(order.getStatus()).append("\n")
                  .append("• **Total**: ₹").append(order.getTotalAmount()).append("\n")
                  .append("• **Date**: ").append(order.getCreatedAt() != null ? order.getCreatedAt().toLocalDate().toString() : "Recent").append("\n\n");
            }
            return sb.toString();
        }

        if (!products.isEmpty()) {
            return "Here are some of our finest handloom sarees matching your query! Browse through the recommendations below or tell me if you are looking for a specific fabric like Banarasi, Kanjivaram, or Cotton.";
        }

        if (lower.contains("banarasi")) {
            return "Banarasi sarees are known for their rich gold and silver zari work and fine silk. They are perfect for weddings and festive grand celebrations! For best care, dry clean only and store wrapped in a muslin cloth.";
        } else if (lower.contains("kanjivaram")) {
            return "Kanjivaram sarees from Tamil Nadu feature heavy silk with vibrant contrasting borders. Ideal for traditional ceremonies and grand events! Always dry clean to maintain lustre.";
        } else if (lower.contains("care") || lower.contains("wash") || lower.contains("clean")) {
            return "To preserve handloom sarees: 1. Dry clean pure silk & zari sarees. 2. Hand wash cottons in cold water with mild detergent. 3. Avoid direct sunlight when drying and store wrapped in soft cotton fabric.";
        }

        return "Welcome to Sarees For Naris! I am Aura, your personal saree shopping assistant. You can ask me to find Banarasi or Silk sarees, check order status, or suggest care instructions. How can I help you today?";
    }

    private String shorten(String text, int maxLength) {
        if (text == null || text.length() <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    }
}

