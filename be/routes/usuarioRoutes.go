package routes

import (
	"backgo/database"
	"backgo/models"
	"backgo/utils"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// ObtenerUsuariosActivos retorna todos los usuarios activos ordenados alfabéticamente.
func ObtenerUsuariosActivos(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre, usuario, administrador FROM usuario WHERE estatus IS TRUE ORDER BY nombre ASC")
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()
	var usuarios []models.Usuario
	for rows.Next() {
		var usuario models.Usuario
		if err := rows.Scan(&usuario.ID, &usuario.Nombre, &usuario.Usuario, &usuario.Administrador); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		usuarios = append(usuarios, usuario)
	}

	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Usuarios obtenidos exitosamente", usuarios)
}

// CrearUsuario registra un nuevo usuario, asigna tipos de ticket y deja traza en logs_usuario.
// Utiliza transacción para garantizar atomicidad entre inserción y log.
func CrearUsuario(c *gin.Context) {
	adminID, existe := c.Get("usuario_id")
	if !existe {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	usuarioAdminID, ok := adminID.(int)
	if !ok {
		utils.RespuestaJSON(c, http.StatusInternalServerError, "Error de tipo de dato")
		return
	}

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
		utils.RespuestaJSON(c, http.StatusBadRequest, "Los datos proporcionados no son válidos.")
		return
	}

	if len(usuario.Password) < 6 {
		utils.RespuestaJSON(c, http.StatusBadRequest, "La contraseña debe tener al menos 6 caracteres.")
		return
	}

	// Valida que el usuario no exista previamente.
	queryCheck := "SELECT EXISTS (SELECT 1 FROM usuario WHERE usuario = $1)"
	err = tx.QueryRow(queryCheck, usuario.Usuario).Scan(&existe)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	if existe {
		utils.RespuestaJSON(c, http.StatusConflict, "El usuario ya existe.")
		return
	}

	// Hashea la contraseña antes de guardar.
	if err := usuario.HashearPassword(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	query := "INSERT INTO usuario (nombre, password, usuario, administrador) VALUES ($1, $2, $3, $4) RETURNING id"
	err = tx.QueryRow(query, usuario.Nombre, usuario.Password, usuario.Usuario, usuario.Administrador).Scan(&usuario.ID)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Valida que se asignen áreas de soporte.
	if len(usuario.TipoTicketID) == 0 {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusBadRequest, "Debe asignar al menos un tipo de ticket al usuario.")
		return
	}

	// Asigna los tipos de ticket permitidos al usuario.
	for _, tipoTicketID := range usuario.TipoTicketID {
		_, err = tx.Exec("INSERT INTO usuario_tipo_ticket (usuario_id, tipo_ticket_id) VALUES ($1, $2)", usuario.ID, tipoTicketID)
		if err != nil {
			_ = tx.Rollback()
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	// Log de auditoría para trazabilidad de cambios.
	queryLog := "INSERT INTO logs_usuario (usuario_id, usuario_modificador_id, accion) VALUES ($1, $2, 'Registro de nuevo usuario en el sistema.')"
	_, err = tx.Exec(queryLog, usuario.ID, usuarioAdminID)
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

	utils.RespuestaJSON(c, http.StatusCreated, fmt.Sprintf("Usuario #%d creado exitosamente", usuario.ID))
}

// CambiarPassword permite cambiar la contraseña de un usuario.
// Solo el propio usuario o un administrador pueden realizar la operación.
func CambiarPassword(c *gin.Context) {
	usuarioID, existe := c.Get("usuario_id")
	if !existe {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	usuid, ok := usuarioID.(int)
	if !ok {
		utils.RespuestaJSON(c, http.StatusInternalServerError, "Error de tipo de dato")
		return
	}

	var usuario models.Usuario
	if err := c.ShouldBindJSON(&usuario); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, err.Error())
		return
	}

	if len(usuario.Password) < 6 {
		utils.RespuestaJSON(c, http.StatusBadRequest, "La contraseña debe tener al menos 6 caracteres.")
		return
	}

	// Permite que solo el propio usuario o un administrador cambien la contraseña.
	if usuario.ID != usuid {
		var esAdmin bool
		err := database.DB.QueryRow("SELECT administrador FROM usuario WHERE id = $1 AND estatus IS TRUE", usuid).Scan(&esAdmin)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusUnauthorized, "No autorizado para cambiar la contraseña de otro usuario")
			return
		}
		if !esAdmin {
			utils.RespuestaJSON(c, http.StatusUnauthorized, "Solo un administrador puede cambiar la contraseña de otro usuario")
			return
		}
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

	if err := usuario.HashearPassword(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	query := "UPDATE usuario SET password = $1, actualizado_en = NOW() WHERE id = $2 RETURNING id"
	err = tx.QueryRow(query, usuario.Password, usuario.ID).Scan(&usuario.ID)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	queryLog := "INSERT INTO logs_usuario (usuario_id, usuario_modificador_id, accion) VALUES ($1, $2, 'Se cambió la contraseña del usuario.')"
	_, err = tx.Exec(queryLog, usuario.ID, usuid)
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

	utils.RespuestaJSON(c, http.StatusOK, "Contraseña cambiada correctamente.")
}

// InhabilitarUsuario desactiva un usuario y registra el cambio en logs_usuario.
// Utiliza transacción para garantizar atomicidad.
func InhabilitarUsuario(c *gin.Context) {
	usuarioID, existe := c.Get("usuario_id")
	if !existe {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	usuid, ok := usuarioID.(int)
	if !ok {
		utils.RespuestaJSON(c, http.StatusInternalServerError, "Error de tipo de dato")
		return
	}

	var usuario models.Usuario

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

	if err := c.ShouldBindJSON(&usuario); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, "Error en el formato de la solicitud")
		return
	}

	query := "UPDATE usuario SET estatus = false, actualizado_en = NOW() WHERE id = $1 RETURNING id"
	err = tx.QueryRow(query, usuario.ID).Scan(&usuario.ID)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	queryLog := "INSERT INTO logs_usuario (usuario_id, usuario_modificador_id, accion) VALUES ($1, $2, 'Usuario inhabilitado en el sistema.')"
	_, err = tx.Exec(queryLog, usuario.ID, usuid)
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

	utils.RespuestaJSON(c, http.StatusOK, "Usuario inhabilitado correctamente.")
}

// ObtenerUsuarioPorID retorna los datos de un usuario específico y sus áreas de soporte activas.
func ObtenerUsuarioPorID(c *gin.Context) {
	id := c.Param("id")
	row := database.DB.QueryRow(`
		SELECT
			u.id,
			u.nombre,
			u.usuario,
			u.administrador
		FROM
			usuario u
		WHERE
			u.id = $1
			AND u.estatus IS TRUE
	`, id)

	var usuario models.Usuario
	if err := row.Scan(&usuario.ID, &usuario.Nombre, &usuario.Usuario, &usuario.Administrador); err != nil {
		utils.RespuestaJSON(c, http.StatusNotFound, "Usuario no encontrado.")
		return
	}

	// Obtiene los tipos de ticket activos asociados al usuario.
	rows, err := database.DB.Query(`
		SELECT tipo_ticket_id
		FROM usuario_tipo_ticket
		WHERE usuario_id = $1 AND estatus = true
	`, id)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	for rows.Next() {
		var ticketID int
		if err := rows.Scan(&ticketID); err == nil {
			usuario.TipoTicketID = append(usuario.TipoTicketID, ticketID)
		}
	}

	utils.RespuestaJSON(c, http.StatusOK, "Usuario obtenido exitosamente", usuario)
}

// ActualizarUsuario permite modificar nombre, usuario, privilegios y áreas de soporte de un usuario.
// Registra logs de auditoría por cada cambio realizado.
// Utiliza transacción para garantizar consistencia.
func ActualizarUsuario(c *gin.Context) {
	adminID, existe := c.Get("usuario_id")
	if !existe {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	usuarioAdminID, ok := adminID.(int)
	if !ok {
		utils.RespuestaJSON(c, http.StatusInternalServerError, "Error de tipo de dato")
		return
	}

	var usuarioNuevo models.Usuario
	if err := c.BindJSON(&usuarioNuevo); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, "Datos inválidos")
		return
	}

	tx, err := database.DB.Begin()
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	defer func() {
		if err != nil {
			_ = tx.Rollback()
		}
	}()

	var usuarioActual models.Usuario
	query := "SELECT nombre, usuario, administrador FROM usuario WHERE id = $1 AND estatus IS TRUE"
	err = tx.QueryRow(query, usuarioNuevo.ID).Scan(&usuarioActual.Nombre, &usuarioActual.Usuario, &usuarioActual.Administrador)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	// Actualiza nombre si cambió y registra log.
	if usuarioNuevo.Nombre != usuarioActual.Nombre {
		updateQueryNombre := "UPDATE usuario SET nombre = $1, actualizado_en = NOW() WHERE id = $2"
		_, err = tx.Exec(updateQueryNombre, usuarioNuevo.Nombre, usuarioNuevo.ID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}

		insertLogNombre := "INSERT INTO logs_usuario (usuario_id, usuario_modificador_id, accion) VALUES ($1, $2, 'Se modificó el nombre completo.')"
		_, err = tx.Exec(insertLogNombre, usuarioNuevo.ID, usuarioAdminID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	// Actualiza nombre de usuario si cambió y registra log.
	if usuarioNuevo.Usuario != usuarioActual.Usuario {
		updateQueryUsuario := "UPDATE usuario SET usuario = $1, actualizado_en = NOW() WHERE id = $2"
		_, err = tx.Exec(updateQueryUsuario, usuarioNuevo.Usuario, usuarioNuevo.ID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}

		insertLogUsuario := "INSERT INTO logs_usuario (usuario_id, usuario_modificador_id, accion) VALUES ($1, $2, 'Se modificó el nombre de usuario.')"
		_, err = tx.Exec(insertLogUsuario, usuarioNuevo.ID, usuarioAdminID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	// Actualiza privilegios de administrador si cambiaron y registra log.
	if usuarioNuevo.Administrador != usuarioActual.Administrador {
		updateQueryAdministrador := "UPDATE usuario SET administrador = $1, actualizado_en = NOW() WHERE id = $2"
		_, err = tx.Exec(updateQueryAdministrador, usuarioNuevo.Administrador, usuarioNuevo.ID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}

		insertLogAdministrador := "INSERT INTO logs_usuario (usuario_id, usuario_modificador_id, accion) VALUES ($1, $2, 'Se modificó el estatus de administrador.')"
		_, err = tx.Exec(insertLogAdministrador, usuarioNuevo.ID, usuarioAdminID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	// Sincroniza áreas de soporte (tipo_ticket) activas del usuario.
	rows, err := tx.Query("SELECT tipo_ticket_id FROM usuario_tipo_ticket WHERE usuario_id = $1 AND estatus = true", usuarioNuevo.ID)
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()

	actuales := make(map[int]bool)
	for rows.Next() {
		var id int
		if err := rows.Scan(&id); err == nil {
			actuales[id] = true
		}
	}

	recibidos := make(map[int]bool)
	for _, id := range usuarioNuevo.TipoTicketID {
		recibidos[id] = true
	}

	modificoAreas := false

	// Desactiva áreas que ya no están en la nueva lista.
	for id := range actuales {
		if !recibidos[id] {
			_, err := tx.Exec("UPDATE usuario_tipo_ticket SET estatus = false, actualizado_en = NOW() WHERE usuario_id = $1 AND tipo_ticket_id = $2", usuarioNuevo.ID, id)
			if err != nil {
				utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
				return
			}
			modificoAreas = true
		}
	}

	// Activa o inserta nuevas áreas.
	for id := range recibidos {
		if !actuales[id] {
			var existe bool
			err := tx.QueryRow("SELECT EXISTS (SELECT 1 FROM usuario_tipo_ticket WHERE usuario_id = $1 AND tipo_ticket_id = $2)", usuarioNuevo.ID, id).Scan(&existe)
			if err != nil {
				utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
				return
			}
			if existe {
				_, err := tx.Exec("UPDATE usuario_tipo_ticket SET estatus = true, actualizado_en = NOW() WHERE usuario_id = $1 AND tipo_ticket_id = $2", usuarioNuevo.ID, id)
				if err != nil {
					utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
					return
				}
				modificoAreas = true
			} else {
				_, err := tx.Exec("INSERT INTO usuario_tipo_ticket (usuario_id, tipo_ticket_id, estatus) VALUES ($1, $2, true)", usuarioNuevo.ID, id)
				if err != nil {
					utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
					return
				}
				modificoAreas = true
			}
		}
	}

	// Registra log si hubo cambios en áreas de soporte.
	if modificoAreas {
		insertLogAreas := "INSERT INTO logs_usuario (usuario_id, usuario_modificador_id, accion) VALUES ($1, $2, 'Se modificaron permisos de las áreas de soporte.')"
		_, err = tx.Exec(insertLogAreas, usuarioNuevo.ID, usuarioAdminID)
		if err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
	}

	if err = tx.Commit(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Usuario actualizado correctamente.")
}

// ObtenerUsuariosInactivos retorna todos los usuarios inactivos ordenados alfabéticamente.
func ObtenerUsuariosInactivos(c *gin.Context) {
	rows, err := database.DB.Query("SELECT id, nombre, usuario FROM usuario WHERE estatus IS FALSE ORDER BY nombre ASC")
	if err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}
	defer rows.Close()
	var usuarios []models.Usuario
	for rows.Next() {
		var usuario models.Usuario
		if err := rows.Scan(&usuario.ID, &usuario.Nombre, &usuario.Usuario); err != nil {
			utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
			return
		}
		usuarios = append(usuarios, usuario)
	}

	if err = rows.Err(); err != nil {
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	utils.RespuestaJSON(c, http.StatusOK, "Usuarios inactivos obtenidos exitosamente", usuarios)
}

// HabilitarUsuario activa un usuario previamente inhabilitado y registra el cambio en logs_usuario.
// Utiliza transacción para garantizar atomicidad.
func HabilitarUsuario(c *gin.Context) {
	usuarioID, existe := c.Get("usuario_id")
	if !existe {
		utils.RespuestaJSON(c, http.StatusUnauthorized, "Usuario no autenticado")
		return
	}

	usuid, ok := usuarioID.(int)
	if !ok {
		utils.RespuestaJSON(c, http.StatusInternalServerError, "Error de tipo de dato")
		return
	}

	var usuario models.Usuario

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

	if err := c.ShouldBindJSON(&usuario); err != nil {
		utils.RespuestaJSON(c, http.StatusBadRequest, "Error en el formato de la solicitud")
		return
	}

	query := "UPDATE usuario SET estatus = true, actualizado_en = NOW() WHERE id = $1 RETURNING id"
	err = tx.QueryRow(query, usuario.ID).Scan(&usuario.ID)
	if err != nil {
		_ = tx.Rollback()
		utils.RespuestaJSON(c, http.StatusInternalServerError, err.Error())
		return
	}

	queryLog := "INSERT INTO logs_usuario (usuario_id, usuario_modificador_id, accion) VALUES ($1, $2, 'Usuario habilitado en el sistema.')"
	_, err = tx.Exec(queryLog, usuario.ID, usuid)
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

	utils.RespuestaJSON(c, http.StatusOK, "Usuario habilitado.")
}
