package routes

import (
	"backgo/database"
	"backgo/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ObtenerTipoTicketsActivos(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre FROM tipo_ticket WHERE estatus IS TRUE")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	defer rows.Close()
	var tipoTickets []models.TipoTicket
	for rows.Next() {
		var tipoTicket models.TipoTicket
		if err := rows.Scan(&tipoTicket.ID, &tipoTicket.Nombre); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
			return
		}
		tipoTickets = append(tipoTickets, tipoTicket)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": http.StatusOK, "tipoTickets": tipoTickets})
}
