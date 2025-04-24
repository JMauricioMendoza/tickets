package models

import "time"

type Ticket struct {
	ID                  int       `json:"id"`
	UsuarioID           int       `json:"usuario_id"`
	Ubicacion           string    `json:"ubicacion"`
	TipoTicketID        int       `json:"tipo_ticket_id"`
	TipoTicketNombre    string    `json:"tipo_ticket_nombre"`
	Descripcion         string    `json:"descripcion"`
	EstatusTicketID     int       `json:"estatus_ticket_id"`
	EstatusTicketNombre string    `json:"estatus_ticket_nombre"`
	CreadoEn            time.Time `json:"creado_en"`
}
