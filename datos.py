import ee
import sys
import json

try:
    # Inicializar Google Earth Engine
    ee.Initialize(project='ee-fbonillamontalvo')

    def get_landsat_scene(latitude, longitude, start_date=None, end_date=None):
        # Crear la geometría del punto a partir de la latitud y longitud proporcionadas
        point = ee.Geometry.Point([longitude, latitude])

        # Filtrar la colección de imágenes Landsat 8 (Landsat Collection 2 Tier 1 Level 2)
        collection = ee.ImageCollection(
            'LANDSAT/LC08/C02/T1_L2').filterBounds(point)

        # Aplicar el filtro de fechas si se proporcionan
        if start_date and end_date:
            collection = collection.filterDate(start_date, end_date)
        elif start_date:  # Si se proporciona solo la fecha de inicio, asumimos hasta la fecha actual
            collection = collection.filterDate(start_date, ee.Date('now'))

        # Obtener la primera imagen de la colección (la adquisición más reciente si no se especifica el rango de fechas)
        image = collection.sort('system:time_start', False).first()

        # Verificar si se encontró alguna imagen
        if image is None or collection.size().getInfo() == 0:
            print(json.dumps(
                {"error": "No images found for the specified location and date range."}))
            return

        # Obtener la ruta y fila del Sistema de Referencia Mundial-2 (WRS-2)
        wrs_path = image.get('WRS_PATH').getInfo()
        wrs_row = image.get('WRS_ROW').getInfo()

        # Definir la extensión de la escena y mostrarla
        footprint = image.geometry().bounds().getInfo()

        # Crear una respuesta JSON con los metadatos de la escena
        response = {
            "scene_id": image.get('LANDSAT_SCENE_ID').getInfo(),
            "satellite": image.get('SPACECRAFT_ID').getInfo(),
            "acquisition_date": image.get('system:time_start').getInfo(),
            "wrs_path": wrs_path,
            "wrs_row": wrs_row,
            "cloud_cover": image.get('CLOUD_COVER').getInfo(),
            "image_quality": image.get('IMAGE_QUALITY').getInfo(),
            "footprint": footprint
        }

        # Imprimir los metadatos de la escena en formato JSON
        print(json.dumps(response))

    # Leer latitud, longitud y rango de fechas desde los argumentos de la línea de comandos
    latitude = float(sys.argv[1])
    longitude = float(sys.argv[2])

    # Comprobar si se proporcionan fechas de inicio y fin
    start_date = sys.argv[3] if len(sys.argv) > 3 else None
    end_date = sys.argv[4] if len(sys.argv) > 4 else None

    # Llamar a la función para obtener la escena Landsat
    get_landsat_scene(latitude, longitude, start_date, end_date)

except Exception as e:
    # Imprimir el error en formato JSON
    print(json.dumps({"error": str(e)}))
