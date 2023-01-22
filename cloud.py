from flask import  request,session
import boto3, json

# Leemos los credenciales

with open('credentials.json') as cred_file:
    cred = json.load(cred_file)

# Creamos el cliente

session_cloud = boto3.Session(
    aws_access_key_id=cred['ACCESS_KEY_ID'],
    aws_secret_access_key=cred['SECRET_ACCESS_KEY'],
    region_name='eu-central-1'
)
s3_client = session_cloud.client('s3')
Bucket = cred['BUCKET']

def images():
    # Obtener el archivo del formulario
    file = request.files.get('cache-image')
    # Obtener el nombre del archivo
    file_name = file.filename
    # Subir el archivo a S3
    s3_client.upload_file("images/wizarding-world-portrait.png", Bucket, 'geocaching/game/')


    # Generar un enlace público
    url = s3_client.generate_presigned_url(
        'get_object',
        Params={
            'Bucket': Bucket,
            'Key': 'geocaching/game/'
        },
        ExpiresIn=3600
    )
    # Generar un enlace público

    #url = f"https://{Bucket}.s3.amazonaws.com/{file_name}"
    #return url

    return url