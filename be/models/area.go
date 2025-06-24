package models

// Area representa una entidad de área funcional dentro del sistema.
// Se utiliza para mapear registros de la tabla 'area' en la base de datos.
type Area struct {
	ID      int    `json:"id"`      // Identificador único del área.
	Nombre  string `json:"nombre"`  // Nombre descriptivo del área.
	Estatus bool   `json:"estatus"` // Indica si el área está activa (true) o inactiva (false).
}
