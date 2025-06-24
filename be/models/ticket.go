package models

import "time"

// Ticket representa un ticket de soporte en el sistema.
// Incluye información de relaciones para evitar múltiples consultas y facilitar la serialización.
type Ticket struct {
	ID                  int       `json:"id"`                    // Identificador único del ticket.
	TipoTicketID        int       `json:"tipo_ticket_id"`        // Relación con el tipo de ticket.
	TipoTicketNombre    string    `json:"tipo_ticket_nombre"`    // Nombre del tipo de ticket (join para respuesta enriquecida).
	Descripcion         string    `json:"descripcion"`           // Descripción detallada del problema.
	EstatusTicketID     int       `json:"estatus_ticket_id"`     // Relación con el estatus del ticket.
	EstatusTicketNombre string    `json:"estatus_ticket_nombre"` // Nombre del estatus (join para respuesta enriquecida).
	CreadoEn            time.Time `json:"creado_en"`             // Timestamp de creación del ticket.
	AreaID              int       `json:"area_id"`               // Relación con el área responsable.
	AreaNombre          string    `json:"area_nombre"`           // Nombre del área (join para respuesta enriquecida).
	CreadoPor           string    `json:"creado_por"`            // Nombre del usuario que creó el ticket.
}
