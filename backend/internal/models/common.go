package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
)

// StringList is stored as JSON text in SQLite and serialized as a JSON array.
type StringList []string

func (s StringList) Value() (driver.Value, error) {
	b, err := json.Marshal(s)
	if err != nil {
		return nil, err
	}
	return string(b), nil
}

func (s *StringList) Scan(value any) error {
	if value == nil {
		*s = StringList{}
		return nil
	}
	var raw []byte
	switch v := value.(type) {
	case []byte:
		raw = v
	case string:
		raw = []byte(v)
	default:
		return errors.New("unsupported StringList value")
	}
	if len(raw) == 0 {
		*s = StringList{}
		return nil
	}
	return json.Unmarshal(raw, s)
}
