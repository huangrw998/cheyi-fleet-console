package handler

import (
	"net/http"
	"strings"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
)

type vehicleRequest struct {
	PlateNo          string `json:"plate_no"`
	ModelID          uint   `json:"model_id"`
	StoreID          uint   `json:"store_id"`
	Color            string `json:"color"`
	Status           string `json:"status"`
	MileageKm        int    `json:"mileage_km"`
	PurchaseDate     string `json:"purchase_date"`
	InsuranceExpiry  string `json:"insurance_expiry"`
	InspectionExpiry string `json:"inspection_expiry"`
	Vin              string `json:"vin"`
	Note             string `json:"note"`
}

type vehiclePatch struct {
	Status           *string `json:"status"`
	StoreID          *uint   `json:"store_id"`
	MileageKm        *int    `json:"mileage_km"`
	InsuranceExpiry  *string `json:"insurance_expiry"`
	InspectionExpiry *string `json:"inspection_expiry"`
	Note             *string `json:"note"`
}

var vehicleStatuses = map[string]bool{
	"available": true, "reserved": true, "rented": true, "maintenance": true, "dispatch": true, "retired": true,
}

func (h *Handler) ListVehicles(c *gin.Context) {
	q := h.DB.Model(&models.Vehicle{})
	if v := c.Query("status"); v != "" && v != "all" {
		q = q.Where("status = ?", v)
	}
	if id, ok := queryUint(c, "store_id"); ok {
		q = q.Where("store_id = ?", id)
	}
	if id, ok := queryUint(c, "model_id"); ok {
		q = q.Where("model_id = ?", id)
	}
	if v := strings.TrimSpace(c.Query("q")); v != "" {
		q = q.Where("(plate_no LIKE ? OR vin LIKE ?)", like(v), like(v))
	}
	var total int64
	q.Count(&total)
	page, size := pageParams(c)
	var rows []models.Vehicle
	if err := q.Preload("Model").Preload("Store").Order("CASE status WHEN 'available' THEN 0 WHEN 'reserved' THEN 1 WHEN 'rented' THEN 2 WHEN 'maintenance' THEN 3 WHEN 'dispatch' THEN 4 ELSE 5 END, id ASC").Offset((page - 1) * size).Limit(size).Find(&rows).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "读取车辆失败")
		return
	}
	paginated(c, rows, page, size, total)
}

func (h *Handler) CreateVehicle(c *gin.Context) {
	var req vehicleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "请填写完整的车辆信息")
		return
	}
	req.PlateNo = strings.TrimSpace(req.PlateNo)
	if req.PlateNo == "" || req.ModelID == 0 || req.StoreID == 0 {
		fail(c, http.StatusBadRequest, "invalid_input", "车牌、车型和门店不能为空")
		return
	}
	var model models.VehicleModel
	if err := h.DB.First(&model, req.ModelID).Error; err != nil {
		fail(c, http.StatusBadRequest, "invalid_model", "车型不存在")
		return
	}
	var store models.Store
	if err := h.DB.First(&store, req.StoreID).Error; err != nil {
		fail(c, http.StatusBadRequest, "invalid_store", "门店不存在")
		return
	}
	if req.Status == "" {
		req.Status = "available"
	}
	if !vehicleStatuses[req.Status] {
		fail(c, http.StatusBadRequest, "invalid_status", "车辆状态不合法")
		return
	}
	v := models.Vehicle{
		PlateNo: req.PlateNo, ModelID: req.ModelID, StoreID: req.StoreID,
		Color: req.Color, Status: req.Status, MileageKm: req.MileageKm,
		Vin: req.Vin, Note: req.Note,
	}
	if t, err := parseDate(req.PurchaseDate); err == nil {
		v.PurchaseDate = t
	}
	if t, err := parseDate(req.InsuranceExpiry); err == nil {
		v.InsuranceExpiry = t
	}
	if t, err := parseDate(req.InspectionExpiry); err == nil {
		v.InspectionExpiry = t
	}
	if err := h.DB.Create(&v).Error; err != nil {
		fail(c, http.StatusConflict, "create_failed", "车牌号已存在或车辆创建失败")
		return
	}
	h.DB.Preload("Model").Preload("Store").First(&v, v.ID)
	c.JSON(http.StatusCreated, gin.H{"data": v})
}

func (h *Handler) PatchVehicle(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var v models.Vehicle
	if err := h.DB.First(&v, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "车辆不存在")
		return
	}
	var req vehiclePatch
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "更新内容不合法")
		return
	}
	updates := map[string]any{}
	if req.Status != nil {
		if !vehicleStatuses[*req.Status] {
			fail(c, http.StatusBadRequest, "invalid_status", "车辆状态不合法")
			return
		}
		updates["status"] = *req.Status
	}
	if req.StoreID != nil {
		var store models.Store
		if err := h.DB.First(&store, *req.StoreID).Error; err != nil {
			fail(c, http.StatusBadRequest, "invalid_store", "门店不存在")
			return
		}
		updates["store_id"] = *req.StoreID
	}
	if req.MileageKm != nil {
		updates["mileage_km"] = *req.MileageKm
	}
	if req.InsuranceExpiry != nil {
		if t, err := parseDate(*req.InsuranceExpiry); err == nil {
			updates["insurance_expiry"] = t
		}
	}
	if req.InspectionExpiry != nil {
		if t, err := parseDate(*req.InspectionExpiry); err == nil {
			updates["inspection_expiry"] = t
		}
	}
	if req.Note != nil {
		updates["note"] = *req.Note
	}
	if len(updates) > 0 {
		if err := h.DB.Model(&v).Updates(updates).Error; err != nil {
			fail(c, http.StatusInternalServerError, "update_failed", "车辆更新失败")
			return
		}
	}
	h.DB.Preload("Model").Preload("Store").First(&v, id)
	ok(c, v)
}
