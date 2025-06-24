package routes

import (
	"backgo/database"
	"backgo/models"
	"backgo/utils"
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// IniciarSesion valida credenciales, crea sesión única por usuario y registra log de inicio.
// Utiliza transacción para garantizar atomicidad entre operaciones de sesión y log.
func IniciarSesion(c *gin.Context) {
	var usuario models.Usuario

	tx, err := database.DB.Begin()
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	defer func() {
		// Rollback en caso de panic o error.
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
		}
	}()

	if err := c.ShouldBindJSON(&usuario); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, "Formato de datos no válidos.")
		return
	}

	passwordIngresada := usuario.Password

	// Consulta usuario activo por nombre de usuario.
	query := "SELECT id, password, administrador FROM usuario WHERE usuario = $1 AND estatus IS TRUE"
	err = tx.QueryRow(query, usuario.Usuario).Scan(&usuario.ID, &usuario.Password, &usuario.Administrador)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "El usuario no existe o está inhabilitado.")
		return
	}

	// Verifica el password usando bcrypt.
	if !usuario.VerificarPassword(passwordIngresada) {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "Contraseña incorrecta.")
		return
	}

	token := uuid.NewString()

	// Elimina sesiones previas del usuario para evitar múltiples sesiones activas.
	_, err = tx.Exec("DELETE FROM sesion WHERE usuario_id = $1", usuario.ID)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Registra nueva sesión con expiración de 1 hora.
	_, err = tx.Exec("INSERT INTO sesion (usuario_id, token, expira_en) VALUES ($1, $2, (SELECT now() + interval '1 hour'))", usuario.ID, token)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Log de auditoría para inicio de sesión.
	_, err = tx.Exec("INSERT INTO logs_sesion (usuario_id, accion) VALUES ($1, 'Inicio de sesión')", usuario.ID)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	err = tx.Commit()
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Devuelve token y privilegios en la respuesta.
	respuesta := map[string]interface{}{
		"token":         token,
		"administrador": usuario.Administrador,
	}

	utils.RespuestaJSON(c, http.StatusOK, "Sesión iniciada correctamente.", respuesta)
}

// CerrarSesion elimina la sesión activa del usuario y registra log de cierre.
// Utiliza transacción para garantizar atomicidad entre eliminación y log.
func CerrarSesion(c *gin.Context) {
	usuarioId := c.Param("usuario_id")

	if _, err := strconv.Atoi(usuarioId); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, "ID de usuario inválido.")
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		} else if err != nil {
			_ = tx.Rollback()
		}
	}()

	// Verifica si existe sesión activa antes de intentar eliminar.
	var existe bool
	queryCheck := "SELECT EXISTS (SELECT 1 FROM sesion WHERE usuario_id = $1)"
	err = tx.QueryRow(queryCheck, usuarioId).Scan(&existe)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	if !existe {
		utils.RespuestaJSON(c, http.StatusOK, "Sesión cerrada correctamente.")
		return
	}

	_, err = tx.Exec("DELETE FROM sesion WHERE usuario_id = $1", usuarioId)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Log de auditoría para cierre de sesión.
	_, err = tx.Exec("INSERT INTO logs_sesion (usuario_id, accion) VALUES ($1, 'Cierre de sesión')", usuarioId)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	err = tx.Commit()
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Sesión cerrada correctamente.")
}

// VerificaSesion valida que el usuario autenticado siga activo y retorna su información básica.
// Útil para mantener sesiones vivas en el frontend.
func VerificaSesion(c *gin.Context) {
	usuarioID, existe := c.Get("usuario_id")
	if !existe {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "Usuario no autenticado.")
		return
	}

	id, ok := usuarioID.(int)
	if !ok {
		utils.RespuestaJSON(c, http.StatusInternalServerError, "Error de tipo de dato.")
		return
	}

	var nombre string
	err := database.DB.QueryRow(`
	SELECT usuario.nombre
	FROM usuario
	WHERE usuario.id = $1
	AND estatus IS TRUE`, id).Scan(&nombre)

	if err != nil {
		if err == sql.ErrNoRows {
			utils.RespuestaJSON(c, http.StatusUnauthorized, "No autorizado: usuario no encontrado o inactivo.")
			return
		}
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	respuesta := map[string]interface{}{
		"usuario_id": id,
		"nombre":     nombre,
	}

	utils.RespuestaJSON(c, http.StatusOK, "Usuario verficado.", respuesta)
}
