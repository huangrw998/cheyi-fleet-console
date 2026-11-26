package handler

func statusLabel(s string) string {
	switch s {
	case "available":
		return "待租"
	case "reserved":
		return "已锁定"
	case "rented":
		return "在租"
	case "maintenance":
		return "维保中"
	case "dispatch":
		return "调拨中"
	case "retired":
		return "停运"
	case "pending_sign":
		return "待签约"
	case "pending_pickup":
		return "待交车"
	case "active":
		return "租用中"
	case "pending_return":
		return "待退车"
	case "returned":
		return "已退租"
	case "cancelled":
		return "已取消"
	case "pending":
		return "待收"
	case "paid":
		return "已收"
	case "overdue":
		return "逾期"
	case "waived":
		return "免收"
	case "scheduled":
		return "待排期"
	case "in_progress":
		return "进行中"
	case "pending_acceptance":
		return "待验收"
	case "completed":
		return "已完成"
	case "in_transit":
		return "在途"
	case "handled":
		return "已处理"
	default:
		return s
	}
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	buf := [20]byte{}
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}
