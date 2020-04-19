const video = document.getElementById('video');

function startVideo() {

    // sobreescribimos la funcion para que funcione en todos los navegadores
    navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)
    // recuperamos información de la camara web
    navigator.getUserMedia(
        // tipo de información
        { video: {} },
        // recuperamos el stream de video y se lo mandamos al src del video
        stream => video.srcObject = stream,
        err => console.log(err)
    )
}

// startVideo();
// cargamos los modelos
Promise.all([
    // detección de caras
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    // reconocimeinto de partes de la cara
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    // reconocimiento de caras
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    // reconocimiento de expresiones
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
    // reconocimiento de edad y génerp
    faceapi.nets.ageGenderNet.loadFromUri('/models'),
]).then(startVideo())

video.addEventListener('play', async () => {
    // creamos un canvas sobre el que dibujar
    const canvas = faceapi.createCanvasFromMedia(video);
    // añadimos el canvas al DOM
    document.body.append(canvas)
    // definimos el tamaño de los objetos del canvas
    const displaySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(canvas, displaySize)




    setInterval(async () => {
        // detección de la posicion de la cara y todas las demás detecciones
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions().withAgeAndGender().withFaceDescriptors();
        // console.log(detections);
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
        console.log(detections)
        resizedDetections.forEach(detection => {
            const box = detection.detection.box
            const drawBox = new faceapi.draw.DrawBox(box, { label: Math.round(detection.age) + " year old " + detection.gender })
            drawBox.draw(canvas)
        })



    }, 100);
})