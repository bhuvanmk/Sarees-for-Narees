package com.sareesfornaaris.auth.dto;

import java.math.BigDecimal;

public class ProductSummary {
    private Integer productId;
    private String name;
    private BigDecimal price;
    private String category;
    private String subcategory;
    private String imageUrl;
    private boolean inStock;

    public ProductSummary() {}

    public ProductSummary(Integer productId, String name, BigDecimal price, String category, String subcategory, String imageUrl, boolean inStock) {
        this.productId = productId;
        this.name = name;
        this.price = price;
        this.category = category;
        this.subcategory = subcategory;
        this.imageUrl = imageUrl;
        this.inStock = inStock;
    }

    public Integer getProductId() {
        return productId;
    }

    public void setProductId(Integer productId) {
        this.productId = productId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getSubcategory() {
        return subcategory;
    }

    public void setSubcategory(String subcategory) {
        this.subcategory = subcategory;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public boolean isInStock() {
        return inStock;
    }

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }
}
