package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"cheyi/backend/internal/config"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type Handler struct {
	DB  *gorm.DB
	Cfg config.Config
}

func New(db *gorm.DB, cfg config.Config) *Handler {
	return &Handler{DB: db, Cfg: cfg}
}

func fail(c *gin.Context, status int, code, message string) {
	c.AbortWithStatusJSON(status, gin.H{"error": gin.H{"code": code, "message": message}})
}

func ok(c *gin.Context, data any) {
	c.JSON(http.StatusOK, gin.H{"data": data})
}

func pageParams(c *gin.Context) (int, int) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(c.DefaultQuery("page_size", "20"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 500 {
		size = 20
	}
	return page, size
}

func paginated(c *gin.Context, data any, page, size int, total int64) {
	c.JSON(http.StatusOK, gin.H{"data": data, "meta": gin.H{"page": page, "page_size": size, "total": total}})
}

func parseDate(s string) (time.Time, error) {
	if s == "" {
		return time.Time{}, fmt.Errorf("date is required")
	}
	if t, err := time.Parse("2006-01-02", s); err == nil {
		return t, nil
	}
	return time.Parse(time.RFC3339, s)
}

func dateString(t time.Time) string {
	if t.IsZero() {
		return ""
	}
	return t.Format("2006-01-02")
}

func newCode(prefix string) string {
	return fmt.Sprintf("%s-%s-%05d", prefix, time.Now().Format("2006"), time.Now().UnixNano()%100000)
}

func contains(s, sub string) bool {
	return strings.Contains(strings.ToLower(s), strings.ToLower(sub))
}

func currentUserID(c *gin.Context) uint {
	v, _ := c.Get("user_id")
	id, _ := v.(uint)
	return id
}

func parseUintParam(c *gin.Context, name string) (uint, bool) {
	n, err := strconv.ParseUint(c.Param(name), 10, 64)
	if err != nil || n == 0 {
		fail(c, http.StatusBadRequest, "invalid_id", "无效的 ID")
		return 0, false
	}
	return uint(n), true
}

func queryUint(c *gin.Context, name string) (uint, bool) {
	raw := c.Query(name)
	if raw == "" {
		return 0, false
	}
	n, err := strconv.ParseUint(raw, 10, 64)
	if err != nil {
		return 0, false
	}
	return uint(n), true
}

func like(q string) string {
	return "%" + strings.TrimSpace(q) + "%"
}

func today() time.Time {
	return time.Now().Truncate(24 * time.Hour)
}

func daysFromNow(n int) time.Time {
	return today().AddDate(0, 0, n)
}
