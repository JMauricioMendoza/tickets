package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// Variable global para la conexión a la BD
var DB *sql.DB

// ConectarDB establece la conexión con PostgreSQL
func ConectarDB() {
	// Cargar variables de entorno
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error cargando el archivo .env")
	}

	// Leer credenciales desde las variables de entorno
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	// Construcción de la cadena de conexión
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	// Abrir conexión
	DB, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal("Error al conectar con la base de datos:", err)
	}

	// Verifica la conexión
	err = DB.Ping()
	if err != nil {
		log.Fatal("No se pudo conectar a la base de datos:", err)
	}

	fmt.Println("✅ Conexión a la base de datos exitosa")
}
