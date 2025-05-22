package routes

import (
	"backgo/database"
	"backgo/models"
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func IniciarSesion(c *gin.Context) {
	var usuario models.Usuario

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
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

	if err := c.ShouldBindJSON(&usuario); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": http.StatusBadRequest, "mensaje": "Formato de datos no válidos."})
		return
	}

	passwordIngresada := usuario.Password

	query := "SELECT id, password, administrador FROM usuario WHERE usuario = $1 AND estatus IS TRUE"
	err = tx.QueryRow(query, usuario.Usuario).Scan(&usuario.ID, &usuario.Password, &usuario.Administrador)

	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": http.StatusUnauthorized, "mensaje": "El usuario no existe o está inhabilitado"})
		return
	}

	if !usuario.VerificarPassword(passwordIngresada) {
		c.JSON(http.StatusUnauthorized, gin.H{"status": http.StatusUnauthorized, "mensaje": "Contraseña incorrecta"})
		return
	}

	token := uuid.NewString()
	expiracion := time.Now().Add(1 * time.Hour)

	_, err = tx.Exec("DELETE FROM sesion WHERE usuario_id = $1", usuario.ID)
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	_, err = tx.Exec("INSERT INTO sesion (usuario_id, token, expira_en) VALUES ($1, $2, $3)", usuario.ID, token, expiracion)
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	_, err = tx.Exec("INSERT INTO logs_sesion (usuario_id, accion) VALUES ($1, 'Inicio de sesión')", usuario.ID)
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	err = tx.Commit()
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": http.StatusOK, "token": token, "administrador": usuario.Administrador})
}

func CerrarSesion(c *gin.Context) {
	usuarioId := c.Param("usuario_id")

	if _, err := strconv.Atoi(usuarioId); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": http.StatusBadRequest, "mensaje": "ID de usuario inválido"})
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
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

	var existe bool
	queryCheck := "SELECT EXISTS (SELECT 1 FROM sesion WHERE usuario_id = $1)"
	err = tx.QueryRow(queryCheck, usuarioId).Scan(&existe)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}
	if !existe {
		c.JSON(http.StatusOK, gin.H{"status": http.StatusOK, "mensaje": "Sesión cerrada correctamente"})
		return
	}

	_, err = tx.Exec("DELETE FROM sesion WHERE usuario_id = $1", usuarioId)
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	_, err = tx.Exec("INSERT INTO logs_sesion (usuario_id, accion) VALUES ($1, 'Cierre de sesión')", usuarioId)
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	err = tx.Commit()
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": http.StatusOK, "mensaje": "Sesión cerrada correctamente"})
}

func VerificaSesion(c *gin.Context) {
	usuarioID, existe := c.Get("usuario_id")
	if !existe {
		c.JSON(http.StatusUnauthorized, gin.H{"status": http.StatusUnauthorized, "mensaje": "Usuario no autenticado"})
		return
	}

	id, ok := usuarioID.(int)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"status": http.StatusInternalServerError, "mensaje": "Error de tipo de dato"})
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
			c.JSON(http.StatusUnauthorized, gin.H{
				"status":  http.StatusUnauthorized,
				"mensaje": "No autorizado: usuario no encontrado o inactivo",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  http.StatusInternalServerError,
			"mensaje": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": http.StatusOK, "usuario_id": id, "nombre": nombre})
}
