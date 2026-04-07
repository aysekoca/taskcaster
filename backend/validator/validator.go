package validator

/*
	for using:
	validator.Instance().Validate(payload)
*/

import (
	"fmt"
	"strings"
	"sync"

	"github.com/go-playground/validator/v10"
)

type ErrorResponse struct {
	Error       bool
	FailedField string
	Tag         string
	Value       interface{}
}

type XValidator struct {
	validator *validator.Validate
}

var (
	instance *XValidator
	once     sync.Once
)

func Instance() *XValidator {
	once.Do(func() {
		instance = &XValidator{
			validator: validator.New(),
		}
	})
	return instance
}

func (v *XValidator) Validate(data interface{}) string {
	validationErrors := []ErrorResponse{}

	errs := v.validator.Struct(data)
	if errs != nil {
		for _, err := range errs.(validator.ValidationErrors) {
			var elem ErrorResponse
			elem.FailedField = err.Field()
			elem.Tag = err.Tag()
			elem.Value = err.Value()
			elem.Error = true
			validationErrors = append(validationErrors, elem)
		}
	}

	errMsgs := make([]string, 0)

	for _, err := range validationErrors {
		errMsgs = append(errMsgs, fmt.Sprintf(
			"[%s]: '%v' | Needs to implement '%s'",
			err.FailedField,
			err.Value,
			err.Tag,
		))
	}

	return strings.Join(errMsgs, "\n")
}
