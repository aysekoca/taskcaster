package tests

import (
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

// SystemAndSecuritySteps: Yetkisiz erişim denemelerini test eder.
func (ctx *TestContext) SystemAndSecuritySteps(t *testing.T) {
	t.Run("SEC: Access Without Token Should Fail", func(t *testing.T) {
		// Token göndermeden korumalı bir route'a erişim denemesi.
		originalToken := ctx.Token
		ctx.Token = ""

		status, _, _ := ctx.SendJSON("GET", "/api/task", nil)
		assert.Equal(t, fiber.StatusUnauthorized, status)
		ctx.Token = originalToken
	})

	t.Run("SEC: Regular User Cannot Access Admin Routes", func(t *testing.T) {
		// Normal bir kullanıcının admin paneline erişmeye çalışması.
		ctx.LoginUser("testuser@taskcaster.com", "testuser1234")
		status, _, _ := ctx.SendJSON("GET", "/api/admin/stats", nil)
		assert.Equal(t, fiber.StatusUnauthorized, status)
	})
}
