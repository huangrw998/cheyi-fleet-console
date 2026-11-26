//go:build prod

package web

import "embed"

// FS contains the production frontend build. The Makefile copies frontend/dist here
// and builds with the `prod` tag. Non-prod builds use an empty FS so that
// `go build ./...`, `go run ./cmd/server` and `go test ./...` work without a
// frontend build.
//go:embed all:dist
var FS embed.FS