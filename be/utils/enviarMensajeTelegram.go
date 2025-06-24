package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// EnviarMensajeTelegram envía un mensaje de texto al chat especificado usando la API de Telegram Bot.
// Utiliza Markdown como parse_mode para permitir formato en el mensaje.
// Retorna error si la petición HTTP falla o la API responde con un status distinto a 200.
func EnviarMensajeTelegram(botToken string, chatID int64, message string) error {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)

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

	return nil
}
