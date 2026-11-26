package handler

import (
	"net/http"
	"strings"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type storeUpdateRequest struct {
	Name     string `json:"name"`
	District string `json:"district"`
	Address  string `json:"address"`
	Capacity int    `json:"capacity"`
	Status   string `json:"status"`
	Image    string `json:"image"`
}

func (h *Handler) UpdateStore(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var s models.Store
	if err := h.DB.First(&s, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "门店不存在")
		return
	}
	var req storeUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "门店信息不合法")
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		fail(c, http.StatusBadRequest, "invalid_input", "门店名称不能为空")
		return
	}
	if err := h.DB.Model(&s).Updates(map[string]any{
		"name": req.Name, "district": req.District, "address": req.Address,
		"capacity": req.Capacity, "status": req.Status, "image": req.Image,
	}).Error; err != nil {
		fail(c, http.StatusInternalServerError, "update_failed", "门店更新失败")
		return
	}
	h.DB.First(&s, id)
	ok(c, s)
}
