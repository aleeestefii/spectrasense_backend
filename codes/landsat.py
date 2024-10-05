import ee
ee.Authenticate()
ee.Initialize(project='ee-fbonillamontalvo')


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
    url = get_landsat_data(latitude, longitude, start_date, end_date)
    print('Download URL:', url)
except ee.EEException as e:
    print('Error:', e)
