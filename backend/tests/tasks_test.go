package tests

import (
	"testing"

	"github.com/gofiber/fiber/v2"
	"github.com/stretchr/testify/assert"
)

// TaskStressTest: Görev yönetimi modülünün stres ve güvenlik testlerini gerçekleştirir.
func (ctx *TestContext) TaskStressTest(t *testing.T) {
	// --- PREPARE (HAZIRLIK) ---
	// Testlerde kullanılacak kullanıcı bilgileri tanımlanıyor.
	adminEmail := "testuser@taskcaster.com"
	userAEmail := "testuser1@taskcaster.com"
	userBEmail := "userB@taskcaster.com"
	password := "testuser1234"

	// User B sisteme kaydediliyor ve veritabanı ID'si sorgulanıyor.
	ctx.RegisterLoginUser("User B", userBEmail, password)
	var userB_ID string
	ctx.DB.QueryRow("SELECT id FROM users WHERE email=$1", userBEmail).Scan(&userB_ID)

	// Admin kullanıcısı ile giriş yapılıyor ve veritabanında rolü admin (0) olarak güncelleniyor.
	ctx.LoginUser(adminEmail, password)
	ctx.MakeUserAdmin(adminEmail)

	var catId string
	// Görevlere atanabilmesi için önce bir kategori oluşturma adımı.
	t.Run("PREP: Create Category", func(t *testing.T) {
		payload := fiber.Map{"name": "General", "color": "#000000"}
		_, res, _ := ctx.SendJSON("POST", "/api/admin/category", &payload)
		catId = res["data"].(map[string]interface{})["id"].(string)
	})

	var taskA_ID string

	// 1. Senaryo: Kategorisiz standart bir görev oluşturma testi.
	t.Run("1. Create Task (No Category)", func(t *testing.T) {
		ctx.LoginUser(userAEmail, password)
		p := fiber.Map{"title": "Task 1", "dueDate": "2025-12-23", "dueTime": "20:00", "status": "PENDING"}
		status, res, _ := ctx.SendJSON("POST", "/api/task", &p)
		assert.Equal(t, fiber.StatusOK, status)
		taskA_ID = res["data"].(map[string]interface{})["id"].(string)
	})

	// 2. Senaryo: Kategori ID'si belirtilerek görev oluşturma testi.
	t.Run("2. Create Task (With Category)", func(t *testing.T) {
		p := fiber.Map{"title": "Task 2", "dueDate": "2025-12-24", "dueTime": "10:00", "status": "PENDING", "categoryId": catId}
		status, _, _ := ctx.SendJSON("POST", "/api/task", &p)
		assert.Equal(t, fiber.StatusOK, status)
	})

	// 3. Senaryo: Mevcut kullanıcının kendi görevlerini listeleme testi.
	t.Run("3. Get My Tasks List", func(t *testing.T) {
		status, res, _ := ctx.SendJSON("GET", "/api/task", nil)
		assert.Equal(t, fiber.StatusOK, status)
		assert.NotNil(t, res["data"])
	})

	// 4. Senaryo (Hata): Yanlış tarih formatı gönderildiğinde sistemin reddetmesi (Validation).
	t.Run("4. Fail: Invalid Date Format", func(t *testing.T) {
		p := fiber.Map{"title": "Bad Date", "dueDate": "23-12-2025", "dueTime": "20:00", "status": "PENDING"}
		status, _, _ := ctx.SendJSON("POST", "/api/task", &p)
		assert.Equal(t, fiber.StatusBadRequest, status)
	})

	// 5. Senaryo (Hata): Tanımsız bir statü (UNKNOWN) gönderildiğinde hata testi.
	t.Run("5. Fail: Invalid Status", func(t *testing.T) {
		p := fiber.Map{"title": "Bad Status", "dueDate": "2025-12-23", "dueTime": "20:00", "status": "UNKNOWN"}
		status, _, _ := ctx.SendJSON("POST", "/api/task", &p)
		assert.Equal(t, fiber.StatusBadRequest, status)
	})

	// 6. Senaryo (Hata): Karakter sınırı aşımı testi (Max 50 karakter varsayılıyor).
	t.Run("6. Fail: Title Too Long", func(t *testing.T) {
		p := fiber.Map{"title": "Bu baslik elli karakterden cok daha uzun bir baslik oldugu icin hata vermelidir", "dueDate": "2025-12-23", "dueTime": "20:00", "status": "PENDING"}
		status, _, _ := ctx.SendJSON("POST", "/api/task", &p)
		assert.Equal(t, fiber.StatusBadRequest, status)
	})

	// 7. Senaryo (Hata): Veritabanında olmayan bir kategori ID'si ile işlem testi.
	t.Run("7. Fail: Non-existent CategoryID", func(t *testing.T) {
		badUUID := "00000000-0000-0000-0000-000000000000"
		p := fiber.Map{"title": "Bad Cat", "dueDate": "2025-12-23", "dueTime": "20:00", "status": "PENDING", "categoryId": badUUID}
		status, _, _ := ctx.SendJSON("POST", "/api/task", &p)
		assert.Equal(t, fiber.StatusBadRequest, status)
	})

	// 8. Senaryo (Hata): Başlık alanı boş bırakıldığında hata testi.
	t.Run("8. Fail: Empty Title", func(t *testing.T) {
		p := fiber.Map{"title": "", "dueDate": "2025-12-23", "dueTime": "20:00", "status": "PENDING"}
		status, _, _ := ctx.SendJSON("POST", "/api/task", &p)
		assert.Equal(t, fiber.StatusBadRequest, status)
	})

	// 9. Güvenlik Testi (IDOR): Bir kullanıcı başkasının görevini güncelleyememeli.
	t.Run("9. Security: User B Cannot Update User A's Task", func(t *testing.T) {
		ctx.LoginUser(userBEmail, password)

		p := fiber.Map{
			"title": "Hacked", "status": "COMPLETED",
			"dueDate": "2025-12-23", "dueTime": "20:00",
		}
		status, _, _ := ctx.SendJSON("PATCH", "/api/task/"+taskA_ID, &p)

		assert.Equal(t, fiber.StatusNotFound, status)
	})

	// 10. Güvenlik Testi (IDOR): Bir kullanıcı başkasının görevini silememeli.
	t.Run("10. Security: User B Cannot Delete User A's Task", func(t *testing.T) {
		status, _, _ := ctx.SendJSON("DELETE", "/api/task/"+taskA_ID, nil)

		assert.Equal(t, fiber.StatusNotFound, status)
	})

	// 11. Güvenlik Testi (Yetki): Standart kullanıcı admin istatistiklerine erişememeli.
	t.Run("11. Security: Regular User Accessing Admin Stats", func(t *testing.T) {
		status, _, _ := ctx.SendJSON("GET", "/api/admin/stats", nil)
		assert.Equal(t, fiber.StatusUnauthorized, status)
	})

	var adminTaskId string
	// 12. Admin Fonksiyonu: Adminin başka bir kullanıcı (User B) adına görev oluşturma testi.
	t.Run("12. Admin: Create Task for User B", func(t *testing.T) {
		ctx.LoginUser(adminEmail, password)
		p := fiber.Map{"title": "Admin Task", "dueDate": "2025-12-25", "dueTime": "09:00", "status": "PENDING", "userId": userB_ID}
		status, res, _ := ctx.SendJSON("POST", "/api/admin/task", &p)
		assert.Equal(t, fiber.StatusOK, status)
		adminTaskId = res["data"].(map[string]interface{})["id"].(string)
	})

	// 13. Admin Fonksiyonu: Adminin başka bir kullanıcının görevini güncelleme testi.
	t.Run("13. Admin: Update User B's Task", func(t *testing.T) {
		p := fiber.Map{"title": "Updated by Admin", "status": "IN_PROGRESS", "dueDate": "2025-12-25", "dueTime": "09:00", "userId": userB_ID}
		status, _, _ := ctx.SendJSON("PATCH", "/api/admin/task/"+adminTaskId, &p)
		assert.Equal(t, fiber.StatusOK, status)
	})

	// 14. Admin Fonksiyonu: Adminin sistemdeki tüm görevleri listeleyebilme testi.
	t.Run("14. Admin: Get All Tasks with User Info", func(t *testing.T) {
		status, res, _ := ctx.SendJSON("GET", "/api/admin/task", nil)
		assert.Equal(t, fiber.StatusOK, status)
		tasks := res["data"].([]interface{})
		assert.GreaterOrEqual(t, len(tasks), 2)
	})

	// 15. Admin Fonksiyonu: Adminin görev detaylarını dosyalarıyla birlikte görme testi.
	t.Run("15. Admin: Get Task Details with Files", func(t *testing.T) {
		status, _, _ := ctx.SendJSON("GET", "/api/admin/task/details/"+adminTaskId, nil)
		assert.Equal(t, fiber.StatusOK, status)
	})

	// 16. Admin Fonksiyonu: Adminin başka bir kullanıcının görevini silme testi.
	t.Run("16. Admin: Delete User B's Task", func(t *testing.T) {
		status, _, _ := ctx.SendJSON("DELETE", "/api/admin/task/"+adminTaskId, nil)
		assert.Equal(t, fiber.StatusOK, status)
	})

	// 17. İstatistik: Kullanıcının kendi görev istatistiklerini alması testi.
	t.Run("17. Statistics: Get Personal Stats", func(t *testing.T) {
		ctx.LoginUser(userAEmail, password)
		status, _, _ := ctx.SendJSON("GET", "/api/tasks/stats", nil)
		assert.Equal(t, fiber.StatusOK, status)
	})

	// 18. İstatistik: Adminin belirli bir kullanıcıya ait istatistikleri çekme testi.
	t.Run("18. Statistics: Admin Get Specific User Stats", func(t *testing.T) {
		ctx.LoginUser(adminEmail, password)
		status, _, _ := ctx.SendJSON("GET", "/api/admin/stats/"+userB_ID, nil)
		assert.Equal(t, fiber.StatusOK, status)
	})

	// 19. Filtreleme: Görevlerin durum (status) bazlı filtrelenmesi testi.
	t.Run("19. Filter: Get Tasks by Status", func(t *testing.T) {
		ctx.LoginUser(userAEmail, password)
		status, _, _ := ctx.SendJSON("GET", "/api/task?status=PENDING", nil)
		assert.Equal(t, fiber.StatusOK, status)
	})

	// 20. Filtreleme: Görevlerin kategori bazlı filtrelenmesi testi.
	t.Run("20. Filter: Get Tasks by Category", func(t *testing.T) {
		status, _, _ := ctx.SendJSON("GET", "/api/task?categoryId="+catId, nil)
		assert.Equal(t, fiber.StatusOK, status)
	})

	// 21. Güvenlik Sızıntısı: Bir kullanıcının başkasına ait özel detaylara erişememesi kontrolü.
	t.Run("21. Security Leak: User B Accessing User A's Private Details", func(t *testing.T) {
		ctx.LoginUser(userBEmail, password)

		status, _, _ := ctx.SendJSON("GET", "/api/task/details/"+taskA_ID, nil)

		assert.Equal(t, fiber.StatusNotFound, status)
	})

	// 22. Format Kontrolü: Geçersiz UUID (GUID) formatı gönderildiğinde hata testi.
	t.Run("22. Invalid GUID Format Check", func(t *testing.T) {
		ctx.LoginUser(userAEmail, password)
		status, _, _ := ctx.SendJSON("GET", "/api/task/details/not-a-uuid", nil)
		assert.Equal(t, fiber.StatusBadRequest, status)
	})
}
