# Plataforma de Rehabilitación Cognitiva y Motora - Perrita Brisa 🐾

Aplicación web interactiva de rehabilitación motora, cognitiva y de estimulación visomotora diseñada para personas en proceso de recuperación neuromuscular o con afecciones del campo visual izquierdo (como hemianopsia o inatención).

La plataforma utiliza a **Brisa**, una perrita blanca asistencial, como hilo conductor para acompañar, motivar y guiar al usuario mediante instrucciones auditivas, animaciones demostrativas e inteligencia artificial.

## 🌟 Características Principales

### 1. Interfaz Adaptada para Tablets y Pantalla Única

* **Diseño compacto sin scroll:** Menú principal estructurado en cuadrícula accesible para pantallas de tabletas.
* **Botones táctiles de gran tamaño:** Zonas de toque ampliadas para facilitar la interacción de usuarios con motricidad reducida.
* **Paleta de colores cálida:** Colores amigables (tonos ámbar, verde azulado, esmeralda y lavanda) para evitar la fatiga visual.

### 2. Ejercicios Físicos y Visuales con Demostraciones Animadas

Rutinas específicas con gráficos en movimiento (CSS/SVG) para realizar por imitación directa:

* **Mano Izquierda:**
  * Apertura y cierre de puño.
  * Pinza fina (toque de yemas de dedos con pulgar).
  * Desplazamiento de objeto/vaso en mesa.
  * Pronación y supinación (giro de muñeca).

* **Pierna Izquierda:**
  * Movilidad de tobillo (elevación de talón y punta).
  * Extensión de rodilla en silla.
  * Elevación de rodilla (marcha estática).
  * Transferencia y carga de peso sentado.

* **Campo Visual Izquierdo:**
  * Uso de ancla visual de color en el margen izquierdo.
  * Giro activo de cuello e inspección en abanico.

### 3. Asistencia por Voz (Text-to-Speech)

* Botones destacados en color amarillo de alta visibilidad (`🔊 Tocá acá para escuchar el ejercicio`).
* Integración nativa con la **Web Speech API** (`SpeechSynthesisUtterance`) configurada en español (`es-AR`) a velocidad moderada para garantizar una comprensión clara.

### 4. Funciones Inteligentes con la API de Gemini (IA)

* **Chat Interactivo con Brisa:** Conversación empática usando la API de Gemini (`gemini-2.5-flash-preview-09-2025`) para responder dudas y brindar apoyo motivacional.
* **Generador de Rutinas Personalizadas:** Generación de 3 micro-ejercicios adaptados según el estado reportado por el usuario (*Buena energía*, *Cansado*, *Molestia en la mano*, etc.).
* **Cuentos de Memoria:** Relatos breves interactivos acompañados de preguntas de opción múltiple para estimular la retención y la comprensión lectora.
* **Consejo Diario Motivacional:** Respuestas breves generadas en tiempo real para iniciar la jornada.

### 5. Minijuegos Cognitivos e Integrados

* **Juego de Memoria:** Emparejamiento de cartas de símbolos.
* **Encuentra el Diferente:** Juego de atención y discriminación visual.
* **Rastreo Visual Izquierdo:** Entrenamiento visomotor con temporizador y contabilización de aciertos enfocado en la mitad izquierda de la pantalla.

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3** (Estructura semántica y animaciones CSS puras)
* **Tailwind CSS** (Estilizado responsivo vía CDN)
* **JavaScript Vanilla (ES6+)** (Lógica de navegación, estados e interacción)
* **FontAwesome 6** (Iconografía táctil y visual)
* **Web Speech API** (Síntesis de voz para las instrucciones)
* **Google Gemini API** (`gemini-2.5-flash-preview-09-2025` con prompting de sistema personalizado para el rol de Brisa)
