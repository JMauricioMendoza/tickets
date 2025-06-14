package routes

import (
	"backgo/database"
	"backgo/models"
	"backgo/utils"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
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

func ObtenerTicketPorID(c *gin.Context) {
	id := c.Param("id")
	row := database.DB.QueryRow(`
		SELECT
			t.id,
			t.creado_por,
			t.area_id,
			a.nombre,
			t.tipo_ticket_id,
			t.estatus_ticket_id,
			t.descripcion
		FROM
			ticket t
			INNER JOIN area a ON a.id = t.area_id
		WHERE
			t.id = $1
	`, id)

	var ticket models.Ticket
	if err := row.Scan(&ticket.ID, &ticket.CreadoPor, &ticket.AreaID, &ticket.AreaNombre, &ticket.TipoTicketID, &ticket.EstatusTicketID, &ticket.Descripcion); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Ticket no encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": http.StatusOK, "ticket": ticket})
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

	queryTipoTicket := "SELECT nombre FROM tipo_ticket WHERE id = $1"
	var tipoTicketNombre string
	err = database.DB.QueryRow(queryTipoTicket, ticket.TipoTicketID).Scan(&tipoTicketNombre)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	err = godotenv.Load()
	if err != nil {
		log.Fatal("Error cargando el archivo .env")
	}

	token := os.Getenv("TELEGRAM_TOKEN")
	chatIDStr := os.Getenv("TELEGRAM_CHAT_ID")

	chatID, err := strconv.ParseInt(chatIDStr, 10, 64)
	if err != nil {
		log.Println("Error convirtiendo chatID a int64:", err.Error())
	}

	message := fmt.Sprintf("🎫 *Nuevo Ticket*\n*ID:* %d\n*Área de soporte:* %s\n*Descripción:* %s", ticket.ID, tipoTicketNombre, ticket.Descripcion)
	err = utils.EnviarMensajeTelegram(token, chatID, message)
	if err != nil {
		log.Println("Error enviando mensaje a Telegram:", err.Error())
	}

	c.JSON(http.StatusCreated, gin.H{
		"status":  http.StatusCreated,
		"mensaje": fmt.Sprintf("Su ticket ha sido creado exitosamente. Número de seguimiento: #%d", ticket.ID),
	})
}

func ActualizarTicket(c *gin.Context) {
	usuarioID, existe := c.Get("usuario_id")
	if !existe {
		c.JSON(http.StatusUnauthorized, gin.H{"status": http.StatusUnauthorized, "mensaje": "Usuario no autenticado"})
		return
	}

	usuid, ok := usuarioID.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": "Error de tipo de dato"})
		return
	}

	var ticketNuevo models.Ticket
	if err := c.BindJSON(&ticketNuevo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": http.StatusBadRequest, "mensaje": "Datos inválidos"})
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

	var ticketActual models.Ticket
	query := "SELECT tipo_ticket_id, estatus_ticket_id FROM ticket WHERE id = $1"
	err = tx.QueryRow(query, ticketNuevo.ID).Scan(&ticketActual.TipoTicketID, &ticketActual.EstatusTicketID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	var validoActualiza bool
	queryPermiso := `
		SELECT
			true 
		FROM
			usuario_tipo_ticket 
		WHERE
			usuario_id = $1
			AND tipo_ticket_id = $2
			AND estatus = true 
		LIMIT 1
	`

	err = tx.QueryRow(queryPermiso, usuid, ticketActual.TipoTicketID).Scan(&validoActualiza)
	if err == sql.ErrNoRows || !validoActualiza {
		c.JSON(http.StatusForbidden, gin.H{"status": http.StatusForbidden, "mensaje": "No tienes permisos para modificar este tipo de ticket"})
		return
	} else if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	if ticketNuevo.TipoTicketID != ticketActual.TipoTicketID {
		updateQueryTipo := "UPDATE ticket SET tipo_ticket_id = $1 WHERE id = $2"
		_, err = tx.Exec(updateQueryTipo, ticketNuevo.TipoTicketID, ticketNuevo.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": ticketNuevo.TipoTicketID})
			return
		}

		insertLogTipo := "INSERT INTO logs_ticket (ticket_id, usuario_id, accion) VALUES ($1, $2, 'Tipo de ticket actualizado')"
		_, err = tx.Exec(insertLogTipo, ticketNuevo.ID, usuid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
			return
		}
	}

	if ticketNuevo.EstatusTicketID != ticketActual.EstatusTicketID {
		updateQueryEstatus := "UPDATE ticket SET estatus_ticket_id = $1 WHERE id = $2"
		_, err = tx.Exec(updateQueryEstatus, ticketNuevo.EstatusTicketID, ticketNuevo.ID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
			return
		}

		insertLogEstatus := "INSERT INTO logs_ticket (ticket_id, usuario_id, accion) VALUES ($1, $2, 'Estatus de ticket actualizado')"
		_, err = tx.Exec(insertLogEstatus, ticketNuevo.ID, usuid)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
			return
		}
	}

	if err = tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": http.StatusOK, "mensaje": "Ticket actualizado correctamente"})
}
