package handler

import (
	"net/http"
	"time"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type dispatchRequest struct {
	VehicleID   uint   `json:"vehicle_id"`
	FromStoreID uint   `json:"from_store_id"`
	ToStoreID   uint   `json:"to_store_id"`
	ScheduledAt string `json:"scheduled_at"`
	Note        string `json:"note"`
}

func (h *Handler) ListDispatch(c *gin.Context) {
	var rows []models.DispatchTask
	if err := h.DB.Preload("Vehicle").Preload("Vehicle.Model").Preload("FromStore").Preload("ToStore").
		Order("created_at DESC").Find(&rows).Error; err != nil {
		fail(c, http.StatusInternalServerError, "db_error", "读取调拨任务失败")
		return
	}
	// Vehicle pool for the dispatch page.
	var pool []models.Vehicle
	h.DB.Preload("Model").Preload("Store").Where("status = ?", "available").Order("store_id ASC").Limit(40).Find(&pool)
	var stores []models.Store
	h.DB.Order("id ASC").Find(&stores)
	c.JSON(http.StatusOK, gin.H{"data": gin.H{"tasks": rows, "pool": pool, "stores": stores}})
}

func (h *Handler) CreateDispatch(c *gin.Context) {
	var req dispatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fail(c, http.StatusBadRequest, "invalid_input", "请填写调拨信息")
		return
	}
	if req.VehicleID == 0 || req.ToStoreID == 0 {
		fail(c, http.StatusBadRequest, "invalid_input", "车辆和目标门店不能为空")
		return
	}
	var v models.Vehicle
	if err := h.DB.First(&v, req.VehicleID).Error; err != nil {
		fail(c, http.StatusBadRequest, "invalid_vehicle", "车辆不存在")
		return
	}
	if v.Status != "available" {
		fail(c, http.StatusConflict, "vehicle_unavailable", "该车辆当前不可调拨")
		return
	}
	var to models.Store
	if err := h.DB.First(&to, req.ToStoreID).Error; err != nil {
		fail(c, http.StatusBadRequest, "invalid_store", "目标门店不存在")
		return
	}
	fromID := req.FromStoreID
	if fromID == 0 {
		fromID = v.StoreID
	}
	scheduled := time.Now()
	if t, err := parseDate(req.ScheduledAt); err == nil {
		scheduled = t
	}
	task := models.DispatchTask{
		TaskNo: newCode("DP"), VehicleID: req.VehicleID, FromStoreID: fromID, ToStoreID: req.ToStoreID,
		Status: "pending", ScheduledAt: scheduled, Note: req.Note,
	}
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&task).Error; err != nil {
			return err
		}
		return tx.Model(&models.Vehicle{}).Where("id = ?", v.ID).Update("status", "dispatch").Error
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "create_failed", "调拨任务创建失败")
		return
	}
	h.DB.Preload("Vehicle").Preload("Vehicle.Model").Preload("FromStore").Preload("ToStore").First(&task, task.ID)
	c.JSON(http.StatusCreated, gin.H{"data": task})
}

func (h *Handler) CompleteDispatch(c *gin.Context) {
	id, okID := parseUintParam(c, "id")
	if !okID {
		return
	}
	var task models.DispatchTask
	if err := h.DB.First(&task, id).Error; err != nil {
		fail(c, http.StatusNotFound, "not_found", "调拨任务不存在")
		return
	}
	if task.Status == "completed" {
		fail(c, http.StatusConflict, "invalid_state", "该调拨任务已完成")
		return
	}
	now := time.Now()
	err := h.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&task).Updates(map[string]any{"status": "completed", "completed_at": now}).Error; err != nil {
			return err
		}
		return tx.Model(&models.Vehicle{}).Where("id = ?", task.VehicleID).Updates(map[string]any{
			"store_id": task.ToStoreID, "status": "available",
		}).Error
	})
	if err != nil {
		fail(c, http.StatusInternalServerError, "update_failed", "调拨完成失败")
		return
	}
	h.DB.Preload("Vehicle").Preload("Vehicle.Model").Preload("FromStore").Preload("ToStore").First(&task, id)
	ok(c, task)
}
