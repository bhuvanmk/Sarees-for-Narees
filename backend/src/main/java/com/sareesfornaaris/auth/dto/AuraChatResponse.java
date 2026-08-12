package com.sareesfornaaris.auth.dto;

import java.math.BigDecimal;
import java.util.List;

public class AuraChatResponse {
    private String reply;
    private List<ProductSummary> suggestedProducts;
    private boolean requiresLogin;
    private boolean showOrdersButton;

    public AuraChatResponse() {}

    public AuraChatResponse(String reply, List<ProductSummary> suggestedProducts, boolean requiresLogin) {
        this(reply, suggestedProducts, requiresLogin, false);
    }

    public AuraChatResponse(String reply, List<ProductSummary> suggestedProducts, boolean requiresLogin, boolean showOrdersButton) {
        this.reply = reply;
        this.suggestedProducts = suggestedProducts;
        this.requiresLogin = requiresLogin;
        this.showOrdersButton = showOrdersButton;
    }


    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public List<ProductSummary> getSuggestedProducts() {
        return suggestedProducts;
    }

    public void setSuggestedProducts(List<ProductSummary> suggestedProducts) {
        this.suggestedProducts = suggestedProducts;
    }

    public boolean isRequiresLogin() {
        return requiresLogin;
    }

    public void setRequiresLogin(boolean requiresLogin) {
        this.requiresLogin = requiresLogin;
    }

    public boolean isShowOrdersButton() {
        return showOrdersButton;
    }

    public void setShowOrdersButton(boolean showOrdersButton) {
        this.showOrdersButton = showOrdersButton;
    }
}

