package routes

import (
	"backgo/database"
	"backgo/models"
	"backgo/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ObtenerAreas retorna todas las áreas, activas e inactivas, ordenadas alfabéticamente.
func ObtenerAreas(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre, estatus FROM area ORDER BY nombre ASC")
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var areas []models.Area
	for rows.Next() {
		var area models.Area
		if err := rows.Scan(&area.ID, &area.Nombre, &area.Estatus); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		areas = append(areas, area)
	}
	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.RespuestaJSON(c, http.StatusOK, "Áreas obtenidas exitosamente", areas)
}

// ObtenerAreasActivos retorna solo las áreas activas, útil para formularios de selección.
func ObtenerAreasActivos(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre FROM area WHERE estatus IS TRUE ORDER BY nombre ASC")
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var areas []models.Area
	for rows.Next() {
		var area models.Area
		if err := rows.Scan(&area.ID, &area.Nombre); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		areas = append(areas, area)
	}
	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.RespuestaJSON(c, http.StatusOK, "Áreas activas obtenidas exitosamente", areas)
}

// CrearArea registra una nueva área y deja traza en logs_area.
// Utiliza transacción para garantizar atomicidad entre inserción y log.
func CrearArea(c *gin.Context) {
	adminID, existe := c.Get("usuario_id")
	if !existe {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}
	usuarioAdminID, ok := adminID.(int)
	if !ok {
		utils.RespuestaJSON(c, http.StatusInternalServerError, "Error de tipo de dato")
		return
	}

	var area models.Area
	tx, err := database.DB.Begin()
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer func() {
		// Rollback en caso de panic o error.
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
		}
	}()

	if err := c.ShouldBindJSON(&area); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, "Los datos proporcionados no son válidos.")
		return
	}

	query := "INSERT INTO area (nombre) VALUES ($1) RETURNING id"
	err = tx.QueryRow(query, area.Nombre).Scan(&area.ID)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Log de auditoría para trazabilidad de cambios.
	queryLog := "INSERT INTO logs_area (area_id, usuario_id, accion) VALUES ($1, $2, 'Registro de nueva área en el sistema.')"
	_, err = tx.Exec(queryLog, area.ID, usuarioAdminID)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	err = tx.Commit()
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.RespuestaJSON(c, http.StatusCreated, "Departamento creado exitosamente.")
}

// ObtenerAreaPorID retorna los datos de un área específica por su ID.
func ObtenerAreaPorID(c *gin.Context) {
	id := c.Param("id")
	row := database.DB.QueryRow("SELECT id, nombre, estatus FROM area WHERE id = $1", id)

	var area models.Area
	if err := row.Scan(&area.ID, &area.Nombre, &area.Estatus); err != nil {
		utils.RespuestaJSON(c, http.StatusNotFound, "Área no encontrada.")
		return
	}
	utils.RespuestaJSON(c, http.StatusOK, "Área obtenida corretamente.", area)
}

// ActualizarArea permite modificar nombre y/o estatus de un área.
// Registra logs de auditoría por cada cambio realizado.
// Utiliza transacción para garantizar consistencia.
func ActualizarArea(c *gin.Context) {
	adminID, existe := c.Get("usuario_id")
	if !existe {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}
	usuarioAdminID, ok := adminID.(int)
	if !ok {
		utils.RespuestaJSON(c, http.StatusInternalServerError, "Error de tipo de dato")
		return
	}

	var areaNuevo models.Area
	if err := c.BindJSON(&areaNuevo); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, "Datos inválidos")
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	var areaActual models.Area
	query := "SELECT nombre, estatus FROM area WHERE id = $1"
	err = tx.QueryRow(query, areaNuevo.ID).Scan(&areaActual.Nombre, &areaActual.Estatus)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Si el nombre cambió, actualiza y registra log.
	if areaNuevo.Nombre != areaActual.Nombre {
		updateQueryNombre := "UPDATE area SET nombre = $1, actualizado_en = NOW() WHERE id = $2"
		_, err = tx.Exec(updateQueryNombre, areaNuevo.Nombre, areaNuevo.ID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		insertLogNombre := "INSERT INTO logs_area (area_id, usuario_id, accion) VALUES ($1, $2, 'Se modificó el nombre del área.')"
		_, err = tx.Exec(insertLogNombre, areaNuevo.ID, usuarioAdminID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	// Si el estatus cambió, actualiza y registra log.
	if areaNuevo.Estatus != areaActual.Estatus {
		updateQueryEstatus := "UPDATE area SET estatus = $1, actualizado_en = NOW() WHERE id = $2"
		_, err = tx.Exec(updateQueryEstatus, areaNuevo.Estatus, areaNuevo.ID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		insertLogEstatus := "INSERT INTO logs_area (area_id, usuario_id, accion) VALUES ($1, $2, 'Se modificó el estatus del área.')"
		_, err = tx.Exec(insertLogEstatus, areaNuevo.ID, usuarioAdminID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	if err = tx.Commit(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	utils.RespuestaJSON(c, http.StatusOK, "Departamento actualizado correctamente.")
}
