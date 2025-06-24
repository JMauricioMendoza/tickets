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

// ObtenerTickets retorna los tickets asociados a los tipos permitidos para el usuario autenticado.
// Utiliza joins para enriquecer la respuesta y restringe resultados según permisos.
func ObtenerTickets(c *gin.Context) {
	usuarioID, existe := c.Get("usuario_id")
	if !existe {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	id, ok := usuarioID.(int)
	if !ok {
		utils.RespuestaJSON(c, http.StatusInternalServerError, "Error de tipo de dato.")
		return
	}

	// Obtiene los tipos de ticket permitidos para el usuario.
	rowsTipoTicket, err := database.DB.Query("SELECT tipo_ticket_id FROM usuario_tipo_ticket WHERE estatus IS TRUE AND usuario_id = $1", id)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rowsTipoTicket.Close()
	var tipoTicketIDs []int
	for rowsTipoTicket.Next() {
		var tipoTicketID int
		err := rowsTipoTicket.Scan(&tipoTicketID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		tipoTicketIDs = append(tipoTicketIDs, tipoTicketID)
	}
	// Construye placeholders y argumentos para la consulta IN dinámica.
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
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	var tickets []models.Ticket
	for rows.Next() {
		var ticket models.Ticket
		if err := rows.Scan(&ticket.ID, &ticket.Descripcion, &ticket.TipoTicketID, &ticket.TipoTicketNombre, &ticket.EstatusTicketID, &ticket.EstatusTicketNombre, &ticket.CreadoEn, &ticket.CreadoPor, &ticket.AreaNombre); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		tickets = append(tickets, ticket)
	}

	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Tickets obtenidos correctamente.", tickets)
}

// ObtenerTicketPorID retorna la información detallada de un ticket específico por su ID.
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
		utils.RespuestaJSON(c, http.StatusNotFound, "Ticket no encontrado.")
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Ticket obtenido corretamente.", ticket)
}

// CrearTicket registra un nuevo ticket y notifica por Telegram.
// Utiliza transacción para garantizar atomicidad y registra log de auditoría.
func CrearTicket(c *gin.Context) {
	var ticket models.Ticket
	if err := c.BindJSON(&ticket); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, "Datos inválidos.")
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

	query := "INSERT INTO ticket (tipo_ticket_id, descripcion, creado_por, area_id) VALUES ($1, $2, $3, $4) RETURNING id, creado_en"
	err = tx.QueryRow(query, ticket.TipoTicketID, ticket.Descripcion, ticket.CreadoPor, ticket.AreaID).Scan(&ticket.ID, &ticket.CreadoEn)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	queryLog := "INSERT INTO logs_ticket (ticket_id, accion) VALUES ($1, 'Ticket creado')"
	_, err = tx.Exec(queryLog, ticket.ID)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	err = tx.Commit()
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Obtiene información adicional para la notificación.
	queryTipoTicket := "SELECT nombre FROM tipo_ticket WHERE id = $1"
	var tipoTicketNombre string
	err = database.DB.QueryRow(queryTipoTicket, ticket.TipoTicketID).Scan(&tipoTicketNombre)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	queryArea := "SELECT nombre FROM area WHERE id = $1"
	var areaNombre string
	err = database.DB.QueryRow(queryArea, ticket.AreaID).Scan(&areaNombre)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Carga variables de entorno para Telegram.
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

	// Formato de mensaje para Telegram.
	message := fmt.Sprintf(
		"🎫 *Nuevo Ticket*\n*%s*\n%s\n*ID:* %d\n*Área de soporte:* %s\n*Descripción:* %s",
		ticket.CreadoPor, areaNombre, ticket.ID, tipoTicketNombre, ticket.Descripcion,
	)

	// Notifica por Telegram usando utilería centralizada.
	err = utils.EnviarMensajeTelegram(token, chatID, message)
	if err != nil {
		log.Println("Error enviando mensaje a Telegram:", err.Error())
	}

	utils.RespuestaJSON(
		c,
		http.StatusCreated,
		fmt.Sprintf("Su ticket ha sido creado exitosamente. Número de seguimiento: #%d.", ticket.ID),
	)
}

// ActualizarTicket permite modificar tipo y/o estatus de un ticket.
// Valida permisos del usuario sobre el tipo de ticket y registra logs de auditoría.
// Utiliza transacción para garantizar consistencia.
func ActualizarTicket(c *gin.Context) {
	usuarioID, existe := c.Get("usuario_id")
	if !existe {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "Usuario no autenticado.")
		return
	}

	usuid, ok := usuarioID.(int)
	if !ok {
		utils.RespuestaJSON(c, http.StatusInternalServerError, "Error de tipo de dato.")
		return
	}

	var ticketNuevo models.Ticket
	if err := c.BindJSON(&ticketNuevo); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, "Datos inválidos.")
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

	var ticketActual models.Ticket
	query := "SELECT tipo_ticket_id, estatus_ticket_id FROM ticket WHERE id = $1"
	err = tx.QueryRow(query, ticketNuevo.ID).Scan(&ticketActual.TipoTicketID, &ticketActual.EstatusTicketID)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Valida que el usuario tenga permiso sobre el tipo de ticket actual.
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
		utils.RespuestaJSON(c, http.StatusForbidden, "No tienes permisos para modificar este tipo de ticket")
		return
	} else if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Si el tipo de ticket cambió, actualiza y registra log.
	if ticketNuevo.TipoTicketID != ticketActual.TipoTicketID {
		updateQueryTipo := "UPDATE ticket SET tipo_ticket_id = $1, actualizado_en = NOW() WHERE id = $2"
		_, err = tx.Exec(updateQueryTipo, ticketNuevo.TipoTicketID, ticketNuevo.ID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}

		insertLogTipo := "INSERT INTO logs_ticket (ticket_id, usuario_id, accion) VALUES ($1, $2, 'Tipo de ticket actualizado')"
		_, err = tx.Exec(insertLogTipo, ticketNuevo.ID, usuid)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	// Si el estatus cambió, actualiza y registra log.
	if ticketNuevo.EstatusTicketID != ticketActual.EstatusTicketID {
		updateQueryEstatus := "UPDATE ticket SET estatus_ticket_id = $1, actualizado_en = NOW() WHERE id = $2"
		_, err = tx.Exec(updateQueryEstatus, ticketNuevo.EstatusTicketID, ticketNuevo.ID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}

		insertLogEstatus := "INSERT INTO logs_ticket (ticket_id, usuario_id, accion) VALUES ($1, $2, 'Estatus de ticket actualizado')"
		_, err = tx.Exec(insertLogEstatus, ticketNuevo.ID, usuid)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	if err = tx.Commit(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Ticket actualizado correctamente")
}
