package app

import (
	"database/sql"
	"log"
	"os"
	"strconv"
	"taskcaster/auth"
	"taskcaster/category"
	"taskcaster/config"
	"taskcaster/db"
	"taskcaster/file"
	guards "taskcaster/guard"
	"taskcaster/tasks"
	"taskcaster/users"

	jwtware "github.com/gofiber/contrib/jwt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
)

type (
	GlobalErrorHandlerResp struct {
		Success bool   `json:"success"`
		Message string `json:"message"`
	}
)

func StartApp(envFile string) {
	app, cfg, _ := SetupApp(envFile)
	log.Fatal(app.Listen(":" + strconv.Itoa(cfg.Port)))
}

func SetupApp(envFile string) (*fiber.App, *config.Config, *sql.DB) {
	config.SetEnvFile(envFile)
	cfg := config.Instance()
	dbConn := dbConnection()

	app := getApp()

	// cors Settings
	app.Use(cors.New())

	// /
	app.Get("/ping", func(c *fiber.Ctx) error {
		return c.SendString("pong")
	})

	// /API/
	apiRouter := app.Group("/api")
	apiRouter.Get("/ping", func(c *fiber.Ctx) error {
		return c.SendString("api pong")
	})

	// Public Endpoints

	// /API/AUTH/
	authRouter := apiRouter.Group("/auth")
	authRouter.Post("/login", auth.Login)
	authRouter.Post("/signup", auth.Signup)
	authRouter.Post("/refresh", auth.Refresh)

	// Protected Endpoints
	apiRouter.Use(jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(cfg.JWTAccessKey)},
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		},
	}))
	apiRouter.Use(guards.AuthMW)

	apiRouter.Get("/category", category.GetCategories)

	apiRouter.Post("/task", tasks.CreateUserTask)
	apiRouter.Delete("/task/:id<guid>", tasks.DeleteUserTask)
	apiRouter.Get("/task", tasks.GetUserTasks)
	apiRouter.Patch("/task/:id<guid>", tasks.UpdateUserTask)
	apiRouter.Get("/task/details/:id<guid>", tasks.GetUserTaskDetails)

	os.Mkdir(cfg.FileStoragePath, os.ModePerm)
	apiRouter.Post("/file/:taskId<guid>", file.UploadAttachment)
	apiRouter.Get("/file/:id<guid>", file.DownloadAttachment)
	apiRouter.Delete("/file/:id<guid>", file.RemoveFile)

	apiRouter.Get("/tasks/stats", tasks.GetUserStatistics)

	adminRouter := app.Group("/api/admin")
	adminRouter.Use(jwtware.New(jwtware.Config{
		SigningKey: jwtware.SigningKey{Key: []byte(cfg.JWTAccessKey)},
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		},
	}))
	adminRouter.Use(guards.AdminMW)

	adminRouter.Patch("/category/:id<guid>", category.UpdateCategory)
	adminRouter.Delete("/category/:id<guid>", category.DeleteCategory)
	adminRouter.Post("/category", category.CreateCategory)

	adminRouter.Post("/task", tasks.CreateTaskAdmin)
	adminRouter.Delete("/task/:id<guid>", tasks.DeleteTaskAdmin)
	adminRouter.Get("/task", tasks.GetTasksAdmin)
	adminRouter.Patch("/task/:id<guid>", tasks.UpdateTaskAdmin)
	adminRouter.Get("/task/details/:id<guid>", tasks.GetTaskDetailsAdmin)

	adminRouter.Post("/file/:taskId<guid>", file.UploadAttachmentAdmin)
	adminRouter.Get("/file/:id<guid>", file.DownloadAttachmentAdmin)
	adminRouter.Delete("/file/:id<guid>", file.RemoveFileAdmin)

	adminRouter.Post("/user", users.CreateUser)
	adminRouter.Patch("/user/:userId<guid>", users.UpdateUser)
	adminRouter.Delete("/user/:userId<guid>", users.DeleteUser)
	adminRouter.Get("/user", users.GetUsers)
	adminRouter.Get("/user/:userId<guid>", users.GetUser)

	adminRouter.Get("/stats", tasks.GetAdminStatistics)
	adminRouter.Get("/stats/:userId<guid>", tasks.GetAdminUserStatistics)
	return app, cfg, dbConn
}

func dbConnection() *sql.DB {
	err := db.InitDB()
	if err != nil {
		log.Fatal("error while connecting to database: ", err)
	}
	return db.DB
}

func getApp() *fiber.App {
	app := fiber.New(fiber.Config{
		BodyLimit: (int(config.Instance().FileSizeLimit) + 10) * 1024 * 1024,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			return c.Status(fiber.StatusBadRequest).JSON(GlobalErrorHandlerResp{
				Success: false,
				Message: err.Error(),
			})
		},
	})
	return app
}
