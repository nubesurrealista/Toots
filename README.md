# Toots

Una sencilla implementación para extraer información pública de Mastodon y mostrar mis toots en: [https://nubesurrealista.github.io/Toots/](https://nubesurrealista.github.io/Toots/)

Agradecería cualquier ayuda para mejorarla ya que no soy programador y esto fue hecho con la asistencia de una IA (**GitHub Copilot**)

## Características

- Obtiene y muestra los últimos toots públicos de una cuenta de Mastodon (en este caso la mía)
- Soporta múltiples temas: Claro, Oscuro y Azul.
- Visualización de imágenes con efectos de hover.
- Posibilidad de ver toots individuales en detalle.
- Diseño responsivo para una mejor visualización en diferentes dispositivos.

## Comenzando

### Requisitos Previos

- Un navegador web.
- Conexión a Internet.

### Instalación

1. Clona el repositorio:
    ```bash
    git clone https://github.com/nubesurrealista/Toots.git
    ```

2. Abre el archivo `index.html` en tu navegador web preferido.

### Uso

- Abre el archivo `index.html`.
- La página cargará y mostrará automáticamente los últimos toots de la cuenta de Mastodon especificada.
- Usa el botón "Cambiar Tema" para alternar entre los temas.
- Haz clic en "Ver más" para ver los toots individuales en detalle.

## Personalización

### Cambiar Instancia y Usuario de Mastodon

- Actualiza las variables `instanceURL` y `userHandle` en el archivo `index.html` para obtener los toots de una instancia o usuario diferente de Mastodon.

### Agregar Nuevos Temas

- Agrega nuevos temas definiendo variables CSS adicionales y actualizando la funcionalidad de alternancia de temas.

## Agradecimientos

Este proyecto fue posible gracias a la ayuda de los siguientes repositorios y recursos:

- [enafore/enafore](https://github.com/enafore/enafore): Por la inspiración y fragmentos de código relacionados con el uso de la API de Mastodon y los temas.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT.
