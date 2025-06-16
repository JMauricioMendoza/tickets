package middleware

import (
	"backgo/database"
	"backgo/utils"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AutenticacionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")

		if token == "" {
			utils.RespuestaJSON(c, http.StatusUnauthorized, "Token requerido")
			c.Abort()
			return
		}

		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		}
		var usuarioID int

		query := `
            SELECT s.usuario_id
            FROM sesion s
            JOIN usuario u ON s.usuario_id = u.id
            WHERE s.token = $1 AND s.expira_en > NOW() AND u.estatus IS TRUE
        `
		err := database.DB.QueryRow(query, token).Scan(&usuarioID)

		if err != nil {
			utils.RespuestaJSON(c, http.StatusUnauthorized, err.Error())
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
			utils.RespuestaJSON(c, http.StatusUnauthorized, "No autenticado")
			c.Abort()
			return
		}

		usuarioID, ok := usuarioIDRaw.(int)
		if !ok {
			utils.RespuestaJSON(c, http.StatusInternalServerError, "Error interno en el ID de usuario")
			c.Abort()
			return
		}

		var esAdmin bool
		query := "SELECT administrador FROM usuario WHERE id = $1 AND estatus IS TRUE"
		err := database.DB.QueryRow(query, usuarioID).Scan(&esAdmin)
		if err != nil {
			if err == sql.ErrNoRows {
				utils.RespuestaJSON(c, http.StatusUnauthorized, "No autorizado: usuario no encontrado o inactivo")
				c.Abort()
				return
			}
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			c.Abort()
			return
		}

		if !esAdmin {
			utils.RespuestaJSON(c, http.StatusUnauthorized, "Acceso restringido a administradores")
			c.Abort()
			return
		}

		c.Next()
	}
}
