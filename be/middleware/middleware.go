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

func AdministradorMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		usuarioIDRaw, existe := c.Get("usuario_id")
		if !existe {
			c.JSON(http.StatusUnauthorized, gin.H{"status": http.StatusUnauthorized, "mensaje": "No autenticado"})
			c.Abort()
			return
		}

		usuarioID, ok := usuarioIDRaw.(int)
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": "Error interno en el ID de usuario"})
			c.Abort()
			return
		}

		var esAdmin bool
		query := "SELECT administrador FROM usuario WHERE id = $1"
		err := database.DB.QueryRow(query, usuarioID).Scan(&esAdmin)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
			c.Abort()
			return
		}

		if !esAdmin {
			c.JSON(http.StatusForbidden, gin.H{"status": http.StatusForbidden, "mensaje": "Acceso restringido a administradores"})
			c.Abort()
			return
		}

		c.Next()
	}
}
