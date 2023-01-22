## Instalación de la aplicación de GeoCaching
Sigue estos pasos para instalar la aplicación de geocaching en tu computadora:

Abre una terminal o línea de comandos.

Clona el repositorio del proyecto en tu computadora con el comando:
```bash
git clone https://github.com/angelderonda/GeoCaching.git
```


Cambia a la carpeta del proyecto con el comando:
```bash
cd GeoCaching
```

Crea un entorno virtual para el proyecto con el comando:
```bash
python -m venv env
```
Activa el entorno virtual con el comando:

```bash
./env/Scripts/activate 
```
(en Windows) o

```bash
source env/bin/activate
```

(en Mac o Linux)

Instala las dependencias del proyecto con el comando:

```bash
pip install flask flask_pymongo requests google-auth google-auth-oauthlib google-auth-httplib2 mongoengine cachecontrol BeautifulSoup4 tkinter boto3
```

Inicia la aplicación con el comando:

```bash
python .\app.py
```
(en Windows) o

```bash
python app.py
```
(en Mac o Linux)

Si se presenta algún problema con el reloj, sincroniza el reloj de tu Windows.