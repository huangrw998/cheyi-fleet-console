package handler

import (
	"sort"
	"time"

	"cheyi/backend/internal/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func buildAlerts(db *gorm.DB, t time.Time, leases []models.Lease) []gin.H {
	alerts := []gin.H{}
	var insurances []models.InsurancePolicy
	db.Preload("Vehicle").Preload("Vehicle.Model").Find(&insurances)
	for _, ins := range insurances {
		diff := int(ins.EndDate.Sub(t).Hours() / 24)
		if diff <= 30 && diff >= -5 {
			severity := "warning"
			if diff <= 7 {
				severity = "critical"
			}
			plate := ""
			if ins.Vehicle != nil {
				plate = ins.Vehicle.PlateNo
			}
			alerts = append(alerts, gin.H{
				"type": "insurance", "severity": severity,
				"title": "保险即将到期", "detail": plate + " · " + ins.Provider + " · " + itoa(diff) + " 天后到期",
				"href": "/vehicles/" + itoa(int(ins.VehicleID)),
			})
		}
	}
	var maintenance []models.MaintenanceOrder
	db.Preload("Vehicle").Where("status != ?", "completed").Find(&maintenance)
	for _, m := range maintenance {
		if !m.ScheduledAt.After(daysFromNow(7)) {
			plate := ""
			if m.Vehicle != nil {
				plate = m.Vehicle.PlateNo
			}
			alerts = append(alerts, gin.H{
				"type": "maintenance", "severity": "warning",
				"title": "保养工单待处理", "detail": plate + " · " + m.Description,
				"href": "/maintenance",
			})
		}
	}
	var overdueBills []models.Bill
	db.Preload("Lease").Preload("Lease.Driver").Preload("Lease.Vehicle").Where("status = ? OR (status = ? AND due_date < ?)", "overdue", "pending", t).Limit(3).Find(&overdueBills)
	for _, b := range overdueBills {
		detail := "账单 " + b.BillNo
		if b.Lease != nil && b.Lease.Driver != nil {
			detail = b.Lease.Driver.Name + " · " + b.BillNo
		}
		alerts = append(alerts, gin.H{
			"type": "bill", "severity": "critical", "title": "租金逾期",
			"detail": detail, "href": "/finance",
		})
	}
	for _, l := range leases {
		if l.Status == "active" {
			diff := int(l.EndDate.Sub(t).Hours() / 24)
			if diff >= 0 && diff <= 7 {
				name := ""
				if l.Driver != nil {
					name = l.Driver.Name
				}
				alerts = append(alerts, gin.H{
					"type": "lease", "severity": "info", "title": "租约即将到期",
					"detail": name + " · " + dateString(l.EndDate) + " 到期",
					"href":   "/leases/" + itoa(int(l.ID)),
				})
			}
		}
	}
	var pendingViolations int64
	db.Model(&models.Violation{}).Where("status = ?", "pending").Count(&pendingViolations)
	if pendingViolations > 0 {
		alerts = append(alerts, gin.H{
			"type": "violation", "severity": "warning", "title": "违章待处理",
			"detail": itoa(int(pendingViolations)) + " 条违章记录待处理", "href": "/finance",
		})
	}
	severityRank := map[string]int{"critical": 0, "warning": 1, "info": 2}
	sort.SliceStable(alerts, func(i, j int) bool {
		return severityRank[alerts[i]["severity"].(string)] < severityRank[alerts[j]["severity"].(string)]
	})
	if len(alerts) > 7 {
		alerts = alerts[:7]
	}
	return alerts
}
