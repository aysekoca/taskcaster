package tests

import (
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

// RegisterUserSteps: Kayıt olma sürecindeki farklı senaryoları (başarı, mükerrer, kısa şifre) test eder.
func (ctx *TestContext) RegisterUserSteps(t *testing.T) {

	t.Run("AUTH-Register Step 1: Register User", func(t *testing.T) {
		// Başarılı kayıt oluşturma testi.
		payload := fiber.Map{
			"name":     "testuser",
			"email":    "testuser@taskcaster.com",
			"password": "testuser1234",
		}
		status, res, err := ctx.SendJSON("POST", "/api/auth/signup", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusCreated, status)
		assert.Equal(t, res["success"], true)
	})

	t.Run("AUTH-Register Step 2: Register Same Email Should Return Error", func(t *testing.T) {
		// Aynı e-posta adresiyle tekrar kayıt olmayı engelleme testi.
		payload := fiber.Map{
			"name":     "testuser1",
			"email":    "testuser@taskcaster.com",
			"password": "testuser1234",
		}
		status, res, err := ctx.SendJSON("POST", "/api/auth/signup", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, status)
		assert.Equal(t, res["success"], false)
	})

	t.Run("AUTH-Register Step 3: Register Same Username", func(t *testing.T) {
		// Aynı isim fakat farklı e-posta ile kayıt olabilme testi.
		payload := fiber.Map{
			"name":     "testuser",
			"email":    "testuser1@taskcaster.com",
			"password": "testuser1234",
		}
		status, res, err := ctx.SendJSON("POST", "/api/auth/signup", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusCreated, status)
		assert.Equal(t, res["success"], true)
	})

	t.Run("AUTH-Register Step 4: Register With Short Password Should Return Error", func(t *testing.T) {
		// Çok kısa şifre girişini engelleme testi.
		payload := fiber.Map{
			"name":     "testuser",
			"email":    "testpassword@taskcaster.com",
			"password": "1234",
		}
		status, res, err := ctx.SendJSON("POST", "/api/auth/signup", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, status)
		assert.Equal(t, res["success"], false)
	})
}

// LoginUserSteps: Sisteme giriş yapma ve token alma süreçlerini test eder.
func (ctx *TestContext) LoginUserSteps(t *testing.T) {

	t.Run("AUTH-Login Step 1: Login User", func(t *testing.T) {
		// Doğru bilgilerle sisteme giriş testi.
		payload := fiber.Map{
			"email":    "testuser@taskcaster.com",
			"password": "testuser1234",
		}
		status, res, err := ctx.SendJSON("POST", "/api/auth/login", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, status)
		assert.Equal(t, res["success"], true)
		assert.IsType(t, res["access"], "")
		assert.IsType(t, res["refresh"], "")
		assert.Equal(t, res["role"], 1.0)
		assert.Equal(t, res["email"], "testuser@taskcaster.com")
	})

	t.Run("AUTH-Login Step 2: Login With Wrong Password", func(t *testing.T) {
		// Yanlış şifre ile giriş denemesini engelleme testi.
		payload := fiber.Map{
			"email":    "testuser@taskcaster.com",
			"password": "testuser1235",
		}
		status, res, err := ctx.SendJSON("POST", "/api/auth/login", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, status)
		assert.Equal(t, res["success"], false)
	})

	t.Run("AUTH-Login Step 3: Login With Non-Existing Email", func(t *testing.T) {
		// Kayıtlı olmayan e-posta ile giriş denemesi.
		payload := fiber.Map{
			"email":    "doesnotexist@taskcaster.com",
			"password": "testuser1235",
		}
		status, res, err := ctx.SendJSON("POST", "/api/auth/login", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, status)
		assert.Equal(t, res["success"], false)
	})

	t.Run("AUTH-Login Step 4: Login User Last Time", func(t *testing.T) {
		// Son bir giriş yapıp tokenları context'e kaydeder.
		payload := fiber.Map{
			"email":    "testuser@taskcaster.com",
			"password": "testuser1234",
		}
		status, res, err := ctx.SendJSON("POST", "/api/auth/login", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, status)
		assert.Equal(t, res["success"], true)
		ctx.Token = res["access"].(string)
		ctx.RefreshToken = res["refresh"].(string)
	})

}

// RefreshUserSteps: Token süresi bittiğinde yenileme işlemini test eder.
func (ctx *TestContext) RefreshUserSteps(t *testing.T) {
	err := ctx.RegisterLoginUser("test", "testrefresh@taskcaster.com", "testuser1234")
	assert.NoError(t, err)
	t.Run("AUTH-Refresh Step 1: Refresh User Token", func(t *testing.T) {
		// Geçerli refresh token ile yeni access token alma.
		payload := fiber.Map{
			"token": ctx.RefreshToken,
		}
		status, res, err := ctx.SendJSON("POST", "/api/auth/refresh", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, status)
		assert.Equal(t, res["success"], true)
	})

	ctx.RefreshUserToken()

	t.Run("AUTH-Refresh Step 2: Send Invalid Token", func(t *testing.T) {
		// Geçersiz token ile yenileme denemesini engelleme.
		payload := fiber.Map{
			"token": "invalid",
		}
		status, res, err := ctx.SendJSON("POST", "/api/auth/refresh", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusUnauthorized, status)
		assert.Equal(t, res["success"], false)
	})

	ctx.RemoveUser("testrefresh@taskcaster.com")

	t.Run("AUTH-Refresh Step 3: Send Deleted User Token", func(t *testing.T) {
		// Silinmiş kullanıcıya ait token ile işlem yapmayı engelleme.
		payload := fiber.Map{
			"token": ctx.RefreshToken,
		}
		status, res, err := ctx.SendJSON("POST", "/api/auth/refresh", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusBadRequest, status)
		assert.Equal(t, res["success"], false)
	})
}

// AuthUserSteps: Tüm kimlik doğrulama testlerini sırayla çalıştırır.
func (ctx *TestContext) AuthUserSteps(t *testing.T) {
	ctx.RegisterUserSteps(t)
	ctx.LoginUserSteps(t)
	ctx.RefreshUserSteps(t)
}
