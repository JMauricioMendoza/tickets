package models

import (
	"time"
)

// Sesion modela una sesión activa de usuario en el sistema.
// Permite mapear registros de la tabla 'sesion' y controlar autenticación y expiración.
type Sesion struct {
	UsuarioID string    `json:"usuario_id"` // Identificador del usuario asociado a la sesión.
	Token     string    `json:"token"`      // Token único de autenticación para la sesión.
	ExpiraEn  time.Time `json:"expira_en"`  // Fecha y hora de expiración de la sesión.
	CreadoEn  time.Time `json:"creado_en"`  // Timestamp de creación de la sesión.
}
