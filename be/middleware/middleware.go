package middleware

import (
	"backgo/database"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AutenticacionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")

		if token == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"status": http.StatusUnauthorized, "mensaje": "Token requerido"})
			c.Abort()
			return
		}

		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		}
		var usuarioID int
		query := "SELECT usuario_id FROM sesion WHERE token = $1 AND expira_en > NOW()"
		err := database.DB.QueryRow(query, token).Scan(&usuarioID)

		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"status": http.StatusUnauthorized, "mensaje": err.Error()})
			c.Abort()
			return
		}

		c.Set("usuario_id", usuarioID)
		c.Next()
	}
}
