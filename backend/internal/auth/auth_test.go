package auth

import "testing"

func TestPasswordHashAndToken(t *testing.T) {
	hash, err := HashPassword("Cheyi@2026")
	if err != nil {
		t.Fatal(err)
	}
	if !CheckPassword(hash, "Cheyi@2026") {
		t.Fatal("expected password to match")
	}
	if CheckPassword(hash, "wrong-password") {
		t.Fatal("expected password not to match")
	}

	token, err := NewToken("test-secret", 7, "admin")
	if err != nil {
		t.Fatal(err)
	}
	claims, err := ParseToken("test-secret", token)
	if err != nil {
		t.Fatal(err)
	}
	if claims.UserID != 7 || claims.Role != "admin" {
		t.Fatalf("unexpected claims: %+v", claims)
	}
	if _, err := ParseToken("wrong-secret", token); err == nil {
		t.Fatal("expected token verification to fail")
	}
}
