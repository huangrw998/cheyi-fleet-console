package database

import (
	"fmt"
	"time"

	"cheyi/backend/internal/models"
	"gorm.io/gorm"
)

func seedFleet(tx *gorm.DB, today time.Time, stores []models.Store, modelRows []models.VehicleModel) ([]models.Vehicle, []models.Driver, error) {
	d := func(n int) time.Time { return today.AddDate(0, 0, n) }
	colors := []string{"珍珠白", "曜石黑", "星河蓝", "云雾灰", "青柠绿"}
	vehicles := make([]models.Vehicle, 0, 64)
	for i := 0; i < 64; i++ {
		modelID := uint(i%len(modelRows) + 1)
		storeID := uint(i%len(stores) + 1)
		v := models.Vehicle{
			PlateNo:          fmt.Sprintf("沪A D%04d", 2000+i),
			ModelID:          modelID,
			StoreID:          storeID,
			Color:            colors[i%len(colors)],
			Status:           "available",
			MileageKm:        12000 + (i*13721)%90000,
			PurchaseDate:     today.AddDate(-(1 + i%4), -(i % 12), 0),
			InsuranceExpiry:  d(8 + (i*7)%120),
			InspectionExpiry: d(60 + (i*11)%300),
			Vin:              fmt.Sprintf("LSVCH6A46N%08d", 21000000+i),
			Note:             "",
		}
		vehicles = append(vehicles, v)
	}
	if err := tx.Create(&vehicles).Error; err != nil {
		return nil, nil, err
	}

	driverNames := []string{
		"周启明", "陈昊然", "林泽宇", "赵思远", "王砚秋", "孙嘉禾", "许文博", "郑一鸣",
		"蒋承泽", "沈亦舟", "韩知远", "唐亦然", "冯嘉树", "曹牧之", "彭予安", "董书航",
		"袁景行", "傅明轩", "罗嘉佑", "谢云舟", "魏子昂", "苏慕白", "梁雨辰", "顾南乔",
		"邵闻溪", "程叙白", "陆星野", "叶知秋", "方既明", "江屿川", "陶然", "贺云舒",
		"闻人清和", "白敬川", "温以宁", "贺兰舟",
		"沈砚清", "顾行之", "谢知微", "陆时安", "沈嘉屿", "顾清越",
		"宋予安", "裴知行", "纪云开", "许南枝",
	}
	drivers := make([]models.Driver, 0, len(driverNames))
	for i, name := range driverNames {
		drv := models.Driver{
			Name:             name,
			Phone:            fmt.Sprintf("139%08d", 26470000+i*1379),
			IDCardNo:         fmt.Sprintf("3101011990%06d", 10101+i*137),
			LicenseNo:        fmt.Sprintf("310101%08d", 19900101+i*97),
			LicenseExpiry:    d(5 + (i*13)%180),
			Status:           "certified",
			Rating:           4.6 + float64(i%4)*0.1,
			JoinedAt:         d(-(60 + i*17)),
			EmergencyContact: fmt.Sprintf("138%08d", 88270000+i*233),
			Note:             "",
		}
		drivers = append(drivers, drv)
	}
	if err := tx.Create(&drivers).Error; err != nil {
		return nil, nil, err
	}
	return vehicles, drivers, nil
}
