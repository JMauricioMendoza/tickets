package main

import (
	"backgo/database"
	"backgo/routes"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func limpiarSesiones(db *sql.DB) {
	ticker := time.NewTicker(1 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		rows, err := db.Query("SELECT usuario_id FROM sesion WHERE expira_en < NOW()")
		if err != nil {
			log.Printf("Error al obtener sesiones expiradas: %v", err)
			continue
		}

		var usuarios []int

		for rows.Next() {
			var usuarioID int
			if err := rows.Scan(&usuarioID); err != nil {
				log.Printf("Error al escanear usuario_id: %v", err)
				continue
			}
			usuarios = append(usuarios, usuarioID)
		}

		if len(usuarios) > 0 {
			for _, usuarioID := range usuarios {
				_, err := db.Exec("INSERT INTO logs_sesion (usuario_id, accion) VALUES ($1, $2)", usuarioID, "Tiempo de sesión expirada")
				if err != nil {
					log.Printf("Error al registrar log para usuario %d: %v", usuarioID, err)
				}
			}

			_, err := db.Exec("DELETE FROM sesion WHERE expira_en < NOW()")
			if err != nil {
				log.Printf("Error al limpiar sesiones expiradas: %v", err)
			} else {
				log.Printf("Sesiones expiradas eliminadas para los usuarios: %v", usuarios)
			}
		}
	}
}

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No se pudo cargar el archivo .env")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	database.ConectarDB()

	go limpiarSesiones(database.DB)

	r := routes.SetupRouter()

	r.Static("/static", "./fe/build/static")
	r.StaticFile("/", "./fe/build/index.html")
	r.NoRoute(func(c *gin.Context) {
		c.File("./fe/build/index.html")
	})

	fmt.Printf("Servidor corriendo en http://localhost:%s\n", port)
	r.Run(":" + port)
}
