package phone

import "testing"

func TestNormalize(t *testing.T) {
	cases := []struct {
		input string
		want  string
	}{
		{"+86 139 0188 7261", "13901887261"},
		{"139-0188-7261", "13901887261"},
		{"8613901887261", "13901887261"},
		{"008613901887261", "13901887261"},
	}
	for _, tc := range cases {
		if got := Normalize(tc.input); got != tc.want {
			t.Fatalf("Normalize(%q) = %q, want %q", tc.input, got, tc.want)
		}
	}
}

func TestCarrierDetection(t *testing.T) {
	cases := []struct {
		input string
		want  Carrier
	}{
		{"13901887261", ChinaMobile},
		{"13001887261", ChinaUnicom},
		{"18901887261", ChinaTelecom},
		{"19201887261", ChinaBroadnet},
		{"17001887261", VirtualOperator},
		{"19901887261", ChinaTelecom},
		{"19701887261", ChinaMobile},
		{"19601887261", ChinaUnicom},
	}
	for _, tc := range cases {
		if got := CarrierOf(tc.input); got != tc.want {
			t.Fatalf("CarrierOf(%q) = %q, want %q", tc.input, got, tc.want)
		}
	}
}

func TestAdminShape(t *testing.T) {
	if !ValidShape("12388888888") {
		t.Fatal("expected admin number to pass shape validation")
	}
	if Valid("12388888888") {
		t.Fatal("admin number should not pass strict carrier validation")
	}
}

func TestInvalidNumbers(t *testing.T) {
	for _, input := range []string{"", "12345678901", "14001887261", "1380188726", "139018872611", "23801887261"} {
		if Valid(input) {
			t.Fatalf("expected %q to be invalid", input)
		}
	}
}
