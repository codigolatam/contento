# Changelog

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/en/2.0.0/)
y el proyecto se adhiere a [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Fundación del backoffice y cuentas: autenticación por correo y contraseña, workspaces como frontera de tenant con roles `autor` y `editor`, invitaciones por correo que caducan, un workspace personal creado dentro del registro de cada cuenta, claves de API por workspace que dan identidad propia a cada agente y se eliminan con el workspace, y el esqueleto de la aplicación con las secciones Pipeline, Series y Piezas (docs/epics/001-fundacion.md).
- Pantalla de acceso de la aplicación: registro, entrada y cierre de sesión con correo y contraseña, con retorno a la ruta pedida tras entrar (docs/tasks/009-acceso-ui.md).
