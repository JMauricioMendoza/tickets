package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
)

func EnviarMensajeTelegram(botToken string, chatID int64, message string) error {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", botToken)

	body, _ := json.Marshal(map[string]interface{}{
		"chat_id":    chatID,
		"text":       message,
		"parse_mode": "Markdown",
	})

	resp, err := http.Post(url, "application/json", bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("falló al enviar mensaje, status: %s", resp.Status)
	}

	return nil
}
