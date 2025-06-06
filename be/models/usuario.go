package models

import (
	"golang.org/x/crypto/bcrypt"
)

type Usuario struct {
	ID            int    `json:"id"`
	Nombre        string `json:"nombre"`
	Password      string `json:"password,omitempty"`
	Usuario       string `json:"usuario"`
	Administrador bool   `json:"administrador"`
	TipoTicketID  []int  `json:"tipo_ticket_id"`
}

func (u *Usuario) HashearPassword() error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashed)
	return nil
}

func (u *Usuario) VerificarPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
