package router

import (
	"io/fs"
	"net/http"
	"strings"

	"cheyi/backend/internal/config"
	"cheyi/backend/internal/handler"
	"cheyi/backend/internal/middleware"
	"cheyi/backend/internal/web"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func New(db *gorm.DB, cfg config.Config) *gin.Engine {
	r := gin.New()
	r.Use(gin.Logger(), gin.Recovery(), middleware.CORS())
	h := handler.New(db, cfg)

	r.GET("/api/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := r.Group("/api/v1")
	{
		api.GET("/public/overview", h.PublicOverview)
		api.GET("/auth/me", h.Me)
		api.POST("/auth/login", h.Login)
		api.POST("/auth/register", h.Register)

		auth := api.Group("")
		auth.Use(middleware.Auth(cfg.JWTSecret))
		{
			auth.POST("/auth/logout", h.Logout)
			auth.GET("/dashboard", h.Dashboard)
			auth.GET("/search", h.Search)

			auth.GET("/models", h.ListModels)
			auth.GET("/models/filters", h.ModelFilters)
			auth.GET("/models/:slug", h.ModelDetail)
			auth.GET("/models/:slug/vehicles", h.ModelVehicles)

			auth.GET("/vehicles", h.ListVehicles)
			auth.POST("/vehicles", h.CreateVehicle)
			auth.GET("/vehicles/:id", h.VehicleDetail)
			auth.PATCH("/vehicles/:id", h.PatchVehicle)
			auth.GET("/vehicles/:id/leases", h.VehicleLeases)
			auth.GET("/vehicles/:id/maintenance", h.VehicleMaintenance)
			auth.GET("/vehicles/:id/insurance", h.VehicleInsurance)
			auth.GET("/vehicles/:id/violations", h.VehicleViolations)

			auth.GET("/drivers", h.ListDrivers)
			auth.POST("/drivers", h.CreateDriver)
			auth.GET("/drivers/:id", h.DriverDetail)
			auth.PATCH("/drivers/:id", h.PatchDriver)
			auth.GET("/drivers/:id/leases", h.DriverLeases)

			auth.GET("/leases", h.ListLeases)
			auth.POST("/leases", h.CreateLease)
			auth.GET("/leases/:id", h.LeaseDetail)
			auth.POST("/leases/:id/sign", h.SignLease)
			auth.POST("/leases/:id/handover", h.HandoverLease)
			auth.POST("/leases/:id/return", h.ReturnLease)
			auth.POST("/leases/:id/cancel", h.CancelLease)

			auth.GET("/bills/export.csv", h.ExportBills)
			auth.GET("/bills", h.ListBills)
			auth.GET("/bills/:id", h.BillDetail)
			auth.POST("/bills/:id/pay", h.PayBill)
			auth.POST("/bills/generate", h.GenerateBills)

			auth.GET("/maintenance-orders", h.ListMaintenance)
			auth.POST("/maintenance-orders", h.CreateMaintenance)
			auth.PATCH("/maintenance-orders/:id/status", h.UpdateMaintenanceStatus)
			auth.GET("/insurance-policies", h.ListInsurance)
			auth.GET("/violations", h.ListViolations)
			auth.POST("/violations", h.CreateViolation)
			auth.PATCH("/violations/:id/handle", h.HandleViolation)

			auth.GET("/dispatch-tasks", h.ListDispatch)
			auth.POST("/dispatch-tasks", h.CreateDispatch)
			auth.POST("/dispatch-tasks/:id/complete", h.CompleteDispatch)

			auth.GET("/reports", h.Reports)

			auth.GET("/settings", h.GetSettings)
			auth.PUT("/settings/stores/:id", h.UpdateStore)
			auth.POST("/settings/pricing-plans", h.CreatePlan)
			auth.PUT("/settings/pricing-plans/:id", h.UpdatePlan)
			auth.PUT("/settings/profile", h.UpdateProfile)
			auth.PUT("/settings/password", h.UpdatePassword)
			auth.PUT("/settings/reminders", h.UpdateReminders)
		}
	}

	if cfg.AppEnv == "production" {
		sub, err := fs.Sub(web.FS, "dist")
		if err == nil {
			fileServer := http.FileServer(http.FS(sub))
			r.NoRoute(func(c *gin.Context) {
				if strings.HasPrefix(c.Request.URL.Path, "/api/") {
					c.JSON(http.StatusNotFound, gin.H{"error": gin.H{"code": "not_found", "message": "接口不存在"}})
					return
				}
				path := strings.TrimPrefix(c.Request.URL.Path, "/")
				if path != "" {
					if f, err := sub.Open(path); err == nil {
						_ = f.Close()
						fileServer.ServeHTTP(c.Writer, c.Request)
						return
					}
				}
				c.Request.URL.Path = "/"
				fileServer.ServeHTTP(c.Writer, c.Request)
			})
		}
	}

	return r
}
