package routes

import (
	"backgo/middleware"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// SetupRouter configura y retorna el router principal de la API.
// Define rutas públicas y protegidas, así como middleware de autenticación y autorización.
func SetupRouter() *gin.Engine {
	r := gin.Default()

	// Configuración de CORS para permitir peticiones desde el frontend.
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "http://localhost:8080"},
		AllowMethods:     []string{"GET", "POST", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Rutas públicas (no requieren autenticación)
	r.POST("/IniciarSesion", IniciarSesion)
	r.DELETE("/CerrarSesion/:usuario_id", CerrarSesion)
	r.POST("/CrearTicket", CrearTicket)
	r.GET("/ObtenerTipoTicketsActivos", ObtenerTipoTicketsActivos)
	r.GET("/ObtenerAreasActivos", ObtenerAreasActivos)

	// Grupo de rutas protegidas por autenticación JWT.
	auth := r.Group("/")
	auth.Use(middleware.AutenticacionMiddleware())
	{
		// Ticket
		auth.GET("/ObtenerTickets", ObtenerTickets)
		auth.GET("/ObtenerTicketPorID/:id", ObtenerTicketPorID)
		auth.PATCH("/ActualizarTicket", ActualizarTicket)

		// Estatus ticket (algunas rutas sólo para administradores)
		auth.GET("/ObtenerEstatusTicketsActivos", ObtenerEstatusTicketsActivos)
		auth.GET("/ObtenerEstatusTickets", middleware.AdministradorMiddleware(), ObtenerEstatusTickets)
		auth.GET("/ObtenerEstatusTicketsPorID/:id", middleware.AdministradorMiddleware(), ObtenerEstatusTicketsPorID)
		auth.PATCH("/ActualizarEstatusTicket", middleware.AdministradorMiddleware(), ActualizarEstatusTicket)
		auth.POST("/CrearEstatusTicket", middleware.AdministradorMiddleware(), CrearEstatusTicket)

		// Usuario (todas las rutas requieren privilegios de administrador)
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

		// Área (rutas administrativas)
		auth.GET("/ObtenerAreas", middleware.AdministradorMiddleware(), ObtenerAreas)
		auth.POST("/CrearArea", middleware.AdministradorMiddleware(), CrearArea)
		auth.GET("/ObtenerAreaPorID/:id", middleware.AdministradorMiddleware(), ObtenerAreaPorID)
		auth.PATCH("/ActualizarArea", middleware.AdministradorMiddleware(), ActualizarArea)

		// TipoTicket (rutas administrativas)
		auth.GET("/ObtenerTipoTickets", middleware.AdministradorMiddleware(), ObtenerTipoTickets)
		auth.GET("/ObtenerTipoTicketPorID/:id", middleware.AdministradorMiddleware(), ObtenerTipoTicketPorID)
		auth.PATCH("/ActualizarTipoTicket", middleware.AdministradorMiddleware(), ActualizarTipoTicket)
		auth.POST("/CrearTipoTicket", middleware.AdministradorMiddleware(), CrearTipoTicket)
	}

	return r
}
