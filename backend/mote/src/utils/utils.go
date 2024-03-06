package utils

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"log"
	"net/http"
	"time"

	"mote/src/config"

	jose "github.com/go-jose/go-jose/v4"
	"github.com/go-jose/go-jose/v4/jwt"
	"github.com/gorilla/securecookie"
)

var (
	secureCookie = securecookie.New([]byte("your-hash-key"), []byte("your-block-key"))
)

//TODO: tok.claims is nil here
func ValidateJwt(jwtStr string) (*jwt.JSONWebToken, *jwt.Claims, error) {
	tok, err := jwt.ParseSigned(jwtStr, []jose.SignatureAlgorithm{jose.SignatureAlgorithm(config.JWT_ALG)})
	if err != nil {
		return nil, nil, err
	}
	log.Println("tok:", tok)

	key := []byte(config.AUTH_JWT_PUBLIC_KEY)

	claims := &jwt.Claims{
		Issuer:   "shawakash",
		Audience: jwt.Audience{"payBox"},
	}
	err = tok.Claims(key, claims)
	if err != nil {
		log.Println("Failed to parse claims:", err)
		return nil, nil, err
	}
	log.Println("claims:", claims)
	log.Println("tok:", tok)

	return tok, claims, nil
}

func ClearCookie(w http.ResponseWriter, cookieName string) {
	http.SetCookie(w, &http.Cookie{
		Name:   cookieName,
		MaxAge: -1,
	})
}

func SetJWTCookie(w http.ResponseWriter, userId string) (string, error) {
	claims := &jwt.Claims{
		Subject:  userId,
		Issuer:   "shawakash",
		Audience: jwt.Audience{"payBox"},
		IssuedAt: jwt.NewNumericDate(time.Now()),
	}
	key := []byte(config.AUTH_JWT_PRIVATE_KEY)
	signer, err := jose.NewSigner(jose.SigningKey{Algorithm: jose.SignatureAlgorithm(config.JWT_ALG), Key: key}, nil)
	if err != nil {
		return "", err
	}

	jwtStr, err := jwt.Signed(signer).Claims(claims).Serialize()
	if err != nil {
		return "", err
	}

	encoded, err := secureCookie.Encode("jwt", jwtStr)
	if err != nil {
		return "", err
	}

	http.SetCookie(w, &http.Cookie{
		Name:     "jwt",
		Value:    encoded,
		Secure:   true,
		HttpOnly: true,
		Path:     "/",
		MaxAge:   60 * 60 * 24 * 365, // approx 1 year
	})
	log.Println("jwtStr:", jwtStr)

	return jwtStr, nil
}

func ImportSPKI(publicKeyPem string) (*rsa.PublicKey, error) {
	block, _ := pem.Decode([]byte(publicKeyPem))
	if block == nil {
		return nil, errors.New("failed to parse PEM block containing the public key")
	}

	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	rsaPub, ok := pub.(*rsa.PublicKey)
	if !ok {
		return nil, errors.New("public key is not of type RSA")
	}

	return rsaPub, nil
}
