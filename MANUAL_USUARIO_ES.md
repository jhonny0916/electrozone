# Manual de Usuario - ELECTROZONE

## 1. Que es este proyecto

ELECTROZONE es una tienda en linea de productos electronicos con dos frentes de uso:

- Tienda para clientes: ver productos, buscar, iniciar sesion/registrarse, agregar al carrito y pagar.
- Panel de administracion: iniciar sesion como admin, ajustar stock de productos (sumar o disminuir) y revisar historial de cambios.

A nivel tecnico, es una aplicacion web con backend en Node.js + Express, base de datos MySQL y frontend HTML/CSS/JavaScript.

---

## 2. Como iniciar el proyecto

## 2.1 Requisitos

- Node.js instalado.
- Docker y Docker Compose instalados (recomendado para correr todo el proyecto).
- Variables de entorno configuradas (al menos `PORT` y `ADMIN_PASSWORD`).

## 2.2 Instalacion

Ejecuta en la raiz del proyecto:

```bash
npm install
```

## 2.3 Variables de entorno

Este repositorio incluye un archivo `.env.example` como plantilla.

1. Crea tu archivo local a partir de la plantilla:

```bash
cp .env.example .env
```

En Windows (CMD):

```bat
copy .env.example .env
```

En Windows (PowerShell):

```powershell
Copy-Item .env.example .env
```

2. Edita `.env` con tus valores reales.

Nota para GitHub: el archivo `.env` NO debe subirse al repositorio. Solo se versiona `.env.example`.

Variables clave:

- `PORT`: puerto del servidor.
- `ADMIN_PASSWORD`: clave para entrar al panel admin.
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: conexion a MySQL.

## 2.4 Ejecutar con Docker (app + MySQL)

Para levantar todo en contenedores (backend y base de datos):

```bash
docker compose up --build
```

Para ejecutar en segundo plano:

```bash
docker compose up --build -d
```

Para detener los servicios:

```bash
docker compose down
```

Si necesitas reinicializar la base de datos desde cero (por ejemplo, volver a cargar esquema y datos semilla):

```bash
docker compose down -v
docker compose up --build
```

## 2.5 Ejecutar sin Docker (opcional)

Si prefieres ejecutarlo localmente con tu propio MySQL:

```bash
npm start
```

Luego abre en navegador:

- Tienda: `http://localhost:PUERTO/`
- Admin: `http://localhost:PUERTO/admin.html`

---

## 3. Manual de uso para cliente

## 3.1 Pantalla principal

Al entrar a la tienda veras:

- Barra de busqueda de productos.
- Listado de tarjetas de productos.
- Botones de ingreso/salida y carrito.

## 3.2 Buscar productos

1. Escribe en el campo "Buscar productos...".
2. El sistema filtra por nombre y caracteristicas.

## 3.3 Ver detalle de un producto

1. Haz clic en la imagen del producto.
2. Se abre un modal con informacion ampliada:
- Nombre.
- Precio.
- Descripcion.
- Caracteristicas.
- Stock disponible.

## 3.4 Registro e inicio de sesion

1. Haz clic en "Ingresar".
2. Se abre una ventana con dos columnas:
- Iniciar sesion.
- Registrarse.
3. Completa el correo y confirma.

Nota: en la version actual, el proceso real de autenticacion usa el correo/username para identificar al usuario.

## 3.5 Agregar productos al carrito

1. Selecciona la cantidad en el producto.
2. Haz clic en "Agregar al carrito".
3. Si el producto ya estaba en el carrito, el sistema suma cantidades.

## 3.6 Ver y editar carrito

1. Haz clic en "Ver Carrito".
2. En el modal de carrito puedes:
- Ver items y subtotal por producto.
- Cambiar cantidad y actualizar.
- Eliminar items.
- Ver total acumulado.

## 3.7 Pagar carrito

1. Dentro del carrito, haz clic en "Pagar".
2. El sistema valida stock disponible de todos los productos.
3. Si hay stock suficiente:
- Se descuenta stock en inventario.
- Los items quedan marcados como pagados.
- Se muestra el total pagado.
4. Si no hay stock para algun item, se informa el error y no se completa la compra.

