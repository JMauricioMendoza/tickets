package routes

import (
	"backgo/database"
	"backgo/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func ObtenerUsuarios(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre, usuario, area_id, estatus FROM usuario")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer rows.Close()
	var usuarios []models.Usuario
	for rows.Next() {
		var usuario models.Usuario
		if err := rows.Scan(&usuario.ID, &usuario.Nombre, &usuario.Usuario, &usuario.AreaID, &usuario.Estatus); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		usuarios = append(usuarios, usuario)
	}

	if err = rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error en la consulta"})
		return
	}

	c.JSON(http.StatusOK, usuarios)
}

func RegistrarUsuario(c *gin.Context) {
	usuarioAdminID, err := strconv.Atoi(c.Param("usuario_admin_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var usuario models.Usuario

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var existe bool
	queryCheck := "SELECT EXISTS (SELECT 1 FROM usuario WHERE usuario = $1)"
	err = tx.QueryRow(queryCheck, usuario.Usuario).Scan(&existe)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if existe {
		c.JSON(http.StatusConflict, gin.H{"error": "El nombre de usuario ya existe"})
		return
	}

	if err := usuario.HashearPassword(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	query := "INSERT INTO usuario (nombre, password, usuario, area_id, administrador) VALUES ($1, $2, $3, $4, $5) RETURNING id"
	err = tx.QueryRow(query, usuario.Nombre, usuario.Password, usuario.Usuario, usuario.AreaID, usuario.Administrador).Scan(&usuario.ID)
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	queryLog := "INSERT INTO logs_usuario (usuario_id, usuario_admin_id, accion) VALUES ($1, $2, 'Usuario creado')"
	_, err = tx.Exec(queryLog, usuario.ID, usuarioAdminID)
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err = tx.Commit()
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Usuario registrado exitosamente", "id": usuario.ID})
}

func CambiarPassword(c *gin.Context) {
	usuarioAdminID, err := strconv.Atoi(c.Param("usuario_admin_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var usuario models.Usuario

	tx, err := database.DB.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := usuario.HashearPassword(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	query := "UPDATE usuario SET password = $1, actualizado_en = NOW() WHERE id = $2"
	_, err = tx.Exec(query, usuario.Password, usuario.ID)
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if usuarioAdminID == 0 {
		queryLog := "INSERT INTO logs_usuario (usuario_id, usuario_admin_id, accion) VALUES ($1, NULL, 'Cambio de contraseña por el usuario')"
		_, err = tx.Exec(queryLog, usuario.ID)
		if err != nil {
			_ = tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	if usuarioAdminID != 0 {
		queryLog := "INSERT INTO logs_usuario (usuario_id, usuario_admin_id, accion) VALUES ($1, $2, 'Cambio de contraseña por administrador')"
		_, err = tx.Exec(queryLog, usuario.ID, usuarioAdminID)
		if err != nil {
			_ = tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	err = tx.Commit()
	if err != nil {
		_ = tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Contraseña cambiada exitosamente", "id": usuario.ID})
}
