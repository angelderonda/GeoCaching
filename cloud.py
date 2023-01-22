from flask import  request, Response
import boto3, json
from io import BytesIO

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

def put_image(game_id,user_name,name_cache):
    # Obtener el archivo del formulario
    file = request.files.get('cache-image')
    # Obtener el nombre del archivo
    file_content = file.read()
    #Pasa a binerario
    file_bytes = BytesIO(file_content)

    folder_name = 'geocaching/game_'+game_id+'/'+user_name+'/' + name_cache + '.jpeg'
    # Subir el archivo a S3
    s3_client.put_object(Bucket=Bucket, Key=folder_name, Body=file_bytes.getvalue())

    return folder_name


def read_image(folder):
   
     # Generar un enlace público
    url = s3_client.generate_presigned_url(
        'get_object',
        Params={
            'Bucket': Bucket,
            'Key': folder,
        },
        ExpiresIn=3600
    )
   
    return url


    