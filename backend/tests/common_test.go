package tests

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"mime/multipart"
	"net/http/httptest"
	"os"
	"taskcaster/app"
	"taskcaster/config"

	"github.com/gofiber/fiber/v2"
)

// TestContext: Testler sırasında uygulama durumunu, veritabanını ve tokenları tutan yapı.
type TestContext struct {
	App          *fiber.App
	Token        string
	RefreshToken string
	DB           *sql.DB
	Cfg          *config.Config
}

// SetupSuite: Test ortamını (.env.test ile) ayağa kaldıran başlangıç fonksiyonu.
func SetupSuite() *TestContext {
	app, cfg, db := app.SetupApp(".env.test")

	return &TestContext{
		App:          app,
		DB:           db,
		Cfg:          cfg,
		Token:        "",
		RefreshToken: "",
	}
}

// ClearTestState: Veritabanındaki tabloları temizler ve yüklenen dosyaları siler.
func (ctx *TestContext) ClearTestState() {
	_, err := ctx.DB.Exec("TRUNCATE TABLE file, tasks, categories, users CASCADE")
	if err != nil {
		log.Fatal(err.Error())
	}

	os.RemoveAll(ctx.Cfg.FileStoragePath)
}

// SendGetRaw: Token ekleyerek bir GET isteği gönderir ve ham yanıtı döner.
func (ctx *TestContext) SendGetRaw(path string) (int, []byte, error) {
	req := httptest.NewRequest("GET", path, nil)
	if ctx.Token != "" {
		req.Header.Set("Authorization", "Bearer "+ctx.Token)
	}

	resp, err := ctx.App.Test(req)
	if err != nil {
		return 0, nil, err
	}

	b, err := io.ReadAll(resp.Body)
	return resp.StatusCode, b, err
}

// SendMultipart: Dosya yükleme işlemleri için çok parçalı (multipart) form verisi gönderir.
func (ctx *TestContext) SendMultipart(method, path, fieldName, fileName string, content []byte) (int, fiber.Map, error) {
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, _ := writer.CreateFormFile(fieldName, fileName)
	part.Write(content)
	writer.Close()

	req := httptest.NewRequest(method, path, body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	if ctx.Token != "" {
		req.Header.Set("Authorization", "Bearer "+ctx.Token)
	}

	resp, err := ctx.App.Test(req, 30000)
	if err != nil {
		return 0, nil, err
	}
	b, _ := io.ReadAll(resp.Body)
	var res fiber.Map
	json.Unmarshal(b, &res)
	return resp.StatusCode, res, nil
}

// SendJSON: Uygulamaya JSON formatında veri gönderen temel yardımcı fonksiyon.
func (ctx *TestContext) SendJSON(method string, path string, data *fiber.Map) (int, fiber.Map, error) {
	body, err := json.Marshal(data)
	if err != nil {
		return 0, nil, err
	}

	req := httptest.NewRequest(method, path, bytes.NewReader(body))

	req.Header.Set("Content-Type", "application/json")
	if ctx.Token != "" {
		req.Header.Set("Authorization", "Bearer "+ctx.Token)
	}

	resp, err := ctx.App.Test(req)
	if err != nil {
		return 0, nil, err
	}

	b, err := io.ReadAll(resp.Body)
	if err != nil {
		return 0, nil, err
	}

	var res fiber.Map
	err = json.Unmarshal(b, &res)
	if err != nil {
		return 0, nil, err
	}

	return resp.StatusCode, res, nil
}

// RefreshUserToken: Refresh token kullanarak yeni bir Access Token alır.
func (ctx *TestContext) RefreshUserToken() error {
	payload := fiber.Map{
		"token": ctx.RefreshToken,
	}
	_, res, err := ctx.SendJSON("POST", "/api/auth/refresh", &payload)
	if err != nil {
		return err
	}

	ctx.RefreshToken = res["refresh"].(string)
	ctx.Token = res["access"].(string)
	return nil
}

// LoginUser: Mevcut bir kullanıcı ile giriş yapıp tokenları context'e kaydeder.
func (ctx *TestContext) LoginUser(email string, password string) error {
	payload := fiber.Map{
		"email":    email,
		"password": password,
	}
	_, res, err := ctx.SendJSON("POST", "/api/auth/login", &payload)
	if err != nil {
		return err
	}

	ctx.RefreshToken = res["refresh"].(string)
	ctx.Token = res["access"].(string)
	return nil
}

// RegisterLoginUser: Hem kayıt hem de giriş işlemini ardarda yapar.
func (ctx *TestContext) RegisterLoginUser(name string, email string, password string) error {
	payload := fiber.Map{
		"name":     name,
		"email":    email,
		"password": password,
	}
	_, _, err := ctx.SendJSON("POST", "/api/auth/signup", &payload)
	if err != nil {
		return err
	}
	return ctx.LoginUser(email, password)

}

// RemoveUser: Belirli bir kullanıcıyı veritabanından tamamen siler.
func (ctx *TestContext) RemoveUser(email string) error {
	sql := "DELETE FROM users WHERE email=$1"

	_, err := ctx.DB.Exec(sql, email)

	return err
}

// MakeUserAdmin: Kullanıcının rolünü Admin (0) olarak günceller.
func (ctx *TestContext) MakeUserAdmin(email string) error {
	sql := "UPDATE users SET role=0 WHERE email=$1"

	_, err := ctx.DB.Exec(sql, email)

	return err
}

// MakeUserRegular: Kullanıcının rolünü Normal Kullanıcı (1) olarak günceller.
func (ctx *TestContext) MakeUserRegular(email string) error {
	sql := "UPDATE users SET role=1 WHERE email=$1"

	_, err := ctx.DB.Exec(sql, email)

	return err
}
