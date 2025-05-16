package routes

import (
	"backgo/database"
	"backgo/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ObtenerEstatusTicketsActivos(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre FROM estatus_ticket WHERE estatus IS TRUE")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	defer rows.Close()
	var estatusTickets []models.EstatusTicket
	for rows.Next() {
		var estatusTicket models.EstatusTicket
		if err := rows.Scan(&estatusTicket.ID, &estatusTicket.Nombre); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
			return
		}
		estatusTickets = append(estatusTickets, estatusTicket)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": http.StatusOK, "estatusTickets": estatusTickets})
}
