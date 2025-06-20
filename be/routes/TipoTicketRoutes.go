package routes

import (
	"backgo/database"
	"backgo/models"
	"backgo/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ObtenerTipoTicketsActivos(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre FROM tipo_ticket WHERE estatus IS TRUE")
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	defer rows.Close()
	var tipoTickets []models.TipoTicket
	for rows.Next() {
		var tipoTicket models.TipoTicket
		if err := rows.Scan(&tipoTicket.ID, &tipoTicket.Nombre); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		tipoTickets = append(tipoTickets, tipoTicket)
	}

	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Tipo de tickets obtenidos correctamente.", tipoTickets)
}

func ObtenerTipoTickets(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre, estatus FROM tipo_ticket ORDER BY nombre ASC")
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	defer rows.Close()
	var tipoTickets []models.TipoTicket
	for rows.Next() {
		var tipoTicket models.TipoTicket
		if err := rows.Scan(&tipoTicket.ID, &tipoTicket.Nombre, &tipoTicket.Estatus); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		tipoTickets = append(tipoTickets, tipoTicket)
	}

	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Tipos de ticket obtenidos exitosamente", tipoTickets)
}

func ObtenerTipoTicketPorID(c *gin.Context) {
	id := c.Param("id")
	row := database.DB.QueryRow("SELECT id, nombre, estatus FROM tipo_ticket WHERE id = $1", id)

	var tipoTicket models.TipoTicket
	if err := row.Scan(&tipoTicket.ID, &tipoTicket.Nombre, &tipoTicket.Estatus); err != nil {
		utils.RespuestaJSON(c, http.StatusNotFound, "Tipo de ticket no encontrad0.")
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Tipo de ticket obtenido corretamente.", tipoTicket)
}

func ActualizarTipoTicket(c *gin.Context) {
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

	var tipoTicketNuevo models.TipoTicket
	if err := c.BindJSON(&tipoTicketNuevo); err != nil {
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

	var tipoTicketActual models.TipoTicket
	query := "SELECT nombre, estatus FROM tipo_ticket WHERE id = $1"
	err = tx.QueryRow(query, tipoTicketNuevo.ID).Scan(&tipoTicketActual.Nombre, &tipoTicketActual.Estatus)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	if tipoTicketNuevo.Nombre != tipoTicketActual.Nombre {
		updateQueryNombre := "UPDATE tipo_ticket SET nombre = $1, actualizado_en = NOW() WHERE id = $2"
		_, err = tx.Exec(updateQueryNombre, tipoTicketNuevo.Nombre, tipoTicketNuevo.ID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}

		insertLogNombre := "INSERT INTO logs_tipo_ticket (tipo_ticket_id, usuario_id, accion) VALUES ($1, $2, 'Se modificó el nombre del tipo de ticket.')"
		_, err = tx.Exec(insertLogNombre, tipoTicketNuevo.ID, usuarioAdminID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	if tipoTicketNuevo.Estatus != tipoTicketActual.Estatus {
		updateQueryEstatus := "UPDATE tipo_ticket SET estatus = $1, actualizado_en = NOW() WHERE id = $2"
		_, err = tx.Exec(updateQueryEstatus, tipoTicketNuevo.Estatus, tipoTicketNuevo.ID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}

		insertLogEstatus := "INSERT INTO logs_tipo_ticket (tipo_ticket_id, usuario_id, accion) VALUES ($1, $2, 'Se modificó el estatus del tipo de ticket.')"
		_, err = tx.Exec(insertLogEstatus, tipoTicketNuevo.ID, usuarioAdminID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	if err = tx.Commit(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Área de soporte actualizada correctamente.")
}

func CrearTipoTicket(c *gin.Context) {
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

	var tipoTicket models.TipoTicket

	tx, err := database.DB.Begin()
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
		}
	}()

	if err := c.ShouldBindJSON(&tipoTicket); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, "Los datos proporcionados no son válidos.")
		return
	}

	query := "INSERT INTO tipo_ticket (nombre) VALUES ($1) RETURNING id"
	err = tx.QueryRow(query, tipoTicket.Nombre).Scan(&tipoTicket.ID)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	queryLog := "INSERT INTO logs_tipo_ticket (tipo_ticket_id, usuario_id, accion) VALUES ($1, $2, 'Registro de nuevo tipo de ticket en el sistema.')"
	_, err = tx.Exec(queryLog, tipoTicket.ID, usuarioAdminID)
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

	utils.RespuestaJSON(c, http.StatusCreated, "Área de soporte creada exitosamente.")
}
