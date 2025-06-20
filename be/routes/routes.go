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
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS", "PATCH"},
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

	// TipoTicket
	r.GET("/ObtenerTipoTicketsActivos", ObtenerTipoTicketsActivos)

	// Area
	r.GET("/ObtenerAreasActivos", ObtenerAreasActivos)

	auth := r.Group("/")
	auth.Use(middleware.AutenticacionMiddleware())
	{
		// Ticket
		auth.GET("/ObtenerTickets", ObtenerTickets)
		auth.GET("/ObtenerTicketPorID/:id", ObtenerTicketPorID)
		auth.PATCH("/ActualizarTicket", ActualizarTicket)

		// Estatus ticket
		auth.GET("/ObtenerEstatusTicketsActivos", ObtenerEstatusTicketsActivos)
		auth.GET("/ObtenerEstatusTickets", middleware.AdministradorMiddleware(), ObtenerEstatusTickets)
		auth.GET("/ObtenerEstatusTicketsPorID/:id", middleware.AdministradorMiddleware(), ObtenerEstatusTicketsPorID)
		auth.PATCH("/ActualizarEstatusTicket", middleware.AdministradorMiddleware(), ActualizarEstatusTicket)
		auth.POST("/CrearEstatusTicket", middleware.AdministradorMiddleware(), CrearEstatusTicket)

		// Usuario
		auth.GET("/ObtenerUsuariosActivos", middleware.AdministradorMiddleware(), ObtenerUsuariosActivos)
		auth.GET("/ObtenerUsuariosInactivos", middleware.AdministradorMiddleware(), ObtenerUsuariosInactivos)
		auth.GET("/ObtenerUsuarioPorID/:id", middleware.AdministradorMiddleware(), ObtenerUsuarioPorID)
		auth.POST("/CrearUsuario", middleware.AdministradorMiddleware(), CrearUsuario)
		auth.PATCH("/InhabilitarUsuario", middleware.AdministradorMiddleware(), InhabilitarUsuario)
		auth.PATCH("/HabilitarUsuario", middleware.AdministradorMiddleware(), HabilitarUsuario)
		auth.PATCH("/ActualizarUsuario", middleware.AdministradorMiddleware(), ActualizarUsuario)
		auth.PATCH("/CambiarPassword", CambiarPassword)

		// Sesion
		auth.GET("/VerificaSesion", VerificaSesion)

		//Areas
		auth.GET("/ObtenerAreas", middleware.AdministradorMiddleware(), ObtenerAreas)
		auth.POST("/CrearArea", middleware.AdministradorMiddleware(), CrearArea)
		auth.GET("/ObtenerAreaPorID/:id", middleware.AdministradorMiddleware(), ObtenerAreaPorID)
		auth.PATCH("/ActualizarArea", middleware.AdministradorMiddleware(), ActualizarArea)

		// TipoTicket
		auth.GET("/ObtenerTipoTickets", middleware.AdministradorMiddleware(), ObtenerTipoTickets)
		auth.GET("/ObtenerTipoTicketPorID/:id", middleware.AdministradorMiddleware(), ObtenerTipoTicketPorID)
		auth.PATCH("/ActualizarTipoTicket", middleware.AdministradorMiddleware(), ActualizarTipoTicket)
		auth.POST("/CrearTipoTicket", middleware.AdministradorMiddleware(), CrearTipoTicket)
	}

	return r
}
