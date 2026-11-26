package handler

import (
	"net/http"
	"strings"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type driverRequest struct {
	Name             string  `json:"name"`
	Phone            string  `json:"phone"`
	IDCardNo         string  `json:"id_card_no"`
	LicenseNo        string  `json:"license_no"`
	LicenseExpiry    string  `json:"license_expiry"`
	Status           string  `json:"status"`
	Rating           float64 `json:"rating"`
	EmergencyContact string  `json:"emergency_contact"`
	Note             string  `json:"note"`
}

type driverPatch struct {
	Name             *string  `json:"name"`
	Phone            *string  `json:"phone"`
	LicenseNo        *string  `json:"license_no"`
	LicenseExpiry    *string  `json:"license_expiry"`
	Status           *string  `json:"status"`
	Rating           *float64 `json:"rating"`
	EmergencyContact *string  `json:"emergency_contact"`
	Note             *string  `json:"note"`
}

var driverStatuses = map[string]bool{
	"pending": true, "certified": true, "leased": true, "returned": true, "blacklisted": true,
}

func (h *Handler) ListDrivers(c *gin.Context) {
	q := h.DB.Model(&models.Driver{})
	if v := c.Query("status"); v != "" && v != "all" {
		q = q.Where("status = ?", v)
	}
	if v := strings.TrimSpace(c.Query("q")); v != "" {
		q = q.Where("(name LIKE ? OR phone LIKE ? OR license_no LIKE ?)", like(v), like(v), like(v))
	}
	var total int64
	q.Count(&total)
	page, size := pageParams(c)
	var rows []models.Driver
	if err := q.Order("id ASC").Offset((page - 1) * size).Limit(size).Find(&rows).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "读取司机失败")
		return
	}
	// Attach current active lease for each driver.
	type row struct {
		models.Driver
		Vehicle *models.Vehicle `json:"current_vehicle,omitempty"`
		Lease   *models.Lease   `json:"current_lease,omitempty"`
	}
	out := make([]row, 0, len(rows))
	for _, d := range rows {
		var l models.Lease
		var vehicle *models.Vehicle
		if err := h.DB.Preload("Vehicle").Preload("Vehicle.Model").Where("driver_id = ? AND status IN ?", d.ID, []string{"pending_sign", "pending_pickup", "active"}).Order("created_at DESC").First(&l).Error; err == nil {
			vehicle = l.Vehicle
			out = append(out, row{Driver: d, Vehicle: vehicle, Lease: &l})
		} else {
			out = append(out, row{Driver: d})
		}
	}
	paginated(c, out, page, size, total)
}

func (h *Handler) CreateDriver(c *gin.Context) {
	var req driverRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "请填写完整的司机信息")
		return
	}
	if strings.TrimSpace(req.Name) == "" || strings.TrimSpace(req.Phone) == "" {
		fail(c, http.StatusBadRequest, "invalid_input", "姓名和手机号不能为空")
		return
	}
	if req.Status == "" {
		req.Status = "pending"
	}
	if !driverStatuses[req.Status] {
		fail(c, http.StatusBadRequest, "invalid_status", "司机状态不合法")
		return
	}
	d := models.Driver{
		Name: req.Name, Phone: req.Phone, IDCardNo: req.IDCardNo, LicenseNo: req.LicenseNo,
		Status: req.Status, Rating: req.Rating, EmergencyContact: req.EmergencyContact,
		Note: req.Note, JoinedAt: today(),
	}
	if t, err := parseDate(req.LicenseExpiry); err == nil {
		d.LicenseExpiry = t
	}
	if err := h.DB.Create(&d).Error; err != nil {
		fail(c, http.StatusConflict, "create_failed", "手机号或证件号已存在")
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": d})
}
