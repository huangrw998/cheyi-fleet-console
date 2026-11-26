package handler

import (
	"net/http"
	"strings"
	"time"

	"cheyi/backend/internal/auth"
	"cheyi/backend/internal/models"
	"cheyi/backend/internal/phone"
	"github.com/gin-gonic/gin"
)

type loginRequest struct {
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

type registerRequest struct {
	Name     string `json:"name" binding:"required"`
	Phone    string `json:"phone" binding:"required"`
	Password string `json:"password" binding:"required,min=8"`
}

func (h *Handler) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "请输入有效的手机号和密码")
		return
	}
	normalized := phone.Normalize(req.Phone)
	if !phone.ValidShape(normalized) {
		fail(c, http.StatusBadRequest, "invalid_phone", "请输入有效的手机号")
		return
	}
	var user models.User
	if err := h.DB.Where("replace(replace(phone, ' ', ''), '-', '') = ?", normalized).First(&user).Error; err != nil {
		fail(c, http.StatusUnauthorized, "invalid_credentials", "手机号或密码不正确")
		return
	}
	if !auth.CheckPassword(user.PasswordHash, req.Password) {
		fail(c, http.StatusUnauthorized, "invalid_credentials", "手机号或密码不正确")
		return
	}
	h.issueSession(c, user)
}

func (h *Handler) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "请填写完整的注册信息")
		return
	}
	normalized := phone.Normalize(req.Phone)
	if !phone.Valid(normalized) {
		fail(c, http.StatusBadRequest, "invalid_phone", "请输入有效的中国大陆手机号")
		return
	}
	name := strings.TrimSpace(req.Name)
	if name == "" {
		fail(c, http.StatusBadRequest, "invalid_input", "请输入姓名")
		return
	}
	if len(req.Password) < 8 {
		fail(c, http.StatusBadRequest, "weak_password", "密码至少 8 位")
		return
	}
	var count int64
	if err := h.DB.Model(&models.User{}).Where("replace(replace(phone, ' ', ''), '-', '') = ?", normalized).Count(&count).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "注册失败，请稍后重试")
		return
	}
	if count > 0 {
		fail(c, http.StatusConflict, "phone_exists", "该手机号已注册")
		return
	}
	hash, err := auth.HashPassword(req.Password)
	if err != nil {
		fail(c, http.StatusInternalServerError, "hash_failed", "注册失败，请稍后重试")
		return
	}
	user := models.User{
		Name: name, PasswordHash: hash, Role: "operator", Phone: normalized,
	}
	if err := h.DB.Create(&user).Error; err != nil {
		fail(c, http.StatusConflict, "register_failed", "注册失败，手机号可能已被使用")
		return
	}
	h.issueSession(c, user)
}

func (h *Handler) issueSession(c *gin.Context, user models.User) {
	token, err := auth.NewToken(h.Cfg.JWTSecret, user.ID, user.Role)
	if err != nil {
		fail(c, http.StatusInternalServerError, "token_error", "登录失败，请稍后重试")
		return
	}
	secure := h.cookieSecure(c)
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(auth.CookieName, token, 8*3600, "/", "", secure, true)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"user": user, "expires_in": 8 * 3600}})
}

func (h *Handler) Logout(c *gin.Context) {
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(auth.CookieName, "", -1, "/", "", h.cookieSecure(c), true)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"ok": true}})
}

func (h *Handler) cookieSecure(c *gin.Context) bool {
	if h.Cfg.AppEnv != "production" {
		return false
	}
	return c.Request.TLS != nil || strings.EqualFold(c.GetHeader("X-Forwarded-Proto"), "https")
}

func (h *Handler) Me(c *gin.Context) {
	token := ""
	if cookie, err := c.Cookie(auth.CookieName); err == nil {
		token = cookie
	}
	if token == "" {
		header := c.GetHeader("Authorization")
		if len(header) > 7 && header[:7] == "Bearer " {
			token = header[7:]
		}
	}
	if token == "" {
		c.JSON(http.StatusOK, gin.H{"data": nil})
		return
	}
	claims, err := auth.ParseToken(h.Cfg.JWTSecret, token)
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"data": nil})
		return
	}
	var user models.User
	if err := h.DB.First(&user, claims.UserID).Error; err != nil {
		c.JSON(http.StatusOK, gin.H{"data": nil})
		return
	}
	ok(c, user)
}

func (h *Handler) PublicOverview(c *gin.Context) {
	var vehicles, drivers, stores, activeLeases int64
	h.DB.Model(&models.Vehicle{}).Count(&vehicles)
	h.DB.Model(&models.Driver{}).Count(&drivers)
	h.DB.Model(&models.Store{}).Where("status = ?", "active").Count(&stores)
	h.DB.Model(&models.Lease{}).Where("status = ?", "active").Count(&activeLeases)
	ok(c, gin.H{
		"vehicles": vehicles, "drivers": drivers, "stores": stores,
		"active_leases": activeLeases, "updated_at": time.Now().Format(time.RFC3339),
	})
}
