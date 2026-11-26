package handler

import (
	"net/http"
	"strings"

	"cheyi/backend/internal/auth"
	"cheyi/backend/internal/models"
	"cheyi/backend/internal/phone"
	"github.com/gin-gonic/gin"
)

type profileRequest struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
}

func (h *Handler) UpdateProfile(c *gin.Context) {
	var req profileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "账号信息不合法")
		return
	}
	var user models.User
	if err := h.DB.First(&user, currentUserID(c)).Error; err != nil {
		fail(c, http.StatusUnauthorized, "unauthorized", "登录已失效")
		return
	}
	if strings.TrimSpace(req.Name) == "" {
		fail(c, http.StatusBadRequest, "invalid_input", "姓名不能为空")
		return
	}
	normalizedPhone := phone.Normalize(req.Phone)
	validPhone := phone.Valid(normalizedPhone)
	if user.Role == "admin" {
		validPhone = phone.ValidShape(normalizedPhone)
	}
	if !validPhone {
		fail(c, http.StatusBadRequest, "invalid_phone", "请输入有效的手机号")
		return
	}
	var duplicate int64
	if err := h.DB.Model(&models.User{}).Where("id <> ? AND replace(replace(phone, ' ', ''), '-', '') = ?", user.ID, normalizedPhone).Count(&duplicate).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "账号信息保存失败")
		return
	}
	if duplicate > 0 {
		fail(c, http.StatusConflict, "phone_exists", "该手机号已被使用")
		return
	}
	if err := h.DB.Model(&user).Updates(map[string]any{
		"name": req.Name, "phone": normalizedPhone,
	}).Error; err != nil {
		fail(c, http.StatusConflict, "update_failed", "手机号已被占用")
		return
	}
	h.DB.First(&user, user.ID)
	ok(c, user)
}

type passwordRequest struct {
	CurrentPassword string `json:"current_password"`
	NewPassword     string `json:"new_password"`
}

func (h *Handler) UpdatePassword(c *gin.Context) {
	var req passwordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "密码信息不合法")
		return
	}
	if len(req.NewPassword) < 8 {
		fail(c, http.StatusBadRequest, "weak_password", "新密码至少 8 位")
		return
	}
	var user models.User
	if err := h.DB.First(&user, currentUserID(c)).Error; err != nil {
		fail(c, http.StatusUnauthorized, "unauthorized", "登录已失效")
		return
	}
	if !auth.CheckPassword(user.PasswordHash, req.CurrentPassword) {
		fail(c, http.StatusBadRequest, "invalid_password", "当前密码不正确")
		return
	}
	hash, err := auth.HashPassword(req.NewPassword)
	if err != nil {
		fail(c, http.StatusInternalServerError, "hash_failed", "密码更新失败")
		return
	}
	if err := h.DB.Model(&user).Update("password_hash", hash).Error; err != nil {
		fail(c, http.StatusInternalServerError, "update_failed", "密码更新失败")
		return
	}
	ok(c, gin.H{"ok": true})
}
