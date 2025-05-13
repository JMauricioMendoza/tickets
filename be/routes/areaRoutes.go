package routes

import (
	"backgo/database"
	"backgo/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func ObtenerAreaActivos(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre FROM area WHERE estatus IS TRUE ORDER BY nombre ASC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	defer rows.Close()
	var areas []models.Area
	for rows.Next() {
		var area models.Area
		if err := rows.Scan(&area.ID, &area.Nombre); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
			return
		}
		areas = append(areas, area)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": http.StatusOK, "areas": areas})
}
