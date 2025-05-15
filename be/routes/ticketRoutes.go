package routes

import (
	"backgo/database"
	"backgo/models"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func ObtenerTickets(c *gin.Context) {
	usuarioID, existe := c.Get("usuario_id")
	if !existe {
		c.JSON(http.StatusUnauthorized, gin.H{"status": http.StatusUnauthorized, "mensaje": "Usuario no autenticado"})
		return
	}

	id, ok := usuarioID.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": "Error de tipo de dato"})
		return
	}

	rowsTipoTicket, err := database.DB.Query("SELECT tipo_ticket_id FROM usuario_tipo_ticket WHERE estatus IS TRUE AND usuario_id = $1", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}
	defer rowsTipoTicket.Close()
	var tipoTicketIDs []int
	for rowsTipoTicket.Next() {
		var tipoTicketID int
		err := rowsTipoTicket.Scan(&tipoTicketID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
			return
		}
		tipoTicketIDs = append(tipoTicketIDs, tipoTicketID)
	}
	placeholders := []string{}
	args := []interface{}{}
	for i, id := range tipoTicketIDs {
		placeholders = append(placeholders, fmt.Sprintf("$%d", i+1))
		args = append(args, id)
	}

	query := fmt.Sprintf(`
		SELECT
			t.id,
			t.descripcion,
			t.tipo_ticket_id,
			tt.nombre,
			t.estatus_ticket_id,
			et.nombre,
			t.creado_en,
			t.creado_por,
			a.nombre
		FROM 
			ticket t
			INNER JOIN tipo_ticket tt ON tt.id = t.tipo_ticket_id
			INNER JOIN estatus_ticket et ON et.id = t.estatus_ticket_id
			INNER JOIN area a ON a.id = t.area_id
		WHERE
			t.tipo_ticket_id IN (%s)
		ORDER BY
			t.creado_en DESC
	`, strings.Join(placeholders, ","))
	rows, err := database.DB.Query(query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}
	defer rows.Close()

	var tickets []models.Ticket
	for rows.Next() {
		var ticket models.Ticket
		if err := rows.Scan(&ticket.ID, &ticket.Descripcion, &ticket.TipoTicketID, &ticket.TipoTicketNombre, &ticket.EstatusTicketID, &ticket.EstatusTicketNombre, &ticket.CreadoEn, &ticket.CreadoPor, &ticket.AreaNombre); err != nil {
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

func ObtenerTicketsPorUsuario(c *gin.Context) {
	UsuarioID := c.Param("usuario_id")
	rows, err := database.DB.Query(`
		SELECT 
			t.id, 
			t.descripcion, 
			t.tipo_ticket_id, 
			tt.nombre, 
			t.estatus_ticket_id,
			et.nombre,
			t.creado_en
		FROM
			ticket t
			INNER JOIN tipo_ticket tt ON tt.id = t.tipo_ticket_id
			INNER JOIN estatus_ticket et ON et.id = t.estatus_ticket_id
		WHERE
			t.usuario_id = $1
		ORDER BY
			t.creado_en DESC
	`, UsuarioID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}
	defer rows.Close()
	var tickets []models.Ticket
	for rows.Next() {
		var ticket models.Ticket
		if err := rows.Scan(&ticket.ID, &ticket.Descripcion, &ticket.TipoTicketID, &ticket.TipoTicketNombre, &ticket.EstatusTicketID, &ticket.EstatusTicketNombre, &ticket.CreadoEn); err != nil {
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
	row := database.DB.QueryRow("SELECT id, tipo_ticket_id, descripcion, estatus_ticket_id, creado_en FROM ticket WHERE id = $1", id)

	var ticket models.Ticket
	if err := row.Scan(&ticket.ID, &ticket.TipoTicketID, &ticket.Descripcion, &ticket.EstatusTicketID, &ticket.CreadoEn); err != nil {
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

	query := "INSERT INTO ticket (tipo_ticket_id, descripcion, creado_por, area_id) VALUES ($1, $2, $3, $4) RETURNING id, creado_en"
	err = tx.QueryRow(query, ticket.TipoTicketID, ticket.Descripcion, ticket.CreadoPor, ticket.AreaID).Scan(&ticket.ID, &ticket.CreadoEn)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	queryLog := "INSERT INTO logs_ticket (ticket_id, accion) VALUES ($1, 'Ticket creado')"
	_, err = tx.Exec(queryLog, ticket.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	err = tx.Commit()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  http.StatusCreated,
		"mensaje": fmt.Sprintf("Su ticket ha sido creado exitosamente. Número de seguimiento: #%d", ticket.ID),
	})
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
