package routes

import (
	"backgo/database"
	"backgo/models"
	"backgo/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ObtenerTipoTicketsActivos(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre FROM tipo_ticket WHERE estatus IS TRUE")
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	defer rows.Close()
	var tipoTickets []models.TipoTicket
	for rows.Next() {
		var tipoTicket models.TipoTicket
		if err := rows.Scan(&tipoTicket.ID, &tipoTicket.Nombre); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		tipoTickets = append(tipoTickets, tipoTicket)
	}

	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Tipo de tickets obtenidos correctamente.", tipoTickets)
}
