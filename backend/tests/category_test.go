package tests

import (
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

// CategorySteps: Kategori yönetimiyle ilgili tüm test adımlarını koordine eder.
func (ctx *TestContext) CategorySteps(t *testing.T) {
	// --- HAZIRLIK (PREPARE) ---
	// auth_test.go içerisinde oluşturulmuş olan test kullanıcısını admin yetkisine yükseltiyoruz.
	adminEmail := "testuser@taskcaster.com"
	err := ctx.MakeUserAdmin(adminEmail)
	assert.NoError(t, err)

	// Testler sırasında oluşturulan kategorinin ID'sini diğer adımlarda kullanmak üzere saklıyoruz.
	var createdCategoryId string
	// auth_test.go'da oluşturulan ve admin olmayan normal kullanıcı e-postası.
	secondUserEmail := "testuser1@taskcaster.com"

	// --- POZİTİF SENARYOLAR (SUCCESS PATH) ---

	t.Run("CAT-Step 1: Admin Create Category Successfully", func(t *testing.T) {
		// Admin girişi yapılır.
		ctx.LoginUser(adminEmail, "testuser1234")

		payload := fiber.Map{
			"name":  "Work",
			"color": "#FF5733",
		}
		// Admin yetkisiyle kategori oluşturma isteği gönderilir.
		status, res, err := ctx.SendJSON("POST", "/api/admin/category", &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, status)
		assert.Equal(t, res["success"], true)

		// Diğer test adımlarında (güncelleme/silme) kullanmak üzere kategori ID'sini alıyoruz.
		data := res["data"].(map[string]interface{})
		createdCategoryId = data["id"].(string)
	})

	t.Run("CAT-Step 2: Get All Categories (Read Access)", func(t *testing.T) {
		// Normal bir kullanıcının kategorileri görme yetkisi olmalıdır.
		ctx.LoginUser(secondUserEmail, "testuser1234")

		status, res, err := ctx.SendJSON("GET", "/api/category", nil)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, status)

		// Dönen listede en az az önce oluşturduğumuz "Work" kategorisi bulunmalıdır.
		data := res["data"].(map[string]interface{})
		categories := data["categories"].([]interface{})
		assert.GreaterOrEqual(t, len(categories), 1)
	})

	// --- NEGATİF SENARYOLAR (ERROR HANDLING & VALIDATION) ---

	t.Run("CAT-Step 3: Duplicate Name Check", func(t *testing.T) {
		// Aynı isimde bir kategorinin tekrar oluşturulmasını engelleme testi.
		ctx.LoginUser(adminEmail, "testuser1234")

		payload := fiber.Map{
			"name":  "Work", // Zaten mevcut olan isim.
			"color": "#000000",
		}
		_, res, err := ctx.SendJSON("POST", "/api/admin/category", &payload)
		assert.NoError(t, err)

		// İşlemin başarısız olması ve uygun bir hata mesajı dönmesi beklenir.
		assert.Equal(t, res["success"], false)
		assert.Contains(t, res["message"], "already exists")
	})

	t.Run("CAT-Step 4: Validation - Invalid Color Length", func(t *testing.T) {
		// Renk kodunun formatına dair doğrulama testi (Örn: #FF geçersizdir, 7 karakter olmalı).
		payload := fiber.Map{
			"name":  "Invalid Color",
			"color": "#FF",
		}
		_, res, err := ctx.SendJSON("POST", "/api/admin/category", &payload)
		assert.NoError(t, err)
		// Veri doğrulaması (Validation) nedeniyle başarısız dönmelidir.
		assert.Equal(t, res["success"], false)
	})

	t.Run("CAT-Step 5: Authorization - Regular User Cannot Delete", func(t *testing.T) {
		// YETKİLENDİRME GÜVENLİĞİ: Normal kullanıcının admin endpoint'ini kullanarak kategori silmesi engellenmelidir.
		ctx.LoginUser(secondUserEmail, "testuser1234")

		path := "/api/admin/category/" + createdCategoryId
		status, _, _ := ctx.SendJSON("DELETE", path, nil)
		// Yetkisiz erişim nedeniyle 401 Unauthorized bekleniyor.
		assert.Equal(t, fiber.StatusUnauthorized, status)
	})

	// --- GÜNCELLEME VE SİLME İŞLEMLERİ (UPDATE & DELETE) ---

	t.Run("CAT-Step 6: Update Category Name and Color", func(t *testing.T) {
		// Adminin mevcut bir kategorinin adını ve rengini güncellemesi.
		ctx.LoginUser(adminEmail, "testuser1234")

		payload := fiber.Map{
			"name":  "Work Updated",
			"color": "#112233",
		}
		path := "/api/admin/category/" + createdCategoryId
		status, res, err := ctx.SendJSON("PATCH", path, &payload)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, status)
		assert.Equal(t, res["success"], true)
	})

	t.Run("CAT-Step 7: Admin Delete Category", func(t *testing.T) {
		// Adminin bir kategoriyi başarıyla sistemden silmesi.
		path := "/api/admin/category/" + createdCategoryId
		status, res, err := ctx.SendJSON("DELETE", path, nil)
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, status)
		assert.Equal(t, res["success"], true)
	})
}
