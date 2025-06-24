package models

import (
	"golang.org/x/crypto/bcrypt"
)

// Usuario modela un usuario del sistema.
// Incluye campos para autenticación y control de acceso.
type Usuario struct {
	ID            int    `json:"id"`
	Nombre        string `json:"nombre"`
	Password      string `json:"password,omitempty"` // Omite el hash en respuestas JSON por seguridad.
	Usuario       string `json:"usuario"`
	Administrador bool   `json:"administrador"`  // Indica si el usuario tiene privilegios de administrador.
	TipoTicketID  []int  `json:"tipo_ticket_id"` // Permite asociar múltiples tipos de ticket al usuario.
}

// HashearPassword genera un hash seguro del password del usuario.
// Utiliza bcrypt con el costo por defecto.
func (u *Usuario) HashearPassword() error {
	hashed, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	u.Password = string(hashed)
	return nil
}

// VerificarPassword compara el password plano con el hash almacenado.
// Retorna true si la contraseña es válida.
func (u *Usuario) VerificarPassword(password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password))
	return err == nil
}
