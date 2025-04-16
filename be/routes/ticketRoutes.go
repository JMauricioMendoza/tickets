package routes

import (
	"backgo/database"
	"backgo/models"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ObtenerTickets(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, usuario_id, tipo_ticket_id, estatus_ticket_id, creado_en FROM ticket")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var tickets []models.Ticket
	for rows.Next() {
		var ticket models.Ticket
		if err := rows.Scan(&ticket.ID, &ticket.UsuarioID, &ticket.TipoTicketID, &ticket.EstatusTicketID, &ticket.CreadoEn); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		tickets = append(tickets, ticket)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error en la consulta"})
		return
	}

	c.JSON(http.StatusOK, tickets)
}

func ObtenerTicketsPorUsuario(c *gin.Context) {
	UsuarioID := c.Param("usuario_id")
	rows, err := database.DB.Query("SELECT id, usuario_id, tipo_ticket_id, estatus_ticket_id, creado_en FROM ticket WHERE usuario_id = $1", UsuarioID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}
	defer rows.Close()
	var tickets []models.Ticket
	for rows.Next() {
		var ticket models.Ticket
		if err := rows.Scan(&ticket.ID, &ticket.UsuarioID, &ticket.TipoTicketID, &ticket.EstatusTicketID, &ticket.CreadoEn); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
			return
		}
		tickets = append(tickets, ticket)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": http.StatusOK, "tickets": tickets})
}

func ObtenerTicketPorID(c *gin.Context) {
	id := c.Param("id")
	row := database.DB.QueryRow("SELECT id, usuario_id, ubicacion, tipo_ticket_id, descripcion, estatus_ticket_id, creado_en FROM ticket WHERE id = $1", id)

	var ticket models.Ticket
	if err := row.Scan(&ticket.ID, &ticket.UsuarioID, &ticket.Ubicacion, &ticket.TipoTicketID, &ticket.Descripcion, &ticket.EstatusTicketID, &ticket.CreadoEn); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket no encontrado"})
		return
	}

	c.JSON(http.StatusOK, ticket)
}

func CrearTicket(c *gin.Context) {
	var ticket models.Ticket
	if err := c.BindJSON(&ticket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": http.StatusBadRequest, "mensaje": err.Error()})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	query := "INSERT INTO ticket (usuario_id, ubicacion, tipo_ticket_id, descripcion) VALUES ($1, $2, $3, $4) RETURNING id, creado_en"
	err = tx.QueryRow(query, ticket.UsuarioID, ticket.Ubicacion, ticket.TipoTicketID, ticket.Descripcion).Scan(&ticket.ID, &ticket.CreadoEn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	queryLog := "INSERT INTO logs_ticket (ticket_id, usuario_id, accion) VALUES ($1, $2, 'Ticket creado')"
	_, err = tx.Exec(queryLog, ticket.ID, ticket.UsuarioID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	err = tx.Commit()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": http.StatusCreated, "ticket": ticket})
}

func ActualizarEstatusTicket(c *gin.Context) {
	usuarioid := c.Param("usuario_id")
	var ticket models.Ticket
	if err := c.BindJSON(&ticket); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo iniciar la transacción"})
		return
	}

	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	var estatus int
	queryEstatus := "SELECT estatus_ticket_id FROM ticket WHERE id = $1"
	err = tx.QueryRow(queryEstatus, ticket.ID).Scan(&estatus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if estatus == 3 || estatus == 4 {
		c.JSON(http.StatusForbidden, gin.H{"error": "Estatus no válido para cambios"})
		return
	}

	query := "UPDATE ticket SET estatus_ticket_id = $1, actualizado_en = NOW() WHERE id = $2"
	_, err = tx.Exec(query, ticket.EstatusTicketID, ticket.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var nombreEstatus string
	queryNombre := "SELECT nombre FROM estatus_ticket WHERE id = $1"
	err = tx.QueryRow(queryNombre, ticket.EstatusTicketID).Scan(&nombreEstatus)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	accion := fmt.Sprintf("Ticket actualizado a estatus '%s'", nombreEstatus)
	queryLog := "INSERT INTO logs_ticket (ticket_id, usuario_id, accion) VALUES ($1, $2, $3)"
	_, err = tx.Exec(queryLog, ticket.ID, usuarioid, accion)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err = tx.Commit()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "No se pudo completar la transacción"})
		return
	}

	c.JSON(http.StatusOK, ticket)
}
