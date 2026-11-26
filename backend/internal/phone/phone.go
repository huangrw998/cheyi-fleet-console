package phone

import "strings"

type Carrier string

const (
	ChinaMobile     Carrier = "中国移动"
	ChinaUnicom     Carrier = "中国联通"
	ChinaTelecom    Carrier = "中国电信"
	ChinaBroadnet   Carrier = "中国广电"
	VirtualOperator Carrier = "虚拟运营商"
)

var carrierByPrefix = map[string]Carrier{
	// 中国移动
	"134": ChinaMobile, "135": ChinaMobile, "136": ChinaMobile, "137": ChinaMobile, "138": ChinaMobile,
	"139": ChinaMobile, "147": ChinaMobile, "150": ChinaMobile, "151": ChinaMobile, "152": ChinaMobile,
	"157": ChinaMobile, "158": ChinaMobile, "159": ChinaMobile, "172": ChinaMobile, "178": ChinaMobile,
	"182": ChinaMobile, "183": ChinaMobile, "184": ChinaMobile, "187": ChinaMobile, "188": ChinaMobile,
	"195": ChinaMobile, "197": ChinaMobile, "198": ChinaMobile,
	// 中国联通
	"130": ChinaUnicom, "131": ChinaUnicom, "132": ChinaUnicom, "145": ChinaUnicom, "155": ChinaUnicom,
	"156": ChinaUnicom, "166": ChinaUnicom, "175": ChinaUnicom, "176": ChinaUnicom, "185": ChinaUnicom,
	"186": ChinaUnicom, "196": ChinaUnicom,
	// 中国电信
	"133": ChinaTelecom, "149": ChinaTelecom, "153": ChinaTelecom, "173": ChinaTelecom, "177": ChinaTelecom,
	"180": ChinaTelecom, "181": ChinaTelecom, "189": ChinaTelecom, "190": ChinaTelecom, "191": ChinaTelecom,
	"193": ChinaTelecom, "199": ChinaTelecom,
	// 中国广电
	"192": ChinaBroadnet,
	// 虚拟运营商
	"162": VirtualOperator, "165": VirtualOperator, "167": VirtualOperator, "170": VirtualOperator, "171": VirtualOperator,
}

func Normalize(raw string) string {
	digits := strings.Map(func(r rune) rune {
		if r >= '0' && r <= '9' {
			return r
		}
		return -1
	}, raw)
	if strings.HasPrefix(digits, "0086") && len(digits) == 15 {
		return digits[4:]
	}
	if strings.HasPrefix(digits, "86") && len(digits) == 13 {
		return digits[2:]
	}
	return digits
}

func CarrierOf(raw string) Carrier {
	normalized := Normalize(raw)
	if len(normalized) != 11 || normalized[0] != '1' || normalized[1] < '3' || normalized[1] > '9' {
		return ""
	}
	return carrierByPrefix[normalized[:3]]
}

func Valid(raw string) bool {
	return CarrierOf(raw) != ""
}

// ValidShape 仅校验 11 位、1 开头，用于预置管理员等特殊账号登录。
func ValidShape(raw string) bool {
	normalized := Normalize(raw)
	return len(normalized) == 11 && normalized[0] == '1'
}
