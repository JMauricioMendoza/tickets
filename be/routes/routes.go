package routes

import (
	"backgo/middleware"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	//Sesion
	r.POST("/IniciarSesion", IniciarSesion)
	r.DELETE("/CerrarSesion/:usuario_id", CerrarSesion)

	//Ticket
	r.POST("/CrearTicket", CrearTicket)

	// TipoTickets
	r.GET("/ObtenerTipoTicketsActivos", ObtenerTipoTicketsActivos)

	// Area
	r.GET("/ObtenerAreaActivos", ObtenerAreaActivos)

	auth := r.Group("/")
	auth.Use(middleware.AutenticacionMiddleware())
	{
		// Ticket
		auth.GET("/ObtenerTickets", middleware.AdministradorMiddleware(), ObtenerTickets)
		auth.GET("/ObtenerTicketPorID/:id", middleware.AdministradorMiddleware(), ObtenerTicketPorID)
		auth.GET("/ObtenerTicketsPorUsuario/:usuario_id", ObtenerTicketsPorUsuario)
		auth.PATCH("/ActualizarEstatusTicket/:usuario_id", middleware.AdministradorMiddleware(), ActualizarEstatusTicket)

		// Usuario
		auth.GET("/ObtenerUsuarios", middleware.AdministradorMiddleware(), ObtenerUsuarios)
		auth.POST("/RegistrarUsuario/:usuario_admin_id", middleware.AdministradorMiddleware(), RegistrarUsuario)
		auth.POST("/CambiarPassword/:usuario_admin_id", CambiarPassword)

		// Sesion
		auth.GET("/VerificaSesion", VerificaSesion)
	}

	return r
}
