package handler

import (
	"net/http"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type planRequest struct {
	Name             string `json:"name"`
	BodyType         string `json:"body_type"`
	MonthlyRentCents int64  `json:"monthly_rent_cents"`
	DepositCents     int64  `json:"deposit_cents"`
	MinTermMonths    int    `json:"min_term_months"`
	Status           string `json:"status"`
}

func (h *Handler) CreatePlan(c *gin.Context) {
	var req planRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "价格方案信息不合法")
		return
	}
	if req.Status == "" {
		req.Status = "active"
	}
	p := models.PricingPlan{
		Name: req.Name, BodyType: req.BodyType, MonthlyRentCents: req.MonthlyRentCents,
		DepositCents: req.DepositCents, MinTermMonths: req.MinTermMonths, Status: req.Status,
	}
	if err := h.DB.Create(&p).Error; err != nil {
		fail(c, http.StatusInternalServerError, "create_failed", "价格方案创建失败")
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": p})
}

func (h *Handler) UpdatePlan(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var p models.PricingPlan
	if err := h.DB.First(&p, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "价格方案不存在")
		return
	}
	var req planRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "价格方案信息不合法")
		return
	}
	if err := h.DB.Model(&p).Updates(map[string]any{
		"name": req.Name, "body_type": req.BodyType, "monthly_rent_cents": req.MonthlyRentCents,
		"deposit_cents": req.DepositCents, "min_term_months": req.MinTermMonths, "status": req.Status,
	}).Error; err != nil {
		fail(c, http.StatusInternalServerError, "update_failed", "价格方案更新失败")
		return
	}
	h.DB.First(&p, id)
	ok(c, p)
}
