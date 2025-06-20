package models

type EstatusTicket struct {
	ID      int    `json:"id"`
	Nombre  string `json:"nombre"`
	Estatus bool   `json:"estatus"`
}
