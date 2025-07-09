# Plataforma de Gestión de Incidencias

Sistema web para la gestión de tickets de soporte técnico.  

## Propósito

La **Plataforma de Gestión de Incidencias** es un sistema de tickets de soporte diseñado para el uso interno del **Instituto Catastral del Estado de Oaxaca**. Su objetivo principal es facilitar la recepción, seguimiento y resolución de incidencias técnicas reportadas por el personal del Instituto, centralizando la comunicación y mejorando la eficiencia en la atención.

## Tecnología utilizada

- **Backend**: API desarrollada en **Go** usando el framework **GIN**.
- **Frontend**: Aplicación construida en **React**.
- **Base de datos**: **PostgreSQL**.
- **Notificaciones**: Integración con la API de **Telegram** para alertas en tiempo real mediante un canal institucional.

## Tipo de usuarios

- **Usuarios sin cuenta**: Pueden levantar tickets de soporte sin necesidad de iniciar sesión.
- **Usuarios autenticados**: Personal técnico adscrito a la Unidad Técnica encargado de atender los tickets.
- **Administradores**: Usuarios con permisos adicionales para la gestión del sistema (catálogos, usuarios, configuración general).

## Problema que resuelve

El sistema responde a la necesidad de contar con un canal inmediato, accesible y formal para:

- Reportar fallos técnicos o de sistema.
- Solicitar asistencia técnica especializada.
- Dar seguimiento estructurado a las incidencias hasta su resolución.

Este canal automatiza parte del flujo de atención y reduce la dependencia de medios informales como mensajes o llamadas, promoviendo trazabilidad y orden.
