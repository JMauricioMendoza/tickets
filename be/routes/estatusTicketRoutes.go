package routes

import (
	"backgo/database"
	"backgo/models"
	"backgo/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ObtenerEstatusTickets(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre, estatus FROM estatus_ticket ORDER BY nombre ASC")
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	defer rows.Close()
	var estatusTickets []models.EstatusTicket
	for rows.Next() {
		var estatusTicket models.EstatusTicket
		if err := rows.Scan(&estatusTicket.ID, &estatusTicket.Nombre, &estatusTicket.Estatus); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		estatusTickets = append(estatusTickets, estatusTicket)
	}

	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Estatus de ticket obtenidos exitosamente", estatusTickets)
}

func ObtenerEstatusTicketsActivos(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre FROM estatus_ticket WHERE estatus IS TRUE ORDER BY nombre ASC")
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	defer rows.Close()
	var estatusTickets []models.EstatusTicket
	for rows.Next() {
		var estatusTicket models.EstatusTicket
		if err := rows.Scan(&estatusTicket.ID, &estatusTicket.Nombre); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		estatusTickets = append(estatusTickets, estatusTicket)
	}

	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Estatus de ticket obtenidos exitosamente", estatusTickets)
}

func ObtenerEstatusTicketsPorID(c *gin.Context) {
	id := c.Param("id")
	row := database.DB.QueryRow("SELECT id, nombre, estatus FROM estatus_ticket WHERE id = $1", id)

	var estatusTicket models.EstatusTicket
	if err := row.Scan(&estatusTicket.ID, &estatusTicket.Nombre, &estatusTicket.Estatus); err != nil {
		utils.RespuestaJSON(c, http.StatusNotFound, "Estatus de ticket no encontrado.")
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Estatus de ticket obtenido corretamente.", estatusTicket)
}

func ActualizarEstatusTicket(c *gin.Context) {
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

	var estatusTicketNuevo models.EstatusTicket
	if err := c.BindJSON(&estatusTicketNuevo); err != nil {
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

	var estatusTicketActual models.EstatusTicket
	query := "SELECT nombre, estatus FROM estatus_ticket WHERE id = $1"
	err = tx.QueryRow(query, estatusTicketNuevo.ID).Scan(&estatusTicketActual.Nombre, &estatusTicketActual.Estatus)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	if estatusTicketNuevo.Nombre != estatusTicketActual.Nombre {
		updateQueryNombre := "UPDATE estatus_ticket SET nombre = $1, actualizado_en = NOW() WHERE id = $2"
		_, err = tx.Exec(updateQueryNombre, estatusTicketNuevo.Nombre, estatusTicketNuevo.ID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}

		insertLogNombre := "INSERT INTO logs_estatus_ticket (estatus_ticket_id, usuario_id, accion) VALUES ($1, $2, 'Se modificó el nombre del estatus de ticket.')"
		_, err = tx.Exec(insertLogNombre, estatusTicketNuevo.ID, usuarioAdminID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	if estatusTicketNuevo.Estatus != estatusTicketActual.Estatus {
		updateQueryEstatus := "UPDATE estatus_ticket SET estatus = $1, actualizado_en = NOW() WHERE id = $2"
		_, err = tx.Exec(updateQueryEstatus, estatusTicketNuevo.Estatus, estatusTicketNuevo.ID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}

		insertLogEstatus := "INSERT INTO logs_estatus_ticket (estatus_ticket_id, usuario_id, accion) VALUES ($1, $2, 'Se modificó el estatus del estatus de ticket.')"
		_, err = tx.Exec(insertLogEstatus, estatusTicketNuevo.ID, usuarioAdminID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	if err = tx.Commit(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Estatus de ticket actualizado correctamente.")
}

func CrearEstatusTicket(c *gin.Context) {
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

	var estatusTicket models.EstatusTicket

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

	if err := c.ShouldBindJSON(&estatusTicket); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, "Los datos proporcionados no son válidos.")
		return
	}

	query := "INSERT INTO estatus_ticket (nombre) VALUES ($1) RETURNING id"
	err = tx.QueryRow(query, estatusTicket.Nombre).Scan(&estatusTicket.ID)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	queryLog := "INSERT INTO logs_estatus_ticket (estatus_ticket_id, usuario_id, accion) VALUES ($1, $2, 'Registro de nuevo estatus de ticket en el sistema.')"
	_, err = tx.Exec(queryLog, estatusTicket.ID, usuarioAdminID)
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

	utils.RespuestaJSON(c, http.StatusCreated, "Estatus de ticket creado exitosamente.")
}
