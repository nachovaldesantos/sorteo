# Sorteo de Dorsales (PWA)

Aplicación Web Progresiva (PWA) ligera, moderna y 100% offline para realizar sorteos aleatorios de dorsales en carreras y eventos deportivos.

## Características

- **Sin dependencias externas ni backend**: Desarrollada exclusivamente con HTML5, CSS3 y JavaScript vanilla.
- **100% Offline**: Equipada con Service Worker y Manifest para funcionar sin conexión a Internet una vez cargada o instalada.
- **Configuración flexible de dorsales por rangos**: Permite añadir tantos rangos como sean necesarios (ej: `100–150`, `200–250`, `400–550`).
- **Control estricto de solapamiento**: Si se configuran rangos solapados (ej: `100–150` y `140–180`), cada dorsal único entra una sola vez en el bombo con la misma probabilidad uniforme.
- **Animación atractiva tipo ruleta / slot machine**: Transición visual con desaceleración progresiva (2–3 s) y celebración sin ruidos ni sonidos molestos.
- **Historial ordenado y persistente**: Guarda cada extracción (`1.º sorteo — Dorsal 427`, `2.º sorteo...`) en `localStorage`.
- **Deshacer y Reiniciar**:
  - **Deshacer último sorteo**: Devuelve el último dorsal sorteado al bombo.
  - **Reiniciar sorteo**: Vacía el historial y restaura todos los dorsales como disponibles, **conservando todos los rangos**.
  - **Resetear rangos**: Elimina rangos e historial con modal de confirmación protegida.
- **Preparada para GitHub Pages**: Rutas completamente relativas (`./`), compatible con despliegue en cualquier subdirectorio.

---

## Estructura del Proyecto

```text
sorteo/
├── index.html              # Interfaz principal (Sorteo y Configuración)
├── manifest.webmanifest    # Manifiesto de la PWA (modo standalone, tema, iconos)
├── sw.js                   # Service Worker para funcionamiento offline
├── css/
│   └── styles.css          # Estilos Mobile-First responsive y animaciones
├── js/
│   ├── app.js              # Controlador de UI, eventos, animación y confeti
│   ├── draw.js             # Motor matemático, validaciones y selección aleatoria
│   └── storage.js          # Gestión y persistencia en localStorage
├── icons/
│   ├── icon.svg            # Icono vectorial de la app
│   ├── icon-192.png        # Icono PWA para dispositivos móviles (192x192)
│   └── icon-512.png        # Icono PWA en alta resolución (512x512)
├── tests/
│   ├── test_runner.js      # Pruebas unitarias de rangos y lógica matemática
│   └── test_storage.js     # Pruebas de persistencia en localStorage
└── README.md               # Documentación y guía de uso
```

---

## Cómo ejecutar y probar localmente

Para que las tecnologías PWA (Service Worker) funcionen adecuadamente, los navegadores requieren ser servidos a través de un servidor web local (o HTTPS).

Puedes iniciar un servidor local con cualquiera de estas opciones:

### Opción A: Con Python (recomendada)
Abre PowerShell o terminal dentro de la carpeta `sorteo` y ejecuta:
```powershell
python -m http.server 8080
```
Luego abre tu navegador en:
```text
http://localhost:8080
```

### Opción B: Con Node.js
Si dispones de `npx`:
```powershell
npx serve .
```

---

## Ejecución de las Pruebas Automatizadas

Se han incluido tests automáticos que verifican los casos clave requeridos:
- Rangos independientes y suma exacta de dorsales.
- Rangos solapados y eliminación de duplicados.
- Sorteos múltiples garantizando que ningún dorsal se repite.
- Deshacer sorteo y recuperación de disponibilidad.
- Reiniciar sorteo y resetear rangos.

Para ejecutarlos:
```powershell
node tests/test_runner.js
node tests/test_storage.js
```