## 3.8 Historial de compras

1. Una vez iniciada la sesion, haz clic en el boton "Mis Compras" en la barra superior.
2. Se abre la pagina de historial de compras.
3. En esta pagina puedes ver:
- La fecha de cada factura.
- El valor total de la factura.
4. Haz clic en "Ver detalle" para abrir una ventana emergente con el desglose por articulo.
5. En el detalle se muestra:
- El nombre del articulo.
- La cantidad comprada.
- El precio total guardado para ese articulo en la factura.

Nota: este historial se construye a partir de las tablas `bills` y `bill_items`.

---

## 4. Manual de uso para administrador

## 4.1 Ingresar al panel admin

1. Abre `/admin.html`.
2. Ingresa la contrasena de administrador (`ADMIN_PASSWORD`).
3. Si es correcta, veras el panel con acceso a "Gestion de Stock".

## 4.2 Gestion de stock

1. Entra a "Gestion de Stock".
2. Veras una tabla con:
- Producto.
- Stock actual.
- Campo de unidades.
3. Escribe las unidades por producto.
4. Elige accion:
- "Agregar Stock".
- "Disminuir Stock".

Reglas:

- Solo se procesan productos con unidades mayores a 0.
- No se permite disminuir por debajo de 0.
- Si hay error en un producto, la operacion no se aplica parcialmente.

## 4.3 Historial de actualizaciones

Debajo de la tabla aparece el historial de acciones de stock:

- Tipo de accion (agregar/disminuir).
- Fecha y hora.
- Detalle por producto:
- Unidades cambiadas.
- Stock anterior.
- Stock nuevo.

---

## 5. Como funciona internamente (resumen funcional)

## 5.1 Frontend

- Sirve archivos estaticos desde la carpeta `frontend`.
- Usa JavaScript en navegador para consumir la API REST.
- Modales para autenticacion, carrito y detalle de producto.

## 5.2 Backend (API)

Principales rutas:

- `/api/auth`
- Registro e inicio de sesion de usuario.

- `/api/articles`
- Listado general, busqueda y detalle por id.

- `/api/cart`
- Agregar, actualizar, listar carrito y pagar.

- `/api/bills`
- Historial de compras del usuario y detalle de cada factura.

- `/api/admin`
- Login de administrador.
- Productos para administracion.
- Actualizacion de stock.
- Historial de stock.

## 5.3 Base de datos

Tablas usadas por el sistema:

- `users`
- `articles`
- `cart`
- `stock_history` (se crea automaticamente si no existe)
- `stock_history_items` (se crea automaticamente si no existe)

## 5.4 Seguridad y control

- El panel admin usa token temporal en sesion (`sessionStorage`).
- El token se genera al iniciar el servidor y cambia en cada reinicio.
- Hay limite de intentos por IP en endpoints admin (rate limiting).

---

## 6. Problemas comunes y solucion

## 6.1 No inicia el servidor

- Verifica que `PORT` este definido.
- Revisa que Node.js y dependencias esten instaladas.

## 6.2 Error de base de datos

- Verifica conexion MySQL (host, usuario, password, base).
- Asegurate de que existan las tablas requeridas.

## 6.3 Error "Ports are not available" al iniciar Docker

Si Docker muestra un error como `Ports are not available`, significa que ese puerto ya esta ocupado en tu equipo.

Configuracion actual del proyecto:

- La app publica `3000:3000`.
- MySQL NO publica puerto al host; se usa solo dentro de la red de Docker para evitar conflictos.

Si el conflicto es con el puerto 3000:

- Deten el proceso local que este usando ese puerto, o
- Cambia el mapeo de la app en `compose.yaml` (por ejemplo `3001:3000`).

## 6.4 Admin no puede ingresar

- Verifica `ADMIN_PASSWORD` en el entorno.
- Si cambiaste la variable, reinicia el servidor.

## 6.5 El admin pierde sesion al reiniciar servidor

- Es comportamiento esperado: el token admin se regenera en cada arranque.

---
