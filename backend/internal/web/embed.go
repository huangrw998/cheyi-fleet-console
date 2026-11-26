package web

import "embed"

// FS contains the production frontend build. The Makefile copies frontend/dist here.
//go:embed all:dist
var FS embed.FS