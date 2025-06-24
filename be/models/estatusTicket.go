package models

// EstatusTicket representa los posibles estados de un ticket en el sistema.
// Se utiliza para mapear registros de la tabla 'estatus_ticket' en la base de datos.
type EstatusTicket struct {
	ID      int    `json:"id"`      // Identificador único del estatus.
	Nombre  string `json:"nombre"`  // Nombre descriptivo del estatus.
	Estatus bool   `json:"estatus"` // Indica si el estatus está activo (true) o inactivo (false).
}
