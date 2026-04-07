package tests

import "testing"

// TestFullFlow: Uygulamanın tüm süreçlerini (Auth -> Task -> File -> Admin) sırayla test eden ana fonksiyon.
func TestFullFlow(t *testing.T) {
	// 1. Ortamı kur.
	ctx := SetupSuite()

	// 2. Veritabanını temizle.
	ctx.ClearTestState()

	// 3. Sırasıyla tüm modül testlerini çalıştır.
	ctx.AuthUserSteps(t)            // Kimlik doğrulama testleri
	ctx.SystemAndSecuritySteps(t)   // Genel güvenlik testleri
	ctx.CategorySteps(t)            // Kategori yönetimi testleri
	ctx.TaskStressTest(t)           // Görev işlemleri testleri
	ctx.FileStressTest(t)           // Dosya işlemleri testleri
	ctx.AdminUserManagementSteps(t) // Admin paneli testleri
}
