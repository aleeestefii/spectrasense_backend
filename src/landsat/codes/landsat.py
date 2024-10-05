import ee
import sys
import json

try:
    # Inicializar Google Earth Engine
    ee.Initialize(project='ee-fbonillamontalvo')

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
        region = point.buffer(45).bounds()
        data = image.sample(region, 30).getInfo()

        # Simplificar la respuesta: solo devuelve las propiedades de cada píxel
        simplified_data = {
            "features": [
                {
                    "id": feature["id"],
                    "properties": feature["properties"]
                }
                for feature in data["features"]
            ]
        }

        # Imprimir los datos en formato JSON puro
        print(json.dumps(simplified_data))

    # Leer latitud, longitud y cobertura de nubes desde los argumentos de la línea de comandos
    latitude = float(sys.argv[1])
    longitude = float(sys.argv[2])
    # Porcentaje máximo de cobertura de nubes
    cloud_cover_threshold = float(sys.argv[3])
    get_pixel_grid(latitude, longitude, cloud_cover_threshold)

except Exception as e:
    # Imprimir el error en formato JSON
    print(json.dumps({"error": str(e)}))
