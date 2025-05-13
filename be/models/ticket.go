package models

import "time"

type Ticket struct {
	ID                  int       `json:"id"`
	TipoTicketID        int       `json:"tipo_ticket_id"`
	TipoTicketNombre    string    `json:"tipo_ticket_nombre"`
	Descripcion         string    `json:"descripcion"`
	EstatusTicketID     int       `json:"estatus_ticket_id"`
	EstatusTicketNombre string    `json:"estatus_ticket_nombre"`
	CreadoEn            time.Time `json:"creado_en"`
	AreaID              int       `json:"area_id"`
	AreaNombre          string    `json:"area_nombre"`
	CreadoPor           string    `json:"creado_por"`
}
