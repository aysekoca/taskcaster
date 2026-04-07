package token

import (
	"errors"
	"log"
	"strconv"
	"taskcaster/config"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenClaim struct {
	UserId string
	jwt.RegisteredClaims
}

func stringToMultiplier(str string) int {
	strLen := len(str)
	if strLen < 2 {
		return 0
	} else {
		typ := str[strLen-1:]
		num := str[:strLen-1]
		i, err := strconv.Atoi(num)
		if err != nil {
			return 0
		}
		switch typ {
		case "m":
			i *= 1
		case "h":
			i *= 60
		case "d":
			i *= 60 * 24
		default:
			break
		}
		return i
	}
}

/*
which: true for refresh, false for access
*/
func Create(userId string, which bool) (string, error) {
	cfg := config.Instance()
	var jwtValues TokenClaim
	var key string
	if which {
		key = cfg.JWTRefreshKey
		jwtValues = crateClaim(userId, false)
	} else {
		key = cfg.JWTAccessKey
		jwtValues = crateClaim(userId, true)
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwtValues)
	tokenString, err := token.SignedString(([]byte)(key))
	if err != nil {
		log.Println(err)
		return "", errors.New("token cannot be created")
	}
	return tokenString, nil
}

func CreateDuo(userId string) (string, string, error) {
	access, errA := Create(userId, false)
	if errA != nil {
		return "", "", errA
	}
	refresh, errR := Create(userId, true)
	if errR != nil {
		return "", "", errR
	}
	return access, refresh, nil
}

func crateClaim(userId string, which bool) TokenClaim {
	cfg := config.Instance()
	var multiplier int
	if which {
		multiplier = stringToMultiplier(cfg.JWTAccessExp)
	} else {
		multiplier = stringToMultiplier(cfg.JWTRefreshExp)
	}
	return TokenClaim{
		userId,
		jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(multiplier) * time.Minute)),
		},
	}
}

func VerifyToken(tokenString string, which bool) (TokenClaim, error) {
	cfg := config.Instance()
	var jwtKey string
	if which {
		jwtKey = cfg.JWTAccessKey
	} else {
		jwtKey = cfg.JWTRefreshKey
	}
	token, err := jwt.ParseWithClaims(tokenString, &TokenClaim{}, func(token *jwt.Token) (any, error) {
		return []byte(jwtKey), nil
	})
	if err != nil {
		log.Println(err)
		return TokenClaim{}, err
	} else if claim, ok := token.Claims.(*TokenClaim); ok {
		return *claim, nil
	} else {
		log.Println(err)
		return TokenClaim{}, err
	}
}
