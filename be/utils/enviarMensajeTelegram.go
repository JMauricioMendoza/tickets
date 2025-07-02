package utils

import (
	"backgo/database"
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

// EnviarMensajeTelegram envía un mensaje de texto al chat especificado usando la API de Telegram Bot.
// Utiliza Markdown como parse_mode para permitir formato en el mensaje.
// Retorna error si la petición HTTP falla o la API responde con un status distinto a 200.
func EnviarMensajeTelegram(message string, ticketID int) error {
	token := os.Getenv("TELEGRAM_TOKEN")
	chatIDStr := os.Getenv("TELEGRAM_CHAT_ID")

	chatID, err := strconv.ParseInt(chatIDStr, 10, 64)
	if err != nil {
		log.Println("Error convirtiendo chatID a int64:", err.Error())
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token)

	// Construye el cuerpo de la petición con los parámetros requeridos por la API de Telegram.
	body, err := json.Marshal(map[string]interface{}{
		"chat_id":    chatID,
		"text":       message,
		"parse_mode": "Markdown",
	})
	if err != nil {
		return fmt.Errorf("error al generar el cuerpo JSON: %w", err)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	resp, err := client.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("error al enviar solicitud HTTP: %w", err)
	}
	defer resp.Body.Close()

	// Si la respuesta no es exitosa, retorna el cuerpo de la respuesta para facilitar el debug.
	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("falló al enviar mensaje, status: %s, respuesta: %s", resp.Status, string(bodyBytes))
	}

	// Si el envío fue exitoso y ticketID es válido, actualiza el campo en la base de datos
	if ticketID > 0 {
		_, err := database.DB.Exec(`UPDATE ticket SET telegram_notificado = true WHERE id = $1`, ticketID)
		if err != nil {
			log.Printf("Error actualizando telegram_notificado del ticket %d: %v\n", ticketID, err)
			// No se retorna error porque el mensaje ya fue enviado; solo se reporta.
		}
	}

	return nil
}

// EnviarMensajesPendientes consulta periódicamente los tickets con telegram_notificado = false
// e intenta enviar una notificación de Telegram por cada uno.
// Si el envío es exitoso, actualiza el campo telegram_notificado en la base de datos.
// Se ejecuta esta función en una goroutine al iniciar el backend.
//
// @param db *sql.DB - Conexión activa a la base de datos.
func EnviarMensajesPendientes(db *sql.DB) {
	ticker := time.NewTicker(1 * time.Minute) // Ejecuta el ciclo cada minuto.
	defer ticker.Stop()

	for range ticker.C {
		// Consulta los tickets pendientes de notificación.
		rows, err := db.Query(`SELECT id, tipo_ticket_id, descripcion, creado_por, area_id FROM ticket WHERE telegram_notificado = false`)
		if err != nil {
			log.Printf("Error consultando tickets no notificados: %v\n", err)
			continue
		}

		for rows.Next() {
			var id, tipo_ticket_id, area_id int
			var descripcion, creado_por string

			// Lee los datos del ticket.
			if err := rows.Scan(&id, &tipo_ticket_id, &descripcion, &creado_por, &area_id); err != nil {
				log.Printf("Error escaneando ticket: %v\n", err)
				continue
			}

			var tipoTicketNombre, areaNombre string

			// Obtiene el nombre del tipo de ticket.
			if err := db.QueryRow("SELECT nombre FROM tipo_ticket WHERE id = $1", tipo_ticket_id).Scan(&tipoTicketNombre); err != nil {
				log.Printf("Error obteniendo tipo_ticket: %v\n", err)
				continue
			}

			// Obtiene el nombre del área.
			if err := db.QueryRow("SELECT nombre FROM area WHERE id = $1", area_id).Scan(&areaNombre); err != nil {
				log.Printf("Error obteniendo área: %v\n", err)
				continue
			}

			// Construye el mensaje a enviar por Telegram.
			message := fmt.Sprintf(
				"🎫 *Nuevo Ticket*\n*%s*\n%s\n*ID:* %d\n*Área de soporte:* %s\n*Descripción:* %s",
				creado_por, areaNombre, id, tipoTicketNombre, descripcion,
			)

			// Intenta enviar el mensaje y marca como notificado si es exitoso.
			if err := EnviarMensajeTelegram(message, id); err != nil {
				log.Printf("Error enviando mensaje de Telegram para ticket %d: %v\n", id, err)
			}
		}
		rows.Close()
	}
}
