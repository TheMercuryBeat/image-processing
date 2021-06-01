# API Rest

Se ha implementado un API Rest se expone un recurso POST donde se consume una o varias imágenes. Estas imágenes se suben a un blob storage de azure para su posterior procesamiento. Despues, creará tantos registros como imagenes se envien en la tabla de Tasks, dicha tabla está almacenada en una MySQL de Azure. 

A continuación se deja un ejemplo de como hacer dicha petición:

```bash
$ curl --location --request POST 'http://localhost:3000/task' --form 'image1=@"/home/<your_image>"'
```

Ademas, se expone otro recurso GET donde se puede recoger el estado de la tarea, indicando en que estado esa el procesamiento de la imagen. Con el siguiente comando se puede obtener dicha información:

```bash
$ curl --location --request GET 'http://localhost:3000/task/<task_id>'
```

## Configurar y arrancar el API Rest

Se deberá hacer un `npm i` para descargar todas las dependencias, luego se tendrá setear las variables de entorno con los valores que se deseen:

```
export ACCOUNT_NAME=<<your_account_name>>
export ACCOUNT_KEY=<<your_account_key>>
export DATABASE=<<your_database>>
export USERNAME=<<your_username>>
export PASSWORD=<<your_password>>
export HOST=<<your_host>>
```

Por ultimo, para arrancar al app se debera lanzar `npm start`.

## Test

Se han implementado unos test unitarios sobre los recursos anteriormente comentados. Para poder ejecutarlos basta con `npm test`.

# Función de Azure

Se ha creado una función en azure que se ejecuta cada vez que un blob storage es añadido. Esta ejecución consiste en actualizar el estado del task creado antes, recortar la imagen original, guardar los datos de dichas imágenes recortadas y subirlas a una carpeta virtual en el blob storage de Azure.

Mencionar que se ha optado por crear una tabla Images con dependencia recursiva, es decir, la imagen original se guardará con sus valores pero sin tener una imagen "padre", y las imágenes recortadas se guardarán con sus propios datos, pero haciendo referencia al Id de la imagen original.


> NOTA: Cuando se suba la funciona a Azure, se deberá setear también las propiedades de base de datos, así como de los permisos a la cuenta de azure para poder subir las imagenes al blob storage:
\
\
ACCOUNT_NAME=<<your_account_name>>\
ACCOUNT_KEY=<<your_account_key>>\
DATABASE=<<your_database>>\
USERNAME=<<your_username>>\
PASSWORD=<<your_password>>\
HOST=<<your_host>>

# Resources
En la carpeta _outputs_ se entregan varias imágenes que han sido procesadas con recortes de 800 y 1024 px de ancho.