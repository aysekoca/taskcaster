package users

import (
	"taskcaster/db"
	"taskcaster/res"
	"taskcaster/validator"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type (
	UpdateUserPayload struct {
		Email    string  `validate:"required,email,max=255"`
		Password *string `validate:"omitempty,min=8,max=255"`
		Role     string  `validate:"required,oneof=0 1"`
		Name     string  `validate:"required,min=3,max=50"`
	}
)

func UpdateUser(c *fiber.Ctx) error {
	userId := c.Params("userId")

	var payload UpdateUserPayload
	if err := c.BodyParser(&payload); err != nil {
		return res.ParsingErrorHandler(err, c)
	}

	if errMessage := validator.Instance().Validate(payload); len(errMessage) > 0 {
		return res.ValidationErrorHandler(errMessage, c)
	}

	var placeholder string
	sql := "SELECT id FROM users WHERE id=$1"
	err := db.DB.QueryRow(sql, userId).Scan(&placeholder)
	if err != nil {
		return res.DbErrorHandler(err, "user", sql, c)
	}

	var count string
	sql = "SELECT COUNT(*) FROM users WHERE email=$1 AND NOT id=$2"
	err = db.DB.QueryRow(sql, payload.Email, userId).Scan(&count)
	if err != nil {
		return res.DbErrorHandler(err, "user", sql, c)
	}
	if count != "0" {
		return res.ApiResponse(false, "User with this email already exists!", nil, c)
	}

	var hashedPasswordToSave string

	if payload.Password == nil {
		sqlQuery := "SELECT password FROM users WHERE id=$1"
		err = db.DB.QueryRow(sqlQuery, userId).Scan(&hashedPasswordToSave)
		if err != nil {
			return res.DbErrorHandler(err, "user", sqlQuery, c)
		}
	} else {
		newHashedBytes, bErr := bcrypt.GenerateFromPassword([]byte(*(payload.Password)), 10)
		if bErr != nil {
			return res.InternalErrorHandler(bErr, "Hashing error!", c)
		}
		hashedPasswordToSave = string(newHashedBytes)
	}

	sql = "UPDATE users SET name = $1,email=$2,password=$3,role=$4 WHERE id=$5 "

	_, err = db.DB.Exec(sql, payload.Name, payload.Email, string(hashedPasswordToSave), payload.Role, userId)
	if err != nil {
		return res.DbErrorHandler(err, "user", sql, c)
	}

	return res.ApiResponse(true, "Successfully updated user", nil, c)
}
