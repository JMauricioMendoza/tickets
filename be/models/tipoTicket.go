package models

// TipoTicket representa una categoría de ticket de soporte.
// Se utiliza para mapear registros de la tabla 'tipo_ticket' en la base de datos.
type TipoTicket struct {
	ID      int    `json:"id"`      // Identificador único del tipo de ticket.
	Nombre  string `json:"nombre"`  // Nombre descriptivo del tipo de ticket.
	Estatus bool   `json:"estatus"` // Indica si el tipo está activo (true) o inactivo (false).
}
