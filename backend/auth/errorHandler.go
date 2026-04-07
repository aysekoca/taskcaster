package auth

import (
	"database/sql"
	"errors"
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/lib/pq"
)

var VerificationException = fiber.Map{"success": false, "message": "Invalid Token"}

func errorController(err error) fiber.Map {
	result := fiber.Map{"success": false, "message": "Database Error", "constraint": ""}
	var pqErr *pq.Error
	if errors.Is(err, sql.ErrNoRows) {
		return fiber.Map{"success": false, "message": "Wrong username or password"}
	}
	if errors.As(err, &pqErr) {
		if pqErr.Code == "23505" {
			result["message"] = "Duplicated key"
			switch pqErr.Constraint {
			case ErrEmailValidation:
				result["constraint"] = "Email"
			default:
				break
			}
		} else {
			log.Println(err)
			result["message"] = "Unkown Database Error"
		}
	} else {
		log.Println(err)
	}
	return result
}
