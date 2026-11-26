//go:build !prod

package web

import "embed"

// FS is empty in development/test builds; static files are only embedded when
// building with the `prod` tag (see embed_prod.go).
var FS embed.FS