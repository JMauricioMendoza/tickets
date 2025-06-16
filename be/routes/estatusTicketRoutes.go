package routes

import (
	"backgo/database"
	"backgo/models"
	"backgo/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ObtenerEstatusTicketsActivos(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre FROM estatus_ticket WHERE estatus IS TRUE")
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	defer rows.Close()
	var estatusTickets []models.EstatusTicket
	for rows.Next() {
		var estatusTicket models.EstatusTicket
		if err := rows.Scan(&estatusTicket.ID, &estatusTicket.Nombre); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		estatusTickets = append(estatusTickets, estatusTicket)
	}

	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Estatus de ticket obtenidos exitosamente", estatusTickets)
}
