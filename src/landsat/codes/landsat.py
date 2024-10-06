import ee
import sys
import json
import os


current_directory = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(
    current_directory, 'ee-fbonillamontalvo-03eef015f7ca.json')

credentials = ee.ServiceAccountCredentials(None, SERVICE_ACCOUNT_FILE)

try:
    # Inicializar Google Earth Engine
    ee.Initialize(credentials)

    def get_pixel_grid(latitude, longitude, cloud_cover_threshold):
        point = ee.Geometry.Point([longitude, latitude])

        # Filtrar la colección por la cobertura de nubes especificada
        collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') \
            .filterBounds(point) \
            .filterMetadata('CLOUD_COVER', 'less_than', cloud_cover_threshold) \
            .sort('CLOUD_COVER')

        if collection.size().getInfo() == 0:
            print(json.dumps(
                {"error": "No images found for the specified location and date range."}))
            return

        # Obtener la primera imagen de la colección
        image = collection.first()

        # Definir una región de 3x3 píxeles alrededor del punto
        pixel_size = 30  # Resolución de Landsat en metros
        # Ajustar para incluir 3x3 píxeles
        region = point.buffer(pixel_size * 1.5).bounds()

        # Utilizar sampleRectangle para garantizar una cuadrícula de 3x3
        rect = image.sampleRectangle(region=region, defaultValue=0)

        # Extraer las bandas necesarias y preparar la salida
        bands = ['SR_B1', 'SR_B2', 'SR_B3', 'SR_B4',
                 'SR_B5', 'SR_B6', 'SR_B7', 'QA_PIXEL']
        data = {band: rect.get(band).getInfo() for band in bands}

        # Convertir los datos a un formato simplificado de características
        simplified_data = {"features": []}
        for i in range(3):
            for j in range(3):
                pixel_data = {band: data[band][i][j] for band in bands}
                simplified_data["features"].append({
                    "id": f"{i * 3 + j}",
                    "properties": pixel_data
                })

        # Imprimir la salida en formato JSON
        print(json.dumps(simplified_data))

    # Obtener argumentos de línea de comando
    if len(sys.argv) != 4:
        print(json.dumps(
            {"error": "Invalid number of arguments. Expected latitude, longitude, and cloud cover threshold."}))
    else:
        latitude = float(sys.argv[1])
        longitude = float(sys.argv[2])
        cloud_cover_threshold = float(sys.argv[3])
        get_pixel_grid(latitude, longitude, cloud_cover_threshold)

except Exception as e:
    # Imprimir el error en formato JSON
    print(json.dumps({"error": str(e)}))
