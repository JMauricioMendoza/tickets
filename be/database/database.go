package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq" // Importa el driver de Postgres para side-effects
)

// DB es la instancia global de la conexión a la base de datos.
// Se inicializa en ConectarDB y se reutiliza en todo el proyecto.
var DB *sql.DB

// ConectarDB inicializa la conexión global a la base de datos PostgreSQL
// usando variables de entorno para mayor seguridad y flexibilidad.
// Termina la ejecución si la conexión falla.
func ConectarDB() {
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	// sslmode=disable es útil en desarrollo; en producción se recomienda habilitar SSL.
	psqlInfo := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	var err error
	DB, err = sql.Open("postgres", psqlInfo)
	if err != nil {
		log.Fatal("Error al conectar con la base de datos:", err)
	}

	// Verifica la conexión real con la base de datos.
	if err = DB.Ping(); err != nil {
		log.Fatal("No se pudo conectar a la base de datos:", err)
	}

	fmt.Println("✅ Conexión a la base de datos exitosa")
}
