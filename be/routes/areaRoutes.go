package routes

import (
	"backgo/database"
	"backgo/models"
	"backgo/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ObtenerAreaActivos(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre FROM area WHERE estatus IS TRUE ORDER BY nombre ASC")
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	defer rows.Close()
	var areas []models.Area
	for rows.Next() {
		var area models.Area
		if err := rows.Scan(&area.ID, &area.Nombre); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		areas = append(areas, area)
	}

	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Áreas obtenidas exitosamente", areas)
}
