package tests

import (
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

// FileStressTest: Dosya yükleme, indirme, silme ve yetkisiz erişim senaryolarını test eder.
func (ctx *TestContext) FileStressTest(t *testing.T) {
	// --- HAZIRLIK (PREPARE) ---
	// Test için gerekli olan Admin, Kullanıcı A ve Kullanıcı B hesapları oluşturulur.
	adminEmail, userAEmail, userBEmail, pass := "admin@test.com", "userA@test.com", "userB@test.com", "pass1234"

	ctx.RegisterLoginUser("Admin", adminEmail, pass)
	ctx.MakeUserAdmin(adminEmail) // Admin hesabı yetkilendirilir.
	ctx.RegisterLoginUser("UserA", userAEmail, pass)
	ctx.RegisterLoginUser("UserB", userBEmail, pass)

	var taskA_ID string
	var fileA_ID string

	// Kullanıcı A sisteme giriş yapar ve kendine bir görev (task) oluşturur.
	ctx.LoginUser(userAEmail, pass)
	p := fiber.Map{"title": "File Task", "dueDate": "2025-12-30", "dueTime": "12:00", "status": "PENDING"}
	_, resTask, _ := ctx.SendJSON("POST", "/api/task", &p)
	taskA_ID = resTask["data"].(map[string]interface{})["id"].(string)

	// --- DOSYA YÜKLEME (UPLOAD) ---

	t.Run("FILE-1: Successful Upload (Standardized Nested Structure)", func(t *testing.T) {
		// Kullanıcı A, kendi görevine bir PNG dosyası yükler.
		// SendMultipart fonksiyonu form-data (dosya) gönderimi için kullanılır.
		status, res, err := ctx.SendMultipart("POST", "/api/file/"+taskA_ID, "file", "image.png", []byte("\x89PNG\r\n\x1a\n"))
		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, status)

		// Yanıtın 'data' anahtarı içerdiğinden emin olunur.
		data, ok := res["data"].(map[string]interface{})
		assert.True(t, ok, "Yanıt 'data' anahtarına sahip olmalı!")

		// Diğer testlerde kullanmak üzere oluşturulan dosyanın ID'si saklanır.
		fileA_ID = data["id"].(string)
		assert.NotEmpty(t, fileA_ID, "Dönen dosya ID'si boş olamaz!")
	})

	// --- GÜVENLİK KONTROLLERİ (SECURITY / IDOR) ---

	t.Run("FILE-2: Security - User B Access Attempt to User A File (IDOR)", func(t *testing.T) {
		// GÜVENLİK: Kullanıcı B sisteme giriş yapar.
		ctx.LoginUser(userBEmail, pass)
		// Kullanıcı B, Kullanıcı A'ya ait dosya ID'sini kullanarak dosyaya erişmeye çalışır.
		status, _, _ := ctx.SendJSON("GET", "/api/file/"+fileA_ID, nil)
		// Erişim engellenmeli ve 404 (veya 401/403) dönmelidir.
		assert.Equal(t, fiber.StatusNotFound, status)
	})

	t.Run("FILE-3: Security - User B Delete User A File", func(t *testing.T) {
		// GÜVENLİK: Kullanıcı B, Kullanıcı A'nın dosyasını silmeye çalışır.
		status, _, _ := ctx.SendJSON("DELETE", "/api/file/"+fileA_ID, nil)
		// Silme işlemi yetkisiz olduğu için başarısız olmalıdır.
		assert.Equal(t, fiber.StatusNotFound, status)
	})

	// --- BOŞ VERİ KONTROLÜ (NULL CHECK) ---

	t.Run("FILE-4: Check Task Details for Null Files", func(t *testing.T) {
		// Dosyası olmayan bir görev oluşturulduğunda sistemin hata vermediği kontrol edilir.
		ctx.LoginUser(userAEmail, pass)
		p2 := fiber.Map{"title": "No File Task", "dueDate": "2025-12-30", "dueTime": "12:00", "status": "PENDING"}
		_, resT, _ := ctx.SendJSON("POST", "/api/task", &p2)
		newTaskId := resT["data"].(map[string]interface{})["id"].(string)

		// Görev detayları istendiğinde sistem 200 OK dönmelidir.
		status, _, _ := ctx.SendJSON("GET", "/api/task/details/"+newTaskId, nil)
		assert.Equal(t, fiber.StatusOK, status)
	})

	// --- ADMİN YETKİLERİ (ADMIN BYPASS) ---

	t.Run("FILE-5: Admin Bypass - Download Any User's File", func(t *testing.T) {
		// YETKİ: Admin hesabı sisteme giriş yapar.
		ctx.LoginUser(adminEmail, pass)
		// Admin, başka bir kullanıcıya (User A) ait dosyayı indirebilmelidir.
		status, body, err := ctx.SendGetRaw("/api/admin/file/" + fileA_ID)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, status)
		assert.NotEmpty(t, body, "İndirilen dosya içeriği boş olmamalı")
	})

	t.Run("FILE-6: Admin Bypass - Delete Any File", func(t *testing.T) {
		// YETKİ: Admin, sistemdeki herhangi bir dosyayı silebilmelidir.
		ctx.LoginUser(adminEmail, pass)
		status, _, _ := ctx.SendJSON("DELETE", "/api/admin/file/"+fileA_ID, nil)
		assert.Equal(t, fiber.StatusOK, status)
	})

	t.Run("FILE-7: Admin Upload to User Task", func(t *testing.T) {
		// YETKİ: Admin, bir kullanıcının görevine dosya yükleyebilmelidir.
		ctx.LoginUser(adminEmail, pass)

		pngContent := []byte("\x89PNG\r\n\x1a\n")

		status, res, err := ctx.SendMultipart(
			"POST",
			"/api/admin/file/"+taskA_ID,
			"file",
			"admin_upload.png",
			pngContent,
		)

		assert.NoError(t, err)
		assert.Equal(t, fiber.StatusOK, status)
		assert.Equal(t, true, res["success"])
	})
}
