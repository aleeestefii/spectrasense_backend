import ee
ee.Authenticate()
ee.Initialize(project='ee-fbonillamontalvo')


def get_pixel_grid(latitude, longitude):
    point = ee.Geometry.Point([longitude, latitude])
    collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') \
        .filterBounds(point) \
        .sort('CLOUD_COVER')

    # Verificar si la colección contiene imágenes
    if collection.size().getInfo() == 0:
        print("No images found for the specified location and date range.")
        return None

    # Obtener la primera imagen de la colección
    image = collection.first()

    # Define la región de interés (90x90 metros en Landsat)
    region = point.buffer(45).bounds()

    # Tomar muestra de la imagen en la región especificada
    data = image.sample(region, 30).getInfo()
    return data


def get_landsat_data(latitude, longitude, start_date, end_date):
    # Definir el punto de interés
    point = ee.Geometry.Point([longitude, latitude])

    # Cargar la colección de Landsat 8 Collection 2
    landsat = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2') \
        .filterBounds(point) \
        .filterDate(start_date, end_date) \
        .sort('CLOUD_COVER')

    # Obtener la primera imagen de la colección
    image = landsat.first()

    # Obtener URL de descarga para bandas seleccionadas (ajustar según necesidad)
    url = image.getDownloadURL({
        'scale': 30,
        'region': point.buffer(1000).bounds().getInfo()['coordinates']
    })

    return url


# Ejemplo de uso
latitude = 34.05
longitude = -118.25
start_date = '2023-01-01'
end_date = '2023-12-31'

try:
    data = get_pixel_grid(latitude, longitude)
    print(data)
except ee.EEException as e:
    print('Error:', e)
