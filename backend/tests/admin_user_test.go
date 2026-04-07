package tests

import (
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

// AdminUserManagementSteps: Adminin diğer kullanıcıları yönetme (CRUD) yeteneklerini test eder.
func (ctx *TestContext) AdminUserManagementSteps(t *testing.T) {
	// --- HAZIRLIK (PREPARE) ---
	// Testleri gerçekleştirebilmek için önce bir "Master Admin" hesabı oluşturulur.
	adminEmail, pass := "admin_master@test.com", "admin1234"
	ctx.RegisterLoginUser("Master Admin", adminEmail, pass) // Kayıt ol ve giriş yap.
	ctx.MakeUserAdmin(adminEmail)                           // Veritabanı seviyesinde admin yetkisi ver.
	ctx.LoginUser(adminEmail, pass)                         // Admin yetkisiyle yeni bir session/token al.

	var targetUserId string
	targetUserEmail := "to_be_managed@test.com"

	// 1. Senaryo: Adminin yetkisiyle yeni bir kullanıcı oluşturması.
	t.Run("ADMIN-USER 1: Create New User via Admin", func(t *testing.T) {
		payload := fiber.Map{
			"name":     "Target User",
			"email":    targetUserEmail,
			"password": "targetPassword123",
			"role":     "0", // Admin rolüyle oluşturulmaya çalışılıyor.
		}
		// Admin endpoint'ine POST isteği gönderilir.
		status, _, _ := ctx.SendJSON("POST", "/api/admin/user", &payload)
		assert.Equal(t, fiber.StatusCreated, status) // 201 Created bekleniyor.

		// Kullanıcı oluştu mu diye veritabanından ID sorgulanır.
		err := ctx.DB.QueryRow("SELECT id FROM users WHERE email=$1", "to_be_managed@test.com").Scan(&targetUserId)

		assert.NoError(t, err, "Kullanıcı oluşturuldu ama veritabanında bulunamadı")
		assert.NotEmpty(t, targetUserId, "Hedef kullanıcı ID'si boş olamaz!")
	})

	// 2. Senaryo: Geçersiz bir rol tipi ile kullanıcı oluşturma denemesi (Validasyon Testi).
	t.Run("ADMIN-USER 2: Create New User via Admin With Wrong User Type", func(t *testing.T) {
		payload := fiber.Map{
			"name":     "Target User",
			"email":    targetUserEmail,
			"password": "targetPassword123",
			"role":     "3", // Tanımsız/geçersiz bir rol tipi.
		}
		status, _, _ := ctx.SendJSON("POST", "/api/admin/user", &payload)
		assert.Equal(t, fiber.StatusBadRequest, status) // 400 Bad Request bekleniyor.
	})

	// 3. Senaryo: Tüm kullanıcıların listelenmesi.
	t.Run("ADMIN-USER 3: List All Users", func(t *testing.T) {
		status, res, _ := ctx.SendJSON("GET", "/api/admin/user", nil)
		assert.Equal(t, fiber.StatusOK, status)

		// Dönen verinin içinde en az 1 kullanıcı (az önce oluşturduğumuz) olduğu kontrol edilir.
		users := res["data"].([]interface{})
		assert.GreaterOrEqual(t, len(users), 1)
	})

	// 4. Senaryo: Spesifik bir kullanıcının detaylarını getirme.
	t.Run("ADMIN-USER 4: Get Single User Details", func(t *testing.T) {
		assert.NotEmpty(t, targetUserId, "Hedef kullanıcı ID'si null olamaz!")

		status, res, _ := ctx.SendJSON("GET", "/api/admin/user/"+targetUserId, nil)
		assert.Equal(t, fiber.StatusOK, status)
		assert.Equal(t, "Successfully fetched user", res["message"])

		// Veri yapısının liste değil, tekil bir nesne (map) olduğu doğrulanır.
		_, ok := res["data"].(map[string]interface{})
		assert.True(t, ok, "Data bir nesne olmalı, liste değil!")
	})

	// 5. Senaryo: Kullanıcı bilgilerini ve rolünü güncelleme (Terfi Ettirme).
	t.Run("ADMIN-USER 5: Update User Role (Promote to Admin)", func(t *testing.T) {
		assert.NotEmpty(t, targetUserId, "Hedef kullanıcı ID'si null olamaz!")

		payload := fiber.Map{
			"name":  "Target User Updated",
			"email": "to_be_managed@test.com",
			"role":  "0", // Rolü Admin (0) olarak güncelliyoruz.
		}

		status, res, err := ctx.SendJSON("PATCH", "/api/admin/user/"+targetUserId, &payload)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, status)
		assert.Equal(t, true, res["success"])
		assert.Equal(t, "Successfully updated user", res["message"])
	})

	// 6. Senaryo: Kullanıcıyı sistemden silme.
	t.Run("ADMIN-USER 6: Delete User", func(t *testing.T) {
		status, _, _ := ctx.SendJSON("DELETE", "/api/admin/user/"+targetUserId, nil)
		assert.Equal(t, fiber.StatusOK, status)
	})

	// 7. Senaryo: Kullanıcının gerçekten silindiğini doğrulama.
	t.Run("ADMIN-USER 7: Verify User is Deleted", func(t *testing.T) {
		// Silinen ID ile tekrar sorgulama yapılırsa 200 (OK) dönmemeli.
		status, _, _ := ctx.SendJSON("GET", "/api/admin/user/"+targetUserId, nil)
		assert.NotEqual(t, fiber.StatusOK, status)
	})
}
