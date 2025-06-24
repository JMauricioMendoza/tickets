package utils

import (
	"github.com/gin-gonic/gin"
)

// RespuestaJSON envía una respuesta JSON estándar para la API.
// Permite incluir opcionalmente un payload de datos adicional bajo la clave "datos".
// Facilita respuestas consistentes y reduce repetición en los handlers.
func RespuestaJSON(c *gin.Context, status int, mensaje string, data ...interface{}) {
	resp := gin.H{
		"mensaje": mensaje,
	}
	// Solo agrega "datos" si se proporciona un valor no nulo.
	if len(data) > 0 && data[0] != nil {
		resp["datos"] = data[0]
	}
	c.JSON(status, resp)
}
