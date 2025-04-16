package models

import (
	"time"
)

type Sesion struct {
	UsuarioID string    `json:"usuario_id"`
	Token     string    `json:"token"`
	ExpiraEn  time.Time `json:"expira_en"`
	CreadoEn  time.Time `json:"creado_en"`
}
