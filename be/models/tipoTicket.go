package models

type TipoTicket struct {
	ID      int    `json:"id"`
	Nombre  string `json:"nombre"`
	Estatus bool   `json:"estatus"`
}
