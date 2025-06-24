package middleware

import (
	"backgo/database"
	"backgo/utils"
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AutenticacionMiddleware valida el token JWT enviado en el header Authorization.
// Si el token es válido y la sesión está activa, inyecta el usuario_id en el contexto.
// Aborta la petición si el token es inválido, expirado o el usuario está inactivo.
func AutenticacionMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")

		if token == "" {
			utils.RespuestaJSON(c, http.StatusUnauthorized, "Token requerido")
			c.Abort()
			return
		}

		// Permite el formato estándar "Bearer <token>"
		if len(token) > 7 && token[:7] == "Bearer " {
			token = token[7:]
		}
		var usuarioID int

		// Verifica que el token exista, no haya expirado y el usuario esté activo.
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

		// Inyecta el usuario_id en el contexto para middlewares/controladores posteriores.
		c.Set("usuario_id", usuarioID)
		c.Next()
	}
}

// AdministradorMiddleware restringe el acceso a rutas solo para usuarios administradores.
// Requiere que AutenticacionMiddleware haya sido ejecutado previamente.
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
		// Verifica que el usuario esté activo y tenga privilegios de administrador.
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
