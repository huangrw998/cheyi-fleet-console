package database

import (
	"fmt"
	"time"

	"cheyi/backend/internal/models"
	"gorm.io/gorm"
)

const expansionFlag = "seed_expansion_guangzhou_v1"

// EnsureExpandedData adds Guangzhou stores and operating data once for existing databases.
func EnsureExpandedData(db *gorm.DB) error {
	return db.Transaction(func(tx *gorm.DB) error {
		var existing int64
		if err := tx.Model(&models.Setting{}).Where("key = ?", expansionFlag).Count(&existing).Error; err != nil {
			return err
		}
		if existing > 0 {
			return nil
		}

		stores := []models.Store{
			{Name: "广州天河店", District: "天河区", Address: "广州市天河区黄埔大道西 1200 号", Capacity: 22, Status: "active", Image: "/media/stores/store-1.webp"},
			{Name: "广州白云店", District: "白云区", Address: "广州市白云区机场路 1638 号", Capacity: 20, Status: "active", Image: "/media/stores/store-2.webp"},
			{Name: "广州番禺店", District: "番禺区", Address: "广州市番禺区迎宾路 688 号", Capacity: 18, Status: "active", Image: "/media/stores/store-3.webp"},
		}
		if err := tx.Create(&stores).Error; err != nil {
			return err
		}

		var modelRows []models.VehicleModel
		if err := tx.Order("id ASC").Find(&modelRows).Error; err != nil {
			return err
		}
		if len(modelRows) == 0 {
			return fmt.Errorf("vehicle models are required before expansion")
		}

		today := time.Now().Truncate(24 * time.Hour)
		d := func(n int) time.Time { return today.AddDate(0, 0, n) }
		colors := []string{"珍珠白", "曜石黑", "星河蓝", "云雾灰", "青柠绿"}

		vehicles := make([]models.Vehicle, 0, 21)
		for i := 0; i < 21; i++ {
			vehicles = append(vehicles, models.Vehicle{
				PlateNo:          fmt.Sprintf("粤A D%04d", 3000+i),
				ModelID:          modelRows[i%len(modelRows)].ID,
				StoreID:          stores[i%len(stores)].ID,
				Color:            colors[i%len(colors)],
				Status:           "available",
				MileageKm:        16000 + (i*9731)%72000,
				PurchaseDate:     today.AddDate(-(1 + i%3), -(i % 10), 0),
				InsuranceExpiry:  d(20 + i*9),
				InspectionExpiry: d(90 + i*11),
				Vin:              fmt.Sprintf("LGWEF4A52N%08d", 31000000+i),
				Note:             "广州运营车辆",
			})
		}
		if err := tx.Create(&vehicles).Error; err != nil {
			return err
		}

		names := []string{
			"梁子谦", "陈启帆", "黄嘉乐", "李承宇", "周柏霖", "吴卓然", "何俊熙", "罗浩然", "邓景铄", "谢天佑",
			"冯梓轩", "曾令航", "钟奕辰", "蔡文韬", "潘志远", "卢启铭", "谭嘉树", "邹子墨", "姚博文", "崔浩然",
		}
		drivers := make([]models.Driver, 0, len(names))
		for i, name := range names {
			drivers = append(drivers, models.Driver{
				Name:             name,
				Phone:            fmt.Sprintf("139%08d", 30000000+i*1739),
				IDCardNo:         fmt.Sprintf("4401011992%06d", 20001+i*271),
				LicenseNo:        fmt.Sprintf("440101%08d", 22000101+i*97),
				LicenseExpiry:    d(18 + i*11),
				Status:           "certified",
				Rating:           4.6 + float64(i%4)*0.1,
				JoinedAt:         d(-(20 + i*11)),
				EmergencyContact: fmt.Sprintf("138%08d", 30000000+i*233),
				Note:             "广州运营司机",
			})
		}
		if err := tx.Create(&drivers).Error; err != nil {
			return err
		}

		if err := seedGuangzhouLeases(tx, today, vehicles, drivers, modelRows); err != nil {
			return err
		}
		if err := seedGuangzhouOperations(tx, today, vehicles, drivers, stores); err != nil {
			return err
		}
		return tx.Create(&models.Setting{Key: expansionFlag, Value: "done"}).Error
	})
}
